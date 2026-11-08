from abc import ABC, abstractmethod
from ai.schemas import ReportIntelligence

class BaseAIProvider(ABC):
    @abstractmethod
    async def analyze_report(self, text: str) -> ReportIntelligence:
        pass
