import json
import hashlib
import requests
from config import (
    GROQ_API_KEY,
    OPENAI_API_KEY,
    OPENAI_VISION_MODEL,
    DEMO_VISUAL_VERIFICATION,
)
from services.token_service import generate_verification_token

# ── Provider URLs ───────────────────────────────────────────────────────
GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"

_VALID_STATUSES = {"acceptable", "mismatch", "uncertain"}
_FOLD_TO_UNCERTAIN = {"not_relevant", "image_quality_low"}
_VALID_SCENARIOS = {"acceptable", "mismatch", "uncertain"}

# Deterministic demo confidence — NOT a computer-vision score.
_DEMO_CONFIDENCE = {
    "acceptable": 0.86,
    "mismatch": 0.81,
    "uncertain": 0.42,
}

_DEMO_COPY = {
    "acceptable": {
        "visual_summary": (
            "Uploaded photo appears suitable as visual evidence for the reported incident."
        ),
        "consistency_reason": (
            "The submitted photo is being used as supporting visual evidence "
            "for the incident identified from the report."
        ),
    },
    "mismatch": {
        "visual_summary": (
            "The submitted photo does not appear consistent with the reported incident."
        ),
        "consistency_reason": (
            "This is a controlled demo mismatch. The evidence does not match "
            "the incident understood from the report."
        ),
    },
    "uncertain": {
        "visual_summary": (
            "Photo was received but could not be confidently evaluated as supporting evidence."
        ),
        "consistency_reason": (
            "Upload a clearer, more directly relevant photo of the reported incident."
        ),
    },
}


def _normalize_status(raw_status: str) -> str:
    s = (raw_status or "").strip().lower()
    if s in _VALID_STATUSES:
        return s
    if s in _FOLD_TO_UNCERTAIN:
        return "uncertain"
    return "uncertain"


def _failure(summary: str, reason: str) -> dict:
    return {
        "status": "analysis_failed",
        "match": False,
        "confidence": 0.0,
        "visual_summary": summary,
        "consistency_reason": reason,
        "category_match": False,
        "detected_objects": [],
        "verification_token": None,
        "demo_mode": bool(DEMO_VISUAL_VERIFICATION),
        "ai_detected": None,
    }


def demo_visual_verify(
    image_base64: str,
    text_report: str = "",
    category: str = "infrastructure",
    photo_storage_path: str | None = None,
    incident_type: str | None = None,
    demo_scenario: str | None = None,
) -> dict:
    """Deterministic visual-evidence check for the competition demo.

    Does NOT call OpenAI, Groq, or any other paid vision model.
    Does NOT classify image pixels. The expected incident comes from
    the real NLP report result (incident_type / category / text_report).

    ``demo_scenario`` is only honoured when DEMO_VISUAL_VERIFICATION is
    enabled. The citizen flow must omit it (defaults to acceptable).
    A client-supplied ``verified=true`` flag is never trusted — this
    function does not even accept one.
    """
    if not (image_base64 or "").strip():
        return _failure(
            "Photo required.",
            "Please upload a photo of the reported incident or location.",
        )

    scenario = (demo_scenario or "acceptable").strip().lower()
    if scenario not in _VALID_SCENARIOS:
        scenario = "acceptable"

    status = scenario
    copy = _DEMO_COPY[status]
    confidence = _DEMO_CONFIDENCE[status]
    incident_label = (incident_type or "").strip() or "the reported incident"
    category_label = (category or "infrastructure").strip() or "infrastructure"

    verification_token = None
    if status == "acceptable":
        if photo_storage_path:
            img_h = hashlib.sha256(photo_storage_path.encode("utf-8")).hexdigest()[:16]
        else:
            img_h = hashlib.sha256(image_base64.encode("utf-8")).hexdigest()[:16]
        txt_h = hashlib.sha256((text_report or "").strip().encode("utf-8")).hexdigest()[:16]
        verification_token = generate_verification_token(
            image_hash=img_h,
            text_hash=txt_h,
            category=category_label,
            status=status,
            confidence=confidence,
        )

    return {
        "status": status,
        "match": status == "acceptable",
        "confidence": confidence,
        "visual_summary": copy["visual_summary"],
        "consistency_reason": copy["consistency_reason"],
        "category_match": status == "acceptable",
        # Intentionally empty — we do not claim objects were detected in the photo.
        "detected_objects": [],
        "verification_token": verification_token,
        "demo_mode": True,
        "demo_scenario": scenario,
        "ai_detected": incident_label,
    }


