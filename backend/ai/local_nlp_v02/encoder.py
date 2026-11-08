import re
import math
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False

try:
    import torch
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

def preprocess_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower().strip()
    return re.sub(r'\s+', ' ', text)

class FallbackSubwordEncoder:
    """
    Subword & character n-gram dense hashing encoder producing 384-dimensional embeddings.
    Provides a deterministic semantic feature space for multilingual Bangla, Banglish, and English text.
    """
    def __init__(self, dim=384):
        self.dim = dim

    def _hash_ngram(self, ngram: str) -> int:
        h = 2166136261
        for char in ngram.encode('utf-8'):
            h = (h ^ char) * 16777619
            h &= 0xFFFFFFFF
        return h % self.dim

    def encode_text(self, text: str) -> np.ndarray:
        cleaned = preprocess_text(text)
        vec = np.zeros(self.dim, dtype=np.float32)

        words = re.findall(r'(?u)\b\w+\b', cleaned)
        for w in words:
            # Word unigrams & bigrams
            idx = self._hash_ngram(f"w_{w}")
            vec[idx] += 2.0
            
            # Subword character n-grams (3 to 5)
            padded = f" {w} "
            for n in range(3, 6):
                for i in range(len(padded) - n + 1):
                    ngram = padded[i:i+n]
                    h_idx = self._hash_ngram(f"c_{ngram}")
                    vec[h_idx] += 1.0

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec /= norm
        return vec

    def encode(self, texts: list[str]) -> np.ndarray:
        return np.array([self.encode_text(t) for t in texts], dtype=np.float32)

class MultilingualEncoder:
    """
    Pretrained Multilingual Encoder wrapper.
    Uses 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2' when PyTorch/SentenceTransformers are present,
    or FallbackSubwordEncoder (384-d) when loading.
    """
    def __init__(self, model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"):
        self.model_name = model_name
        self.st_model = None
        self.fallback = FallbackSubwordEncoder(dim=384)
        self.use_st = False

        if HAS_SENTENCE_TRANSFORMERS and HAS_TORCH:
            try:
                if hasattr(torch, "set_num_threads"):
                    torch.set_num_threads(4)
                self.st_model = SentenceTransformer(model_name, device="cpu")
                self.use_st = True
            except Exception:
                self.use_st = False

    def encode(self, texts: list[str]) -> np.ndarray:
        if isinstance(texts, str):
            texts = [texts]

        if self.use_st and self.st_model is not None:
            embeddings = self.st_model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
            return embeddings.astype(np.float32)
        else:
            return self.fallback.encode(texts)

    def compute_similarity(self, text1: str, text2: str) -> float:
        """Computes cosine similarity between dense embeddings of two text inputs."""
        v1 = self.encode([text1])[0]
        v2 = self.encode([text2])[0]
        dot = float(np.dot(v1, v2))
        norm1 = float(np.linalg.norm(v1))
        norm2 = float(np.linalg.norm(v2))
        if norm1 > 0 and norm2 > 0:
            return round(dot / (norm1 * norm2), 4)
        return 0.0

_encoder_instance = None

def get_multilingual_encoder() -> MultilingualEncoder:
    global _encoder_instance
    if _encoder_instance is None:
        _encoder_instance = MultilingualEncoder()
    return _encoder_instance
