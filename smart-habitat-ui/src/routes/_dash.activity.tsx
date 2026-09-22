import { createFileRoute } from "@tanstack/react-router";
import { Activity, Bell, Cpu, Power, UserCheck } from "lucide-react";
import { useState } from "react";
import { Card, EmptyState, Segmented } from "@/components/ui-kit";
import { useBuilding } from "@/context/AppProvider";
import { clockTime, timeAgo } from "@/lib/format";
import type { ActivityType } from "@/lib/types";

export const Route = createFileRoute("/_dash/activity")({
  head: () => ({
    meta: [
      { title: "Activity Log — SmartBuild OS" },
      {
        name: "description",
        content:
          "Chronological log of occupancy events, appliance switching, alert decisions and device connectivity changes.",
      },
      { property: "og:title", content: "Activity Log — SmartBuild OS" },
      {
        property: "og:description",
        content: "Every occupancy, appliance, alert and device event in one timeline.",
      },
    ],
  }),
  component: ActivityPage,
});

const ICONS: Record<ActivityType, typeof Activity> = {
  occupancy: UserCheck,
  appliance: Power,
  alert: Bell,
  device: Cpu,
  system: Activity,
};

function ActivityPage() {
  const { activity, loading } = useBuilding();
  const [filter, setFilter] = useState<ActivityType | "all">("all");

  const visible = activity.filter((a) => filter === "all" || a.type === filter);

  return (
    <div className="space-y-5">
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <Segmented
          size="sm"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "occupancy", label: "Occupancy" },
            { value: "appliance", label: "Appliances" },
            { value: "alert", label: "Alerts" },
            { value: "device", label: "Devices" },
          ]}
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading activity…</p>
      ) : visible.length === 0 ? (
        <EmptyState title="No events" detail="Nothing logged for this category yet." />
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-border">
            {visible.map((entry) => {
              const Icon = ICONS[entry.type];
              return (
                <li key={entry.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-teal">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm">{entry.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(entry.createdAt)}
                      {entry.roomNumber ? ` · Room ${entry.roomNumber}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {clockTime(entry.createdAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
