"""
Deterministic Authority Routing & Priority Business Rules for Nirapod Dhaka.
Keeps administrative authority assignment and priority weighting out of the ML model learning heads.
"""

def derive_authority(category: str, incident_type: str, severity: str) -> str:
    """
    Deterministic rule engine mapping report attributes to responsible authority.
    - 'crime' -> 'police'
    - 'accident' (Electrical / Gas / Fire) -> 'dmb' (Disaster Management Board)
    - 'accident' (Vehicle collision) -> 'police'
    - 'infrastructure' -> 'city_corp'
    """
    cat = (category or "").lower().strip()
    inc = (incident_type or "").lower().strip()

    if cat == "crime":
        return "police"
    elif cat == "accident":
        if any(keyword in inc for keyword in ["electrical", "gas", "fire", "explosion", "spark"]):
            return "dmb"
        return "police"
    elif cat == "infrastructure":
        return "city_corp"
    
    return "unknown"

def calculate_priority_score(severity: str, urgency: str, confidence: float) -> float:
    """Calculates priority score (0.0 to 100.0)."""
    sev_map = {"low": 10, "medium": 20, "high": 30, "critical": 40}
    urg_map = {"low": 10, "medium": 20, "high": 30, "critical": 40}

    s = sev_map.get((severity or "").lower(), 10)
    u = urg_map.get((urgency or "").lower(), 10)
    conf_boost = max(0.0, min(1.0, float(confidence or 0.5))) * 20.0

    return round(float(s + u + conf_boost), 1)
