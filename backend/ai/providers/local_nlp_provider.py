from ai.providers.base import BaseAIProvider
from ai.schemas import ReportIntelligence
from ai.local_nlp.model import get_local_model

class LocalNLPProvider(BaseAIProvider):
    async def analyze_report(self, text: str) -> ReportIntelligence:
        model = get_local_model()
        result = model.predict(text)
        
        # If model confidence is dangerously low, raise an exception to trigger Groq fallback
        if result.confidence < 0.35:
            raise ValueError(f"Local NLP model confidence too low ({result.confidence}). Fallback to primary LLM.")
            
        return result
