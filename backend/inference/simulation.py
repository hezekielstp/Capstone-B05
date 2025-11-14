import numpy as np

def simulate_realistic_eeg(fs=150, seconds=1.0, correlate=True):
    N = int(fs * seconds)
    t = np.linspace(0, seconds, N, endpoint=False)

    bands = {
        "delta":  np.random.uniform(1, 3),
        "theta":  np.random.uniform(4, 7),
        "alpha":  np.random.uniform(8, 12),
        "beta":   np.random.uniform(13, 25),
        "gamma":  np.random.uniform(30, 40)
    }

    amps = {
        "delta":  np.random.uniform(20, 60),
        "theta":  np.random.uniform(10, 40),
        "alpha":  np.random.uniform(15, 50),
        "beta":   np.random.uniform(5, 20),
        "gamma":  np.random.uniform(2, 10)
    }

    ch1 = (
        amps["delta"]*np.sin(2*np.pi*bands["delta"]*t + np.random.rand()*6.28) +
        amps["theta"]*np.sin(2*np.pi*bands["theta"]*t + np.random.rand()*6.28) +
        amps["alpha"]*np.sin(2*np.pi*bands["alpha"]*t + np.random.rand()*6.28) +
        amps["beta"] *np.sin(2*np.pi*bands["beta"] *t + np.random.rand()*6.28) +
        amps["gamma"]*np.sin(2*np.pi*bands["gamma"]*t + np.random.rand()*6.28)
    )

    drift = np.cumsum(np.random.randn(N) * 0.002)
    noise = np.random.randn(N) * 3.0
    ch1 = ch1 + drift + noise

    if correlate:
        ch2 = (
            ch1 * np.random.uniform(0.75, 0.95) +
            np.random.randn(N) * 5.0 +
            np.sin(2*np.pi*np.random.uniform(0.5,2)*t)
        )
    else:
        ch2 = np.random.randn(N) * 20

    return ch1, ch2
