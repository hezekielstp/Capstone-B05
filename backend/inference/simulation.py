import numpy as np

def simulate_realistic_eeg(fs=60, seconds=2.0):
    """
    Simulate realistic single-channel differential EEG signal with emotion-driven variability.
    
    Args:
        fs: Sampling frequency (Hz) - default 60 Hz for Affectra
        seconds: Duration of signal (seconds) - default 2s for streaming window
    
    Returns:
        eeg_signal: 1D numpy array of simulated differential EEG (μV)
    """
    N = int(fs * seconds)
    t = np.linspace(0, seconds, N, endpoint=False)
    
    # Randomly select emotion profile for more diverse results
    emotion_profiles = {
        "positive": {
            "alpha": (8, 20),   # High alpha power (relaxed, positive)
            "beta": (2, 8),     # Low beta (calm)
            "theta": (3, 8),    # Moderate theta
            "delta": (4, 10),   # Low delta
        },
        "neutral": {
            "alpha": (6, 14),   # Moderate alpha
            "beta": (4, 12),    # Moderate beta
            "theta": (4, 10),   # Moderate theta
            "delta": (5, 12),   # Moderate delta
        },
        "negative": {
            "alpha": (3, 8),    # Low alpha (stressed, anxious)
            "beta": (8, 20),    # High beta (alert, anxious)
            "theta": (6, 15),   # Higher theta (emotional processing)
            "delta": (6, 15),   # Higher delta
        }
    }
    
    # Randomly select emotion profile with equal probability
    profile_key = np.random.choice(["positive", "neutral", "negative"])
    profile = emotion_profiles[profile_key]
    
    # Randomize band frequencies within physiological ranges
    bands = {
        "delta":  np.random.uniform(1, 3),
        "theta":  np.random.uniform(4, 7),
        "alpha":  np.random.uniform(8, 12),
        "beta":   np.random.uniform(13, 25),
    }
    
    # Randomize amplitudes based on emotion profile
    amps = {
        "delta":  np.random.uniform(*profile["delta"]),
        "theta":  np.random.uniform(*profile["theta"]),
        "alpha":  np.random.uniform(*profile["alpha"]),
        "beta":   np.random.uniform(*profile["beta"]),
    }
    
    # Add random phase variations for each band
    phases = {
        "delta": np.random.rand() * 2 * np.pi,
        "theta": np.random.rand() * 2 * np.pi,
        "alpha": np.random.rand() * 2 * np.pi,
        "beta": np.random.rand() * 2 * np.pi,
    }
    
    # Generate multi-band signal with random harmonics for complexity
    eeg_signal = (
        amps["delta"] * np.sin(2*np.pi*bands["delta"]*t + phases["delta"]) +
        amps["theta"] * np.sin(2*np.pi*bands["theta"]*t + phases["theta"]) +
        amps["alpha"] * np.sin(2*np.pi*bands["alpha"]*t + phases["alpha"]) +
        amps["beta"]  * np.sin(2*np.pi*bands["beta"] *t + phases["beta"])
    )
    
    # Add harmonics for more realistic frequency content
    for band, freq in bands.items():
        harmonic_amp = amps[band] * np.random.uniform(0.1, 0.3)
        harmonic_freq = freq * 2  # First harmonic
        eeg_signal += harmonic_amp * np.sin(2*np.pi*harmonic_freq*t + np.random.rand()*2*np.pi)
    
    # Add realistic artifacts with more variation
    drift = np.cumsum(np.random.randn(N) * np.random.uniform(0.0005, 0.002))  # Variable baseline drift
    noise = np.random.randn(N) * np.random.uniform(1.0, 3.0)  # Variable noise level
    
    # Occasional "blink" artifacts (random spikes)
    if np.random.rand() > 0.7:  # 30% chance of artifact
        artifact_idx = np.random.randint(N//4, 3*N//4)  # Middle 50% of signal
        artifact_width = np.random.randint(5, 15)
        artifact_magnitude = np.random.uniform(20, 50) * np.random.choice([-1, 1])
        eeg_signal[artifact_idx:artifact_idx+artifact_width] += artifact_magnitude
    
    eeg_signal = eeg_signal + drift + noise
    
    # Random baseline offset
    eeg_signal += np.random.uniform(-5, 5)
    
    return eeg_signal
