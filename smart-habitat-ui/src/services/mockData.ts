import type { ActivityEntry, Alert, Recommendation, Room } from "@/lib/types";

const now = Date.now();

const minutesAgo = (m: number) =>
  new Date(now - m * 60_000).toISOString();

export const mockRooms: Room[] = [
  {
    id: "r-101",
    number: "101",
    name: "Design Studio",
    floor: 1,
    occupied: true,
    emptyForMinutes: 0,
    temperature: 23.4,
    humidity: 48,
    fan: true,
    light: true,
    ac: false,
    online: true,
    mode: "automatic",
    emptyDelayMinutes: 10,
    lastUpdated: minutesAgo(1),
  },

  {
    id: "r-102",
    number: "102",
    name: "Seminar Hall",
    floor: 1,
    occupied: false,
    emptyForMinutes: 12,
    temperature: 26.8,
    humidity: 52,
    fan: true,
    light: true,
    ac: false,
    online: true,
    mode: "approval",
    emptyDelayMinutes: 10,
    lastUpdated: minutesAgo(2),
  },

  {
    id: "r-103",
    number: "103",
    name: "Server Room",
    floor: 1,
    occupied: false,
    emptyForMinutes: 240,
    temperature: 30.2,
    humidity: 38,
    fan: true,
    light: false,
    ac: false,
    online: true,
    mode: "manual",
    emptyDelayMinutes: 15,
    lastUpdated: minutesAgo(1),
  },

  {
    id: "r-201",
    number: "201",
    name: "Open Workspace",
    floor: 2,
    occupied: true,
    emptyForMinutes: 0,
    temperature: 24.1,
    humidity: 55,
    fan: true,
    light: true,
    ac: false,
    online: true,
    mode: "automatic",
    emptyDelayMinutes: 5,
    lastUpdated: minutesAgo(1),
  },

  {
    id: "r-202",
    number: "202",
    name: "Meeting Pod",
    floor: 2,
    occupied: false,
    emptyForMinutes: 35,
    temperature: 22.6,
    humidity: 46,
    fan: false,
    light: false,
    ac: false,
    online: true,
    mode: "automatic",
    emptyDelayMinutes: 10,
    lastUpdated: minutesAgo(3),
  },

  {
    id: "r-203",
    number: "203",
    name: "Lab Annexe",
    floor: 2,
    occupied: false,
    emptyForMinutes: 18,
    temperature: 25.0,
    humidity: 71,
    fan: true,
    light: false,
    ac: false,
    online: false,
    mode: "approval",
    emptyDelayMinutes: 15,
    lastUpdated: minutesAgo(26),
  },

  {
    id: "r-301",
    number: "301",
    name: "Executive Cabin",
    floor: 3,
    occupied: true,
    emptyForMinutes: 0,
    temperature: 21.2,
    humidity: 44,
    fan: false,
    light: true,
    ac: false,
    online: true,
    mode: "manual",
    emptyDelayMinutes: 5,
    lastUpdated: minutesAgo(1),
  },

  {
    id: "r-302",
    number: "302",
    name: "Training Room",
    floor: 3,
    occupied: false,
    emptyForMinutes: 8,
    temperature: 24.8,
    humidity: 50,
    fan: false,
    light: true,
    ac: false,
    online: true,
    mode: "approval",
    emptyDelayMinutes: 5,
    lastUpdated: minutesAgo(2),
  },
];

