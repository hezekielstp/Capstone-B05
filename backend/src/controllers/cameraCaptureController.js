import CameraCapture from "../models/cameraCapture.model.js";
import EEGSession from "../models/eegSession.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * UPLOAD from ESP32-CAM
 * Accepts raw JPEG binary data from ESP32
 * Links photo to user's latest EEG session
 */
export const uploadFromESP32 = async (req, res) => {
  try {
    // Get user ID from header (sent by ESP32)
    const userId = req.headers["x-user-id"];
    
    if (!userId) {
      return res.status(400).json({
        message: "X-User-ID header is required",
      });
    }

    // Get raw binary data (JPEG)
    const imageBuffer = req.body;
    
    if (!imageBuffer || imageBuffer.length === 0) {
      return res.status(400).json({
        message: "No image data received",
      });
    }

    console.log(`📸 Received photo upload: ${imageBuffer.length} bytes from user ${userId}`);

    // Find user's latest EEG session, or create one if doesn't exist
    let latestSession = await EEGSession.findOne({ userId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!latestSession) {
      console.log(`⚠️ No session found for user ${userId}, creating new session...`);
      // Auto-create a session with neutral mood for photo capture
      latestSession = await EEGSession.create({
        userId,
        mood: "Netral",
        probabilities: [0.33, 0.34, 0.33], // Neutral probabilities
        note: "Auto-created session for ESP32-CAM photo capture",
      });
      console.log(`✅ Created new session: ${latestSession._id}`);
    }

    // Generate unique filename with timestamp
    const timestamp = new Date();
    const filename = `camera_${userId}_${timestamp.getTime()}.jpg`;
    const uploadDir = path.join(__dirname, "..", "..", "uploads", "camera_captures");
    const filePath = path.join(uploadDir, filename);

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save image to disk
    fs.writeFileSync(filePath, imageBuffer);

    console.log(`✅ Photo saved to: ${filePath}`);

    // Create CameraCapture record
    const imageUrl = `/uploads/camera_captures/${filename}`;
    const newCapture = await CameraCapture.create({
      sessionId: latestSession._id,
      timestamp,
      imageUrl,
      contextNote: "Auto-captured by ESP32-CAM",
    });

    console.log(`✅ CameraCapture record created: captureId=${newCapture.captureId}`);

    // ✅ PERMANENTLY assign photo to session if not already set
    if (!latestSession.photoPath) {
      latestSession.photoPath = imageUrl;
      await latestSession.save();
      console.log(`✅ Photo permanently assigned to session ${latestSession._id}: ${imageUrl}`);
    }

    return res.status(201).json({
      message: "Photo uploaded successfully",
      data: {
        captureId: newCapture.captureId,
        sessionId: latestSession._id,
        imageUrl,
        timestamp,
      },
    });
  } catch (error) {
    console.error("uploadFromESP32 Error:", error);
    res.status(500).json({ 
      message: "Server error during photo upload", 
      error: error.message 
    });
  }
};

/**
 * CREATE new camera capture record
 * ESP32 should already send/upload image (URL/path obtained by server)
 */
export const createCameraCapture = async (req, res) => {
  try {
    const { sessionId, timestamp, imageUrl, contextNote } = req.body;

    if (!sessionId || !timestamp || !imageUrl) {
      return res.status(400).json({
        message: "sessionId, timestamp, and imageUrl are required",
      });
    }

    const newCapture = await CameraCapture.create({
      sessionId,
      timestamp,
      imageUrl,
      contextNote,
    });

    return res.status(201).json({
      message: "Capture created successfully",
      data: newCapture,
    });
  } catch (error) {
    console.error("createCameraCapture Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


/**
 * GET all captures (sorted by captureId ASC)
 */
export const getAllCaptures = async (req, res) => {
  try {
    const captures = await CameraCapture.find().sort({ captureId: 1 });

    return res.status(200).json({
      message: "All captures retrieved",
      data: captures,
    });
  } catch (error) {
    console.error("getAllCaptures Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


/**
 * GET capture by captureId (not _id)
 */
export const getCaptureById = async (req, res) => {
  try {
    const { captureId } = req.params;

    // Validate captureId is a valid number
    const parsedId = Number(captureId);
    if (isNaN(parsedId)) {
      return res.status(400).json({ 
        message: "Invalid captureId. Must be a number.",
        received: captureId 
      });
    }

    const capture = await CameraCapture.findOne({ captureId: parsedId });

    if (!capture) {
      return res.status(404).json({ message: "Capture not found" });
    }

    return res.status(200).json({
      message: "Capture retrieved",
      data: capture,
    });
  } catch (error) {
    console.error("getCaptureById Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


/**
 * GET captures by sessionId
 */
export const getCapturesBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const captures = await CameraCapture.find({ sessionId }).sort({ captureId: 1 });

    return res.status(200).json({
      message: "Captures retrieved",
      data: captures,
    });
  } catch (error) {
    console.error("getCapturesBySession Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


/**
 * DELETE capture by captureId
 */
export const deleteCapture = async (req, res) => {
  try {
    const { captureId } = req.params;

    const deleted = await CameraCapture.findOneAndDelete({ captureId: Number(captureId) });

    if (!deleted) {
      return res.status(404).json({ message: "Capture not found" });
    }

    return res.status(200).json({
      message: "Capture deleted",
      data: deleted,
    });
  } catch (error) {
    console.error("deleteCapture Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


/**
 * DELETE all (optional, for resetting)
 */
export const deleteAllCaptures = async (req, res) => {
  try {
    await CameraCapture.deleteMany({});

    return res.status(200).json({
      message: "All captures deleted",
    });
  } catch (error) {
    console.error("deleteAllCaptures Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
