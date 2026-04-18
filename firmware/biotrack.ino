#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- Neural-Link Configuration ---
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASS "YOUR_WIFI_PASSWORD"
#define SERVER_URL "https://sporttest.vercel.app/api/ingest" 
#define DEVICE_ID "esp32-v01"

MAX30105 particleSensor;

#define MIC_DIGITAL 35

const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float bpm = 0;
int avgBpm = 0;

// Mic Detection State
unsigned long lastSound = 0;
int clapCount = 0;
unsigned long clapWindowStart = 0;
String soundEvent = "";
unsigned long soundEventTime = 0;

// Sync Interval
unsigned long lastSync = 0;
const unsigned long syncInterval = 3000; // 3 seconds

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  // Connection Phase
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Initializing Link");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nLink Stable.");

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAV30102 Missing. Critical Failure.");
    while (1);
  }

  particleSensor.setup(0x0F, 2, 2, 400, 411, 4096);
  particleSensor.setPulseAmplitudeRed(0x0F);
  particleSensor.setPulseAmplitudeIR(0x0F);

  pinMode(MIC_DIGITAL, INPUT);
  Serial.println("Nexus Probe Ready.");
}

void loop() {
  long ir = particleSensor.getIR();
  bool fingerOn = ir > 30000;

  if (fingerOn) {
    if (checkForBeat(ir)) {
      long delta = millis() - lastBeat;
      lastBeat = millis();
      bpm = 60 / (delta / 1000.0);

      if (bpm > 50 && bpm < 180) {
        rates[rateSpot++] = (byte)bpm;
        rateSpot %= RATE_SIZE;

        // Weighted Average for higher fidelity
        float wSum = 0, wTotal = 0;
        for (byte x = 0; x < RATE_SIZE; x++) {
          float w = x + 1;
          wSum += rates[x] * w;
          wTotal += w;
        }
        avgBpm = (int)(wSum / wTotal);
      }
    }
  } else {
    bpm = 0;
    avgBpm = 0;
    lastBeat = 0;
    for (byte x = 0; x < RATE_SIZE; x++) rates[x] = 0;
  }

  // Mic logic (Clap Detection)
  int micValue = digitalRead(MIC_DIGITAL);
  if (micValue == 0) {
    unsigned long now = millis();
    if (now - lastSound > 100) {
      if (now - clapWindowStart < 500) {
        clapCount++;
      } else {
        clapCount = 1;
        clapWindowStart = now;
      }
      lastSound = now;
      soundEvent = (clapCount >= 2) ? "DOUBLE_CLAP" : "SINGLE_CLAP";
      if (clapCount >= 2) clapCount = 0;
      soundEventTime = now;
    }
  }
  if (millis() - soundEventTime > 500) soundEvent = "";

  // Cloud Transmission
  if (millis() - lastSync > syncInterval) {
    lastSync = millis();
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(SERVER_URL);
      http.addHeader("Content-Type", "application/json");

      StaticJsonDocument<400> doc;
      doc["device_id"] = DEVICE_ID;
      doc["heart_rate"] = avgBpm;
      doc["spo2"] = fingerOn ? 98.0 : 0.0; 
      doc["temperature"] = 36.5; 
      doc["sound_db"] = (soundEvent != "") ? 85.0 : 45.0; // Simulated volume
      
      // Raw signal for dashboard visualization
      doc["ir_raw"] = ir;
      doc["red_raw"] = particleSensor.getRed();
      
      String payload;
      serializeJson(doc, payload);
      int code = http.POST(payload);
      Serial.print("[TX] Status: "); Serial.println(code);
      http.end();
    }
  }

  // Terminal telemetry
  Serial.print(fingerOn ? "[ON]  " : "[--]  ");
  Serial.print("IR: ");    Serial.print(ir);
  Serial.print("  BPM: "); Serial.print(bpm, 1);
  Serial.print("  Avg: "); Serial.print(avgBpm);
  if (soundEvent != "") {
    Serial.print("  EVENT: ");
    Serial.print(soundEvent);
  }
  Serial.println();

  delay(20);
}
