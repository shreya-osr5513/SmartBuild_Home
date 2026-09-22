export type RoomMode = "automatic" | "approval" | "manual";

export type ComfortStatus = "comfortable" | "warm" | "cold" | "humid";

export interface Room {
  id: string;
  number: string;
  name: string;
  floor: number;
  occupied: boolean;
  /** minutes the room has been empty (0 when occupied) */
  emptyForMinutes: number;
  temperature: number;
  humidity: number;
  fan: boolean;
  light: boolean;
  ac: boolean;
  online: boolean;
  mode: RoomMode;
  emptyDelayMinutes: 5 | 10 | 15;
  lastUpdated: string;
}

export type AlertType = "energy" | "temperature" | "offline" | "environment";
export type AlertStatus = "active" | "resolved" | "ignored";
export type AlertSeverity = "high" | "medium" | "low";

export interface Alert {
  id: string;
  roomId: string;
  roomNumber: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  createdAt: string;
}

export type ActivityType =
  | "occupancy"
  | "appliance"
  | "alert"
  | "device"
  | "system";

export interface ActivityEntry {
  id: string;
  roomId?: string;
  roomNumber?: string;
  type: ActivityType;
  message: string;
  createdAt: string;
}

export interface EnergyStats {
  estimatedSavedKwh: number;
  estimatedSavedCost: number;
  wastageEvents: number;
  wastageMinutes: number;
  applianceRuntime: { room: string; fanHours: number; lightHours: number }[];
  weekly: { day: string; kwh: number; wastedKwh: number }[];
}

export interface Recommendation {
  id: string;
  roomId?: string;
  roomNumber?: string;
  title: string;
  detail: string;
  confidence: number;
}

export interface OverviewStats {
  totalRooms: number;
  occupiedRooms: number;
  emptyRooms: number;
  energyAlerts: number;
  averageTemperature: number;
  devicesOnline: number;
  devicesOffline: number;
  buildingStatus: "optimal" | "attention" | "critical";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Facility Manager";
}