export const mockAlerts: Alert[] = [
  {
    id: "a-1",
    roomId: "r-102",
    roomNumber: "102",
    type: "energy",
    severity: "high",
    status: "active",
    message:
      "No occupancy detected in Room 102 for 10 minutes. Fan and Light are still ON.",
    createdAt: minutesAgo(4),
  },

  {
    id: "a-2",
    roomId: "r-103",
    roomNumber: "103",
    type: "temperature",
    severity: "high",
    status: "active",
    message:
      "Room 103 temperature at 30.2 °C — above the 29 °C threshold.",
    createdAt: minutesAgo(15),
  },

  {
    id: "a-3",
    roomId: "r-203",
    roomNumber: "203",
    type: "offline",
    severity: "medium",
    status: "active",
    message:
      "ESP32 node in Room 203 has not reported for 26 minutes.",
    createdAt: minutesAgo(26),
  },

  {
    id: "a-4",
    roomId: "r-203",
    roomNumber: "203",
    type: "environment",
    severity: "medium",
    status: "active",
    message:
      "Humidity in Room 203 at 71% — outside the comfort band.",
    createdAt: minutesAgo(40),
  },

  {
    id: "a-5",
    roomId: "r-302",
    roomNumber: "302",
    type: "energy",
    severity: "low",
    status: "ignored",
    message:
      "Light left ON in empty Room 302 for 8 minutes.",
    createdAt: minutesAgo(70),
  },

  {
    id: "a-6",
    roomId: "r-201",
    roomNumber: "201",
    type: "energy",
    severity: "medium",
    status: "resolved",
    message:
      "Fan switched OFF automatically in Room 201 after 12 empty minutes.",
    createdAt: minutesAgo(180),
  },
];

export const mockActivity: ActivityEntry[] = [
  {
    id: "l-1",
    roomId: "r-101",
    roomNumber: "101",
    type: "occupancy",
    message: "Occupancy detected in Room 101",
    createdAt: minutesAgo(1),
  },

  {
    id: "l-2",
    roomId: "r-202",
    roomNumber: "202",
    type: "appliance",
    message:
      "Fan turned OFF in Room 202 (automatic mode)",
    createdAt: minutesAgo(9),
  },

  {
    id: "l-3",
    roomId: "r-102",
    roomNumber: "102",
    type: "alert",
    message:
      "Energy wastage alert raised for Room 102",
    createdAt: minutesAgo(4),
  },

  {
    id: "l-4",
    roomId: "r-203",
    roomNumber: "203",
    type: "device",
    message:
      "Device in Room 203 went offline",
    createdAt: minutesAgo(26),
  },

  {
    id: "l-5",
    roomId: "r-301",
    roomNumber: "301",
    type: "appliance",
    message:
      "Light turned ON manually in Room 301",
    createdAt: minutesAgo(33),
  },

  {
    id: "l-6",
    roomId: "r-201",
    roomNumber: "201",
    type: "alert",
    message:
      "Alert approved — appliances switched OFF in Room 201",
    createdAt: minutesAgo(52),
  },

  {
    id: "l-7",
    roomId: "r-302",
    roomNumber: "302",
    type: "device",
    message:
      "Device reconnected in Room 302",
    createdAt: minutesAgo(95),
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    id: "rec-1",
    roomId: "r-102",
    roomNumber: "102",
    title:
      "Room 102 likely to remain empty",
    detail:
      "Historical pattern shows no bookings until 16:00 — recommend switching Fan and Light OFF.",
    confidence: 0.92,
  },

  {
    id: "rec-2",
    roomId: "r-103",
    roomNumber: "103",
    title:
      "Pre-cool Room 103",
    detail:
      "Temperature trending up 1.4 °C/hour. Recommend increasing ventilation before 14:30.",
    confidence: 0.78,
  },

  {
    id: "rec-3",
    roomId: "r-201",
    roomNumber: "201",
    title:
      "Shift Room 201 to Automatic",
    detail:
      "Occupancy is highly regular here; automation could save an estimated 4.2 kWh per week.",
    confidence: 0.69,
  },
];

export const mockWeekly = [
  { day: "Mon", kwh: 48, wastedKwh: 7 },
  { day: "Tue", kwh: 52, wastedKwh: 6 },
  { day: "Wed", kwh: 45, wastedKwh: 4 },
  { day: "Thu", kwh: 57, wastedKwh: 9 },
  { day: "Fri", kwh: 50, wastedKwh: 5 },
  { day: "Sat", kwh: 28, wastedKwh: 3 },
  { day: "Sun", kwh: 21, wastedKwh: 2 },
];