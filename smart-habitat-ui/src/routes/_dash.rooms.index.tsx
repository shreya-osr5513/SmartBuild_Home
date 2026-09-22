import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { RoomCard } from "@/components/RoomCard";
import { EmptyState, Segmented } from "@/components/ui-kit";
import { useBuilding } from "@/context/AppProvider";
import { isWasting } from "@/lib/format";

type Filter = "all" | "occupied" | "empty" | "alerts" | "offline";

export const Route = createFileRoute("/_dash/rooms/")({
  head: () => ({
    meta: [
      { title: "Rooms — SmartBuild OS Room Monitoring" },
      {
        name: "description",
        content:
          "Search and filter every monitored room by occupancy, alerts and device status with live temperature, humidity and appliance state.",
      },
      { property: "og:title", content: "Rooms — SmartBuild OS" },
      {
        property: "og:description",
        content: "Live room-by-room occupancy, comfort and appliance monitoring.",
      },
    ],
  }),
  component: RoomsPage,
});

function RoomsPage() {
  const { rooms, loading } = useBuilding();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rooms.filter((room) => {
      const matchesQuery =
        !q ||
        room.number.toLowerCase().includes(q) ||
        room.name.toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" ||
        (filter === "occupied" && room.occupied) ||
        (filter === "empty" && !room.occupied) ||
        (filter === "alerts" && isWasting(room)) ||
        (filter === "offline" && !room.online);
      return matchesQuery && matchesFilter;
    });
  }, [rooms, query, filter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search room number or name"
            aria-label="Search rooms"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <Segmented
            size="sm"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All" },
              { value: "occupied", label: "Occupied" },
              { value: "empty", label: "Empty" },
              { value: "alerts", label: "Alerts" },
              { value: "offline", label: "Offline" },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading rooms…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No rooms match" detail="Try a different search or filter." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
