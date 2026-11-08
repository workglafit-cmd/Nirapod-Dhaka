import math
from shapely.geometry import Point, LineString
from supabase import create_client
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Hazard weights based on requirements
WEIGHTS = {
    "crime": {
        "robbery": 100,
        "default": 80
    },
    "accident": {
        "road_accident": 60,
        "default": 50
    },
    "infrastructure": {
        "building": 200, # Critical
        "fire": 90,
        "waterlogging": 80,
        "manhole": 50,
        "road": 40,
        "default": 30
    }
}

def get_weight(rtype: str, subtype: str) -> int:
    type_weights = WEIGHTS.get(rtype, {})
    return type_weights.get(subtype, type_weights.get("default", 10))

def fetch_active_reports():
    # In a real app we'd fetch only reports within a bounding box
    res = supabase.table("reports").select("*").in_("status", ["sent", "received"]).execute()
    return res.data

def score_routes(candidate_routes: list, reports: list, avoid_preferences: list) -> dict:
    if not candidate_routes:
        return None
        
    best_route = None
    lowest_penalty = float('inf')
    
    # Approx 50 meters in degrees
    BUFFER_DEG = 0.0005 

    for idx, route in enumerate(candidate_routes):
        geom = route["geometry"]["coordinates"] # list of [lng, lat]
        if len(geom) < 2:
            continue
            
        line = LineString(geom)
        penalty = 0
        avoided_hazards = []
        
        # Base penalty for duration/distance
        # Normalizing to make safety the primary metric, but distance still matters
        duration_sec = route.get("duration", 0)
        penalty += (duration_sec / 60) * 1 # 1 point per minute of travel
        
        for rep in reports:
            pt = Point(rep["lng"], rep["lat"])
            dist = line.distance(pt)
            
            if dist < BUFFER_DEG:
                # Hazard is close to this route!
                w = get_weight(rep["type"], rep["subtype"])
                
                # Check user preferences
                if "crime" in avoid_preferences and rep["type"] == "crime":
                    w *= 2 # Double penalty if user explicitly avoids it
                if "waterlogging" in avoid_preferences and rep["subtype"] == "waterlogging":
                    w *= 2
                    
                penalty += w
                avoided_hazards.append({
                    "id": rep["id"],
                    "type": rep["type"],
                    "subtype": rep["subtype"],
                    "weight": w
                })
        
        route["safety_score"] = max(0, 100 - (penalty / 10)) # Arbitrary scale 0-100
        route["penalty"] = penalty
        route["hazards_encountered"] = avoided_hazards
        
        if penalty < lowest_penalty:
            lowest_penalty = penalty
            best_route = route
            
    return best_route
