# AeroSmart: IoT Home Automation System (ESP32 + MQTT + Mobile Dashboard)

A premium, responsive, and lightweight IoT Home Automation system featuring an ESP32 microcontroller, relay controllers, an MQTT routing broker, and a dark-mode glassmorphic mobile web dashboard.

---

## 🏗️ Architecture

```
                       ┌─────────────────────────┐
                       │  Mobile Web Dashboard   │
                       │ (HTML5 / Vanilla CSS/JS)│
                       └────────────┬────────────┘
                                    │ MQTT over WebSockets
                                    ▼ (Port 8884 / SSL)
                       ┌─────────────────────────┐
                       │       MQTT Broker       │
                       │  (broker.hivemq.com)    │
                       └────────────┬────────────┘
                                    │ MQTT over TCP
                                    ▼ (Port 1883)
                       ┌─────────────────────────┐
                       │   ESP32 Microcontroller │
                       │    (Arduino Sketch)     │
                       └────────────┬────────────┘
                                    │ GPIO High / Low
                                    ▼
                       ┌─────────────────────────┐
                       │      Relay Modules      │
                       └─────────────────────────┘
```

---

## 📂 Project Structure

```
iot-home-automation/
├── README.md              # Documentation & guides
├── package.json           # Simulator scripts & dependencies
├── mock_esp32.js          # Node.js Mock ESP32 device simulator
├── dashboard/             # Web/Mobile Client files
│   ├── index.html         # semantic UI structure
│   ├── style.css          # Glassmorphic responsive styling
│   └── app.js             # Client MQTT logic & dynamic renderer
└── esp32_firmware/        # Microcontroller code files
    ├── esp32_firmware.ino # Main Arduino C++ sketch
    └── config.h           # Wi-Fi credentials & Relay profiles config
```

---

## ⚡ Quick Start: Running the Simulator (No hardware required)

You can fully test the responsive dashboard and control loop without needing a physical ESP32.

### 1. Run the Device Simulator
1. Navigate to the project root directory in your terminal:
   ```bash
   cd /Users/meydivyansh/iot-home-automation
   ```
2. Start the mock device:
   ```bash
   python3 mock_esp32.py
   ```
   *(Note: The script will automatically install `paho-mqtt` if you don't already have it).*
   You should see the simulator connect to `broker.hivemq.com` and log `Status: ONLINE`.

### 2. Launch the Mobile Dashboard
1. Open [dashboard/index.html](file:///Users/meydivyansh/iot-home-automation/dashboard/index.html) in your browser (Safari, Chrome, or any mobile browser).
2. The dashboard will automatically read its default configurations and attempt connection.
3. Once connected, the simulator will send the list of relays dynamically, and the UI will automatically render the switches!
4. Try toggling the switches on the dashboard. You will see real-time console messages in the simulator terminal confirming state transitions, and vice versa!

---

## 🔌 Hardware Setup & Deployment

### 1. Wiring Guide (ESP32 to Relay Module)
Connect the ESP32 GPIOs to the input pins of your Relay Board. Make sure the relays are powered appropriately (usually 5V VCC).

| Relay Channel | Appliance Name | ESP32 GPIO Pin |
|:---|:---|:---|
| Channel 1 | Living Room Light | **GPIO 12** |
| Channel 2 | Ceiling Fan | **GPIO 13** |
| Channel 3 | Bedroom AC | **GPIO 14** |
| Channel 4 | On-board LED / Test | **GPIO 2** |

*Note: You can easily add or change pins by modifying the array in `esp32_firmware/config.h`.*

### 2. Flashing the ESP32
1. Open `esp32_firmware/esp32_firmware.ino` in your **Arduino IDE** or **VS Code (PlatformIO)**.
2. Install the required libraries via the Arduino Library Manager:
   - **PubSubClient** by Nick O'Leary
   - **ArduinoJson** by Benoit Blanchon (V6 or later)
3. Open `esp32_firmware/config.h` and configure:
   - `WIFI_SSID` and `WIFI_PASSWORD` to your local network.
   - (Optional) Configure private MQTT broker credentials if you don't want to use the public HiveMQ test broker.
4. Select your ESP32 board in tools and upload the sketch.
5. Open the Serial Monitor (Baud rate `115200`) to check progress.

---

## 🌐 Online Simulation in Wokwi

You can run the ESP32 firmware in a virtual browser-based circuit board using **Wokwi**:

### Method A: Browser-based Simulation (Easiest)
1. Go to [wokwi.com/projects/new/esp32](https://wokwi.com/projects/new/esp32).
2. Copy and paste the code from [esp32_firmware/esp32_firmware.ino](file:///Users/meydivyansh/iot-home-automation/esp32_firmware/esp32_firmware.ino) into the `sketch.ino` tab.
3. Click the `+` button in the editor, create a new file named `config.h`, and copy the contents of [esp32_firmware/config.h](file:///Users/meydivyansh/iot-home-automation/esp32_firmware/config.h) into it.
4. Click the `+` button again, create a file named `libraries.txt`, and copy the contents of [esp32_firmware/libraries.txt](file:///Users/meydivyansh/iot-home-automation/esp32_firmware/libraries.txt) into it.
5. Click on the `diagram.json` tab and paste the contents of [esp32_firmware/diagram.json](file:///Users/meydivyansh/iot-home-automation/esp32_firmware/diagram.json) into it. This will automatically wire the ESP32 to 3 relays and LEDs!
6. Click the **Start Simulation** (Play) button. The ESP32 will connect to Wokwi's virtual WiFi gateway, link to the public HiveMQ MQTT broker, and status will show `online`!

### Method B: VS Code Extension
If you have the Wokwi VS Code extension installed:
1. Open the `/Users/meydivyansh/iot-home-automation` workspace in VS Code.
2. Open the command palette (`Cmd+Shift+P` on macOS) and run `Wokwi: Start Simulator`.
3. The simulator will compile the source code and start running the interactive board.

