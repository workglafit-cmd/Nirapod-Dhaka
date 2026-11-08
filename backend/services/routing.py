import httpx

# OSRM Public API
OSRM_BASE = "https://router.project-osrm.org/route/v1"
NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search"

async def geocode_destination(destination: str, current_lat: float, current_lng: float) -> tuple[float, float] | None:
    # Search within Dhaka area primarily (approximate bounding box)
    params = {
        "q": destination,
        "format": "json",
        "limit": 1,
        "viewbox": f"{current_lng - 0.2},{current_lat + 0.2},{current_lng + 0.2},{current_lat - 0.2}",
        "bounded": 1
    }
    
    headers = {
        "User-Agent": "NirapodAI/1.0"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(NOMINATIM_BASE, params=params, headers=headers)
            res.raise_for_status()
            data = res.json()
            if data:
                return float(data[0]["lat"]), float(data[0]["lon"])
            return None
        except Exception as e:
            print(f"Geocoding Error: {e}")
            return None

async def fetch_candidate_routes(start_lat: float, start_lng: float, end_lat: float, end_lng: float, mode: str):
    profile = "car"
    if mode == "walking":
        profile = "foot"
    elif mode == "cycling":
        profile = "bike"
        
    url = f"{OSRM_BASE}/{profile}/{start_lng},{start_lat};{end_lng},{end_lat}"
    
    params = {
        "overview": "full",
        "geometries": "geojson",
        "alternatives": "true",
        "steps": "false"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url, params=params)
            res.raise_for_status()
            data = res.json()
            return data.get("routes", [])
        except Exception as e:
            print(f"OSRM Error: {e}")
            return []
