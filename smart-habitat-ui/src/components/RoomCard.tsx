import { Link } from "@tanstack/react-router";
import { Droplets, Fan, Lightbulb, Thermometer, Wifi, WifiOff } from "lucide-react";
import { Badge } from "./ui-kit";
import { comfortLabel, comfortStatus, isWasting, timeAgo } from "@/lib/format";
import type { Room } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RoomCard({ room }: { room: Room }) {
  const comfort = comfortStatus(room);
  const wasting = isWasting(room);

  return (
    <Link
      to="/rooms/$roomId"
      params={{ roomId: room.id }}
      className="card-surface block p-5 transition-all hover:-translate-y-0.5 hover:border-teal/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="font-display truncate text-lg font-semibold">
            Room {room.number}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {room.name} · Floor {room.floor}
          </p>
        </div>
        <Badge tone={room.occupied ? "success" : "muted"} dot>
          {room.occupied ? "Occupied" : "Empty"}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface-2 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Thermometer className="size-3.5 shrink-0" /> Temperature
          </div>
          <p className="mt-1 text-lg font-semibold">{room.temperature.toFixed(1)} °C</p>
        </div>
        <div className="rounded-xl bg-surface-2 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Droplets className="size-3.5 shrink-0" /> Humidity
          </div>
          <p className="mt-1 text-lg font-semibold">{room.humidity}%</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium",
            room.fan ? "bg-teal/15 text-teal" : "bg-muted text-muted-foreground",
          )}
        >
          <Fan className="size-3.5" /> Fan {room.fan ? "ON" : "OFF"}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium",
            room.light ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground",
          )}
        >
          <Lightbulb className="size-3.5" /> Light {room.light ? "ON" : "OFF"}
        </span>
        <Badge tone={comfort === "comfortable" ? "success" : "warning"}>
          {comfortLabel[comfort]}
        </Badge>
      </div>

      {wasting ? (
        <p className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          Energy wastage detected — empty for {room.emptyForMinutes} min with appliances ON.
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="truncate">Updated {timeAgo(room.lastUpdated)}</span>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 font-medium",
            room.number === "101"
              ? room.online
                ? "text-success"
                : "text-danger"
              : "text-muted-foreground",
          )}
        >
          {room.number === "101" ? (
            <>
              {room.online ? (
                <Wifi className="size-3.5" />
              ) : (
                <WifiOff className="size-3.5" />
              )}
              {room.online ? "Online" : "Offline"}
            </>
          ) : (
            <>Simulated</>
          )}
        </span>
      </div>
    </Link>
  );
}
