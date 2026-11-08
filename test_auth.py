import os
from supabase import create_client

url = os.environ.get("VITE_SUPABASE_URL", "https://pqddaxdwjqquypfwqxcr.supabase.co")
key = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_DfjvPPvh9WCwB-hdRRHunA_AcxAVs2e")

supabase = create_client(url, key)

try:
    res = supabase.auth.sign_in_with_password({"email": "citycorp@demo.nirapod", "password": "demo123"})
    print("Success:", res)
except Exception as e:
    print("Error:", e)
    print("Error type:", type(e))
    if hasattr(e, 'message'):
        print("Error message:", e.message)
