import numpy as np
from scipy.fft import fft
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

def extract_sampling_invariant_features(eeg_signal, fs):
    """
    Extract features that are invariant to sampling rate.
    
    Args:
        eeg_signal: 1D numpy array of preprocessed EEG voltage values
        fs: sampling frequency (Hz)
    
    Returns:
        Dictionary of normalized features
    """
    features = {}
    
    # ========== TIME DOMAIN FEATURES ==========
    features['mean'] = np.mean(eeg_signal)
    features['std'] = np.std(eeg_signal)
    features['variance'] = np.var(eeg_signal)
    features['min'] = np.min(eeg_signal)
    features['max'] = np.max(eeg_signal)
    features['range'] = features['max'] - features['min']
    features['median'] = np.median(eeg_signal)
    
    # Higher order moments
    features['skewness'] = stats.skew(eeg_signal)
    features['kurtosis'] = stats.kurtosis(eeg_signal)
    
    # Zero crossing rate (normalized)
    zero_crossings = np.sum(np.diff(np.sign(eeg_signal)) != 0)
    features['zero_crossing_rate'] = zero_crossings / len(eeg_signal)
    
    # Signal energy (normalized by length)
    features['energy_normalized'] = np.sum(eeg_signal**2) / len(eeg_signal)
    
    # Shannon entropy
    hist, _ = np.histogram(eeg_signal, bins=50, density=True)
    hist = hist[hist > 0]
    features['shannon_entropy'] = -np.sum(hist * np.log2(hist + 1e-10))
    
    # Peak-to-peak amplitude
    features['ptp'] = np.ptp(eeg_signal)
    
    # Root mean square
    features['rms'] = np.sqrt(np.mean(eeg_signal**2))
    
    # ========== FREQUENCY DOMAIN FEATURES ==========
    nyquist = fs / 2
    
    # Compute FFT
    fft_vals = fft(eeg_signal)
    fft_mag = np.abs(fft_vals[:len(fft_vals)//2])
    fft_freq = np.fft.fftfreq(len(eeg_signal), 1/fs)[:len(fft_vals)//2]
    
    # Total spectral energy
    total_energy = np.sum(fft_mag**2)
    
    # EEG band definitions (as ratios of Nyquist - sampling-rate invariant)
    bands = {
        'delta': (0.5, 4),     # 0.5-4 Hz
        'theta': (4, 8),       # 4-8 Hz
        'alpha': (8, 13),      # 8-13 Hz
        'beta': (13, 30),      # 13-30 Hz
    }
    
    # Add gamma only if Nyquist allows
    if nyquist >= 30:
        bands['gamma'] = (30, min(50, nyquist * 0.95))
    
    # Band power ratios (relative to total power - sampling-rate invariant)
    for band_name, (low_freq, high_freq) in bands.items():
        band_mask = (fft_freq >= low_freq) & (fft_freq <= high_freq)
        band_power = np.sum(fft_mag[band_mask]**2)
        
        # Store as ratio of total power
        features[f'{band_name}_power_ratio'] = band_power / (total_energy + 1e-10)
    
    # Spectral centroid (as fraction of Nyquist)
    spectral_centroid = np.sum(fft_freq * fft_mag) / (np.sum(fft_mag) + 1e-10)
    features['spectral_centroid_norm'] = spectral_centroid / nyquist
    
    # Dominant frequency (as fraction of Nyquist)
    dominant_freq = fft_freq[np.argmax(fft_mag)]
    features['dominant_freq_norm'] = dominant_freq / nyquist
    
    # Spectral entropy (normalized)
    psd_norm = fft_mag**2 / (np.sum(fft_mag**2) + 1e-10)
    psd_norm = psd_norm[psd_norm > 0]
    features['spectral_entropy'] = -np.sum(psd_norm * np.log2(psd_norm + 1e-10))
    
    # Spectral rolloff (as fraction of Nyquist)
    cumsum_psd = np.cumsum(fft_mag**2)
    rolloff_idx = np.where(cumsum_psd >= 0.85 * cumsum_psd[-1])[0]
    if len(rolloff_idx) > 0:
        features['spectral_rolloff_norm'] = fft_freq[rolloff_idx[0]] / nyquist
    else:
        features['spectral_rolloff_norm'] = 0.5
    
    # Spectral spread (normalized)
    spectral_spread = np.sqrt(np.sum(((fft_freq - spectral_centroid)**2) * fft_mag) /
                              (np.sum(fft_mag) + 1e-10))
    features['spectral_spread_norm'] = spectral_spread / nyquist
    
    # Spectral flux (change in spectrum)
    if len(eeg_signal) > fs:  # Need at least 1 second
        mid = len(eeg_signal) // 2
        fft1 = np.abs(fft(eeg_signal[:mid]))[:len(eeg_signal[:mid])//2]
        fft2 = np.abs(fft(eeg_signal[mid:]))[:len(eeg_signal[mid:])//2]
        
        # Normalize lengths if different
        min_len = min(len(fft1), len(fft2))
        spectral_flux = np.sum((fft2[:min_len] - fft1[:min_len])**2)
        features['spectral_flux'] = spectral_flux / min_len
    else:
        features['spectral_flux'] = 0.0
    
    return features
