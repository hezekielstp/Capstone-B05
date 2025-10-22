# main.py
from fastapi import FastAPI
import joblib
import numpy as np

app = FastAPI()

model = joblib.load("saved_models/ensemble_model.pkl")
# scaler = joblib.load("saved_models/scaler.pkl")

@app.post("/predict")
def predict(features: list[float]):
    X = np.array(features).reshape(1, -1)
    X_scaled = scaler.transform(X)
    pred = model.predict(X_scaled)[0]
    return {"emotion": str(pred)}
