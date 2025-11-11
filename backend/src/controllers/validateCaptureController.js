import CameraCapture from "../models/cameraCapture.model.js";
import EEGSession from "../models/eegSession.model.js";   // pastikan model ini sudah ada

/**
 * Validate capture metadata before upload
 */
export const validateCapture = async (req, res) => {
  try {
    const { sessionId, timestamp } = req.body;

    // ✅ Cek input lengkap
    if (!sessionId || !timestamp) {
      return res.status(400).json({
        valid: false,
        reason: "sessionId and timestamp are required",
      });
    }

    // ✅ Cek session exist
    const session = await EEGSession.findById(sessionId);
    if (!session) {
      return res.status(400).json({
        valid: false,
        reason: "Invalid sessionId: session not found",
      });
    }

    // ✅ Cek duplicate timestamp
    const exists = await CameraCapture.findOne({ timestamp });
    if (exists) {
      return res.status(400).json({
        valid: false,
        reason: "Duplicate capture detected (same timestamp)",
      });
    }

    // ✅ Jika ok
    return res.status(200).json({ valid: true });
  } catch (err) {
    console.error("validateCapture Error:", err);
    res.status(500).json({
      valid: false,
      reason: "Server error",
      error: err.message,
    });
  }
};
