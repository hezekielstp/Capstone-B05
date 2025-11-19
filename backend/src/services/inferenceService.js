import { spawn } from "child_process";
import EEGSession from "../models/eegSession.model.js";
import User from "../models/user.model.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Track active inference sessions per user
// Structure: { userId: { intervalId, isActive, isPaused } }
const activeInferenceSessions = new Map();

/**
 * Run Python inference for a specific user
 * Creates a new EEG session with emotion detection results
 */
async function runInferenceForUser(userId, shouldSaveToDatabase = true) {
  return new Promise((resolve, reject) => {
    try {
      const inferenceDir = path.join(__dirname, "..", "..", "inference");
      const py = spawn("python", ["inference.py"], {
        cwd: inferenceDir,
      });

      let output = "";
      let errorOutput = "";

      py.stdout.on("data", (data) => {
        output += data.toString();
      });

      py.stderr.on("data", (data) => {
        errorOutput += data.toString();
        // Only log errors, not info messages
        if (errorOutput.includes("ERROR") || errorOutput.includes("Failed")) {
          console.error(`[PYTHON ERROR for user ${userId}]:`, data.toString());
        }
      });

      py.on("close", async (code) => {
        if (code !== 0) {
          console.error(`❌ Inference failed for user ${userId}. Exit code: ${code}`);
          return reject(new Error(`Python inference failed with code ${code}`));
        }

        try {
          // Parse JSON result from Python
          const result = JSON.parse(output);

          // Only save to database if not paused
          if (shouldSaveToDatabase) {
            const saved = await EEGSession.create({
              userId,
              mood: result.prediction, // Negatif / Netral / Positif
              probabilities: result.probabilities,
              photoPath: null,
              note: "",
            });

            console.log(`✅ Inference saved for user ${userId}: ${result.prediction}`);
            resolve(saved);
          } else {
            console.log(`⏸️  Inference skipped (paused) for user ${userId}: ${result.prediction}`);
            resolve({ ...result, saved: false });
          }
        } catch (err) {
          console.error(`❌ Failed to parse Python output for user ${userId}:`, err.message);
          reject(err);
        }
      });

      py.on("error", (err) => {
        console.error(`❌ Failed to spawn Python process for user ${userId}:`, err.message);
        reject(err);
      });
    } catch (err) {
      console.error(`❌ Error in runInferenceForUser for ${userId}:`, err.message);
      reject(err);
    }
  });
}

/**
 * Start inference session for a specific user
 * Runs every 10 seconds until stopped
 */
export function startUserInferenceSession(userId) {
  // Check if session already exists
  if (activeInferenceSessions.has(userId.toString())) {
    const session = activeInferenceSessions.get(userId.toString());
    if (session.isActive) {
      console.log(`ℹ️  Inference session already active for user ${userId}`);
      return { success: true, message: "Session already active" };
    }
  }

  // Run inference immediately
  const shouldSave = true; // Start in active mode
  runInferenceForUser(userId, shouldSave).catch((err) => {
    console.error(`⚠️  Initial inference failed for user ${userId}:`, err.message);
  });

  // Set up interval for continuous inference
  const intervalId = setInterval(async () => {
    const session = activeInferenceSessions.get(userId.toString());
    
    if (!session || !session.isActive) {
      console.log(`⏹️  Stopping inference for user ${userId} (session inactive)`);
      clearInterval(intervalId);
      return;
    }

    const shouldSave = !session.isPaused;
    
    try {
      await runInferenceForUser(userId, shouldSave);
    } catch (err) {
      console.error(`⚠️  Inference cycle failed for user ${userId}:`, err.message);
    }
  }, 10000); // 10 seconds

  // Store session info
  activeInferenceSessions.set(userId.toString(), {
    intervalId,
    isActive: true,
    isPaused: false,
    startedAt: new Date(),
  });

  console.log(`🚀 Inference session started for user ${userId}`);
  return { success: true, message: "Inference session started" };
}

/**
 * Stop inference session for a specific user
 * Completely stops the inference loop
 */
export function stopUserInferenceSession(userId) {
  const session = activeInferenceSessions.get(userId.toString());
  
  if (!session) {
    console.log(`ℹ️  No active inference session for user ${userId}`);
    return { success: false, message: "No active session" };
  }

  // Clear the interval
  clearInterval(session.intervalId);
  
  // Remove from active sessions
  activeInferenceSessions.delete(userId.toString());
  
  console.log(`⏹️  Inference session stopped for user ${userId}`);
  return { success: true, message: "Inference session stopped" };
}

/**
 * Pause inference session (keeps running but doesn't save to DB)
 */
export function pauseUserInferenceSession(userId) {
  const session = activeInferenceSessions.get(userId.toString());
  
  if (!session || !session.isActive) {
    return { success: false, message: "No active session to pause" };
  }

  session.isPaused = true;
  activeInferenceSessions.set(userId.toString(), session);
  
  console.log(`⏸️  Inference session paused for user ${userId}`);
  return { success: true, message: "Inference session paused" };
}

/**
 * Resume inference session (start saving to DB again)
 */
export function resumeUserInferenceSession(userId) {
  const session = activeInferenceSessions.get(userId.toString());
  
  if (!session || !session.isActive) {
    return { success: false, message: "No active session to resume" };
  }

  session.isPaused = false;
  activeInferenceSessions.set(userId.toString(), session);
  
  console.log(`▶️  Inference session resumed for user ${userId}`);
  return { success: true, message: "Inference session resumed" };
}

/**
 * Get status of user's inference session
 */
export function getUserInferenceStatus(userId) {
  const session = activeInferenceSessions.get(userId.toString());
  
  if (!session) {
    return { 
      isActive: false, 
      isPaused: false,
      message: "No active session"
    };
  }

  return {
    isActive: session.isActive,
    isPaused: session.isPaused,
    startedAt: session.startedAt,
    message: session.isPaused ? "Session paused" : "Session active"
  };
}

/**
 * Manual trigger for single user (can be called from API endpoint)
 */
export async function triggerInferenceForUser(userId) {
  try {
    const result = await runInferenceForUser(userId, true);
    return result;
  } catch (err) {
    throw err;
  }
}
