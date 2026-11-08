import hmac
import hashlib
import json
import base64
import time
import os

SECRET_KEY = os.getenv("VERIFICATION_SECRET_KEY", "nirapod-dhaka-vision-verify-secret-key-2026")

def generate_verification_token(image_hash: str, text_hash: str, category: str, status: str, confidence: float) -> str:
    payload = {
        "img_h": image_hash,
        "txt_h": text_hash,
        "cat": category.lower(),
        "status": status.lower(),
        "conf": round(confidence, 2),
        "ts": int(time.time())
    }
    raw_payload = json.dumps(payload, sort_keys=True).encode("utf-8")
    signature = hmac.new(SECRET_KEY.encode("utf-8"), raw_payload, hashlib.sha256).hexdigest()
    token_dict = {
        "payload": payload,
        "sig": signature
    }
    return base64.urlsafe_b64encode(json.dumps(token_dict).encode("utf-8")).decode("utf-8")

def verify_verification_token(token_str: str, text_report: str, category: str) -> tuple[bool, str]:
    if not token_str:
        return False, "TOKEN_MISSING"
    try:
        raw_json = base64.urlsafe_b64decode(token_str.encode("utf-8")).decode("utf-8")
        token_dict = json.loads(raw_json)
        payload = token_dict.get("payload", {})
        sig = token_dict.get("sig", "")
        
        # 1. Verify HMAC signature
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), json.dumps(payload, sort_keys=True).encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return False, "INVALID_TOKEN_SIGNATURE"
            
        # 2. Check token expiration (30 minutes)
        if time.time() - payload.get("ts", 0) > 1800:
            return False, "TOKEN_EXPIRED"
            
        # 3. Check status
        if payload.get("status") != "acceptable":
            return False, f"STATUS_NOT_ACCEPTABLE:{payload.get('status')}"
            
        # 4. Check text hash consistency
        calc_txt_h = hashlib.sha256(text_report.strip().encode("utf-8")).hexdigest()[:16]
        if payload.get("txt_h") != calc_txt_h:
            return False, "TEXT_CONTENT_CHANGED_AFTER_VERIFICATION"
            
        # 5. Check category consistency
        if payload.get("cat") != category.lower():
            return False, "CATEGORY_CHANGED_AFTER_VERIFICATION"
            
        return True, "VERIFIED"
    except Exception as e:
        return False, f"TOKEN_DECODE_FAILED:{str(e)}"
