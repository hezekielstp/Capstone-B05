import numpy as np
import pandas as pd

def extract_features(ch_a, ch_b, fs=150):
    feats = {}

    # time-domain
    feats["CH1_mean"] = float(np.mean(ch_a))
    feats["CH2_mean"] = float(np.mean(ch_b))
    feats["CH1_std"]  = float(np.std(ch_a))
    feats["CH2_std"]  = float(np.std(ch_b))
    feats["CH1_min"]  = float(np.min(ch_a))
    feats["CH2_min"]  = float(np.min(ch_b))
    feats["CH1_max"]  = float(np.max(ch_a))
    feats["CH2_max"]  = float(np.max(ch_b))
    feats["CH1_rms"]  = float(np.sqrt(np.mean(ch_a**2)))
    feats["CH2_rms"]  = float(np.sqrt(np.mean(ch_b**2)))

    # FFT
    N = len(ch_a)
    freqs = np.fft.rfftfreq(N, 1/fs)
    fA = np.abs(np.fft.rfft(ch_a))
    fB = np.abs(np.fft.rfft(ch_b))

    def band_power(fx, band):
        lo, hi = band
        mask = (freqs >= lo) & (freqs < hi)
        return float(np.sum(fx[mask]))

    BANDS = {
        "delta": (0.5,4),
        "theta": (4,8),
        "alpha": (8,12),
        "beta":  (12,30),
        "gamma": (30,45)
    }

    for b, rng in BANDS.items():
        feats[f"CH1_P_{b}"] = band_power(fA, rng)
        feats[f"CH2_P_{b}"] = band_power(fB, rng)

    # dominant freq
    feats["CH1_dominant_freq"] = float(freqs[np.argmax(fA)])
    feats["CH2_dominant_freq"] = float(freqs[np.argmax(fB)])

    # asymmetry
    for b in BANDS:
        feats[f"{b}_asymmetry"] = feats[f"CH1_P_{b}"] - feats[f"CH2_P_{b}"]

    # covariance + eigenvalues
    var1 = feats["CH1_std"]**2
    var2 = feats["CH2_std"]**2
    cov12 = feats["CH1_std"] * feats["CH2_std"]
    feats["cov_12"] = cov12

    M = np.array([[var1, cov12],[cov12, var2]])
    eigvals = np.linalg.eigvalsh(M)
    feats["eig_cov1"] = float(eigvals[-1])
    feats["eig_cov2"] = float(eigvals[0])

    return pd.DataFrame([feats])
