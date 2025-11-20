import json
import os
import sys
import time
import numpy as np
import joblib
import warnings
from collections import deque

# Import from your modular files
from feature_extraction import extract_sampling_invariant_features
# We will use the simulation as a fallback if Bluetooth fails
from simulation import get_eeg_data 

warnings.filterwarnings('ignore')

# ============================
#  BLUETOOTH COM PORT READER
# ============================
def read_eeg_from_serial(port='COM3', baudrate=115200, duration=2.0, fs=60):
    """
    Reads real data from ESP32. Returns None if it fails/timeouts.
    Logs to stderr so it doesn't break JSON output.
    """
    try:
        import serial
        
        # Open Serial Port
        ser = serial.Serial(port, baudrate, timeout=1)
        time.sleep(0.1) # Stabilization
        
        eeg_samples = []
        target_samples = int(fs * duration)
        start_time = time.time()
        
        # Log to stderr
        print(f"📡 Connecting to {port}...", file=sys.stderr)
        
        while len(eeg_samples) < target_samples:
            # 5 Second Timeout
            if time.time() - start_time > 5.0:
                print(f"⚠️ Serial Timeout", file=sys.stderr)
                break
            
            if ser.in_waiting > 0:
                try:
                    line = ser.readline().decode('utf-8', errors='ignore').strip()
                    # Expecting: "index,value,voltage" or just "voltage"
                    parts = line.split(',')
                    if len(parts) >= 1:
                        # Take the last value as the voltage/ADC reading
                        val = float(parts[-1])
                        eeg_samples.append(val)
                except ValueError:
                    continue

        ser.close()
        
        if len(eeg_samples) >= target_samples * 0.5: # Accept if we have at least 50% data
            print(f"✅ Received {len(eeg_samples)} samples", file=sys.stderr)
            # Pad or trim to match exact window size if necessary, or return as is
            return np.array(eeg_samples[:target_samples])
        else:
            return None

    except ImportError:
        print("⚠️ pyserial not installed", file=sys.stderr)
        return None
    except Exception as e:
        print(f"⚠️ Serial Error: {e}", file=sys.stderr)
        return None

# ============================
#  EMOTION CLASSIFIER
# ============================
class EmotionClassifier:
    def __init__(self, model_path='simple_emotion_classifier_xgb.joblib', fs=250):
        self.fs = fs
        self.model = None

        # Resolve path relative to this inference file
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_dir, "model", model_path)
        
        try:
            # Load Model
            checkpoint = joblib.load(model_path)
            self.model = checkpoint['model']
            self.scaler = checkpoint.get('scaler', None)
            self.label_map = checkpoint.get('label_map', None)
            self.feature_names = checkpoint.get('feature_names', [])
            print("✓ Model loaded", file=sys.stderr)
        except Exception as e:
            print(f"⚠ Model load failed ({e})", file=sys.stderr)
            self.mock_mode = True

    def predict(self, clean_eeg_window):
        # Feature Extraction
        features = extract_sampling_invariant_features(clean_eeg_window, self.fs)

        # 1. Mock Mode (if model failed to load)
        if hasattr(self, 'mock_mode'):
            # Simple logic for fallback
            return "Netral", {"Netral": 0.8, "Positif": 0.1, "Negatif": 0.1}

        # 2. Real Prediction
        try:
            # Align features
            if len(self.feature_names) > 0:
                feature_vector = [features.get(name, 0.0) for name in self.feature_names]
            else:
                feature_vector = list(features.values())

            X = np.array([feature_vector])
            
            # Scaling
            if hasattr(self, 'scaler') and self.scaler is not None:
                X = self.scaler.transform(X)

            # Predict
            prediction_index = self.model.predict(X)[0]
            probabilities = self.model.predict_proba(X)[0]

            # Label Mapping
            if self.label_map:
                prediction_label = self.label_map.get(prediction_index, str(prediction_index))
                # Double check str/int keys
                if prediction_label == str(prediction_index):
                     prediction_label = self.label_map.get(str(prediction_index), str(prediction_index))
            else:
                prediction_label = str(prediction_index)

            # Probability Dict
            classes = self.model.classes_
            prob_dict = {str(c): float(p) for c, p in zip(classes, probabilities)}

            return prediction_label, prob_dict

        except Exception as e:
            print(f"Prediction Logic Error: {e}", file=sys.stderr)
            return "Error", {"Error": 1.0}

# ============================
#  MAIN EXECUTION
# ============================
def run_inference():
    # CONFIG
    FS = 60  # Match your hardware
    WINDOW = 2.0
    COM_PORT = 'COM3' 
    
    # 1. INIT CLASSIFIER
    classifier = EmotionClassifier(fs=FS)
    
    # 2. ACQUIRE DATA (Serial -> Fallback to Simulation)
    eeg_data = read_eeg_from_serial(port=COM_PORT, fs=FS, duration=WINDOW)
    
    source = "bluetooth"
    true_state = "unknown"

    if eeg_data is None:
        print("⚠️ Fallback to Simulation", file=sys.stderr)
        # Use the simulation module we made previously
        # Note: simulate_raw_adc_eeg returns (data, state)
        # We use the wrapper get_eeg_data from simulation.py
        clean_data, source, true_state = get_eeg_data(
            use_simulation=True, 
            fs=FS, 
            duration=WINDOW
        )
    else:
        # We have real data, but it needs cleaning (Notch filter etc)
        from feature_extraction import process_raw_adc_signal
        clean_data = process_raw_adc_signal(eeg_data, fs=FS)

    # 3. PREDICT
    if clean_data is not None and len(clean_data) > 0:
        prediction, probabilities = classifier.predict(clean_data)

        # LABEL TRANSLATION (English -> Indonesian)
        translation_map = {
            "neutral": "Netral", "calm": "Netral",
            "stressed": "Negatif", "negative": "Negatif",
            "positive": "Positif"
        }
        # Normalize keys to lowercase for lookup
        pred_key = prediction.lower()
        final_label = translation_map.get(pred_key, prediction)

        # 4. CONSTRUCT FINAL JSON RESULT
        result = {
            "prediction": final_label,
            "probabilities": list(probabilities.values()), # Node usually likes simple arrays
            "probabilities_dict": probabilities,
            "source": source,
            "true_state_debug": true_state,
            "samples_processed": len(clean_data)
        }
        
        # 5. OUTPUT TO STDOUT (Only this goes to Node)
        print(json.dumps(result))
        sys.stdout.flush() # Ensure it sends immediately
    else:
        error_res = {"error": "No data acquired", "prediction": "Netral"}
        print(json.dumps(error_res))

if __name__ == "__main__":
    run_inference()