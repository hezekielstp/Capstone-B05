import express from "express";
import EEGSession from "../models/eegSession.model.js";
import User from "../models/user.model.js";
import {
  queueManualEmotion,
  toggleManualMode,
  getUserInferenceStatus,
  getActiveUserIds,
} from "../services/inferenceService.js";

const router = express.Router();

/**
 * Get all active users (for selection on remote device)
 * Checks both active inference sessions AND recent database sessions
 */
router.get("/users", async (req, res) => {
  try {
    // Get users with active inference sessions (logged in)
    const activeUserIds = getActiveUserIds();
    
    // Also get users with recent EEG sessions in database
    const recentSessions = await EEGSession.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("userId", "name email");

    // Collect all unique user IDs
    const allUserIds = new Set();
    
    // Add active session users
    activeUserIds.forEach(id => allUserIds.add(id));
    
    // Add users from database sessions
    for (const session of recentSessions) {
      if (session.userId) {
        allUserIds.add(session.userId._id.toString());
      }
    }

    // Fetch user details for all unique IDs
    const uniqueUsers = [];
    for (const userId of allUserIds) {
      const user = await User.findById(userId).select("name email");
      if (user) {
        uniqueUsers.push({
          id: user._id,
          name: user.name,
          email: user.email,
        });
      }
    }

    res.status(200).json(uniqueUsers);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get users",
      error: err.message,
    });
  }
});

/**
 * Get status for a specific user (no auth required)
 */
router.get("/status/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const status = getUserInferenceStatus(userId);

    res.status(200).json(status);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get status",
      error: err.message,
    });
  }
});

/**
 * Toggle manual mode for a user (no auth required)
 */
router.post("/toggle/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const { enabled } = req.body;

    const result = toggleManualMode(userId, enabled);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      message: "Failed to toggle manual mode",
      error: err.message,
    });
  }
});

/**
 * Send emotion for a user (no auth required)
 */
router.post("/emotion/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const { emotion } = req.body;

    if (!["Positif", "Netral", "Negatif"].includes(emotion)) {
      return res.status(400).json({
        message: "Invalid emotion. Must be Positif, Netral, or Negatif",
      });
    }

    queueManualEmotion(userId, emotion);

    res.status(200).json({
      success: true,
      message: "Emotion queued",
      emotion,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to send emotion",
      error: err.message,
    });
  }
});

export default router;
