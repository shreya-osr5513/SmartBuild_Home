import sys
import subprocess
import time
import random
import json

# Auto-install paho-mqtt if not present
try:
    import paho.mqtt.client as mqtt
except ImportError:
    print("Installing required library: paho-mqtt...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "paho-mqtt"])
        import paho.mqtt.client as mqtt
    except Exception as e:
        print(f"Error installing dependencies: {e}")
        print("Please manually run: pip3 install paho-mqtt")
        sys.exit(1)

BROKER = "broker.hivemq.com"
PORT = 1883
BASE_TOPIC = "home/smarthabitat_shreya"

client_id = f"mock_esp32_device_{random.randint(1000, 9999)}"

# Default Mock Relays matching the config.h structure
relays = [
    { "id": "light_1", "name": "Living Room Light", "pin": 12, "state": False },
    { "id": "fan_1", "name": "Ceiling Fan", "pin": 13, "state": False },
    { "id": "ac_unit", "name": "Bedroom AC", "pin": 14, "state": False },
    { "id": "status_led", "name": "On-board Led", "pin": 2, "state": False }
]

def on_connect(client, userdata, flags, rc, properties=None):
    print("\nConnected to MQTT Broker!")
    print("Status: ONLINE")
    
    # Publish LWT online confirmation
    client.publish(f"{BASE_TOPIC}/status", "online", qos=1, retain=True)
    
    # Publish dynamic configuration
    config_payload = json.dumps({ "relays": relays })
    client.publish(f"{BASE_TOPIC}/config", config_payload, qos=1, retain=True)
    print(f"Published configurations to: {BASE_TOPIC}/config")
    
    # Publish initial states
    for relay in relays:
        state_topic = f"{BASE_TOPIC}/status/{relay['id']}/state"
        state_val = "ON" if relay["state"] else "OFF"
        client.publish(state_topic, state_val, qos=1, retain=True)
        print(f"Initial state: {relay['id']} -> {state_val}")
        
    # Subscribe to control commands
    client.subscribe(f"{BASE_TOPIC}/control/#", qos=1)
    print(f"Subscribed to control topic: {BASE_TOPIC}/control/#")
    print("\nWaiting for commands from dashboard...")
    print("----------------------------------------------------")

def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode('utf-8')
    
    control_prefix = f"{BASE_TOPIC}/control/"
    if topic.startswith(control_prefix):
        relay_id = topic[len(control_prefix):]
        # Find relay
        relay = next((r for r in relays if r["id"] == relay_id), None)
        if relay:
            relay["state"] = (payload == "ON")
            print(f"[COMMAND] Relay [{relay['name']}] set to {payload}")
            
            # Publish state confirmation
            state_topic = f"{BASE_TOPIC}/status/{relay['id']}/state"
            client.publish(state_topic, payload, qos=1, retain=True)
            print(f"[STATUS] Confirmed status published: {relay['id']} -> {payload}")
        else:
            print(f"[WARNING] Received control command for unknown relay ID: {relay_id}")

# Setup Client, support paho-mqtt v2.0+ as well as v1.x
try:
    client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2, client_id=client_id)
except AttributeError:
    client = mqtt.Client(client_id=client_id)

client.will_set(f"{BASE_TOPIC}/status", "offline", qos=1, retain=True)
client.on_connect = on_connect
client.on_message = on_message

print("----------------------------------------------------")
print(" AeroSmart IoT - Mock ESP32 Device Simulator (Python)")
print("----------------------------------------------------")
print(f"Connecting to broker: {BROKER}:{PORT}")

client.connect(BROKER, PORT, 60)

try:
    client.loop_forever()
except KeyboardInterrupt:
    print("\nDisconnecting and shutting down...")
    client.publish(f"{BASE_TOPIC}/status", "offline", qos=1, retain=True)
    client.disconnect()
    print("Simulator stopped.")
