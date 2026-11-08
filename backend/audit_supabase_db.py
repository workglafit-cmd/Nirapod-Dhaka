import os
import requests
import dotenv

dotenv.load_dotenv(dotenv_path="../.env")
dotenv.load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "https://pqddaxdwjqquypfwqxcr.supabase.co")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Test POST matching REAL schema columns of 'reports' table
dummy_payload = {
    "type": "infrastructure",
    "subtype": "manhole",
    "description": "Test audit hazard description",
    "lat": 23.8103,
    "lng": 90.4125,
    "status": "sent",
    "ai_severity": "high",
    "ai_urgency": "high",
    "ai_category": "infrastructure",
    "ai_incident_type": "Open Manhole",
    "ai_confidence": 0.95,
    "ai_priority_score": 79,
    "ai_reason": "Audit test AI metadata"
}

post_res = requests.post(f"{SUPABASE_URL}/rest/v1/reports", headers=headers, json=dummy_payload)
print("POST Dummy Report Status:", post_res.status_code)
print("POST Response Body:", post_res.text)
