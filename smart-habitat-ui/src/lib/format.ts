import type { ComfortStatus, Room } from "./types";

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diff / 60_000));
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.round(mins / 60);
  if (hrs === 1) return "1 hour ago";
  if (hrs < 24) return `${hrs} hours ago`;
  return `${Math.round(hrs / 24)} days ago`;
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function comfortStatus(room: Room): ComfortStatus {
  if (room.humidity > 65) return "humid";
  if (room.temperature >= 28) return "warm";
  if (room.temperature <= 19) return "cold";
  return "comfortable";
}

export const comfortLabel: Record<ComfortStatus, string> = {
  comfortable: "Comfortable",
  warm: "Too warm",
  cold: "Too cold",
  humid: "Humid",
};

/** A room is wasting energy when it is empty past its delay with appliances ON. */
export function isWasting(room: Room): boolean {
  return (
    !room.occupied &&
    room.emptyForMinutes >= room.emptyDelayMinutes &&
    (room.fan || room.light)
  );
}

export function wastageMessage(room: Room): string {
  const on = [room.fan && "Fan", room.light && "Light"].filter(Boolean).join(" and ");
  return `No occupancy detected in Room ${room.number} for ${room.emptyForMinutes} minutes. ${on} ${on.includes("and") ? "are" : "is"} still ON.`;
}
