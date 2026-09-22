# SmartBuild Home

SmartBuild Home is an IoT-based smart room monitoring and appliance control system built using **ESP32, MQTT, Wokwi, React, TypeScript, and Vite**.

Room 101 is the live MQTT-connected room, while the remaining rooms are simulated to demonstrate multi-room monitoring and scalability.

---

## Features

* Fan, Light and AC ON/OFF control
* Turn all appliances OFF
* ESP32 Online / Offline detection
* Real-time MQTT state updates
* Activity logging
* Multi-room dashboard
* Occupancy monitoring
* Temperature and humidity display
* Alerts and energy analytics
* Automation modes
* AI-style recommendations
* Responsive frontend

---

## System Architecture

SmartBuild Dashboard
↓
MQTT over WebSockets
↓
HiveMQ Broker
↓
ESP32 in Wokwi
↓
Fan / Light / AC


```text
SmartBuild Home Web Dashboard
            |
            | MQTT over WebSockets
            v
     HiveMQ MQTT Broker
            |
            | MQTT
            v
        ESP32 Device
      (Wokwi Simulation)
            |
            v
       Relay Modules
       /     |     \
    Light   Fan     AC
```


---

## Room 101

Room 101 is the live IoT room.

It supports:

* Fan control
* Light control
* AC control
* Online / Offline status
* Real-time state synchronization
* Activity logging

When Wokwi is running, Room 101 shows **Online**.
When Wokwi is stopped, it shows **Offline**.

---

## Simulated Rooms

Other rooms are used to demonstrate:

* Temperature
* Humidity
* Occupancy
* Energy alerts
* Automation
* Analytics
* AI recommendations

---

## MQTT

**Broker:** `broker.hivemq.com`

**Base Topic:** `home/smarthabitat_shreya`

Control topics:

* `home/smarthabitat_shreya/control/light_1`
* `home/smarthabitat_shreya/control/fan_1`
* `home/smarthabitat_shreya/control/ac_unit`

---

## GPIO Mapping

| Device     | GPIO |
| ---------- | ---: |
| Light      |   12 |
| Fan        |   13 |
| AC         |   14 |
| Status LED |    2 |

---

## Technologies

* ESP32
* MQTT
* Wokwi
* PlatformIO
* React
* TypeScript
* Vite
* MQTT.js
* Python

---

## How to Run

### Frontend

`cd smart-habitat-ui`

`npm.cmd install`

`npm.cmd run dev`

Open:

`http://localhost:8080`

### ESP32

Build using:

**PlatformIO → Project Tasks → esp32dev → Build**

Then open `diagram.json` and start Wokwi.

---

## Demo

1. Start frontend and Wokwi.
2. Open Room 101.
3. Turn Fan, Light and AC ON/OFF.
4. Observe LEDs in Wokwi.
5. Use **Turn all appliances off**.
6. Stop Wokwi and show Room 101 becoming Offline.
7. Restart Wokwi and show it becoming Online again.

---

## Applications

* Smart homes
* Hostels
* Offices
* Classrooms
* Labs
* Building automation
* Energy monitoring

---

## Future Scope

* Real temperature and humidity sensors
* PIR occupancy sensors
* Energy meters
* Multiple live ESP32 rooms
* Cloud database
* Notifications
* Scheduling
* Real AI-based energy optimization

---

## Note

Room 101 uses live MQTT control. Temperature, humidity, occupancy, analytics, AI recommendations, and additional rooms currently use simulated data for demonstration.

---

## License and Attribution

This project adapts components from an existing MIT-licensed IoT home automation project and extends them with the SmartBuild Home frontend and MQTT-based room control.
