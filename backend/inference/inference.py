import json
import os
import sys
import numpy as np
import joblib
from collections import deque
import warnings
warnings.filterwarnings('ignore')

from feature_extraction import extract_sampling_invariant_features
from simulation import simulate_realistic_eeg

# ============================
#  BLUETOOTH COM PORT READER
# ============================
def read_eeg_from_serial(port='COM3', baudrate=115200, duration=2.0, fs=60):
    """
    Read EEG data from ESP32 Bluetooth COM port.
    
    Args:
        port: COM port (e.g., 'COM3' on Windows)
        baudrate: Serial baudrate (default 115200)
        duration: Duration to read (seconds)
        fs: Expected sampling frequency (Hz)
    
    Returns:
        eeg_data: numpy array of EEG samples, or None if failed
    """
    try:
        import serial
        import time
        
        ser = serial.Serial(port, baudrate, timeout=1)
        time.sleep(0.1)  # Wait for connection
        
        eeg_samples = []
        target_samples = int(fs * duration)
        start_time = time.time()
        
        print(f"📡 Reading from {port} at {baudrate} baud...", file=sys.stderr)
        
        while len(eeg_samples) < target_samples:
            # Check timeout (max 5 seconds to collect samples)
            if time.time() - start_time > 5.0:
                print(f"⚠️  Timeout reading from serial port", file=sys.stderr)
                break
            
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                
                # Parse format: "timestamp,index,value" or "index,value,voltage"
                parts = line.split(',')
                if len(parts) >= 3:
                    try:
                        # Try last column as voltage value
                        voltage = float(parts[-1])
                        eeg_samples.append(voltage)
                    except ValueError:
                        continue
        
        ser.close()
        
        if len(eeg_samples) >= target_samples * 0.8:  # At least 80% of samples
            print(f"✅ Read {len(eeg_samples)} samples from serial", file=sys.stderr)
            return np.array(eeg_samples[:target_samples])
        else:
            print(f"⚠️  Insufficient samples: {len(eeg_samples)}/{target_samples}", file=sys.stderr)
            return None
            
    except ImportError:
        print("⚠️  pyserial not installed (pip install pyserial)", file=sys.stderr)
        return None
    except Exception as e:
        print(f"⚠️  Serial read error: {e}", file=sys.stderr)
        return None

# ============================
#  EMOTION CLASSIFIER
# ============================
class EmotionClassifier:
    """Real-time emotion classifier for differential EEG signals."""
    
    def __init__(self, model_path='emotion_classifier.joblib', fs=60):
        self.fs = fs
        
        # Load trained model
        try:
            checkpoint = joblib.load(model_path)
            self.model = checkpoint['model']
            self.scaler = checkpoint['scaler']
            self.label_map = checkpoint['label_map']
            self.feature_names = checkpoint['feature_names']
            
            print(f"✅ Model loaded: {len(self.feature_names)} features, {len(self.label_map)} classes", file=sys.stderr)
        except Exception as e:
            raise RuntimeError(f"Failed to load model: {e}")
    
    def predict(self, raw_eeg_window):
        """
        Predict emotion from raw EEG window.
        
        Args:
            raw_eeg_window: 1D numpy array of differential EEG voltage (μV)
        
        Returns:
            prediction: Emotion label (str)
            probabilities: Dictionary of class probabilities
        """
        # Validate input
        if len(raw_eeg_window) < self.fs * 0.5:
            raise ValueError(f"Window too short: need at least {self.fs*0.5} samples (0.5s)")
        
        # Extract features
        extracted_features = extract_sampling_invariant_features(raw_eeg_window, self.fs)
        
        # Align features to model's expected feature vector
        feature_vector = np.zeros(self.scaler.n_features_in_)
        
        for i, feature_name in enumerate(self.feature_names):
            if feature_name in extracted_features:
                feature_vector[i] = extracted_features[feature_name]
            # Heuristic mappings for common statistical features
            elif 'mean' in feature_name and 'mean' in extracted_features:
                feature_vector[i] = extracted_features['mean']
            elif 'std' in feature_name and 'std' in extracted_features:
                feature_vector[i] = extracted_features['std']
            elif 'min' in feature_name and 'min' in extracted_features:
                feature_vector[i] = extracted_features['min']
            elif 'max' in feature_name and 'max' in extracted_features:
                feature_vector[i] = extracted_features['max']
        
        # Scale and predict
        feature_vector_scaled = self.scaler.transform(feature_vector.reshape(1, -1))
        pred_class = self.model.predict(feature_vector_scaled)[0]
        pred_proba = self.model.predict_proba(feature_vector_scaled)[0]
        
        # Map to labels
        prediction = self.label_map[pred_class]
        probabilities = {
            self.label_map[i]: float(prob)
            for i, prob in enumerate(pred_proba)
        }
        
        return prediction, probabilities

