import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from services.llm import parse_user_intent, generate_route_explanation
from services.routing import geocode_destination, fetch_candidate_routes
from services.scoring import fetch_active_reports, score_routes

from ai.pipeline import analyze_report
from ai.schemas import ReportIntelligence
from typing import Optional
from services.geofence import is_within_dhaka
from services.token_service import verify_verification_token
from config import DEMO_VISUAL_VERIFICATION

load_dotenv(dotenv_path="../.env")

app = FastAPI(title="Nirapod AI Route Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RouteRequest(BaseModel):
    query: str
    current_lat: float
    current_lng: float

class AnalyzeRequest(BaseModel):
    text: str
    lat: Optional[float] = None
    lng: Optional[float] = None

class AnalyzeVoiceRequest(BaseModel):
    audio_base64: str
    mime_type: str = "audio/webm"
    lat: Optional[float] = None
    lng: Optional[float] = None

class AnalyzeImageRequest(BaseModel):
    image_base64: str
    text_report: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    category: str = "infrastructure"
    photo_storage_path: Optional[str] = None
    # Real NLP incident label — used as the expected incident in demo mode.
    incident_type: Optional[str] = None
    # Controlled /demo/ai scenarios only. Ignored unless DEMO_VISUAL_VERIFICATION.
    demo_scenario: Optional[str] = None
    # Never trusted. Present so a malicious client cannot "verify" by sending it.
    verified: Optional[bool] = None


class ValidateEvidenceRequest(BaseModel):
    verification_token: str
    text_report: str
    category: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/analyze-report")
async def api_analyze_report(req: AnalyzeRequest):
    if req.lat is not None and req.lng is not None:
        if not is_within_dhaka(req.lat, req.lng):
            raise HTTPException(status_code=400, detail={"error": "REPORT_OUTSIDE_SERVICE_AREA", "message": "Reports can only be submitted within Dhaka City."})
    try:
        result = await analyze_report(req.text)
        return {
            "status": "success",
            "data": result.dict()
        }
    except Exception as e:
        print(f"Error analyzing report: {e}")
        return {
            "status": "error",
            "message": str(e),
            "data": {
                "needs_review": True
            }
        }

@app.post("/api/analyze-voice-report")
async def api_analyze_voice_report(req: AnalyzeVoiceRequest):
    if req.lat is not None and req.lng is not None:
        if not is_within_dhaka(req.lat, req.lng):
            raise HTTPException(status_code=400, detail={"error": "REPORT_OUTSIDE_SERVICE_AREA", "message": "Reports can only be submitted within Dhaka City."})
    try:
        from ai.multimodal.voice_service import transcribe_and_analyze_audio
        result = await transcribe_and_analyze_audio(req.audio_base64, req.mime_type)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        print(f"Error analyzing voice report: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/analyze-image-report")
async def api_analyze_image_report(req: AnalyzeImageRequest):
    if req.lat is not None and req.lng is not None:
        if not is_within_dhaka(req.lat, req.lng):
            raise HTTPException(status_code=400, detail={"error": "REPORT_OUTSIDE_SERVICE_AREA", "message": "Reports can only be submitted within Dhaka City."})
    # Ignore any client-supplied verified flag. Tokens are minted server-side.
    _ = req.verified
    try:
        from ai.multimodal.vision_service import analyze_hazard_image
        result = await analyze_hazard_image(
            image_base64=req.image_base64,
            text_report=req.text_report,
            category=req.category or "infrastructure",
            photo_storage_path=req.photo_storage_path,
            incident_type=req.incident_type,
            demo_scenario=req.demo_scenario if DEMO_VISUAL_VERIFICATION else None,
        )
        return {
            "status": "success",
            "data": result,
            "demo_visual_verification": DEMO_VISUAL_VERIFICATION,
        }
    except Exception as e:
        print(f"Error analyzing image report: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@app.post("/api/demo-visual-verify")
async def api_demo_visual_verify(req: AnalyzeImageRequest):
    """Explicit demo evidence-check endpoint. Never calls a paid Vision LLM."""
    if not DEMO_VISUAL_VERIFICATION:
        raise HTTPException(status_code=403, detail="Demo visual verification is disabled.")
    return await api_analyze_image_report(req)


@app.post("/api/validate-visual-evidence")
async def api_validate_visual_evidence(req: ValidateEvidenceRequest):
    """HMAC check for a server-issued evidence token. Clients cannot mint these."""
    ok, reason = verify_verification_token(
        req.verification_token,
        req.text_report,
        req.category,
    )
    if not ok:
        raise HTTPException(status_code=400, detail={"error": reason, "valid": False})
    return {"status": "success", "valid": True, "reason": reason}

@app.post("/api/route")
async def get_safe_route(req: RouteRequest):
    try:
        # 1. Grok API parses intent
        intent = await parse_user_intent(req.query)
        dest_name = intent.get("destination")
        mode = intent.get("mode", "driving")
        preferences = intent.get("preferences", [])
        
        if not dest_name:
            return {"status": "error", "message": "Could not determine destination."}
            
        # 2. Geocode destination
        coords = await geocode_destination(dest_name, req.current_lat, req.current_lng)
        if not coords:
            return {"status": "error", "message": f"Could not locate {dest_name}."}
            
        dest_lat, dest_lng = coords
        
        # 3. Fetch base routes from OSRM
        candidates = await fetch_candidate_routes(
            req.current_lat, req.current_lng, 
            dest_lat, dest_lng, 
            mode
        )
        
        if not candidates:
            return {"status": "error", "message": "No routes found."}
            
        # 4. Fetch Supabase hazard reports & Score routes
        reports = fetch_active_reports()
        best_route = score_routes(candidates, reports, preferences)
        
        if not best_route:
            return {"status": "error", "message": "Failed to score routes."}
            
        # 5. Grok API explains the route
        explanation = await generate_route_explanation(req.query, {
            "destination": dest_name,
            "mode": mode,
            "safety_score": best_route.get("safety_score"),
            "hazards_encountered": best_route.get("hazards_encountered", []),
            "duration_mins": round(best_route.get("duration", 0) / 60)
        })
        
        return {
            "status": "success",
            "destination": dest_name,
            "mode": mode,
            "route": best_route, # Contains geometry, distance, duration
            "all_routes": candidates, # Optional for frontend rendering
            "explanation": explanation
        }
    except Exception as e:
        print(f"Error processing route: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
