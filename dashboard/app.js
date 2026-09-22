// --- Configuration Defaults ---
const DEFAULT_CONFIG = {
  host: 'wss://broker.hivemq.com:8884/mqtt',
  username: '',
  password: '',
  topic: 'home/smarthabitat_shreya'
};

// --- DOM Elements ---
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const settingsForm = document.getElementById('settingsForm');
const resetDefaults = document.getElementById('resetDefaults');

const mqttHostInput = document.getElementById('mqttHost');
const mqttUserInput = document.getElementById('mqttUser');
const mqttPassInput = document.getElementById('mqttPass');
const mqttTopicInput = document.getElementById('mqttTopic');

const brokerStatus = document.getElementById('brokerStatus');
const deviceStatus = document.getElementById('deviceStatus');
const controlsGrid = document.getElementById('controlsGrid');
const loadingState = document.getElementById('loadingState');
const logConsole = document.getElementById('logConsole');
const clearLogsBtn = document.getElementById('clearLogs');

// --- Global Variables ---
let client = null;
let currentConfig = null;
let activeRelays = []; // Cache of relay objects currently rendered

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  loadConfig();
  setupEventListeners();
  connectMQTT();
});

// --- Config Management ---
function loadConfig() {
  const saved = localStorage.getItem('aerosmart_mqtt_config');
  if (saved) {
    try {
      currentConfig = JSON.parse(saved);
    } catch (e) {
      currentConfig = { ...DEFAULT_CONFIG };
    }
  } else {
    currentConfig = { ...DEFAULT_CONFIG };
  }
  
  // Fill inputs
  mqttHostInput.value = currentConfig.host;
  mqttUserInput.value = currentConfig.username;
  mqttPassInput.value = currentConfig.password;
  mqttTopicInput.value = currentConfig.topic;
}

function saveConfig(config) {
  currentConfig = config;
  localStorage.setItem('aerosmart_mqtt_config', JSON.stringify(config));
}

// --- Event Listeners ---
function setupEventListeners() {
  settingsBtn.addEventListener('click', () => settingsModal.classList.add('open'));
  closeSettings.addEventListener('click', () => settingsModal.classList.remove('open'));
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove('open');
    }
  });

  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newConfig = {
      host: mqttHostInput.value.trim(),
      username: mqttUserInput.value.trim(),
      password: mqttPassInput.value.trim(),
      topic: mqttTopicInput.value.trim()
    };
    saveConfig(newConfig);
    settingsModal.classList.remove('open');
    addLog('Configuration saved. Reconnecting...', 'info');
    connectMQTT();
  });

  resetDefaults.addEventListener('click', () => {
    mqttHostInput.value = DEFAULT_CONFIG.host;
    mqttUserInput.value = DEFAULT_CONFIG.username;
    mqttPassInput.value = DEFAULT_CONFIG.password;
    mqttTopicInput.value = DEFAULT_CONFIG.topic;
  });

  clearLogsBtn.addEventListener('click', () => {
    logConsole.innerHTML = '<div class="log-entry system">Logs cleared.</div>';
  });
}

// --- Console Logger ---
function addLog(message, type = 'system') {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.innerText = `[${timeStr}] ${message}`;
  logConsole.appendChild(entry);
  logConsole.scrollTop = logConsole.scrollHeight;
}

