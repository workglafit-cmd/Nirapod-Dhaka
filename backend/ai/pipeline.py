import logging
from ai.providers.local_nlp_v02_provider import LocalNLPv02Provider
from ai.providers.local_nlp_v01_provider import LocalNLPv01Provider
from ai.providers.groq_provider import GroqProvider
from ai.schemas import ReportIntelligence

logger = logging.getLogger("nirapod.ai.pipeline")

async def analyze_report(text: str) -> ReportIntelligence:
    """
    Hierarchical AI Safety Analysis Pipeline:
    1. Primary: Local NLP v0.2 (Pretrained Multilingual Dense Encoder + Domain Classification Heads)
    2. Baseline Fallback: Local NLP v0.1 (TF-IDF Word/Char N-Gram Baseline)
    3. External Fallback: Groq Cloud LLM (When local confidence < 0.40 or local inference fails)
    """
    # 1. Primary Level: Local NLP v0.2
    try:
        provider_v02 = LocalNLPv02Provider()
        result = await provider_v02.analyze_report(text)
        logger.info(f"[Pipeline] Local NLP v0.2 succeeded with confidence {result.confidence}")
        return result
    except Exception as err_v02:
        logger.warning(f"[Pipeline] Local NLP v0.2 fallback triggered: {err_v02}")

    # 2. Secondary Level: Local NLP v0.1 Baseline
    try:
        provider_v01 = LocalNLPv01Provider()
        result = await provider_v01.analyze_report(text)
        logger.info(f"[Pipeline] Local NLP v0.1 baseline succeeded with confidence {result.confidence}")
        return result
    except Exception as err_v01:
        logger.warning(f"[Pipeline] Local NLP v0.1 baseline fallback triggered: {err_v01}")

    # 3. Tertiary Level: Groq Cloud LLM Provider
    logger.info("[Pipeline] Delegating to Groq Cloud LLM provider...")
    groq_provider = GroqProvider()
    return await groq_provider.analyze_report(text)
