import json
import asyncio
import requests
from config import GROQ_API_KEY
from ai.schemas import ReportIntelligence
from ai.providers.base import BaseAIProvider

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

class GroqProvider(BaseAIProvider):
    async def analyze_report(self, text: str) -> ReportIntelligence:
        if not GROQ_API_KEY:
            raise Exception("Groq API Key is not configured.")

        system_prompt = """
You are an expert AI public safety analyst for Nirapod Dhaka. Your task is to analyze civic hazard reports written in Bangla, Banglish, English, or a mix of these.
Output ONLY a JSON object that strictly adheres to the requested schema.

Supported categories: 'crime', 'infrastructure', 'accident', 'other'.
Supported severities: 'low', 'medium', 'high', 'critical'.
Supported urgencies: 'low', 'medium', 'high', 'critical'.
Supported authorities: 'police' (for crime/severe accidents), 'city_corp' (for general infrastructure), 'dmb' (Disaster Management Board, for severe infrastructure/hazards), 'unknown'.

Example input: 'ei rastay ekta open manhole ase raat e dekha jay na onek dangerous'
Example output:
{
  "category": "infrastructure",
  "incident_type": "Open Manhole",
  "severity": "high",
  "urgency": "high",
  "language": "Banglish",
  "relevant_authority": "city_corp",
  "confidence": 0.95,
  "reason": "Open manhole combined with nighttime visibility risk."
}

If the report cannot be confidently classified into crime, infrastructure, or accident, set category to 'other' and relevant_authority to 'unknown'.
"""

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "openai/gpt-oss-20b",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            "temperature": 0.1,
            "response_format": {"type": "json_object"}
        }

        def _make_request():
            response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=20)
            response.raise_for_status()
            return response.json()

        data = await asyncio.to_thread(_make_request)
        content = data["choices"][0]["message"]["content"]
        
        parsed = json.loads(content)
        return ReportIntelligence(**parsed)
