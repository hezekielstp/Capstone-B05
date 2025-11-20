import numpy as np
from scipy import signal
from scipy.fft import fft

# ============================
#  SIGNAL PROCESSING UTILS
# ============================
def process_raw_adc_signal(raw_adc_array, fs=60):
    """
    Converts Raw ADC -> Clean Microvolts
    """
    if len(raw_adc_array) == 0:
        return np.array([])

    ADC_RESOLUTION = 4095.0
    V_REF = 3.3
    HARDWARE_GAIN = 612.8
    TO_MICROVOLTS = 1_000_000.0

    SCALE_FACTOR = (V_REF / ADC_RESOLUTION / HARDWARE_GAIN) * TO_MICROVOLTS
    eeg_uv = raw_adc_array.astype(float) * SCALE_FACTOR
    eeg_uv = eeg_uv - np.mean(eeg_uv)

    # --- THE FIX: CONDITIONAL FILTERING ---
    # A 50Hz Notch filter requires fs > 100Hz.
    if fs > 100:
        try:
            b, a = signal.iirnotch(w0=50.0, Q=30.0, fs=fs)
            eeg_clean = signal.filtfilt(b, a, eeg_uv)
            return eeg_clean
        except Exception as e:
            return eeg_uv
    else:
        # If fs is 60Hz, we can't filter 50Hz. 
        # Just return the signal (the simulation now produces clean data).
        return eeg_uv

# ============================
#  FEATURE EXTRACTION
# ============================
def extract_sampling_invariant_features(eeg_signal, fs):
    """
    Extracts features from CLEANED EEG signal (uV).
    """
    features = {}

    if len(eeg_signal) == 0 or np.std(eeg_signal) == 0:
        return {k: 0.0 for k in ['mean', 'std', 'alpha_power_ratio', 'beta_power_ratio']}

    features['mean'] = np.mean(eeg_signal)
    features['std'] = np.std(eeg_signal)
    features['ptp'] = np.ptp(eeg_signal)

    # FFT
    fft_vals = fft(eeg_signal)
    n = len(eeg_signal)
    fft_mag = np.abs(fft_vals[:n//2])
    fft_freq = np.fft.fftfreq(n, 1/fs)[:n//2]
    total_energy = np.sum(fft_mag**2)

    bands = {
        'delta': (0.5, 4),
        'theta': (4, 8),
        'alpha': (8, 13),
        'beta': (13, 30)
    }

    for band_name, (low, high) in bands.items():
        idx = np.where((fft_freq >= low) & (fft_freq <= high))[0]
        if len(idx) > 0:
            band_power = np.sum(fft_mag[idx]**2)
            features[f'{band_name}_power_ratio'] = band_power / (total_energy + 1e-10)
        else:
            features[f'{band_name}_power_ratio'] = 0.0

    return features