// --- MQTT Connection Management ---
function connectMQTT() {
  if (client) {
    client.end();
  }

  updateBrokerBadge('connecting');
  updateDeviceBadge('offline');
  
  addLog(`Connecting to broker: ${currentConfig.host}...`, 'info');

  const options = {
    keepalive: 60,
    clientId: 'aerosmart_web_' + Math.random().toString(16).substr(2, 8),
    connectTimeout: 5000,
    clean: true,
    reconnectPeriod: 4000
  };

  if (currentConfig.username) {
    options.username = currentConfig.username;
  }
  if (currentConfig.password) {
    options.password = currentConfig.password;
  }

  try {
    client = mqtt.connect(currentConfig.host, options);

    client.on('connect', () => {
      updateBrokerBadge('online');
      addLog('Connected to MQTT Broker.', 'success');
      
      // Subscribe to topics
      const baseTopic = currentConfig.topic;
      client.subscribe(`${baseTopic}/config`, { qos: 1 });
      client.subscribe(`${baseTopic}/status`, { qos: 1 });
      client.subscribe(`${baseTopic}/status/+/state`, { qos: 1 });
      addLog(`Subscribed to topic: ${baseTopic}/#`, 'system');
    });

    client.on('message', (topic, payload) => {
      handleIncomingMessage(topic, payload.toString());
    });

    client.on('error', (err) => {
      updateBrokerBadge('offline');
      addLog(`MQTT Error: ${err.message}`, 'warning');
    });

    client.on('close', () => {
      updateBrokerBadge('offline');
      updateDeviceBadge('offline');
      addLog('MQTT connection closed.', 'warning');
      disableSwitches();
    });

  } catch (err) {
    updateBrokerBadge('offline');
    addLog(`MQTT Init Error: ${err.message}`, 'warning');
  }
}

// --- Status Badge Toggles ---
function updateBrokerBadge(state) {
  const dot = brokerStatus.querySelector('.status-dot');
  const label = brokerStatus.querySelector('.status-label');
  
  dot.className = 'status-dot';
  if (state === 'online') {
    dot.classList.add('online');
    label.innerText = 'Broker: Connected';
  } else if (state === 'connecting') {
    dot.classList.add('connecting');
    label.innerText = 'Broker: Connecting';
  } else {
    dot.classList.add('offline');
    label.innerText = 'Broker: Disconnected';
  }
}

function updateDeviceBadge(state) {
  const dot = deviceStatus.querySelector('.status-dot');
  const label = deviceStatus.querySelector('.status-label');
  
  dot.className = 'status-dot';
  if (state === 'online') {
    dot.classList.add('online');
    label.innerText = 'Device: Online';
    enableSwitches();
  } else {
    dot.classList.add('offline');
    label.innerText = 'Device: Offline';
    disableSwitches();
  }
}

// --- Message Handler ---
function handleIncomingMessage(topic, message) {
  const baseTopic = currentConfig.topic;

  // LWT status topic
  if (topic === `${baseTopic}/status`) {
    if (message === 'online') {
      updateDeviceBadge('online');
      addLog('ESP32 Device is ONLINE.', 'success');
    } else {
      updateDeviceBadge('offline');
      addLog('ESP32 Device went OFFLINE (LWT).', 'warning');
    }
  } 
  // Config Topic
  else if (topic === `${baseTopic}/config`) {
    try {
      const configObj = JSON.parse(message);
      if (Array.isArray(configObj.relays)) {
        addLog('Device config received. Dynamically building controls...', 'info');
        buildRelayControls(configObj.relays);
        updateDeviceBadge('online'); // Receiving config implicitly means device is online
      }
    } catch (e) {
      addLog('Failed to parse device configuration JSON.', 'warning');
    }
  } 
  // Relay state topics: home/esp32/status/relay_id/state
  else {
    const regex = new RegExp(`^${baseTopic}/status/([^/]+)/state$`);
    const match = topic.match(regex);
    if (match) {
      const relayId = match[1];
      const state = message === 'ON';
      addLog(`Relay updated: ${relayId} -> ${message}`, 'system');
      updateRelayUI(relayId, state);
    }
  }
}

