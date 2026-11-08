import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv() # Fallback to standard search

SUPABASE_URL = os.getenv("SUPABASE_URL", os.getenv("VITE_SUPABASE_URL"))
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use service role if needed, or public key for reads
if not SUPABASE_SERVICE_KEY:
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_ANON_KEY", os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY"))

GROK_API_KEY = os.getenv("GROK_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", os.getenv("VITE_GROQ_API_KEY"))
# Paid vision providers are retained for a future CV layer but are NOT used
# on the demo report flow. DEMO_VISUAL_VERIFICATION defaults to true so
# OpenAI/Groq Vision is never called for image verification in this demo.
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_VISION_MODEL = os.getenv("OPENAI_VISION_MODEL", "gpt-4o-mini")
DEMO_VISUAL_VERIFICATION = os.getenv("DEMO_VISUAL_VERIFICATION", "true").strip().lower() in {
    "1",
    "true",
    "yes",
    "on",
}
