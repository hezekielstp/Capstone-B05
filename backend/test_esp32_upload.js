/**
 * Test script for ESP32-CAM integration
 * Tests the /api/camera/upload endpoint without needing actual ESP32 hardware
 * 
 * Requirements: Node.js 18+ (for built-in fetch) or install node-fetch
 * Usage: node test_esp32_upload.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Note: If you get "fetch is not defined" error on Node < 18:
// Run: npm install node-fetch
// Then uncomment: import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SERVER_URL = 'http://localhost:5001';
const USER_ID = '668877e8a93e5e40854c6012'; // UPDATE THIS with your actual user ID

// Create a test JPEG image (1x1 pixel red JPEG)
const createTestJPEG = () => {
  // Minimal valid JPEG file (1x1 red pixel)
  return Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x09, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00,
    0x54, 0x7F, 0xFF, 0xD9
  ]);
};

async function testUpload() {
  console.log('🧪 ESP32-CAM Upload Test\n');
  console.log('========================================');
  console.log(`Server: ${SERVER_URL}`);
  console.log(`User ID: ${USER_ID}`);
  console.log('========================================\n');

  // Step 1: Check server connectivity
  console.log('1️⃣  Testing server connectivity...');
  try {
    const healthCheck = await fetch(SERVER_URL);
    console.log(`   ✅ Server is reachable (Status: ${healthCheck.status})\n`);
  } catch (err) {
    console.log(`   ❌ Server is NOT reachable!`);
    console.log(`   Error: ${err.message}`);
    console.log(`   → Make sure backend is running: npm run dev\n`);
    return;
  }

  // Step 2: Create test image
  console.log('2️⃣  Creating test JPEG image...');
  const testImage = createTestJPEG();
  console.log(`   ✅ Test image created (${testImage.length} bytes)\n`);

  // Step 3: Upload to server
  console.log('3️⃣  Uploading to /api/camera/upload...');
  try {
    const response = await fetch(`${SERVER_URL}/api/camera/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
        'X-User-ID': USER_ID,
      },
      body: testImage,
    });

    const data = await response.json();

    if (response.ok) {
      console.log('   ✅ Upload successful!\n');
      console.log('📊 Response:');
      console.log(JSON.stringify(data, null, 2));
      console.log('\n🎉 Test PASSED!\n');
      console.log('📸 Photo location:');
      console.log(`   ${SERVER_URL}${data.data.imageUrl}`);
      console.log('\n💡 Next steps:');
      console.log('   1. Open the photo URL in browser to verify');
      console.log('   2. Check backend/uploads/camera_captures/ folder');
      console.log('   3. Upload your Arduino code to ESP32-CAM');
    } else {
      console.log('   ❌ Upload failed!\n');
      console.log('📊 Error Response:');
      console.log(JSON.stringify(data, null, 2));
      console.log('\n💡 Troubleshooting:');
      
      if (data.message?.includes('User ID')) {
        console.log('   → Update USER_ID constant in this script');
        console.log('   → Get your user ID from MongoDB or JWT token');
      } else if (data.message?.includes('session')) {
        console.log('   → Create an EEG session first');
        console.log('   → Run: POST /api/sessions/inference with auth token');
      }
    }
  } catch (err) {
    console.log('   ❌ Upload request failed!\n');
    console.log(`Error: ${err.message}\n`);
    console.log('💡 Troubleshooting:');
    console.log('   → Check if backend is running on port 5001');
    console.log('   → Verify no firewall blocking localhost:5001');
  }

  console.log('\n========================================');
}

// Run the test
testUpload();
