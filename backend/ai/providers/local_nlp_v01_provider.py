from ai.providers.base import BaseAIProvider
from ai.schemas import ReportIntelligence
from ai.local_nlp.model import get_local_model

class LocalNLPv01Provider(BaseAIProvider):
    """v0.1 TF-IDF word/character n-gram baseline provider."""
    async def analyze_report(self, text: str) -> ReportIntelligence:
        model = get_local_model()
        result = model.predict(text)
        if result.confidence < 0.40:
            raise ValueError(f"v0.1 TF-IDF confidence ({result.confidence}) below threshold.")
        return result
