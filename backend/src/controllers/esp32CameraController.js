import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import CameraCapture from "../models/cameraCapture.model.js";
import EEGSession from "../models/eegSession.model.js";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ESP32-CAM Photo Upload Handler
 * Receives JPEG image data from ESP32-CAM and saves it to disk
 * Creates CameraCapture record with auto-incremented captureId
 */
export const uploadPhotoFromESP32 = async (req, res) => {
  try {
    console.log("📸 ESP32 upload request received");
    console.log("   Headers:", req.headers);
    console.log("   Body size:", req.body ? req.body.length : 0, "bytes");
    
    // Extract userId from custom header sent by ESP32
    const userId = req.headers["x-user-id"];
    
    if (!userId) {
      console.log("❌ Missing X-User-ID header");
      return res.status(400).json({
        success: false,
        message: "X-User-ID header is required",
      });
    }

    console.log("   User ID:", userId);

    // Get the latest session for this user to link the photo
    const latestSession = await EEGSession.findOne({ userId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!latestSession) {
      console.log("❌ No session found for user:", userId);
      return res.status(404).json({
        success: false,
        message: "No EEG session found for this user. Please create a session first.",
      });
    }

    console.log("   Linked to session:", latestSession._id);

    // Generate unique filename with timestamp
    const timestamp = new Date();
    const filename = `capture_${userId}_${Date.now()}.jpg`;
    
    // Define upload directory
    const uploadDir = path.join(__dirname, "../../uploads/camera_captures");
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("   Created upload directory");
    }

    const filepath = path.join(uploadDir, filename);

    // Save the binary image data to file
    fs.writeFileSync(filepath, req.body);
    console.log("   File saved:", filename);

    // Create relative URL for storing in database
    const imageUrl = `/uploads/camera_captures/${filename}`;

    // Save capture record to database with auto-increment captureId
    const newCapture = await CameraCapture.create({
      sessionId: latestSession._id,
      timestamp: timestamp,
      imageUrl: imageUrl,
      contextNote: `Auto-captured from ESP32-CAM at ${timestamp.toISOString()}`,
    });

    console.log(`✅ Photo saved: ${filename} (captureId: ${newCapture.captureId})`);

    return res.status(201).json({
      success: true,
      message: "Photo uploaded successfully",
      data: {
        captureId: newCapture.captureId,
        sessionId: latestSession._id,
        imageUrl: imageUrl,
        timestamp: timestamp,
        filename: filename,
      },
    });

  } catch (error) {
    console.error("❌ ESP32 Photo Upload Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload photo",
      error: error.message,
    });
  }
};

/**
 * Optional: Trigger photo capture from web UI
 * Returns instruction for ESP32 to take photo
 */
export const triggerPhotoCapture = async (req, res) => {
  try {
    const userId = req.userId; // From JWT token

    // Check if user has an active session
    const activeSession = await EEGSession.findOne({ userId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!activeSession) {
      return res.status(404).json({
        success: false,
        message: "No active session found. Please start an EEG session first.",
      });
    }

    // In a real implementation, you might use WebSocket or MQTT
    // to send trigger signal to ESP32-CAM
    // For now, we just return a success response
    return res.status(200).json({
      success: true,
      message: "Photo capture triggered",
      sessionId: activeSession._id,
      note: "ESP32-CAM should automatically send photo to /api/camera/upload",
    });

  } catch (error) {
    console.error("❌ Trigger Photo Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to trigger photo capture",
      error: error.message,
    });
  }
};
