import re
import numpy as np
from ai.schemas import ReportIntelligence
from ai.local_nlp.feature_extractor import MultilingualFeatureExtractor
from ai.local_nlp.dataset import TRAINING_DATA

try:
    from sklearn.linear_model import LogisticRegression
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

def detect_language(text: str) -> str:
    """Detect whether input text is Bangla script, English, Banglish, or Code-switched."""
    if re.search(r'[\u0980-\u09FF]', text):
        if re.search(r'[a-zA-Z]', text):
            return "Code-switched"
        return "Bangla"
    
    banglish_keywords = {"ase", "nai", "ekta", "onek", "rastay", "raat", "churi", "gorto", "dekha", "korse", "ekjon", "gari"}
    words = set(re.findall(r'\b\w+\b', text.lower()))
    if words.intersection(banglish_keywords):
        return "Banglish"
    return "English"

class PureNumpyHead:
    """Zero-dependency nearest centroid cosine similarity head with softmax probabilities."""
    def __init__(self):
        self.classes_ = []
        self.centroids = []

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
        self.centroids = np.array(self.centroids)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        # Cosine similarity matrix: (n_samples, n_classes)
        sims = np.dot(X, self.centroids.T)
        # Apply temperature scaled softmax
        exp_sims = np.exp(sims * 5.0)
        sums = np.sum(exp_sims, axis=1, keepdims=True)
        sums[sums == 0] = 1.0
        return exp_sims / sums

class LocalSafetyClassifier:
    """
    Multilingual fine-tuned classifier for Nirapod Dhaka public safety domain.
    Trains multi-head models on hybrid n-gram TF-IDF representations.
    """
    def __init__(self):
        self.extractor = MultilingualFeatureExtractor()
        self.use_sklearn = HAS_SKLEARN
        if self.use_sklearn:
            self.clf_category = LogisticRegression(C=2.0, max_iter=500, class_weight='balanced')
            self.clf_severity = LogisticRegression(C=2.0, max_iter=500, class_weight='balanced')
            self.clf_urgency = LogisticRegression(C=2.0, max_iter=500, class_weight='balanced')
            self.clf_authority = LogisticRegression(C=2.0, max_iter=500, class_weight='balanced')
            self.clf_incident = LogisticRegression(C=2.0, max_iter=500, class_weight='balanced')
        else:
            self.clf_category = PureNumpyHead()
            self.clf_severity = PureNumpyHead()
            self.clf_urgency = PureNumpyHead()
            self.clf_authority = PureNumpyHead()
            self.clf_incident = PureNumpyHead()
        self.is_trained = False

    def train(self, dataset=None):
        if dataset is None:
            dataset = TRAINING_DATA

        texts = [sample["text"] for sample in dataset]
        X = self.extractor.fit_transform(texts)

        if not self.use_sklearn and hasattr(X, "toarray"):
            X = X.toarray()

        y_category = [sample["category"] for sample in dataset]
        y_severity = [sample["severity"] for sample in dataset]
        y_urgency = [sample["urgency"] for sample in dataset]
        y_authority = [sample["relevant_authority"] for sample in dataset]
        y_incident = [sample["incident_type"] for sample in dataset]

        self.clf_category.fit(X, y_category)
        self.clf_severity.fit(X, y_severity)
        self.clf_urgency.fit(X, y_urgency)
        self.clf_authority.fit(X, y_authority)
        self.clf_incident.fit(X, y_incident)
        self.is_trained = True
        return self

    def predict(self, text: str) -> ReportIntelligence:
        if not self.is_trained:
            self.train()

        X = self.extractor.transform([text])
        if not self.use_sklearn and hasattr(X, "toarray"):
            X = X.toarray()
        elif self.use_sklearn and not hasattr(X, "toarray") and isinstance(X, np.ndarray):
            pass

        # Predict classes & probabilities
        cat_probs = self.clf_category.predict_proba(X)[0]
        cat_idx = np.argmax(cat_probs)
        category = self.clf_category.classes_[cat_idx]
        cat_conf = float(cat_probs[cat_idx])

        sev_probs = self.clf_severity.predict_proba(X)[0]
        sev_idx = np.argmax(sev_probs)
        severity = self.clf_severity.classes_[sev_idx]
        sev_conf = float(sev_probs[sev_idx])

        urg_probs = self.clf_urgency.predict_proba(X)[0]
        urg_idx = np.argmax(urg_probs)
        urgency = self.clf_urgency.classes_[urg_idx]
        urg_conf = float(urg_probs[urg_idx])

        auth_probs = self.clf_authority.predict_proba(X)[0]
        auth_idx = np.argmax(auth_probs)
        authority = self.clf_authority.classes_[auth_idx]
        auth_conf = float(auth_probs[auth_idx])

        inc_probs = self.clf_incident.predict_proba(X)[0]
        inc_idx = np.argmax(inc_probs)
        incident_type = self.clf_incident.classes_[inc_idx]

        overall_confidence = round(float((cat_conf + sev_conf + urg_conf + auth_conf) / 4.0), 2)
        lang = detect_language(text)
        reason = f"Local NLP model classified as '{incident_type}' ({category}) with {int(overall_confidence * 100)}% confidence."

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

_model_instance = None

def get_local_model() -> LocalSafetyClassifier:
    global _model_instance
    if _model_instance is None:
        _model_instance = LocalSafetyClassifier()
        _model_instance.train()
    return _model_instance
