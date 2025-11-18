/*
 * ESP32-CAM Integration for Affectra EEG Emotion Tracking System
 * 
 * This code captures photos and uploads them to the Node.js backend
 * whenever triggered (manually or automatically based on emotion detection)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Update WiFi credentials (ssid & password)
 * 2. Update serverHost to your laptop's local IP address
 *    - Find your IP: ipconfig (Windows) or ifconfig (Mac/Linux)
 *    - Use the IPv4 address from your WiFi/hotspot connection
 * 3. Update X-User-ID header with your MongoDB user ID
 *    - Get this from your user profile or MongoDB after registration
 * 4. Upload to ESP32-CAM board (select "AI Thinker ESP32-CAM" board)
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <WiFiClient.h>
#include <HTTPClient.h>

// ===========================
// Camera model configuration
// ===========================
#include "board_config.h"

// ===========================
// WiFi Configuration
// ===========================
const char *ssid = "123";                    // CHANGE: Your WiFi SSID
const char *password = "kudadiri123";        // CHANGE: Your WiFi Password

// ===========================
// Backend Server Configuration
// ===========================
// IMPORTANT: Update this to your laptop's local IP address
// Run "ipconfig" (Windows) or "ifconfig" (Mac/Linux) to find your IP
const char* serverHost = "10.86.184.210";    // CHANGE: Your laptop's IP
const int serverPort = 5001;
const char* serverPath = "/api/camera/upload";

// ===========================
// User Configuration
// ===========================
// IMPORTANT: Replace with your actual MongoDB User ID
// You can get this from your user profile after logging in
const char* userId = "691a6bce29d681d8100fac26";  // CHANGE: Your MongoDB User ID

// ===========================
// Upload Settings
// ===========================
const int UPLOAD_TIMEOUT = 45000;      // 45 seconds timeout
const int PHOTO_INTERVAL = 10000;      // 10 seconds between photos
const int MAX_RETRY_ATTEMPTS = 3;      // Retry failed uploads 3 times

// ===========================
// Function: Send Photo to Backend Server
// ===========================
bool send_photo_to_server() {
  camera_fb_t *fb = NULL;
  bool success = false;
  
  // 1. Capture photo from camera
  Serial.println("\n📸 Capturing photo...");
  fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("❌ Failed to capture photo from camera");
    return false;
  }
  
  Serial.printf("✅ Photo captured: %d bytes\n", fb->len);

  // 2. Send photo via HTTP POST
  WiFiClient client;
  HTTPClient http;
  
  // Build full URL
  String url = "http://" + String(serverHost) + ":" + String(serverPort) + String(serverPath);
  
  if (http.begin(client, serverHost, serverPort, serverPath)) { 
    
    // Set timeout for stable file save
    http.setTimeout(UPLOAD_TIMEOUT); 
    
    Serial.println("📤 Uploading to: " + url);

    // Set headers
    http.addHeader("Content-Type", "image/jpeg");
    http.addHeader("X-User-ID", userId);  // Send user ID for session linking

    // Perform POST request with photo data (JPEG bytes)
    int httpResponseCode = http.POST(fb->buf, fb->len);

    if (httpResponseCode > 0) {
      Serial.printf("✅ Upload successful! HTTP Response: %d\n", httpResponseCode);
      
      // Parse server response
      String response = http.getString();
      Serial.println("📥 Server Response:");
      Serial.println(response);
      
      success = true;
    } else {
      // Handle errors
      if (httpResponseCode == HTTPC_ERROR_CONNECTION_REFUSED) {
        Serial.println("❌ Connection refused. Is backend server running?");
      } else if (httpResponseCode == HTTPC_ERROR_CONNECTION_LOST) {
        Serial.println("❌ Connection lost during upload");
      } else if (httpResponseCode == -1) {
        Serial.printf("❌ Upload timeout after %d seconds\n", UPLOAD_TIMEOUT / 1000);
      } else {
        Serial.printf("❌ Upload failed. Error code: %d (%s)\n", 
                      httpResponseCode, 
                      http.errorToString(httpResponseCode).c_str());
      }
    }
    http.end();
  } else {
    Serial.println("❌ Failed to initialize HTTP connection");
  }

  // 3. Return camera frame buffer
  esp_camera_fb_return(fb);
  
  return success;
}

// ===========================
// Function: Upload with Retry Logic
// ===========================
void upload_with_retry() {
  int attempt = 0;
  bool uploaded = false;
  
  while (attempt < MAX_RETRY_ATTEMPTS && !uploaded) {
    attempt++;
    Serial.printf("\n🔄 Upload attempt %d/%d\n", attempt, MAX_RETRY_ATTEMPTS);
    
    uploaded = send_photo_to_server();
    
    if (!uploaded && attempt < MAX_RETRY_ATTEMPTS) {
      Serial.println("⏳ Retrying in 3 seconds...");
      delay(3000);
    }
  }
  
  if (uploaded) {
    Serial.println("✅ Photo successfully uploaded to backend!");
  } else {
    Serial.println("❌ Failed to upload photo after all retry attempts");
  }
}

// External functions (defined in camera server code)
void startCameraServer();
void setupLedFlash();

// ===========================
// Setup Function
// ===========================
void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println("\n\n");
  Serial.println("================================");
  Serial.println("Affectra ESP32-CAM Starting...");
  Serial.println("================================");

  // Camera configuration
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_VGA;  // VGA (640x480) - good balance of quality/size
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;  // 10-63, lower = higher quality
  config.fb_count = 1;

  // Optimize settings if PSRAM is available
  if (config.pixel_format == PIXFORMAT_JPEG) {
    if (psramFound()) {
      config.jpeg_quality = 10;  // Higher quality with PSRAM
      config.fb_count = 2;
      config.grab_mode = CAMERA_GRAB_LATEST;
    } else {
      config.frame_size = FRAMESIZE_SVGA;
      config.fb_location = CAMERA_FB_IN_DRAM;
    }
  } else {
    config.frame_size = FRAMESIZE_240X240;
#if CONFIG_IDF_TARGET_ESP32S3
    config.fb_count = 2;
#endif
  }

#if defined(CAMERA_MODEL_ESP_EYE)
  pinMode(13, INPUT_PULLUP);
  pinMode(14, INPUT_PULLUP);
#endif

  // Initialize camera
  Serial.println("🔧 Initializing camera...");
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("❌ Camera init failed with error 0x%x\n", err);
    Serial.println("⚠️ Check camera connections and restart");
    return;
  }
  Serial.println("✅ Camera initialized");

  // Configure camera sensor
  sensor_t *s = esp_camera_sensor_get();
  if (s->id.PID == OV3660_PID) {
    s->set_vflip(s, 1);
    s->set_brightness(s, 1);
    s->set_saturation(s, -2);
  }
  
  if (config.pixel_format == PIXFORMAT_JPEG) {
    s->set_framesize(s, FRAMESIZE_VGA);
  }

#if defined(CAMERA_MODEL_M5STACK_WIDE) || defined(CAMERA_MODEL_M5STACK_ESP32CAM)
  s->set_vflip(s, 1);
  s->set_hmirror(s, 1);
#endif

#if defined(CAMERA_MODEL_ESP32S3_EYE)
  s->set_vflip(s, 1);
#endif

#if defined(LED_GPIO_NUM)
  setupLedFlash();
#endif

  // Connect to WiFi
  Serial.println("🌐 Connecting to WiFi...");
  WiFi.begin(ssid, password);
  WiFi.setSleep(false);

  int wifi_attempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifi_attempts < 20) {
    delay(500);
    Serial.print(".");
    wifi_attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.print("📍 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📡 Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\n❌ WiFi connection failed!");
    Serial.println("⚠️ Check SSID and password, then restart");
    return;
  }

  // Start camera server (for web viewing)
  startCameraServer();
  Serial.print("📷 Camera web interface: http://");
  Serial.println(WiFi.localIP());
  
  Serial.println("\n================================");
  Serial.println("✅ System Ready!");
  Serial.println("Backend: " + String(serverHost) + ":" + String(serverPort));
  Serial.println("User ID: " + String(userId));
  Serial.println("================================\n");
}

// ===========================
// Main Loop
// ===========================
void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi disconnected. Reconnecting...");
    WiFi.begin(ssid, password);
    delay(5000);
    return;
  }
  
  // Upload photo with retry logic
  upload_with_retry();
  
  // Wait before next capture
  Serial.printf("\n⏳ Waiting %d seconds before next capture...\n", PHOTO_INTERVAL / 1000);
  delay(PHOTO_INTERVAL);
}
