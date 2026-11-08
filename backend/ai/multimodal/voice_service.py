import os
import io
import base64
import requests
from config import GROQ_API_KEY
from ai.pipeline import analyze_report
from ai.schemas import ReportIntelligence

GROQ_TRANSCRIPTION_URL = "https://api.groq.com/openai/v1/audio/transcriptions"

async def transcribe_and_analyze_audio(audio_base64: str, mime_type: str = "audio/webm") -> dict:
    """
    Transcribes audio using Groq Whisper API, then passes transcribed text
    directly into Nirapod Dhaka Local NLP Pipeline.
    """
    if not GROQ_API_KEY:
        raise ValueError("Groq API Key is missing for audio transcription.")

    # Remove data URL header if present (e.g. "data:audio/webm;base64,...")
    if "," in audio_base64:
        audio_base64 = audio_base64.split(",")[1]

    audio_bytes = base64.b64decode(audio_base64)
    file_ext = "webm" if "webm" in mime_type else "mp3" if "mp3" in mime_type else "wav"

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}"
    }

    files = {
        "file": (f"speech_report.{file_ext}", io.BytesIO(audio_bytes), mime_type),
        "model": (None, "whisper-large-v3-turbo"),
        "response_format": (None, "json")
    }

    # Transcribe audio using Whisper
    response = requests.post(GROQ_TRANSCRIPTION_URL, headers=headers, files=files, timeout=25)
    response.raise_for_status()
    transcription_data = response.json()
    transcribed_text = transcription_data.get("text", "").strip()

    if not transcribed_text:
        raise ValueError("Audio transcription yielded no text.")

    # Pass transcribed natural language into Nirapod Local NLP Pipeline
    intelligence = await analyze_report(transcribed_text)

    return {
        "transcribed_text": transcribed_text,
        "intelligence": intelligence.dict()
    }