# ============================
#  STREAMING BUFFER
# ============================
class StreamingEEGBuffer:
    """Circular buffer for streaming EEG data with sliding window prediction."""
    
    def __init__(self, classifier, window_size_seconds=2.0):
        self.classifier = classifier
        self.fs = classifier.fs
        self.window_size = int(window_size_seconds * self.fs)
        self.buffer = deque(maxlen=self.window_size)
    
    def add_samples(self, samples):
        """Add multiple EEG samples to buffer."""
        for sample in samples:
            self.buffer.append(sample)
    
    def is_ready(self):
        """Check if buffer has enough samples for prediction."""
        return len(self.buffer) >= self.window_size
    
    def predict(self):
        """Predict emotion from current buffer window."""
        if not self.is_ready():
            return None
        
        window = np.array(self.buffer)
        return self.classifier.predict(window)

# ============================
#  MAIN INFERENCE FUNCTION
# ============================
def run_inference():
    """
    Run emotion inference with Bluetooth COM port fallback to simulation.
    """
    # Configuration
    FS = 60  # Affectra sampling rate
    WINDOW_DURATION = 2.0  # 2-second window
    COM_PORT = 'COM3'  # Default COM port for ESP32 Bluetooth
    
    # Load model
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH = os.path.join(BASE_DIR, "model", "emotion_classifier.joblib")
    
    try:
        classifier = EmotionClassifier(MODEL_PATH, fs=FS)
    except RuntimeError as e:
        # Fallback: Output error as JSON for Node.js to handle
        error_result = {
            "prediction": "Netral",
            "probabilities": [0.33, 0.34, 0.33],
            "error": str(e),
            "source": "model_error"
        }
        print(json.dumps(error_result))
        return
    
    # Try to read from Bluetooth COM port
    print(f"🔍 Attempting to read EEG from {COM_PORT}...", file=sys.stderr)
    eeg_data = read_eeg_from_serial(COM_PORT, duration=WINDOW_DURATION, fs=FS)
    
    # Fallback to simulation if COM port fails
    if eeg_data is None:
        print("⚠️  Bluetooth unavailable, using EEG simulation", file=sys.stderr)
        eeg_data = simulate_realistic_eeg(fs=FS, seconds=WINDOW_DURATION)
        data_source = "simulation"
    else:
        data_source = "bluetooth"
    
    # Create streaming buffer and predict
    buffer = StreamingEEGBuffer(classifier, window_size_seconds=WINDOW_DURATION)
    buffer.add_samples(eeg_data)
    
    if buffer.is_ready():
        prediction, probabilities = buffer.predict()
        
        # Format output for Node.js
        result = {
            "prediction": prediction,
            "probabilities": list(probabilities.values()),
            "source": data_source,
            "samples": len(eeg_data)
        }
        
        print(json.dumps(result))
    else:
        # Not enough samples
        error_result = {
            "prediction": "Netral",
            "probabilities": [0.33, 0.34, 0.33],
            "error": "Insufficient samples",
            "source": "error"
        }
        print(json.dumps(error_result))


# ============================
#  ENTRY POINT
# ============================
if __name__ == "__main__":
    run_inference()