def _call_vision(formatted_b64: str, user_msg: str) -> dict:
    """Legacy paid-vision path. Not used when DEMO_VISUAL_VERIFICATION is on."""
    system_prompt = """You are a visual evidence consistency checker for a public safety reporting system.

Your task is NOT to prove that the incident happened.
Your task is to determine whether the visible contents of the image appear reasonably consistent with what the user reported.

Always return JSON with this exact schema (and nothing else):
{
  "status": "acceptable" | "mismatch" | "uncertain",
  "match": true | false,
  "confidence": 0.0 to 1.0,
  "visual_summary": "One-sentence description of what is visibly present in the image.",
  "consistency_reason": "Short explanation of how the image relates to the report. Use phrasing like 'appears consistent' rather than 'confirmed' or 'proven'.",
  "category_match": true | false,
  "detected_objects": ["short label", "short label"]
}

Do not return null. Return a JSON object only.
"""

    headers: dict[str, str] = {"Content-Type": "application/json"}

    if OPENAI_API_KEY:
        headers["Authorization"] = f"Bearer {OPENAI_API_KEY}"
        payload = {
            "model": OPENAI_VISION_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_msg},
                        {"type": "image_url", "image_url": {"url": formatted_b64}},
                    ],
                },
            ],
            "temperature": 0.1,
            "response_format": {"type": "json_object"},
        }
        response = requests.post(OPENAI_CHAT_URL, headers=headers, json=payload, timeout=60)
    elif GROQ_API_KEY:
        headers["Authorization"] = f"Bearer {GROQ_API_KEY}"
        payload = {
            "model": "llama-3.2-11b-vision-preview",
            "messages": [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_msg},
                        {"type": "image_url", "image_url": {"url": formatted_b64}},
                    ],
                },
            ],
            "temperature": 0.1,
            "response_format": {"type": "json_object"},
        }
        response = requests.post(GROQ_CHAT_URL, headers=headers, json=payload, timeout=60)
    else:
        raise RuntimeError("No vision provider configured")

    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]
    return json.loads(content)


async def analyze_hazard_image(
    image_base64: str,
    text_report: str = "",
    category: str = "infrastructure",
    photo_storage_path: str | None = None,
    incident_type: str | None = None,
    demo_scenario: str | None = None,
) -> dict:
    """Visual evidence check.

    When DEMO_VISUAL_VERIFICATION is enabled (default for this demo),
    this never calls a paid Vision LLM. It returns a deterministic
    evidence-consistency result derived from the report understanding.

    The paid OpenAI/Groq path is retained behind the flag for future use
    and is not invoked on the demo report flow.
    """
    if DEMO_VISUAL_VERIFICATION:
        return demo_visual_verify(
            image_base64=image_base64,
            text_report=text_report,
            category=category or "infrastructure",
            photo_storage_path=photo_storage_path,
            incident_type=incident_type,
            demo_scenario=demo_scenario,
        )

    if not OPENAI_API_KEY and not GROQ_API_KEY:
        return _failure(
            "Visual verification service is not configured.",
            "Neither OPENAI_API_KEY nor GROQ_API_KEY is set on the server.",
        )

    formatted_b64 = image_base64
    if not formatted_b64.startswith("data:"):
        formatted_b64 = f"data:image/jpeg;base64,{formatted_b64}"

    user_msg = f"Report Category: {category}\nReport Description: '{text_report}'"

    try:
        parsed = _call_vision(formatted_b64, user_msg)
    except Exception as err:
        print(f"[Vision AI Error] {err}")
        return _failure(
            "Visual verification service failed to process the image.",
            f"Analysis failed: {str(err)}",
        )

    status = _normalize_status(parsed.get("status", "uncertain"))
    try:
        confidence = float(parsed.get("confidence", 0.0))
    except (TypeError, ValueError):
        confidence = 0.0
    confidence = max(0.0, min(1.0, confidence))

    if status == "acceptable" and confidence < 0.50:
        status = "uncertain"

    match = status == "acceptable"
    visual_summary = parsed.get("visual_summary") or "Visual evidence inspected."
    consistency_reason = parsed.get("consistency_reason") or "Analysis completed."
    category_match = bool(parsed.get("category_match", True))
    detected_objects = parsed.get("detected_objects") or []

    verification_token = None
    if status == "acceptable":
        if photo_storage_path:
            img_h = hashlib.sha256(photo_storage_path.encode("utf-8")).hexdigest()[:16]
        else:
            img_h = hashlib.sha256(image_base64.encode("utf-8")).hexdigest()[:16]
        txt_h = hashlib.sha256(text_report.strip().encode("utf-8")).hexdigest()[:16]
        verification_token = generate_verification_token(
            image_hash=img_h,
            text_hash=txt_h,
            category=category,
            status=status,
            confidence=confidence,
        )

    return {
        "status": status,
        "match": match,
        "confidence": confidence,
        "visual_summary": visual_summary,
        "consistency_reason": consistency_reason,
        "category_match": category_match,
        "detected_objects": detected_objects,
        "verification_token": verification_token,
        "demo_mode": False,
        "ai_detected": incident_type,
    }
