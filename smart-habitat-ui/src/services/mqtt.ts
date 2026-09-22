import mqtt from "mqtt";

const BROKER_URL = "wss://broker.hivemq.com:8884/mqtt";
const BASE_TOPIC = "home/smarthabitat_shreya";

const client = mqtt.connect(BROKER_URL, {
  clientId: `smart_habitat_web_${Math.random().toString(16).slice(2, 10)}`,
  keepalive: 60,
  reconnectPeriod: 4000,
  connectTimeout: 5000,
});

let deviceOnline = false;

const relayStates: Record<string, boolean> = {
  light_1: false,
  fan_1: false,
  ac_unit: false,
  status_led: false,
};

type RelayListener = (relayId: string, state: boolean) => void;
type DeviceListener = (online: boolean) => void;

const relayListeners: RelayListener[] = [];
const deviceListeners: DeviceListener[] = [];

client.on("connect", () => {
  console.log("Smart Habitat MQTT connected");

  client.subscribe(`${BASE_TOPIC}/status`);
  client.subscribe(`${BASE_TOPIC}/status/+/state`);
});

client.on("message", (topic, buffer) => {
  const payload = buffer.toString();

  if (topic === `${BASE_TOPIC}/status`) {
    deviceOnline = payload === "online";

    deviceListeners.forEach((listener) => {
      listener(deviceOnline);
    });

    return;
  }

  const prefix = `${BASE_TOPIC}/status/`;

  if (topic.startsWith(prefix) && topic.endsWith("/state")) {
    const relayId = topic
      .replace(prefix, "")
      .replace("/state", "");

    const state = payload === "ON";

    relayStates[relayId] = state;

    relayListeners.forEach((listener) => {
      listener(relayId, state);
    });
  }
});

client.on("error", (error) => {
  console.error("MQTT error:", error);
});

export function setRelay(relayId: string, state: boolean) {
  client.publish(
    `${BASE_TOPIC}/control/${relayId}`,
    state ? "ON" : "OFF",
    {
      qos: 1,
    },
  );
}

export function getRelayState(relayId: string) {
  return relayStates[relayId] ?? false;
}

export function getDeviceOnline() {
  return deviceOnline;
}

export function onRelayStateChange(listener: RelayListener) {
  relayListeners.push(listener);

  return () => {
    const index = relayListeners.indexOf(listener);

    if (index >= 0) {
      relayListeners.splice(index, 1);
    }
  };
}

export function onDeviceStatusChange(listener: DeviceListener) {
  deviceListeners.push(listener);

  return () => {
    const index = deviceListeners.indexOf(listener);

    if (index >= 0) {
      deviceListeners.splice(index, 1);
    }
  };
}