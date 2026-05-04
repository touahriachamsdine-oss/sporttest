#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#define WIFI_SSID "OnePlus 7T-5acc"
#define WIFI_PASS "TESTnode13"
#define SERVER_URL "https://sporttest-blond.vercel.app/api/ingest"
#define DEVICE_ID "esp32-v01"

#define MIC_DIGITAL 3

MAX30105 particleSensor;

const byte RATE_SIZE = 32;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float bpm = 0;
int avgBpm = 0;

unsigned long lastSound = 0;
int clapCount = 0;
unsigned long clapWindowStart = 0;
String soundEvent = "";
unsigned long soundEventTime = 0;

unsigned long lastSync = 0;
const unsigned long syncInterval = 8000;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Wire.begin(4, 5);

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting WiFi");
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 20) {
    delay(500);
    Serial.print(".");
    tries++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected.");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi Failed. Running offline.");
  }

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102 not found.");
    while (1);
  }

  particleSensor.setup(0x0F, 2, 2, 400, 411, 4096);
  particleSensor.setPulseAmplitudeRed(0x0F);
  particleSensor.setPulseAmplitudeIR(0x0F);

  pinMode(MIC_DIGITAL, INPUT);
  Serial.println("Ready.");
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

        long sum = 0;
        for (byte x = 0; x < RATE_SIZE; x++) sum += rates[x];
        avgBpm = sum / RATE_SIZE;
      }
    }
  } else {
    bpm = 0;
    avgBpm = 0;
    lastBeat = 0;
    for (byte x = 0; x < RATE_SIZE; x++) rates[x] = 0;
  }

  // Mic
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

  // Cloud sync
  if (millis() - lastSync > syncInterval) {
    lastSync = millis();
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(SERVER_URL);
      http.addHeader("Content-Type", "application/json");

      // Calculate simulated temperature based on heart rate
      float simulated_temp = 36.5 + (avgBpm > 0 ? (avgBpm - 70) * 0.05 : 0);
      simulated_temp += (random(-10, 11) / 100.0); // Slight jitter
      if (simulated_temp < 36.0) simulated_temp = 36.0;
      if (simulated_temp > 39.5) simulated_temp = 39.5;

      // Calculate simulated ambient temp
      float ambient_temp = 22.0 + (avgBpm > 0 ? (avgBpm - 70) * 0.02 : 0);
      ambient_temp += (random(-20, 21) / 100.0); // More jitter for ambient

      // mic_raw simulation for AMBIENT_AMP chart
      int mic_raw = 512 + random(-50, 51); // Reasonable movement around midpoint
      if (soundEvent != "") mic_raw += 300; // Spike on sound

      StaticJsonDocument<512> doc;
      doc["device_id"]    = DEVICE_ID;
      doc["heart_rate"]   = avgBpm;
      doc["spo2"]         = fingerOn ? 98.0 : 0.0;
      doc["temperature"]  = simulated_temp;
      doc["ambient_temp"] = ambient_temp;
      doc["sound_db"]     = (soundEvent != "") ? 85.0 : 45.0 + (random(-20, 21) / 10.0);
      doc["mic_raw"]      = mic_raw;
      doc["ir_raw"]       = ir;
      doc["red_raw"]      = particleSensor.getRed();
      doc["sound_event"]  = soundEvent;
      doc["finger_on"]    = fingerOn;

      String payload;
      serializeJson(doc, payload);

      int code = http.POST(payload);
      Serial.print("[TX] HTTP: "); Serial.println(code);
      http.end();
    } else {
      Serial.println("[TX] WiFi lost. Reconnecting...");
      WiFi.reconnect();
    }
  }

  // Serial
  Serial.print(fingerOn ? "[ON]  " : "[--]  ");
  Serial.print("IR: ");    Serial.print(ir);
  Serial.print("  BPM: "); Serial.print(bpm, 1);
  Serial.print("  Avg: "); Serial.print(avgBpm);
  if (soundEvent != "") {
    Serial.print("  ");
    Serial.print(soundEvent);
  }
  Serial.println();

  delay(20);
}