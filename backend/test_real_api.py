import sys
import os
import asyncio

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.dirname(__file__))

from config import GROQ_API_KEY
from ai.pipeline import analyze_report

async def test_report():
    print(f"Loaded GROQ_API_KEY: {'[PRESENT]' if GROQ_API_KEY else '[MISSING]'}")
    if GROQ_API_KEY:
        print(f"Key preview: {GROQ_API_KEY[:7]}...{GROQ_API_KEY[-4:] if len(GROQ_API_KEY) > 10 else ''}")

    test_inputs = [
        "ei rastay ekta open manhole ase raat e dekha jay na onek dangerous",
        "raat e ekhane ekjon ke churi korse light nai manushjon o kom"
    ]

    for test_text in test_inputs:
        print(f"\nAnalyzing test input:\n  \"{test_text}\"\n")
        try:
            result = await analyze_report(test_text)
            print("--- RESULT FROM REAL API ---")
            print(f"Category:          {result.category}")
            print(f"Incident Type:     {result.incident_type}")
            print(f"Severity:          {result.severity}")
            print(f"Urgency:           {result.urgency}")
            print(f"Language:          {result.language}")
            print(f"Authority:         {result.relevant_authority}")
            print(f"Confidence:        {result.confidence}")
            print(f"Reason:            {result.reason}")
            print(f"Priority Score:    {result.priority_score}")
            print("----------------------------")
        except Exception as e:
            print(f"Error during API analysis: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test_report())
