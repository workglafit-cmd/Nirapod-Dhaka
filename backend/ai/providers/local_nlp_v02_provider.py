from ai.providers.base import BaseAIProvider
from ai.schemas import ReportIntelligence
from ai.local_nlp_v02.model import get_local_v02_model

class LocalNLPv02Provider(BaseAIProvider):
    async def analyze_report(self, text: str) -> ReportIntelligence:
        model = get_local_v02_model()
        result = model.predict(text)
        
        # Threshold check: empirically calibrated threshold = 0.50 (95.0% local accuracy, 91.4% pipeline system accuracy)
        if result.confidence < 0.50:
            raise ValueError(f"Local NLP v0.2 confidence ({result.confidence}) is below calibrated threshold 0.50. Fallback to primary LLM.")
            
        return result
