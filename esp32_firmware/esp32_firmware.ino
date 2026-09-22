#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "config.h"

// Initialize WiFi and MQTT clients
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Timing variables
unsigned long lastReconnectAttempt = 0;
const unsigned long reconnectInterval = 5000; // Attempt reconnection every 5 seconds

// Generate a random Client ID to prevent collisions on public brokers
String completeClientId;

// ==========================================
// Function Declarations
// ==========================================
void setupWiFi();
void setupMQTT();
void connectToMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void publishConfig();
void publishRelayStates();
void updateRelayState(int index, bool state);

// ==========================================
// Setup
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n--- AeroSmart ESP32 System Initializing ---");

  // Generate unique client ID with chip ID to prevent collisions
  uint64_t chipId = ESP.getEfuseMac();
  completeClientId = String(MQTT_CLIENT_ID) + "_" + String((uint32_t)(chipId & 0xFFFFFFFF), HEX);
  Serial.printf("Client ID: %s\n", completeClientId.c_str());

  // Initialize GPIO pins for Relays
  for (int i = 0; i < relayCount; i++) {
    pinMode(relays[i].pin, OUTPUT);
    // Write initial state (taking into account activeLow configuration)
    bool pinValue = relays[i].activeLow ? !relays[i].state : relays[i].state;
    digitalWrite(relays[i].pin, pinValue);
    
    Serial.printf("Configured Relay [%s] on GPIO %d (Active %s, Initial: %s)\n", 
                  relays[i].id, 
                  relays[i].pin, 
                  relays[i].activeLow ? "LOW" : "HIGH",
                  relays[i].state ? "ON" : "OFF");
  }

  // Setup Connections
  setupWiFi();
  setupMQTT();
}

// ==========================================
// Loop
// ==========================================
void loop() {
  // Verify Wi-Fi Status
  if (WiFi.status() != WL_CONNECTED) {
    setupWiFi();
  }

  // Verify MQTT Status
  if (!mqttClient.connected()) {
    unsigned long now = millis();
    if (now - lastReconnectAttempt > reconnectInterval) {
      lastReconnectAttempt = now;
      connectToMQTT();
    }
  } else {
    // Normal operation
    mqttClient.loop();
  }
}

// ==========================================
// Connection Setup
// ==========================================
void setupWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  
  Serial.printf("Connecting to SSID: %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.printf("IP Address: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\nWiFi Connection failed. Will retry in loop.");
  }
}

void setupMQTT() {
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  // Increase buffer size to handle larger config packets if there are many relays
  mqttClient.setBufferSize(2048);
}

void connectToMQTT() {
  Serial.print("Attempting MQTT connection... ");

  // Create status and LWT topics
  String statusTopic = String(BASE_TOPIC) + "/status";
  
  // Set Will: Topic, QoS, Retain, Payload
  // If the ESP32 disconnects unexpectedly, the broker will publish "offline" to status
  bool connected = false;
  if (strlen(MQTT_USER) > 0) {
    connected = mqttClient.connect(completeClientId.c_str(), MQTT_USER, MQTT_PASS, 
                                  statusTopic.c_str(), 1, true, "offline");
  } else {
    connected = mqttClient.connect(completeClientId.c_str(), 
                                  statusTopic.c_str(), 1, true, "offline");
  }

  if (connected) {
    Serial.println("connected!");
    
    // 1. Publish LWT online confirmation
    mqttClient.publish(statusTopic.c_str(), "online", true);

    // 2. Publish complete configuration (retained)
    publishConfig();

    // 3. Publish current states for all relays
    publishRelayStates();

    // 4. Subscribe to control wildcard topic
    String controlWildcard = String(BASE_TOPIC) + "/control/#";
    mqttClient.subscribe(controlWildcard.c_str(), 1);
    Serial.printf("Subscribed to control topic: %s\n", controlWildcard.c_str());
  } else {
    Serial.printf("failed, rc=%d. Will try again in 5 seconds.\n", mqttClient.state());
  }
}

// ==========================================
// Publish Data Functions
// ==========================================

// Publishes configuration JSON
void publishConfig() {
  DynamicJsonDocument doc(2048);
  JsonArray relayArray = doc.createNestedArray("relays");

  for (int i = 0; i < relayCount; i++) {
    JsonObject relayObj = relayArray.createNestedObject();
    relayObj["id"] = relays[i].id;
    relayObj["name"] = relays[i].name;
    relayObj["pin"] = relays[i].pin;
    relayObj["state"] = relays[i].state;
  }

  String configJson;
  serializeJson(doc, configJson);

  String configTopic = String(BASE_TOPIC) + "/config";
  bool success = mqttClient.publish(configTopic.c_str(), configJson.c_str(), true);
  
  if (success) {
    Serial.printf("Published config to %s\n", configTopic.c_str());
    Serial.println(configJson);
  } else {
    Serial.println("Failed to publish config (buffer size issue or broker disconnected).");
  }
}

// Publishes status states of all relays
void publishRelayStates() {
  for (int i = 0; i < relayCount; i++) {
    String stateTopic = String(BASE_TOPIC) + "/status/" + String(relays[i].id) + "/state";
    String statePayload = relays[i].state ? "ON" : "OFF";
    mqttClient.publish(stateTopic.c_str(), statePayload.c_str(), true);
  }
  Serial.println("Relay states published.");
}

// ==========================================
// MQTT Callback Logic
// ==========================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // Convert payload to string
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.printf("Message arrived on topic [%s]: %s\n", topic, message.c_str());

  // Check if topic matches BASE_TOPIC/control/<relay_id>
  String controlPrefix = String(BASE_TOPIC) + "/control/";
  String topicStr = String(topic);
  
  if (topicStr.startsWith(controlPrefix)) {
    String relayId = topicStr.substring(controlPrefix.length());
    
    // Find matching relay
    int foundIndex = -1;
    for (int i = 0; i < relayCount; i++) {
      if (relayId.equals(relays[i].id)) {
        foundIndex = i;
        break;
      }
    }
    
    if (foundIndex != -1) {
      bool newState = message.equalsIgnoreCase("ON") || message.equals("1");
      updateRelayState(foundIndex, newState);
    } else {
      Serial.printf("Warning: Received control for unknown relay ID: %s\n", relayId.c_str());
    }
  }
}

// ==========================================
// Hardware Control Functions
// ==========================================
void updateRelayState(int index, bool state) {
  relays[index].state = state;
  
  // Calculate raw pin value based on active low configuration
  bool pinVal = relays[index].activeLow ? !state : state;
  digitalWrite(relays[index].pin, pinVal);
  
  Serial.printf("Relay [%s] on GPIO %d set to %s (Pin write: %s)\n", 
                relays[index].id, 
                relays[index].pin, 
                state ? "ON" : "OFF", 
                pinVal ? "HIGH" : "LOW");

  // Publish updated state to broker (retained so dashboard gets correct value on loading)
  String stateTopic = String(BASE_TOPIC) + "/status/" + String(relays[index].id) + "/state";
  String statePayload = state ? "ON" : "OFF";
  mqttClient.publish(stateTopic.c_str(), statePayload.c_str(), true);
}
