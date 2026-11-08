import json
import httpx
from config import GROK_API_KEY

GROK_URL = "https://api.x.ai/v1/chat/completions"

async def parse_user_intent(query: str) -> dict:
    if not GROK_API_KEY:
        # Fallback if no key
        return {
            "destination": query,
            "mode": "driving",
            "preferences": []
        }
        
    prompt = """
    You are an AI Route Assistant. Extract the routing intent from the user's query.
    Return ONLY a JSON object with the following keys:
    - destination: string (the physical location the user wants to go to, or null if not found)
    - mode: string (one of 'driving', 'walking', 'cycling'. Guess 'driving' if unspecified)
    - preferences: list of strings (e.g. ['avoid_crime', 'well_lit', 'safest', 'fastest'])
    """
    
    headers = {
        "Authorization": f"Bearer {GROK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "grok-beta",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": query}
        ],
        "response_format": {"type": "json_object"}
    }
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(GROK_URL, headers=headers, json=payload, timeout=10.0)
            res.raise_for_status()
            data = res.json()
            content = data["choices"][0]["message"]["content"]
            return json.loads(content)
        except Exception as e:
            print(f"Grok API Error: {e}")
            return {
                "destination": query,
                "mode": "driving",
                "preferences": []
            }

async def generate_route_explanation(query: str, route_details: dict) -> str:
    if not GROK_API_KEY:
        return "I found the safest route based on real-time hazard data."
        
    prompt = f"""
    You are an AI Route Assistant for Nirapod Dhaka.
    The user asked: '{query}'
    
    The backend selected the safest route. Here are the details:
    {json.dumps(route_details, indent=2)}
    
    Explain concisely why this route was chosen. Mention what hazards were avoided if applicable.
    Do NOT use markdown bolding excessively. Keep it to 1-2 friendly sentences.
    """
    
    headers = {
        "Authorization": f"Bearer {GROK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "grok-beta",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(GROK_URL, headers=headers, json=payload, timeout=10.0)
            res.raise_for_status()
            data = res.json()
            return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"Grok API Error: {e}")
            return "I found the safest route based on real-time hazard data."


GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

async def groq_chat_completion(messages: list, system_prompt: str = "") -> str:
    from config import GROQ_API_KEY
    if not GROQ_API_KEY:
        return "Groq API Key is not configured."
        
    formatted_messages = []
    if system_prompt:
        formatted_messages.append({"role": "system", "content": system_prompt})
    formatted_messages.extend(messages)
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": formatted_messages,
        "temperature": 0.7,
        "max_tokens": 1024
    }
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(GROQ_URL, headers=headers, json=payload, timeout=15.0)
            res.raise_for_status()
            data = res.json()
            return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"Groq API Error: {e}")
            raise Exception(f"Groq API request failed: {e}")

