"""
Empirical Evaluation Suite for Nirapod Dhaka Local NLP v0.2.
Evaluates on 25% HELD-OUT TEST SPLIT (Zero Paraphrase Leakage).
Measures:
  1. Held-Out Classification Metrics (Accuracy, Precision, Recall, Macro F1)
  2. Language Subset Breakdown (Bangla, Banglish, English, Code-Switched, Noisy)
  3. Cross-Lingual Semantic Embedding Similarity (Bangla <-> Banglish <-> English)
  4. Cross-Lingual Semantic Equivalence Classification
"""

import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ai.local_nlp_v02.dataset import get_train_test_split, SEMANTIC_EQUIVALENCE_PAIRS_V2
from ai.local_nlp_v02.model import get_local_v02_model
from ai.local_nlp_v02.encoder import get_multilingual_encoder

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

def run_evaluation_v02():
    train_samples, test_samples = get_train_test_split()
    model = get_local_v02_model()
    encoder = get_multilingual_encoder()

    print("===============================================================")
    print("   NIRAPOD DHAKA LOCAL NLP v0.2 EMPIRICAL BENCHMARK EVALUATION ")
    print("   Corpus Scale: Prototype (70 train / 25 held-out test samples)")
    print("   Data Policy: Zero Paraphrase Leakage between Train and Test  ")
    print("===============================================================\n")

    # 1. Evaluate by Language Subsets on Held-Out Test Set
    lang_subsets = {}
    for sample in test_samples:
        lang = sample["language"]
        if lang not in lang_subsets:
            lang_subsets[lang] = []
        lang_subsets[lang].append(sample)

    overall_true = []
    overall_pred = []

    for lang_name, samples in lang_subsets.items():
        y_true = [s["category"] for s in samples]
        y_pred = []

        for s in samples:
            res = model.predict(s["text"])
            y_pred.append(res.category)

        acc, p, r, f1 = calculate_metrics(y_true, y_pred)
        overall_true.extend(y_true)
        overall_pred.extend(y_pred)

        print(f"--- Subset: {lang_name:<15} (n={len(samples)}) ---")
        print(f"  Accuracy:  {acc * 100:.1f}%")
        print(f"  Precision: {p * 100:.1f}%")
        print(f"  Recall:    {r * 100:.1f}%")
        print(f"  F1 Score:  {f1 * 100:.1f}%\n")

    tot_acc, tot_p, tot_r, tot_f1 = calculate_metrics(overall_true, overall_pred)

    print("===============================================================")
    print(f"HELD-OUT TEST SET ACCURACY: {tot_acc * 100:.1f}%")
    print(f"HELD-OUT TEST MACRO F1:     {tot_f1 * 100:.1f}%")
    print("===============================================================\n")

    # 2. Semantic Embedding Similarity Benchmarks (Bangla <-> Banglish <-> English)
    print("--- Cross-Lingual Semantic Embedding Similarity Tests ---")
    sim_scores = []
    for pair in SEMANTIC_EQUIVALENCE_PAIRS_V2:
        t_bn = pair["text_bangla"]
        t_bng = pair["text_banglish"]
        t_en = pair["text_english"]

        sim_bn_bng = encoder.compute_similarity(t_bn, t_bng)
        sim_bn_en = encoder.compute_similarity(t_bn, t_en)
        sim_bng_en = encoder.compute_similarity(t_bng, t_en)
        avg_sim = round((sim_bn_bng + sim_bn_en + sim_bng_en) / 3.0, 4)
        sim_scores.append(avg_sim)

        print(f"Pair ({pair['pair_id']}):")
        print(f"  Bangla <-> Banglish Cosine Similarity: {sim_bn_bng:.4f}")
        print(f"  Bangla <-> English  Cosine Similarity: {sim_bn_en:.4f}")
        print(f"  Banglish <-> English Cosine Similarity: {sim_bng_en:.4f}")
        print(f"  Mean Triplet Cosine Similarity:       {avg_sim:.4f}\n")

    mean_overall_sim = round(sum(sim_scores) / len(sim_scores), 4) if sim_scores else 0.0
    print(f"OVERALL CROSS-LINGUAL SEMANTIC SIMILARITY: {mean_overall_sim:.4f}\n")

    # 3. Cross-Lingual Semantic Equivalence Classification Test
    print("--- Cross-Lingual Semantic Equivalence Classification ---")
    equiv_matches = 0
    total_pairs = len(SEMANTIC_EQUIVALENCE_PAIRS_V2)

    for pair in SEMANTIC_EQUIVALENCE_PAIRS_V2:
        res_bn = model.predict(pair["text_bangla"])
        res_bng = model.predict(pair["text_banglish"])
        res_en = model.predict(pair["text_english"])

        match = (res_bn.category == res_bng.category == res_en.category) and \
                (res_bn.severity == res_bng.severity == res_en.severity)
        if match:
            equiv_matches += 1

        print(f"Pair ({pair['pair_id']}): Bangla={res_bn.category}/{res_bn.severity}, Banglish={res_bng.category}/{res_bng.severity}, English={res_en.category}/{res_en.severity} -> {'PASS' if match else 'FAIL'}")

    equiv_rate = round((equiv_matches / total_pairs) * 100, 1)
    print(f"\nSemantic Equivalence Classification Match Rate: {equiv_rate}%\n")

    return {
        "held_out_accuracy": tot_acc,
        "held_out_f1": tot_f1,
        "mean_semantic_similarity": mean_overall_sim,
        "semantic_equivalence_rate": equiv_rate
    }

if __name__ == "__main__":
    run_evaluation_v02()
