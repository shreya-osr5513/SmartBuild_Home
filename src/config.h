#ifndef CONFIG_H
#define CONFIG_H

// ==========================================
// Wi-Fi Configuration
// ==========================================
// For Wokwi simulation, use "Wokwi-GUEST" and empty password.
// For physical deployment, replace with your home router's credentials.
#define WIFI_SSID       "Wokwi-GUEST"
#define WIFI_PASSWORD   ""

// ==========================================
// MQTT Broker Configuration
// ==========================================
// broker.hivemq.com is a free public broker.
// Port 1883 is standard TCP (unencrypted) for microcontroller connections.
#define MQTT_BROKER     "broker.hivemq.com"
#define MQTT_PORT       1883
#define MQTT_USER       ""
#define MQTT_PASS       ""
#define BASE_TOPIC      "home/smarthabitat_shreya"

// Auto-generated client ID to prevent collisions on the public broker
#define MQTT_CLIENT_ID  "smarthabitat_esp32_client"

// ==========================================
// Relay Channels (Dynamic Configuration)
// ==========================================
// Define your relay channels here. The ESP32 will auto-publish this list
// to the dashboard on startup, allowing the dashboard to auto-generate the switches.
struct Relay {
  const char* id;      // Unique string identifier (used in MQTT topics, e.g., home/esp32/status/relay_id/state)
  const char* name;    // User-friendly display name (e.g. "Living Room Lamp")
  int pin;             // ESP32 GPIO pin connected to the relay input (e.g. 12, 13, 14, 27)
  bool activeLow;      // Set true if your relay board triggers on LOW signal, false if active HIGH
  bool state;          // Default initial state (false = off, true = on)
};

// Define channels. Add, remove, or modify elements below to change the system dynamics.
// Note: ESP32 standard GPIO pins: 12, 13, 14, 15, 27, 26, 25, 33, 32 are good choices.
// Pin 2 is typically the on-board blue LED, handy for testing.
Relay relays[] = {
  {"light_1", "Living Room Light", 12, false, false},
  {"fan_1", "Ceiling Fan", 13, false, false},
  {"ac_unit", "Bedroom AC", 14, false, false},
  {"status_led","On-board Led",  2, false, false}
};

// Calculate the number of relays dynamically
const int relayCount = sizeof(relays) / sizeof(relays[0]);

#endif // CONFIG_H
