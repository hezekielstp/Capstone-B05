/*
 * ESP32-CAM Integration for Affectra EEG Emotion Tracking System
 * 
 * SETUP MODES:
 * 
 * MODE 1 - WEB CONFIGURATION (RECOMMENDED):
 * 1. Upload this code to ESP32-CAM (no changes needed!)
 * 2. ESP32-CAM creates WiFi hotspot: "Affectra-Setup"
 * 3. Connect your phone/laptop to "Affectra-Setup" (password: affectra123)
 * 4. Open browser: http://192.168.4.1
 * 5. Enter: WiFi SSID, WiFi Password, Server IP, User ID
 * 6. Click Save - ESP32 will restart and auto-connect!
 * 
 * MODE 2 - HARDCODED (QUICK TEST):
 * Uncomment #define USE_HARDCODED_CONFIG below and fill in values
 * 
 * RESET CONFIGURATION:
 * Hold BOOT button for 5 seconds on startup to reset all settings
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <Preferences.h>

// ===========================
// Camera model configuration
// ===========================
#include "board_config.h"

// ===========================
// Configuration Mode Selection
// ===========================
// Uncomment to use hardcoded values (for quick testing)
// #define USE_HARDCODED_CONFIG

// Uncomment to ALWAYS show configuration portal on startup (for multi-user testing)
// #define ALWAYS_SHOW_CONFIG_PORTAL

#ifdef USE_HARDCODED_CONFIG
  const char *ssid = "123";                    // CHANGE: Your WiFi SSID
  const char *password = "kudadiri123";        // CHANGE: Your WiFi Password
  const char* serverHost = "10.86.184.210";    // CHANGE: Your laptop's IP
  const char* userId = "668877e8a93e5e40854c6012";  // CHANGE: Your MongoDB User ID
#else
  // Dynamic configuration - stored in ESP32 flash memory
  String ssid = "";
  String password = "";
  String serverHost = "";
  String userId = "";
#endif

// ===========================
// Configuration Portal Settings
// ===========================
const char* AP_SSID = "Affectra-Setup";
const char* AP_PASSWORD = "affectra123";
const int serverPort = 5001;
const char* serverPath = "/api/camera/upload";

// ===========================
// Global Objects
// ===========================
Preferences preferences;
WebServer configServer(80);  // Port 80 for initial setup, will use 8080 after WiFi connects
WebServer *runtimeConfigServer = NULL;  // Separate server on port 8080 for runtime config

// ===========================
// Upload Settings
// ===========================
const int UPLOAD_TIMEOUT = 45000;      // 45 seconds timeout
const int PHOTO_INTERVAL = 10000;      // 10 seconds between photos
const int MAX_RETRY_ATTEMPTS = 3;      // Retry failed uploads 3 times
const int BOOT_BUTTON_PIN = 0;         // GPIO 0 for factory reset

// ===========================
// HTML Configuration Page
// ===========================
const char SETUP_PAGE[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Affectra Setup</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #2D3570 0%, #1a1f4a 100%);
      min-height: 100vh;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 500px;
      width: 100%;
      padding: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #2D3570;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .logo p {
      color: #666;
      font-size: 14px;
    }
    .current-config {
      background: #F5F7FB;
      border-left: 4px solid #2D3570;
      padding: 16px;
      margin-bottom: 24px;
      border-radius: 4px;
    }
    .current-config h3 {
      color: #2D3570;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .current-config p {
      font-size: 13px;
      color: #555;
      margin-bottom: 6px;
      word-break: break-all;
    }
    .current-config .label {
      font-weight: 600;
      color: #2D3570;
    }
    .form-group {
      margin-bottom: 24px;
    }
    label {
      display: block;
      color: #2D3570;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }
    input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s;
    }
    input:focus {
      outline: none;
      border-color: #2D3570;
      box-shadow: 0 0 0 3px rgba(45, 53, 112, 0.1);
    }
    .help-text {
      font-size: 12px;
      color: #666;
      margin-top: 6px;
    }
    .btn {
      width: 100%;
      padding: 14px;
      background: #2D3570;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 12px;
    }
    .btn:hover {
      background: #1a1f4a;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(45, 53, 112, 0.3);
    }
    .btn:active {
      transform: translateY(0);
    }
    .btn-danger {
      background: #dc3545;
    }
    .btn-danger:hover {
      background: #c82333;
    }
    .status {
      margin-top: 20px;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
      display: none;
    }
    .status.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .status.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .warning-box {
      background: #fff3cd;
      border: 1px solid #ffc107;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .warning-box p {
      font-size: 13px;
      color: #856404;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>🎯 Affectra</h1>
      <p>ESP32-CAM Configuration</p>
    </div>
    
    <div class="current-config" id="currentConfig" style="display:none;">
      <h3>📋 Current Configuration</h3>
      <p><span class="label">WiFi:</span> <span id="currentSsid">-</span></p>
      <p><span class="label">Server:</span> <span id="currentServer">-</span></p>
      <p><span class="label">User ID:</span> <span id="currentUserId">-</span></p>
    </div>

    <div class="warning-box">
      <p>⚠️ <strong>Multi-User Notice:</strong> If switching to a different user, please update the User ID below to avoid photos going to the wrong account!</p>
    </div>
    
    <form id="configForm">
      <div class="form-group">
        <label>WiFi Network (SSID)</label>
        <input type="text" name="ssid" id="ssidInput" required placeholder="Your WiFi name">
        <div class="help-text">Enter your home/office WiFi network name</div>
      </div>
      
      <div class="form-group">
        <label>WiFi Password</label>
        <input type="password" name="password" required placeholder="WiFi password">
        <div class="help-text">Your WiFi password (will be stored securely)</div>
      </div>
      
      <div class="form-group">
        <label>Backend Server IP</label>
        <input type="text" name="serverHost" id="serverInput" required placeholder="192.168.1.100">
        <div class="help-text">Your laptop's local IP (run: ipconfig or ifconfig)</div>
      </div>
      
      <div class="form-group">
        <label>User ID</label>
        <input type="text" name="userId" id="userIdInput" required placeholder="668877e8a93e5e40854c6012">
        <div class="help-text">Your MongoDB User ID (check your email or dashboard)</div>
      </div>
      
      <button type="submit" class="btn">💾 Save Configuration</button>
      <button type="button" class="btn btn-danger" onclick="clearUserId()">🔄 Clear User ID Only</button>
    </form>
    
    <div style="margin-top: 20px; padding: 12px; background: #fff3cd; border-radius: 8px; border: 1px solid #ffc107;">
      <p style="font-size: 12px; color: #856404; margin: 0;">
        💡 <strong>Tip:</strong> "Clear User ID" removes only the User ID, keeping WiFi connected. 
        For complete factory reset, hold the BOOT button for 5 seconds on startup.
      </p>
    </div>
    
    <div id="status" class="status"></div>
  </div>
  
  <script>
    // Load current config on page load
    window.onload = async () => {
      try {
        const response = await fetch('/config');
        const data = await response.json();
        
        if (data.ssid && data.ssid !== '') {
          document.getElementById('currentConfig').style.display = 'block';
          document.getElementById('currentSsid').textContent = data.ssid;
          document.getElementById('currentServer').textContent = data.serverHost + ':5001';
          document.getElementById('currentUserId').textContent = data.userId || 'Not set';
          
          // Pre-fill form with current values
          document.getElementById('ssidInput').value = data.ssid;
          document.getElementById('serverInput').value = data.serverHost;
          document.getElementById('userIdInput').value = data.userId || '';
        }
      } catch (e) {
        console.log('No existing config');
      }
    };

    document.getElementById('configForm').onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      const status = document.getElementById('status');
      status.style.display = 'block';
      status.className = 'status';
      status.textContent = '⏳ Saving configuration...';
      
      try {
        const response = await fetch('/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          status.className = 'status success';
          status.textContent = '✅ Configuration saved! ESP32-CAM will restart in 3 seconds...';
          setTimeout(() => {
            status.textContent = '🔄 Restarting... Please wait 10 seconds then check your dashboard for photos!';
          }, 3000);
        } else {
          throw new Error('Failed to save');
        }
      } catch (error) {
        status.className = 'status error';
        status.textContent = '❌ Failed to save configuration. Please try again.';
      }
    };

    async function clearUserId() {
      if (!confirm('🔄 This will clear only the User ID. WiFi will stay connected. Continue?')) {
        return;
      }

      const status = document.getElementById('status');
      status.style.display = 'block';
      status.className = 'status';
      status.textContent = '⏳ Clearing User ID...';

      try {
        const response = await fetch('/clear', { method: 'POST' });
        if (response.ok) {
          status.className = 'status success';
          status.textContent = '✅ User ID cleared! Please enter new User ID and save.';
          
          // Clear the User ID field
          document.getElementById('userIdInput').value = '';
          document.getElementById('currentUserId').textContent = 'Not set';
          
          setTimeout(() => {
            location.reload();
          }, 2000);
        }
      } catch (error) {
        status.className = 'status error';
        status.textContent = '❌ Failed to clear User ID.';
      }
    }
  </script>
</body>
</html>
)rawliteral";

// ===========================
// Configuration Functions
// ===========================
void loadConfiguration() {
  preferences.begin("affectra", false);
  
#ifndef USE_HARDCODED_CONFIG
  ssid = preferences.getString("ssid", "");
  password = preferences.getString("password", "");
  serverHost = preferences.getString("serverHost", "");
  userId = preferences.getString("userId", "");
#endif
  
  preferences.end();
}

void saveConfiguration(String newSsid, String newPassword, String newServerHost, String newUserId) {
  preferences.begin("affectra", false);
  preferences.putString("ssid", newSsid);
  preferences.putString("password", newPassword);
  preferences.putString("serverHost", newServerHost);
  preferences.putString("userId", newUserId);
  preferences.end();
  
  Serial.println("✅ Configuration saved to flash memory!");
}

void clearConfiguration() {
  preferences.begin("affectra", false);
  preferences.clear();
  preferences.end();
  
  Serial.println("🗑️ Configuration cleared!");
}

bool isConfigured() {
#ifdef USE_HARDCODED_CONFIG
  return true;
#else
  #ifdef ALWAYS_SHOW_CONFIG_PORTAL
    return false;  // Always show config portal for easy reconfiguration
  #else
    return ssid.length() > 0 && serverHost.length() > 0 && userId.length() > 0;
  #endif
#endif
}

// ===========================
// Web Server Handlers
// ===========================
void handleRoot() {
  // Works with both configServer (AP mode) and runtimeConfigServer (STA mode)
  if (runtimeConfigServer != NULL && runtimeConfigServer->client()) {
    runtimeConfigServer->send(200, "text/html", SETUP_PAGE);
  } else {
    configServer.send(200, "text/html", SETUP_PAGE);
  }
}

void handleGetConfig() {
  // Return current configuration as JSON
  String json = "{";
  json += "\"ssid\":\"" + ssid + "\",";
  json += "\"serverHost\":\"" + serverHost + "\",";
  json += "\"userId\":\"" + userId + "\"";
  json += "}";
  
  if (runtimeConfigServer != NULL && runtimeConfigServer->client()) {
    runtimeConfigServer->send(200, "application/json", json);
  } else {
    configServer.send(200, "application/json", json);
  }
}

void handleSave() {
  WebServer* server = (runtimeConfigServer != NULL && runtimeConfigServer->client()) ? runtimeConfigServer : &configServer;
  
  if (server->method() == HTTP_POST) {
    String body = server->arg("plain");
    
    // Parse JSON manually (simple parsing for small payload)
    int ssidStart = body.indexOf("\"ssid\":\"") + 8;
    int ssidEnd = body.indexOf("\"", ssidStart);
    String newSsid = body.substring(ssidStart, ssidEnd);
    
    int passStart = body.indexOf("\"password\":\"") + 12;
    int passEnd = body.indexOf("\"", passStart);
    String newPassword = body.substring(passStart, passEnd);
    
    int hostStart = body.indexOf("\"serverHost\":\"") + 14;
    int hostEnd = body.indexOf("\"", hostStart);
    String newServerHost = body.substring(hostStart, hostEnd);
    
    int userStart = body.indexOf("\"userId\":\"") + 10;
    int userEnd = body.indexOf("\"", userStart);
    String newUserId = body.substring(userStart, userEnd);
    
    // Save to preferences
    saveConfiguration(newSsid, newPassword, newServerHost, newUserId);
    
    server->send(200, "application/json", "{\"success\":true}");
    
    delay(1000);
    ESP.restart();
  } else {
    server->send(405, "text/plain", "Method Not Allowed");
  }
}

void handleClear() {
  WebServer* server = (runtimeConfigServer != NULL && runtimeConfigServer->client()) ? runtimeConfigServer : &configServer;
  
  if (server->method() == HTTP_POST) {
    // Only clear User ID, keep WiFi and server config
    preferences.begin("affectra", false);
    preferences.remove("userId");  // Only remove User ID
    preferences.end();
    
    // Update the global variable
    userId = "";
    
    Serial.println("🗑️ User ID cleared! WiFi and Server settings retained.");
    server->send(200, "application/json", "{\"success\":true,\"message\":\"User ID cleared. Please enter new User ID.\"}");
  } else {
    server->send(405, "text/plain", "Method Not Allowed");
  }
}

// ===========================
// Configuration Portal Mode
// ===========================
void startConfigPortal() {
  Serial.println("\n🌐 Starting Configuration Portal...");
  
  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASSWORD);
  
  IPAddress IP = WiFi.softAPIP();
  Serial.println("✅ Configuration Portal Active!");
  Serial.println("================================");
  Serial.println("📱 Connect to WiFi:");
  Serial.println("   SSID: " + String(AP_SSID));
  Serial.println("   Password: " + String(AP_PASSWORD));
  Serial.println("\n🌐 Open browser:");
  Serial.print("   http://");
  Serial.println(IP);
  Serial.println("================================\n");
  
  configServer.on("/", handleRoot);
  configServer.on("/config", handleGetConfig);
  configServer.on("/save", handleSave);
  configServer.on("/clear", handleClear);
  configServer.begin();
  
  // Wait for configuration
  while (true) {
    configServer.handleClient();
    delay(10);
  }
}

// ===========================
// Check for Factory Reset
// ===========================
bool checkFactoryReset() {
  pinMode(BOOT_BUTTON_PIN, INPUT_PULLUP);
  
  if (digitalRead(BOOT_BUTTON_PIN) == LOW) {
    Serial.println("🔘 BOOT button pressed...");
    delay(5000);
    
    if (digitalRead(BOOT_BUTTON_PIN) == LOW) {
      Serial.println("🗑️ Factory reset triggered!");
      clearConfiguration();
      return true;
    }
  }
  
  return false;
}

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
  String url = "http://" + serverHost + ":" + String(serverPort) + String(serverPath);
  
  if (http.begin(client, serverHost.c_str(), serverPort, serverPath)) { 
    
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

  // Check for factory reset (hold BOOT button)
  if (checkFactoryReset()) {
    delay(2000);
    ESP.restart();
  }

  // Load saved configuration
  loadConfiguration();

  // Check if configured
  if (!isConfigured()) {
    Serial.println("⚠️ No configuration found!");
    startConfigPortal();  // This will block until configured
  }

  // Display current configuration
  Serial.println("\n📋 Current Configuration:");
  Serial.println("WiFi SSID: " + ssid);
  Serial.println("Server: " + serverHost + ":" + String(serverPort));
  Serial.println("User ID: " + userId);
  Serial.println();

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
  Serial.println("🌐 Connecting to WiFi: " + ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), password.c_str());
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
    Serial.print("🌐 Config Portal: http://");
    Serial.print(WiFi.localIP());
    Serial.println(":8080/");
    Serial.print("📡 Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\n❌ WiFi connection failed!");
    Serial.println("⚠️ Check SSID and password, then restart");
    Serial.println("💡 Hold BOOT button for 5 seconds to reset configuration");
    return;
  }

  // Start camera server (for web viewing)
  startCameraServer();
  Serial.print("📷 Camera web interface: http://");
  Serial.println(WiFi.localIP());
  
  // Start configuration server on port 8080 to avoid conflict with camera server (port 80)
  // Users can access http://[ESP32-IP]:8080/ to reconfigure at any time
  runtimeConfigServer = new WebServer(8080);
  runtimeConfigServer->on("/", handleRoot);
  runtimeConfigServer->on("/config", handleGetConfig);
  runtimeConfigServer->on("/save", handleSave);
  runtimeConfigServer->on("/clear", handleClear);
  runtimeConfigServer->begin();
  
  Serial.println("\n🔧 Configuration Portal:");
  Serial.print("   http://");
  Serial.print(WiFi.localIP());
  Serial.println(":8080/");
  Serial.println("   (Access anytime to change User ID)");
  
  Serial.println("\n================================");
  Serial.println("✅ System Ready!");
  Serial.println("Backend: " + serverHost + ":" + String(serverPort));
  Serial.println("User ID: " + userId);
  Serial.println("================================\n");
}

// ===========================
// Main Loop
// ===========================
void loop() {
  // Handle configuration web server requests
  if (runtimeConfigServer != NULL) {
    runtimeConfigServer->handleClient();
  }
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi disconnected. Reconnecting...");
    WiFi.begin(ssid.c_str(), password.c_str());
    delay(5000);
    return;
  }
  
  // Upload photo with retry logic
  upload_with_retry();
  
  // Wait before next capture
  Serial.printf("\n⏳ Waiting %d seconds before next capture...\n", PHOTO_INTERVAL / 1000);
  delay(PHOTO_INTERVAL);
}
