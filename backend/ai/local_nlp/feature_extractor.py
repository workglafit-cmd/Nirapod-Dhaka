import re
import math
import numpy as np
from collections import Counter

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.pipeline import FeatureUnion
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

def preprocess_text(text: str) -> str:
    """Normalize text across Bangla, Banglish, and English."""
    if not text:
        return ""
    text = text.lower().strip()
    text = re.sub(r'\s+', ' ', text)
    return text

def extract_char_ngrams(text: str, n_min=3, n_max=5) -> list[str]:
    text = f" {preprocess_text(text)} "
    ngrams = []
    for n in range(n_min, n_max + 1):
        for i in range(len(text) - n + 1):
            ngrams.append(text[i:i+n])
    return ngrams

def extract_word_ngrams(text: str) -> list[str]:
    words = re.findall(r'(?u)\b\w+\b', preprocess_text(text))
    unigrams = words
    bigrams = [f"{words[i]} {words[i+1]}" for i in range(len(words)-1)]
    return unigrams + bigrams

class PureNumpyVectorizer:
    """Zero-dependency fallback TF-IDF Vectorizer."""
    def __init__(self):
        self.vocab = {}
        self.idf = {}
        self.is_fitted = False

    def fit(self, texts: list[str]):
        doc_counts = Counter()
        num_docs = len(texts)
        all_features = set()

        for t in texts:
            features = set(extract_word_ngrams(t) + extract_char_ngrams(t))
            for f in features:
                doc_counts[f] += 1
                all_features.add(f)

        self.vocab = {feat: idx for idx, feat in enumerate(sorted(all_features))}
        self.idf = {
            feat: math.log((1 + num_docs) / (1 + count)) + 1.0
            for feat, count in doc_counts.items()
        }
        self.is_fitted = True
        return self

    def transform(self, texts: list[str]) -> np.ndarray:
        matrix = np.zeros((len(texts), len(self.vocab)), dtype=np.float32)
        for row_idx, t in enumerate(texts):
            features = extract_word_ngrams(t) + extract_char_ngrams(t)
            counts = Counter(features)
            total = len(features) or 1
            for feat, cnt in counts.items():
                if feat in self.vocab:
                    col_idx = self.vocab[feat]
                    tf = 1 + math.log(cnt) if cnt > 0 else 0
                    matrix[row_idx, col_idx] = tf * self.idf[feat]
            # L2 normalize
            norm = np.linalg.norm(matrix[row_idx])
            if norm > 0:
                matrix[row_idx] /= norm
        return matrix

    def fit_transform(self, texts: list[str]) -> np.ndarray:
        self.fit(texts)
        return self.transform(texts)

class MultilingualFeatureExtractor:
    def __init__(self):
        self.use_sklearn = HAS_SKLEARN
        if self.use_sklearn:
            self.word_vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),
                preprocessor=preprocess_text,
                token_pattern=r'(?u)\b\w+\b',
                sublinear_tf=True
            )
            self.char_vectorizer = TfidfVectorizer(
                ngram_range=(3, 5),
                analyzer='char_wb',
                preprocessor=preprocess_text,
                sublinear_tf=True
            )
            self.union = FeatureUnion([
                ('word', self.word_vectorizer),
                ('char', self.char_vectorizer)
            ])
        else:
            self.fallback = PureNumpyVectorizer()
        self.is_fitted = False

    def fit(self, texts: list[str]):
        cleaned = [preprocess_text(t) for t in texts]
        if self.use_sklearn:
            self.union.fit(cleaned)
        else:
            self.fallback.fit(cleaned)
        self.is_fitted = True
        return self

    def transform(self, texts: list[str]):
        cleaned = [preprocess_text(t) for t in texts]
        if self.use_sklearn:
            return self.union.transform(cleaned)
        else:
            return self.fallback.transform(cleaned)

    def fit_transform(self, texts: list[str]):
        cleaned = [preprocess_text(t) for t in texts]
        if self.use_sklearn:
            res = self.union.fit_transform(cleaned)
        else:
            res = self.fallback.fit_transform(cleaned)
        self.is_fitted = True
        return res
