
import json
import joblib
import numpy as np
import pandas as pd
from feature_extraction import extract_features
from simulation import simulate_realistic_eeg

model = joblib.load("model/final_model.pkl")

def run_inference():
    ch_a, ch_b = simulate_realistic_eeg()
    sample = extract_features(ch_a, ch_b)

    expected = list(model.feature_names_in_)
    sample = sample[expected]

    pred = int(model.predict(sample)[0])
    proba = model.predict_proba(sample)[0].tolist()

    result = {
        "prediction": pred,
        "probabilities": proba
    }
    print(json.dumps(result))

if __name__ == "__main__":
    run_inference()
