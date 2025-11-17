# Camera Captures Upload Directory

This directory stores photos uploaded from ESP32-CAM hardware.

## Directory Structure
```
camera_captures/
├── capture_<userId>_<timestamp>.jpg
├── capture_<userId>_<timestamp>.jpg
└── ...
```

## File Naming Convention
- Format: `capture_<userId>_<timestamp>.jpg`
- Example: `capture_668877e8a93e5e40854c6012_1732012345678.jpg`

## Access
Photos are accessible via static URL:
```
http://localhost:5001/uploads/camera_captures/<filename>.jpg
```

## Storage
- Photos are automatically saved here by ESP32-CAM upload endpoint
- Each photo is linked to an EEG session in MongoDB
- Files should be periodically cleaned up in production

## Development
This directory is created automatically if it doesn't exist.
.gitkeep ensures the directory structure is preserved in version control.
