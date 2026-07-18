from django.conf import settings
import os
import pickle
import warnings

# Suppress scikit-learn version mismatch warnings on unpickling
warnings.filterwarnings("ignore", category=UserWarning)

_nb_model = None
_vect_model = None

def load_models():
    global _nb_model, _vect_model
    if _nb_model is None or _vect_model is None:
        nb_model_path = os.path.join(settings.BASE_DIR, "models", "nb_model.pkl")
        vectorizer_model_path = os.path.join(settings.BASE_DIR, "models", "vectorizer_model.pkl")
        
        with open(nb_model_path, "rb") as f:
            _nb_model = pickle.load(f)
        with open(vectorizer_model_path, "rb") as f:
            _vect_model = pickle.load(f)
            
    return _nb_model, _vect_model

def predict_with_confidence(text):
    """
    Predicts authenticity and returns confidence breakdown.
    Note: In the trained dataset, Class 0 = REAL NEWS, Class 1 = FAKE NEWS.
    Returns: is_real (bool), real_prob (float), fake_prob (float)
    """
    nb_model, vect_model = load_models()
    if not text or not text.strip():
        return True, 50.0, 50.0

    vectorized = vect_model.transform([text])
    
    if hasattr(nb_model, "predict_proba"):
        probs = nb_model.predict_proba(vectorized)[0]
        classes = getattr(nb_model, "classes_", [0, 1])
        if list(classes) == [0, 1] or list(classes) == [False, True]:
            real_prob = round(float(probs[0]) * 100, 1)
            fake_prob = round(float(probs[1]) * 100, 1)
        else:
            fake_prob = round(float(probs[0]) * 100, 1)
            real_prob = round(100.0 - fake_prob, 1)
    else:
        pred = nb_model.predict(vectorized)[0]
        is_real_val = bool(pred == 0 or pred is False)
        real_prob = 92.0 if is_real_val else 8.0
        fake_prob = round(100.0 - real_prob, 1)

    is_real = real_prob >= fake_prob
    return is_real, real_prob, fake_prob