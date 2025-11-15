import json
import os
import joblib
import numpy as np
import pandas as pd
from feature_extraction import extract_features
from simulation import simulate_realistic_eeg

# ============================
#  LOAD MODEL DENGAN PATH ABSOLUT
# ============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))            # .../backend/inference/
MODEL_PATH = os.path.join(BASE_DIR, "model", "final_model.pkl")  # .../backend/inference/model/final_model.pkl

model = joblib.load(MODEL_PATH)

# ============================
#  MAPPING EMOSI
# ============================
label_map = {
    0: "Negatif",
    1: "Netral",
    2: "Positif"
}

# ============================
#  FUNGSI UTAMA INFERENCE
# ============================
def run_inference():
    # Simulasi generation dua channel EEG
    ch_a, ch_b = simulate_realistic_eeg()

    # Ekstrak fitur EEG
    sample = extract_features(ch_a, ch_b)

    # Sesuaikan order kolom dengan model
    expected = list(model.feature_names_in_)
    sample = sample[expected]

    # Prediksi label
    pred = int(model.predict(sample)[0])

    # Ambil probabilitas
    proba = model.predict_proba(sample)[0].tolist()

    # Bentuk output JSON
    result = {
        "prediction": label_map[pred],  # ubah angka ke label
        "probabilities": proba
    }

    # Cetak JSON ke stdout (dibaca oleh Node)
    print(json.dumps(result))


# ============================
#  JALANKAN JIKA DI-EXECUTE LANGSUNG
# ============================
if __name__ == "__main__":
    run_inference()
