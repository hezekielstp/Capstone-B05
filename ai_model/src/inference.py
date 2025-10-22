# src/inference.py
import joblib
import numpy as np
from pathlib import Path
from src.preprocess.preprocess import preprocess_data  # your preprocessing logic

# --- Load the model(s) and preprocessing tools ---
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "saved_models" / "ensemble_model.pkl"
SCALER_PATH = BASE_DIR / "saved_models" / "scaler.pkl"

# Load serialized model and scaler
model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

def predict_emotion(raw_data: list[float]) -> str:
    """
    Run a full prediction pipeline:
      1. Preprocess raw EEG features
      2. Scale or normalize them
      3. Get prediction from the ensemble model
    """
    # Step 1: Preprocessing (optional, depends on your model)
    processed = preprocess_data(np.array(raw_data))

    # Step 2: Feature scaling
    X = scaler.transform([processed])

    # Step 3: Predict emotion
    prediction = model.predict(X)[0]

    return str(prediction)
