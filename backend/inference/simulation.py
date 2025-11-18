import numpy as np

def simulate_realistic_eeg(fs=60, seconds=2.0):
    """
    Simulate realistic single-channel differential EEG signal.
    
    Args:
        fs: Sampling frequency (Hz) - default 60 Hz for Affectra
        seconds: Duration of signal (seconds) - default 2s for streaming window
    
    Returns:
        eeg_signal: 1D numpy array of simulated differential EEG (μV)
    """
    N = int(fs * seconds)
    t = np.linspace(0, seconds, N, endpoint=False)
    
    # Randomize band frequencies within physiological ranges
    bands = {
        "delta":  np.random.uniform(1, 3),
        "theta":  np.random.uniform(4, 7),
        "alpha":  np.random.uniform(8, 12),
        "beta":   np.random.uniform(13, 25),
    }
    
    # Randomize amplitudes (differential signal typically smaller than single-ended)
    amps = {
        "delta":  np.random.uniform(5, 15),   # Reduced from 20-60
        "theta":  np.random.uniform(3, 10),   # Reduced from 10-40
        "alpha":  np.random.uniform(4, 12),   # Reduced from 15-50
        "beta":   np.random.uniform(2, 8),    # Reduced from 5-20
    }
    
    # Generate multi-band signal
    eeg_signal = (
        amps["delta"] * np.sin(2*np.pi*bands["delta"]*t + np.random.rand()*6.28) +
        amps["theta"] * np.sin(2*np.pi*bands["theta"]*t + np.random.rand()*6.28) +
        amps["alpha"] * np.sin(2*np.pi*bands["alpha"]*t + np.random.rand()*6.28) +
        amps["beta"]  * np.sin(2*np.pi*bands["beta"] *t + np.random.rand()*6.28)
    )
    
    # Add realistic artifacts
    drift = np.cumsum(np.random.randn(N) * 0.001)  # Slow baseline drift
    noise = np.random.randn(N) * 1.5               # Reduced noise for differential
    
    eeg_signal = eeg_signal + drift + noise
    
    return eeg_signal
