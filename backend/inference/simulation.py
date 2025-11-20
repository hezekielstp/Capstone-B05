import numpy as np
# Import the cleaning function from your other module
from feature_extraction import process_raw_adc_signal

# ============================
#  SIMULATION
# ============================
def simulate_raw_adc_eeg(fs=60, seconds=2.0, emotion_state=None):
    """
    Simulates RAW ADC values with controllable emotion states.
    
    Args:
        emotion_state: None (random), 'calm', 'stressed', or 'neutral'
    """
    N = int(fs * seconds)
    t = np.linspace(0, seconds, N, endpoint=False)

    # Choose emotion state
    if emotion_state is None:
        state = np.random.choice(["calm", "stressed", "neutral"])
    else:
        state = emotion_state

    # Generate different brainwave patterns
    if state == "calm":
        # Alpha waves (8-12Hz) dominant
        true_eeg_uv = 40 * np.sin(2*np.pi*10*t) + 10 * np.sin(2*np.pi*2*t)
        true_eeg_uv += np.random.normal(0, 3, N)
    elif state == "stressed":
        # Beta waves (13-30Hz) dominant
        # NOTE: At fs=60, Beta (up to 30Hz) is barely visible. 
        # We emphasize the lower end of Beta (14-20Hz) so it doesn't get lost.
        true_eeg_uv = 35 * np.sin(2*np.pi*15*t) + 18 * np.sin(2*np.pi*6*t)
        true_eeg_uv += np.random.normal(0, 8, N)
    else:  # neutral
        # Mixed
        true_eeg_uv = 20 * np.sin(2*np.pi*8*t) + 20 * np.sin(2*np.pi*15*t)
        true_eeg_uv += np.random.normal(0, 5, N)
    # --- THE FIX: SMART NOISE INJECTION ---
    # Only add 50Hz hum if Sampling Rate > 100Hz.
    # Otherwise, it aliases to 10Hz and ruins the data.
    if fs > 100:
        mains_hum_uv = 400 * np.sin(2*np.pi*50*t + np.random.rand()*2*np.pi)
    else:
        # Add simple white noise instead of hum for low FS
        mains_hum_uv = np.random.normal(0, 10, N)
    input_signal_uv = true_eeg_uv + mains_hum_uv

    # Convert to ADC
    GAIN = 612.8
    V_REF = 3.3
    ADC_RES = 4095.0

    amplified_volts = (input_signal_uv / 1_000_000) * GAIN
    bias_volts = 0.802
    total_volts = np.clip(amplified_volts + bias_volts, 0, V_REF)
    raw_adc = np.round((total_volts / V_REF) * ADC_RES).astype(int)

    return raw_adc, state

# ============================
#  BLUETOOTH / SIMULATION READER
# ============================
def get_eeg_data(use_simulation=False, fs=60, duration=2.0, emotion_state=None):
    """
    Acquires data either from COM port or Simulation.
    """
    if use_simulation:
        raw_adc, true_state = simulate_raw_adc_eeg(fs=fs, seconds=duration, emotion_state=emotion_state)
        # Use the imported utility to clean the data
        clean_data = process_raw_adc_signal(raw_adc, fs=fs)
        return clean_data, "simulation", true_state

    return None, "error", None