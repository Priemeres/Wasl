// ESP32 Arduino example for a trusted local network.
// Replace placeholders locally; never commit actual credentials or device tokens.
#include <WiFi.h>
#include <HTTPClient.h>
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* WASL_ENDPOINT = "http://192.168.1.10:8080/api/telemetry";
const char* DEVICE_TOKEN = "YOUR_DEVICE_TOKEN";
unsigned long lastAttempt = 0;
void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}
void loop() {
  if (millis() - lastAttempt < 5000) return;
  lastAttempt = millis();
  if (WiFi.status() != WL_CONNECTED) { WiFi.reconnect(); return; }
  HTTPClient http;
  http.setTimeout(5000);
  if (!http.begin(WASL_ENDPOINT)) return;
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + DEVICE_TOKEN);
  // Replace 26.4 with an actual sensor measurement.
  int status = http.POST("{\"value\":26.4,\"unit\":\"C\"}");
  Serial.printf("Wasl status: %d\n", status);
  http.end();
}
