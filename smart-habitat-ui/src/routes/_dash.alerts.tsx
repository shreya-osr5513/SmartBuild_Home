import { Link, createFileRoute } from "@tanstack/react-router";
import { Bell, Thermometer, WifiOff, Wind, Zap } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, EmptyState, Segmented } from "@/components/ui-kit";
import { useBuilding } from "@/context/AppProvider";
import { timeAgo } from "@/lib/format";
import type { AlertStatus, AlertType } from "@/lib/types";

export const Route = createFileRoute("/_dash/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — SmartBuild OS Energy & Device Alerts" },
      {
        name: "description",
        content:
          "Track energy wastage, high temperature, offline device and environmental alerts with active, resolved and ignored states.",
      },
      { property: "og:title", content: "Alerts — SmartBuild OS" },
      {
        property: "og:description",
        content: "Energy wastage, temperature, offline and environment alerts in one feed.",
      },
    ],
  }),
  component: AlertsPage,
});

const ICONS: Record<AlertType, typeof Zap> = {
  energy: Zap,
  temperature: Thermometer,
  offline: WifiOff,
  environment: Wind,
};

const LABELS: Record<AlertType, string> = {
  energy: "Energy wastage",
  temperature: "High temperature",
  offline: "Device offline",
  environment: "Environmental",
};

export function AlertsPage() {
  const { alerts, loading, updateAlert } = useBuilding();
  const [filter, setFilter] = useState<AlertStatus | "all">("active");

  const visible = alerts.filter((a) => filter === "all" || a.status === filter);

  return (
    <div className="space-y-5">
      <Segmented
        size="sm"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "active", label: "Active" },
          { value: "resolved", label: "Resolved" },
          { value: "ignored", label: "Ignored" },
          { value: "all", label: "All" },
        ]}
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading alerts…</p>
      ) : visible.length === 0 ? (
        <EmptyState title="Nothing here" detail="No alerts with this status." />
      ) : (
        <div className="space-y-3">
          {visible.map((alert) => {
            const Icon = ICONS[alert.type];
            return (
              <Card key={alert.id} className="p-4 sm:p-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div className="flex min-w-0 gap-3">
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                        alert.severity === "high"
                          ? "bg-danger/15 text-danger"
                          : alert.severity === "medium"
                            ? "bg-warning/15 text-warning"
                            : "bg-teal/15 text-teal"
                      }`}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{LABELS[alert.type]}</p>
                        <Badge
                          tone={
                            alert.status === "active"
                              ? "danger"
                              : alert.status === "resolved"
                                ? "success"
                                : "muted"
                          }
                        >
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Room {alert.roomNumber} · {timeAgo(alert.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link to="/rooms/$roomId" params={{ roomId: alert.roomId }}>
                      <Button size="sm" variant="outline">
                        Open room
                      </Button>
                    </Link>
                    {alert.status === "active" ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => void updateAlert(alert.id, "resolved")}
                        >
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void updateAlert(alert.id, "ignored")}
                        >
                          Ignore
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Bell className="size-3.5" /> Alerts are generated from mock telemetry and will stream
        from the device backend later.
      </p>
    </div>
  );
}