// --- Dynamic UI builder ---
function buildRelayControls(relays) {
  activeRelays = relays;
  
  // Clear grid
  controlsGrid.innerHTML = '';
  
  if (relays.length === 0) {
    controlsGrid.innerHTML = `
      <div class="loading-state">
        <p>No relays configured on the ESP32.</p>
      </div>
    `;
    return;
  }

  relays.forEach(relay => {
    const card = document.createElement('div');
    card.className = `appliance-card ${relay.state ? 'active' : ''}`;
    card.id = `card_${relay.id}`;
    
    // Choose icon based on name
    const iconClass = getIconForAppliance(relay.name);

    card.innerHTML = `
      <div class="card-info">
        <div class="appliance-icon">
          <i class="${iconClass}"></i>
        </div>
        <div class="appliance-meta">
          <h3>${relay.name}</h3>
          <span>GPIO ${relay.pin}</span>
        </div>
      </div>
      <label class="toggle-switch">
        <input type="checkbox" id="switch_${relay.id}" ${relay.state ? 'checked' : ''} onchange="toggleRelay('${relay.id}', this.checked)">
        <span class="slider"></span>
      </label>
    `;
    
    controlsGrid.appendChild(card);
  });
}

// Helper to auto-pick descriptive icons
function getIconForAppliance(name) {
  const lower = name.toLowerCase();
  if (lower.includes('light') || lower.includes('bulb') || lower.includes('lamp')) return 'fa-solid fa-lightbulb';
  if (lower.includes('fan') || lower.includes('cooler') || lower.includes('vent')) return 'fa-solid fa-fan';
  if (lower.includes('ac') || lower.includes('air conditioner') || lower.includes('hvac')) return 'fa-solid fa-snowflake';
  if (lower.includes('geyser') || lower.includes('water heater') || lower.includes('heater')) return 'fa-solid fa-temperature-high';
  if (lower.includes('tv') || lower.includes('television') || lower.includes('screen')) return 'fa-solid fa-tv';
  if (lower.includes('plug') || lower.includes('socket') || lower.includes('charger')) return 'fa-solid fa-plug';
  if (lower.includes('door') || lower.includes('lock')) return 'fa-solid fa-door-closed';
  if (lower.includes('pump') || lower.includes('motor')) return 'fa-solid fa-water';
  return 'fa-solid fa-power-off'; // Default power icon
}

// --- Toggle Control ---
window.toggleRelay = function(relayId, isChecked) {
  if (!client || !client.connected) {
    addLog('Cannot send command. MQTT broker is disconnected.', 'warning');
    // Revert UI check
    const checkbox = document.getElementById(`switch_${relayId}`);
    if (checkbox) checkbox.checked = !isChecked;
    return;
  }

  const baseTopic = currentConfig.topic;
  const controlTopic = `${baseTopic}/control/${relayId}`;
  const payload = isChecked ? 'ON' : 'OFF';

  client.publish(controlTopic, payload, { qos: 1, retain: false });
  addLog(`Published command: ${relayId} -> ${payload}`, 'info');
  
  // Optimistically toggle active class (will be locked down/corrected on state feedback loop)
  const card = document.getElementById(`card_${relayId}`);
  if (card) {
    if (isChecked) card.classList.add('active');
    else card.classList.remove('active');
  }
};

// --- Update UI State ---
function updateRelayUI(relayId, state) {
  const checkbox = document.getElementById(`switch_${relayId}`);
  const card = document.getElementById(`card_${relayId}`);
  
  if (checkbox) {
    checkbox.checked = state;
  }
  if (card) {
    if (state) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  }
}

// --- Enable/Disable switches based on device online status ---
function disableSwitches() {
  const switches = document.querySelectorAll('.toggle-switch input');
  switches.forEach(sw => {
    sw.disabled = true;
  });
  const cards = document.querySelectorAll('.appliance-card');
  cards.forEach(card => {
    card.classList.add('offline');
  });
}

function enableSwitches() {
  const switches = document.querySelectorAll('.toggle-switch input');
  switches.forEach(sw => {
    sw.disabled = false;
  });
  const cards = document.querySelectorAll('.appliance-card');
  cards.forEach(card => {
    card.classList.remove('offline');
  });
}
