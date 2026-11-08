import sys
import os
import asyncio

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.dirname(__file__))

from ai.pipeline import analyze_report

TEST_MATRIX = [
    {
        "label": "Test 1: Native Bangla Report",
        "input": "রাস্তায় একটি ম্যানহোল খোলা অবস্থায় পড়ে আছে, রাতের আঁধারে বড় দুর্ঘটনা ঘটতে পারে"
    },
    {
        "label": "Test 2: Banglish Report",
        "input": "ei rastay ekta open manhole ase raat e dekha jay na onek dangerous"
    },
    {
        "label": "Test 3: English Report",
        "input": "Armed robbery reported in dark alley behind bus terminal at night"
    },
    {
        "label": "Test 4: Code-switched Report",
        "label_desc": "Bangla + English Mixed",
        "input": "Flyover cross a heavy truck vs car crash, emergency hospital team needed"
    },
    {
        "label": "Test 5: Noisy Speech-Style Input",
        "input": "churi hse ratre mobil nye geche knife shwoing fast police"
    },
    {
        "label": "Test 6: Vague / Low-Confidence Input (Triggers Groq Fallback)",
        "input": "ajke khub brishti hocche shohore kothao jawar upay nai"
    }
]

async def run_system_verification():
    print("===============================================================")
    print("   NIRAPOD DHAKA FULL SYSTEM END-TO-END VERIFICATION SUITE     ")
    print("===============================================================\n")

    for test_case in TEST_MATRIX:
        print(f"--- {test_case['label']} ---")
        print(f"Input: \"{test_case['input']}\"\n")
        try:
            res = await analyze_report(test_case['input'])
            print(f"  Category:          {res.category}")
            print(f"  Incident Type:     {res.incident_type}")
            print(f"  Severity:          {res.severity}")
            print(f"  Urgency:           {res.urgency}")
            print(f"  Language:          {res.language}")
            print(f"  Authority:         {res.relevant_authority}")
            print(f"  Confidence:        {res.confidence}")
            print(f"  Priority Score:    {res.priority_score}")
            print(f"  Reasoning:         {res.reason}")
            print("---------------------------------------------------------------\n")
        except Exception as e:
            print(f"  Error processing report: {e}\n")

if __name__ == "__main__":
    asyncio.run(run_system_verification())
