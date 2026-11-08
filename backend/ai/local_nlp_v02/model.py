import re
import numpy as np
from ai.schemas import ReportIntelligence
from ai.local_nlp_v02.encoder import get_multilingual_encoder
from ai.local_nlp_v02.dataset import get_train_test_split
from ai.local_nlp_v02.business_rules import derive_authority

try:
    from sklearn.linear_model import LogisticRegression
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

def detect_language(text: str) -> str:
    """Detect language type of input report."""
    if re.search(r'[\u0980-\u09FF]', text):
        if re.search(r'[a-zA-Z]', text):
            return "Code-switched"
        return "Bangla"
    
    banglish_keywords = {"ase", "nai", "ekta", "onek", "rastay", "raat", "churi", "gorto", "dekha", "korse", "ekjon", "gari", "bikel", "dhakka", "moila", "goli"}
    words = set(re.findall(r'\b\w+\b', text.lower()))
    if words.intersection(banglish_keywords):
        return "Banglish"
    return "English"

class SoftmaxClassifierHead:
    """Softmax centroid classification head operating on dense embeddings."""
    def __init__(self, temperature=4.0):
        self.classes_ = []
        self.centroids = []
        self.temperature = temperature

    def fit(self, X: np.ndarray, y: list[str]):
        self.classes_ = sorted(list(set(y)))
        self.centroids = []
        for c in self.classes_:
            indices = [i for i, label in enumerate(y) if label == c]
            sub_X = X[indices]
            centroid = np.mean(sub_X, axis=0)
            norm = np.linalg.norm(centroid)
            if norm > 0:
                centroid /= norm
            self.centroids.append(centroid)
        self.centroids = np.array(self.centroids, dtype=np.float32)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        sims = np.dot(X, self.centroids.T)
        exp_sims = np.exp(sims * self.temperature)
        sums = np.sum(exp_sims, axis=1, keepdims=True)
        sums[sums == 0] = 1.0
        return exp_sims / sums

class LocalNLPv02Model:
    """
    Local NLP v0.2 Model for Nirapod Dhaka.
    Uses pretrained multilingual dense embeddings with domain classification heads.
    """
    def __init__(self):
        self.encoder = get_multilingual_encoder()
        self.use_sklearn = HAS_SKLEARN
        
        if self.use_sklearn:
            self.head_category = LogisticRegression(C=2.0, max_iter=500, class_weight='balanced')
            self.head_incident = LogisticRegression(C=2.0, max_iter=500, class_weight='balanced')
            self.head_severity = LogisticRegression(C=2.0, max_iter=500, class_weight='balanced')
            self.head_urgency = LogisticRegression(C=2.0, max_iter=500, class_weight='balanced')
        else:
            self.head_category = SoftmaxClassifierHead()
            self.head_incident = SoftmaxClassifierHead()
            self.head_severity = SoftmaxClassifierHead()
            self.head_urgency = SoftmaxClassifierHead()
            
        self.is_trained = False

    def train(self, train_samples=None):
        if train_samples is None:
            train_samples, _ = get_train_test_split()

        texts = [s["text"] for s in train_samples]
        X = self.encoder.encode(texts)

        y_category = [s["category"] for s in train_samples]
        y_incident = [s["incident_type"] for s in train_samples]
        y_severity = [s["severity"] for s in train_samples]
        y_urgency = [s["urgency"] for s in train_samples]

        self.head_category.fit(X, y_category)
        self.head_incident.fit(X, y_incident)
        self.head_severity.fit(X, y_severity)
        self.head_urgency.fit(X, y_urgency)

        self.is_trained = True
        return self

    def predict(self, text: str) -> ReportIntelligence:
        if not self.is_trained:
            self.train()

        X = self.encoder.encode([text])

        # Category prediction & probability
        cat_probs = self.head_category.predict_proba(X)[0]
        cat_idx = np.argmax(cat_probs)
        category = self.head_category.classes_[cat_idx]
        cat_conf = float(cat_probs[cat_idx])

        # Incident type prediction
        inc_probs = self.head_incident.predict_proba(X)[0]
        inc_idx = np.argmax(inc_probs)
        incident_type = self.head_incident.classes_[inc_idx]

        # Severity prediction & probability
        sev_probs = self.head_severity.predict_proba(X)[0]
        sev_idx = np.argmax(sev_probs)
        severity = self.head_severity.classes_[sev_idx]
        sev_conf = float(sev_probs[sev_idx])

        # Urgency prediction & probability
        urg_probs = self.head_urgency.predict_proba(X)[0]
        urg_idx = np.argmax(urg_probs)
        urgency = self.head_urgency.classes_[urg_idx]
        urg_conf = float(urg_probs[urg_idx])

        # Overall model confidence
        overall_confidence = round(float((cat_conf + sev_conf + urg_conf) / 3.0), 2)
        
        # Authority routing via deterministic business rules
        authority = derive_authority(category, incident_type, severity)
        lang = detect_language(text)

        reason = f"Local NLP v0.2 pretrained encoder matched '{incident_type}' ({category}) with {int(overall_confidence * 100)}% confidence."

        return ReportIntelligence(
            category=category,
            incident_type=incident_type,
            severity=severity,
            urgency=urgency,
            language=lang,
            relevant_authority=authority,
            confidence=overall_confidence,
            reason=reason
        )

_model_v02_instance = None

def get_local_v02_model() -> LocalNLPv02Model:
    global _model_v02_instance
    if _model_v02_instance is None:
        _model_v02_instance = LocalNLPv02Model()
        _model_v02_instance.train()
    return _model_v02_instance
