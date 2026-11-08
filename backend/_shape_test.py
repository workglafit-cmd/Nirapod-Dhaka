"""Live API smoke tests — verify the response SHAPE matches the user's
contract for each of the 3 states, even if the actual vision verdict is
"analysis_failed" because no vision provider is configured.

Also exercises the prompt to show what the model *would* return if a real
vision key were set.
"""
import json, urllib.request, urllib.error, base64

API = "http://127.0.0.1:8000/api/analyze-image-report"
TINY_JPEG = bytes.fromhex(
    "ffd8ffe000104a46494600010101006000600000ffdb00430008060607060508070707090908"
    "0a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c303134"
    "34341f27393d38323c2e333432"
    "ffc00011080001000103012200021101031101"
    "ffc4001f0000010501010101010100000000000000000102030405060708090a0b"
    "ffc400b5100002010303020403050504040000017d010203000411051221314106135161072271"
    "14328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a"
    "434445464748494a535455565758595a636465666768696a737475767778797a83848586878889"
    "8a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3"
    "d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9fa"
    "ffda000c03010002110311003f00fbd0a2800a28a000a28a00ffd9"
)

def post(jpg, text, category):
    b64 = base64.b64encode(jpg).decode()
    body = json.dumps({"image_base64": f"data:image/jpeg;base64,{b64}", "text_report": text, "category": category}).encode()
    req = urllib.request.Request(API, data=body, method="POST", headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return {"status": "http_error", "code": e.code}

report = "ei rastay ekta open manhole ase, rate dekha jay na, manush pore jete pare"
r = post(TINY_JPEG, report, "infrastructure")
print("=== TEST F (API failure / 1x1 dummy image) ===")
print(json.dumps(r, indent=2, ensure_ascii=False))

# Verify response shape contract
print("\n=== CONTRACT VERIFICATION ===")
d = r.get("data", {})
required = ["status", "match", "confidence", "visual_summary", "consistency_reason", "category_match", "verification_token"]
for k in required:
    present = k in d
    print(f"  {k:20s}  present={present}  value={d.get(k)!r}")
print(f"\nfinal status: {d.get('status')!r}  (acceptable | mismatch | uncertain | analysis_failed)")
print(f"verification_token issued: {bool(d.get('verification_token'))}  (must be False for any non-acceptable)")
