from pydantic import BaseModel, Field, computed_field
from typing import Literal

class ReportIntelligence(BaseModel):
    category: Literal["crime", "infrastructure", "accident", "other"]
    incident_type: str = Field(description="Specific type of incident, e.g. 'Open Manhole', 'Robbery', 'Broken Road'")
    severity: Literal["low", "medium", "high", "critical"]
    urgency: Literal["low", "medium", "high", "critical"]
    language: str = Field(description="Detected language, e.g. 'Bangla', 'Banglish', 'English', 'Mixed'")
    relevant_authority: Literal["police", "city_corp", "dmb", "unknown"]
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str = Field(description="Short reason explaining the categorization and severity.")

    @computed_field
    def priority_score(self) -> float:
        sev_map = {"low": 10, "medium": 20, "high": 30, "critical": 40}
        urg_map = {"low": 10, "medium": 20, "high": 30, "critical": 40}
        s = sev_map.get(self.severity, 10)
        u = urg_map.get(self.urgency, 10)
        return round(s + u + (self.confidence * 20.0), 1)
