import { createFileRoute } from "@tanstack/react-router";
import { Leaf, Timer, TriangleAlert, Wallet } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, SectionTitle } from "@/components/ui-kit";
import { useBuilding } from "@/context/AppProvider";

export const Route = createFileRoute("/_dash/energy")({
  head: () => ({
    meta: [
      { title: "Energy — SmartBuild OS Consumption Analytics" },
      {
        name: "description",
        content:
          "Appliance runtime, energy wastage events and estimated savings across the building, visualised in a clean weekly breakdown.",
      },
      { property: "og:title", content: "Energy — SmartBuild OS" },
      {
        property: "og:description",
        content: "Weekly consumption, wastage events and estimated energy saved.",
      },
    ],
  }),
  component: EnergyPage,
});

function EnergyPage() {
  const { energy, loading } = useBuilding();

  if (loading || !energy)
    return <p className="text-sm text-muted-foreground">Loading analytics…</p>;

  const maxKwh = Math.max(...energy.weekly.map((d) => d.kwh));
  const maxRuntime = Math.max(
    ...energy.applianceRuntime.map((r) => r.fanHours + r.lightHours),
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          icon={Leaf}
          label="Energy saved"
          value={`${energy.estimatedSavedKwh} kWh`}
          hint="last 30 days"
          tone="success"
        />
        <StatCard
          icon={Wallet}
          label="Cost avoided"
          value={`₹${energy.estimatedSavedCost}`}
          hint="estimated"
        />
        <StatCard
          icon={TriangleAlert}
          label="Wastage events"
          value={energy.wastageEvents}
          tone="danger"
        />
        <StatCard
          icon={Timer}
          label="Wasted runtime"
          value={`${energy.wastageMinutes} min`}
          tone="warning"
        />
      </div>

      <Card>
        <SectionTitle title="Weekly consumption" subtitle="Total vs wasted energy (kWh)" />
        <div className="flex h-56 items-end gap-3 sm:gap-5">
          {energy.weekly.map((day) => (
            <div key={day.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-44 w-full items-end justify-center gap-1">
                <div
                  className="w-1/2 rounded-t-lg bg-teal/80"
                  style={{ height: `${(day.kwh / maxKwh) * 100}%` }}
                  title={`${day.kwh} kWh used`}
                />
                <div
                  className="w-1/3 rounded-t-lg bg-danger/70"
                  style={{ height: `${(day.wastedKwh / maxKwh) * 100}%` }}
                  title={`${day.wastedKwh} kWh wasted`}
                />
              </div>
              <span className="text-xs text-muted-foreground">{day.day}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded bg-teal/80" /> Consumed
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded bg-danger/70" /> Wasted
          </span>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Appliance runtime" subtitle="Hours per room, this week" />
        <div className="space-y-4">
          {energy.applianceRuntime.map((row) => {
            const total = row.fanHours + row.lightHours;
            return (
              <div key={row.room}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm">
                  <span className="truncate">{row.room}</span>
                  <span className="shrink-0 text-muted-foreground">{total.toFixed(1)} h</span>
                </div>
                <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="bg-teal"
                    style={{ width: `${(row.fanHours / maxRuntime) * 100}%` }}
                  />
                  <div
                    className="bg-warning"
                    style={{ width: `${(row.lightHours / maxRuntime) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded bg-teal" /> Fan
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded bg-warning" /> Light
          </span>
        </div>
      </Card>
    </div>
  );
}
