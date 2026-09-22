# SmartBuild Home

SmartBuild Home is an IoT-based smart room monitoring and appliance control system built using ESP32, MQTT, Wokwi simulation, and a responsive React dashboard.

The project demonstrates real-time control of room appliances such as a fan, light, and AC through MQTT, along with live device online/offline status, activity logging, and a building monitoring interface.

---

## Project Overview

SmartBuild Home combines:

- ESP32-based IoT appliance control
- MQTT communication using HiveMQ
- Wokwi-based ESP32 and relay simulation
- React + TypeScript dashboard
- Real-time device status updates
- Room-wise monitoring interface
- Activity logs
- Simulated environmental and analytics data

The current implementation uses **Room 101 as the live MQTT-connected IoT room**, while the remaining rooms are provided as simulated monitoring rooms for demonstrating the larger smart-building interface.

---

## System Architecture

```text
SmartBuild Home Dashboard
        |
        | MQTT over WebSockets
        v
HiveMQ Public MQTT Broker
        |
        | MQTT
        v
ESP32 (Wokwi Simulation)
        |
        v
Relay Modules
   |      |      |
 Light   Fan     AC
