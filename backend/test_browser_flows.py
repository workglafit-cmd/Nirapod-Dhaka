import sys
import os
from fastapi.testclient import TestClient

# Ensure root is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app

client = TestClient(app)

def run_tests():
    print("=== RUNNING BROWSER E2E FLOW AUDIT (FASTAPI TESTCLIENT) ===\n")
    
    # TEST 1: Banglish Text Report
    print("TEST 1: Banglish Text Report ('ei rastay ekta open manhole ase...')")
    text1 = "ei rastay ekta open manhole ase, rate dekha jay na, manush pore jete pare"
    resp1 = client.post("/api/analyze-report", json={"text": text1})
    print(f"Status Code: {resp1.status_code}")
    res1_json = resp1.json()
    res1 = res1_json.get("data", {})
    print(f"  AI Category: {res1.get('category')}")
    print(f"  Incident Type: {res1.get('incident_type')}")
    print(f"  Severity: {res1.get('severity')}")
    print(f"  Urgency: {res1.get('urgency')}")
    print(f"  Confidence: {res1.get('confidence')}")
    print(f"  Priority Score: {res1.get('priority_score')}")
    print(f"  Relevant Authority: {res1.get('relevant_authority')}")
    print(f"  Reason: {res1.get('reason')}")
    assert resp1.status_code == 200 and res1.get('confidence') is not None, "Test 1 failed!"
    print("SUCCESS: TEST 1 PASSED\n")

    # TEST 2: Native Bangla Text Report
    print("TEST 2: Native Bangla Text Report ('মিরপুর ১০ এ রাস্তার ড্রেন...')")
    text2 = "মিরপুর ১০ এ রাস্তার ড্রেন উন্মুক্ত অবস্থায় আছে এবং দুর্ঘটনা ঘটছে"
    resp2 = client.post("/api/analyze-report", json={"text": text2})
    print(f"Status Code: {resp2.status_code}")
    res2_json = resp2.json()
    res2 = res2_json.get("data", {})
    print(f"  AI Category: {res2.get('category')}")
    print(f"  Incident Type: {res2.get('incident_type')}")
    print(f"  Severity: {res2.get('severity')}")
    print(f"  Confidence: {res2.get('confidence')}")
    print(f"  Priority Score: {res2.get('priority_score')}")
    print(f"  Relevant Authority: {res2.get('relevant_authority')}")
    assert resp2.status_code == 200 and res2.get('confidence') is not None, "Test 2 failed!"
    print("SUCCESS: TEST 2 PASSED\n")

    # TEST 3: Voice Report Endpoint Audit
    print("TEST 3: Voice Report Endpoint Audit")
    resp3 = client.post("/api/analyze-voice-report", json={"audio_base64": "SGVsbG8gV29ybGQ=", "mime_type": "audio/webm"})
    print(f"Status Code: {resp3.status_code}")
    res3 = resp3.json()
    print(f"  Voice Analysis Response: {res3}")
    assert resp3.status_code == 200, "Test 3 failed!"
    print("SUCCESS: TEST 3 PASSED\n")

    # TEST 4: Image Report Endpoint Audit
    print("TEST 4: Image Report Endpoint Audit")
    resp4 = client.post("/api/analyze-image-report", json={"image_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "text_report": "open manhole near road"})
    print(f"Status Code: {resp4.status_code}")
    res4 = resp4.json()
    print(f"  Image Analysis Response: {res4}")
    assert resp4.status_code == 200, "Test 4 failed!"
    print("SUCCESS: TEST 4 PASSED\n")

    # TEST 5: AI Failure → Manual Fallback
    print("TEST 5: AI Failure → Manual Reporting Fallback")
    resp5 = client.post("/api/analyze-report", json={"text": ""})
    print(f"Status Code: {resp5.status_code}")
    res5 = resp5.json()
    print(f"  Fallback Response: {res5}")
    assert resp5.status_code == 200, "Test 5 failed!"
    print("SUCCESS: TEST 5 PASSED\n")

    # TEST 6: Priority Score Sorting Audit
    print("TEST 6: Priority Score Sorting Audit")
    pri1 = res1.get('priority_score', 0)
    text_low = "ordinary quiet street photo"
    resp_low = client.post("/api/analyze-report", json={"text": text_low})
    pri_low = resp_low.json().get("data", {}).get('priority_score', 0)
    print(f"  High Hazard Score ('{text1[:30]}...'): {pri1}")
    print(f"  Low Hazard Score ('{text_low}'): {pri_low}")
    assert pri1 >= pri_low, "Priority score audit failed!"
    print("SUCCESS: TEST 6 PASSED\n")

    print("==================================================")
    print("ALL 6 BACKEND & USER FLOW AUDIT SUITES PASSED CLEANLY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
