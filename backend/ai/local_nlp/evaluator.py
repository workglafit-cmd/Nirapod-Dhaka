"""
Empirical Evaluation Suite for Nirapod Dhaka Local NLP Model.
Measures measured Accuracy, Precision, Recall, Macro F1 across language subsets and semantic equivalence tests.
"""

import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ai.local_nlp.model import get_local_model

EVALUATION_DATASETS = {
    "Bangla": [
        {"text": "রাস্তায় একটা খোলা ম্যানহোল রয়েছে রাতে পড়ে যাওয়ার ভয় আছে", "category": "infrastructure", "severity": "high"},
        {"text": "রাতে এই রাস্তায় মোবাইল ছিনতাই হয়েছে পুলিশ টহল প্রয়োজন", "category": "crime", "severity": "critical"},
        {"text": "বাস ও সিএনজি মুখোমুখি সংঘর্ষে ২ জন গুরুতর আহত", "category": "accident", "severity": "critical"},
        {"text": "বৈদ্যুতিক লাইনে বড় ধরণের স্পার্ক হচ্ছে দ্রুত সাহায্য দরকার", "category": "accident", "severity": "high"},
        {"text": "রাস্তার মোড়ে ময়লার ভাগাড় গন্ধে টেকাই যাচ্ছে না", "category": "other", "severity": "low"}
    ],
    "Banglish": [
        {"text": "ei rastay gorto ar open manhole ase raat e accident hobe", "category": "infrastructure", "severity": "high"},
        {"text": "raat e goli te ekjon ke churi kora hoise knife chilo", "category": "crime", "severity": "critical"},
        {"text": "bus ar car crash korse road blockage onk beshi", "category": "accident", "severity": "critical"},
        {"text": "electric wire jhule ache transformer sparkling high risk", "category": "accident", "severity": "high"},
        {"text": "moila gari ashenai 3 din dhore smell hochhe", "category": "other", "severity": "low"}
    ],
    "English": [
        {"text": "Uncovered dangerous manhole in middle of road near school", "category": "infrastructure", "severity": "high"},
        {"text": "Armed robbery reported near apartment complex entrance", "category": "crime", "severity": "critical"},
        {"text": "Severe road crash involving truck and motorbike injuries reported", "category": "accident", "severity": "critical"},
        {"text": "High voltage wire hanging low dangerous spark near market", "category": "accident", "severity": "high"},
        {"text": "Overflowing garbage bin creating public health hazard", "category": "other", "severity": "low"}
    ],
    "Code-Switched": [
        {"text": "Mirpur road a manhole open obosthay ache, very dangerous at night", "category": "infrastructure", "severity": "high"},
        {"text": "goli te chintai hoise phone and wallet niye gese, police immediate help need", "category": "crime", "severity": "critical"},
        {"text": "head on collision between car and bus on flyover, emergency hospital team pathan", "category": "accident", "severity": "critical"},
        {"text": "transformer spark kortese fire risk high in main bazaar", "category": "accident", "severity": "high"},
        {"text": "moila r smell a rasta diye jawa jacche na, city corp clear it", "category": "other", "severity": "low"}
    ],
    "Noisy": [
        {"text": "opn manhol in d midle of road darkness danger", "category": "infrastructure", "severity": "high"},
        {"text": "churi hse ratre mobil nye geche knife shwoing", "category": "crime", "severity": "critical"},
        {"text": "garri accident bus truck hit blood help emergency", "category": "accident", "severity": "critical"},
        {"text": "elec wire spark fire threat fast help", "category": "accident", "severity": "high"},
        {"text": "garbag smell bad area clean rqstd", "category": "other", "severity": "low"}
    ]
}

