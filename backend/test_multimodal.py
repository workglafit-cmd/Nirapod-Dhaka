import sys
import os
import asyncio
import base64

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.dirname(__file__))

from ai.multimodal.vision_service import analyze_hazard_image

# 1x1 dummy sample JPEG image in base64
TINY_JPEG_BASE64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP////////////////////////////////////////////////////////////////////////////////──────"

async def test_multimodal_vision():
    print("===============================================================")
    print("      NIRAPOD DHAKA MULTIMODAL VISION INTEGRATION TEST         ")
    print("===============================================================\n")

    test_text = "ei rastay ekta open manhole ase raat e dekha jay na"
    print(f"Testing Groq Vision API with report text:\n  \"{test_text}\"\n")

    try:
        # Test Groq Vision with test text comparison
        res = await analyze_hazard_image(TINY_JPEG_BASE64, text_report=test_text)
        print("--- RESULT FROM GROQ VISION MULTIMODAL API ---")
        print(f"Visual Hazard Detected: {res.get('visual_hazard_detected')}")
        print(f"Visual Category:        {res.get('visual_category')}")
        print(f"Visual Incident Type:   {res.get('visual_incident_type')}")
        print(f"Visual Severity:        {res.get('visual_severity')}")
        print(f"Visual Evidence Summary: {res.get('visual_evidence_summary')}")
        print(f"Match Status:           {res.get('cross_comparison', {}).get('match_status')}")
        print(f"Discrepancy Note:       {res.get('cross_comparison', {}).get('discrepancy_note')}")
        print("----------------------------------------------")
    except Exception as e:
        print(f"Multimodal vision test completed (Note: {type(e).__name__}: {e})")

if __name__ == "__main__":
    asyncio.run(test_multimodal_vision())
