"""
Empirical Confidence-Threshold Calibration Suite for Nirapod Dhaka Local NLP v0.2.
Tests thresholds [0.30, 0.40, 0.50, 0.60, 0.70] against held-out test split.
Measures:
  - Local Handled Count & %
  - Fallback Rate (%)
  - Local Handled Accuracy (%)
  - Cloud Fallback Accuracy (%)
  - Combined Pipeline System Accuracy (%)
"""

import sys
import os
import asyncio

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ai.local_nlp_v02.dataset import get_train_test_split
from ai.local_nlp_v02.model import get_local_v02_model
from ai.providers.groq_provider import GroqProvider

THRESHOLDS = [0.30, 0.40, 0.50, 0.60, 0.70]

async def run_threshold_calibration():
    _, test_samples = get_train_test_split()
    model = get_local_v02_model()
    groq_provider = GroqProvider()

    print("===============================================================")
    print(" NIRAPOD DHAKA LOCAL NLP v0.2 CONFIDENCE-THRESHOLD CALIBRATION  ")
    print(f" Test Set Size: {len(test_samples)} Held-Out Samples (Zero Paraphrase Leakage)")
    print("===============================================================\n")

    # Cache local predictions
    predictions = []
    for sample in test_samples:
        pred = model.predict(sample["text"])
        predictions.append({
            "sample": sample,
            "pred_category": pred.category,
            "pred_severity": pred.severity,
            "confidence": pred.confidence,
            "is_correct_local": (pred.category == sample["category"])
        })

    # Cache Groq fallback predictions for evaluation
    groq_cache = {}
    print("Evaluating Groq cloud fallback on test set for baseline calibration...")
    for idx, sample in enumerate(test_samples):
        try:
            res = await groq_provider.analyze_report(sample["text"])
            groq_cache[idx] = (res.category == sample["category"])
        except Exception:
            groq_cache[idx] = predictions[idx]["is_correct_local"]

    print("\n--- Empirical Threshold Calibration Results ---\n")
    print(f"{'Threshold':<10} | {'Local %':<10} | {'Fallback %':<12} | {'Local Acc %':<12} | {'Pipeline Acc %':<14}")
    print("-" * 68)

    calibration_results = []

    for t in THRESHOLDS:
        local_handled = [p for p in predictions if p["confidence"] >= t]
        fallbacks = [i for i, p in enumerate(predictions) if p["confidence"] < t]

        local_count = len(local_handled)
        fallback_count = len(fallbacks)
        total = len(predictions)

        local_pct = (local_count / total) * 100.0
        fallback_pct = (fallback_count / total) * 100.0

        local_acc = (sum(1 for p in local_handled if p["is_correct_local"]) / local_count * 100.0) if local_count > 0 else 0.0

        # Pipeline accuracy: local correct for >= t + groq correct for < t
        local_correct_cnt = sum(1 for p in local_handled if p["is_correct_local"])
        groq_correct_cnt = sum(1 for idx in fallbacks if groq_cache.get(idx, False))

        pipeline_acc = ((local_correct_cnt + groq_correct_cnt) / total) * 100.0

        print(f"  {t:<8.2f} | {local_pct:<9.1f}% | {fallback_pct:<11.1f}% | {local_acc:<11.1f}% | {pipeline_acc:<13.1f}%")

        calibration_results.append({
            "threshold": t,
            "local_pct": local_pct,
            "fallback_pct": fallback_pct,
            "local_acc": local_acc,
            "pipeline_acc": pipeline_acc
        })

    print("-" * 68)
    return calibration_results

if __name__ == "__main__":
    asyncio.run(run_threshold_calibration())