SEMANTIC_EQUIVALENCE_PAIRS = [
    (
        "ei rastay ekta open manhole ase raat e dekha jay na onek dangerous",
        "রাস্তায় খোলা ম্যানহোল আছে রাতে দেখা যায় না পথচারী পড়ে যেতে পারে"
    ),
    (
        "raat e ekhane ekjon ke churi korse light nai manushjon o kom",
        "Armed robbery reported at night in dark alley near bus stand"
    ),
    (
        "bikel 4 tay ekta bus ar truck mukhomukhi dhakka lagse onek manush ahoto",
        "Head-on collision between bus and truck casualties high send ambulance"
    )
]

def calculate_metrics(y_true, y_pred):
    total = len(y_true)
    if total == 0:
        return 0.0, 0.0, 0.0, 0.0

    acc = sum(1 for t, p in zip(y_true, y_pred) if t == p) / total
    classes = sorted(list(set(y_true + y_pred)))

    precisions, recalls, f1s = [], [], []
    for c in classes:
        tp = sum(1 for t, p in zip(y_true, y_pred) if t == c and p == c)
        fp = sum(1 for t, p in zip(y_true, y_pred) if t != c and p == c)
        fn = sum(1 for t, p in zip(y_true, y_pred) if t == c and p != c)

        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0

        precisions.append(prec)
        recalls.append(rec)
        f1s.append(f1)

    macro_p = sum(precisions) / len(classes) if classes else 0.0
    macro_r = sum(recalls) / len(classes) if classes else 0.0
    macro_f1 = sum(f1s) / len(classes) if classes else 0.0

    return acc, macro_p, macro_r, macro_f1

def run_evaluation():
    model = get_local_model()
    results = {}

    overall_true = []
    overall_pred = []

    print("===============================================================")
    print("      NIRAPOD DHAKA LOCAL NLP MODEL EVALUATION BENCHMARK       ")
    print("===============================================================\n")

    for subset_name, samples in EVALUATION_DATASETS.items():
        y_true = [s["category"] for s in samples]
        y_pred = []

        for s in samples:
            res = model.predict(s["text"])
            y_pred.append(res.category)

        acc, p, r, f1 = calculate_metrics(y_true, y_pred)

        results[subset_name] = {
            "accuracy": acc,
            "precision": p,
            "recall": r,
            "f1_score": f1
        }

        overall_true.extend(y_true)
        overall_pred.extend(y_pred)

        print(f"--- Subset: {subset_name:<15} ---")
        print(f"  Accuracy:  {acc * 100:.1f}%")
        print(f"  Precision: {p * 100:.1f}%")
        print(f"  Recall:    {r * 100:.1f}%")
        print(f"  F1 Score:  {f1 * 100:.1f}%\n")

    tot_acc, tot_p, tot_r, tot_f1 = calculate_metrics(overall_true, overall_pred)

    print("===============================================================")
    print(f"OVERALL MODEL ACCURACY:  {tot_acc * 100:.1f}%")
    print(f"OVERALL MACRO F1 SCORE:  {tot_f1 * 100:.1f}%")
    print("===============================================================\n")

    print("--- Semantic Equivalence Equivalence Tests ---")
    equiv_matches = 0
    for idx, (t1, t2) in enumerate(SEMANTIC_EQUIVALENCE_PAIRS, 1):
        res1 = model.predict(t1)
        res2 = model.predict(t2)
        match = (res1.category == res2.category and res1.severity == res2.severity)
        if match:
            equiv_matches += 1
        print(f"Pair {idx}: CategoryMatch=({res1.category} vs {res2.category}), SeverityMatch=({res1.severity} vs {res2.severity}) -> {'PASS' if match else 'FAIL'}")

    equiv_score = (equiv_matches / len(SEMANTIC_EQUIVALENCE_PAIRS)) * 100
    print(f"\nSemantic Equivalence Match Rate: {equiv_score:.1f}%\n")

    return {
        "subsets": results,
        "overall_accuracy": tot_acc,
        "overall_f1": tot_f1,
        "semantic_equivalence_rate": equiv_score
    }

if __name__ == "__main__":
    run_evaluation()
