import { createFileRoute } from "@tanstack/react-router";
import { Card, SectionTitle, Segmented } from "@/components/ui-kit";
import { useAuth, useBuilding } from "@/context/AppProvider";

export const Route = createFileRoute("/_dash/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SmartBuild OS Room Automation" },
      {
        name: "description",
        content:
          "Configure automation mode and empty-room delay for every monitored room, and review the connected account.",
      },
      { property: "og:title", content: "Settings — SmartBuild OS" },
      {
        property: "og:description",
        content: "Per-room automation mode and empty-room delay configuration.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { rooms, loading, changeMode, changeDelay } = useBuilding();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle title="Account" subtitle="Mock session — ready for real authentication" />
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p className="truncate capitalize">
            <span className="text-muted-foreground">Name: </span>
            {user?.name}
          </p>
          <p className="truncate">
            <span className="text-muted-foreground">Role: </span>
            {user?.role}
          </p>
          <p className="truncate sm:col-span-2">
            <span className="text-muted-foreground">Email: </span>
            {user?.email}
          </p>
        </div>
      </Card>

      <div>
        <SectionTitle
          title="Room automation"
          subtitle="Choose how each room reacts when it becomes empty"
        />
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading rooms…</p>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <Card key={room.id} className="space-y-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    Room {room.number} · {room.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Floor {room.floor}</p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
                      Operating mode
                    </p>
                    <Segmented
                      size="sm"
                      value={room.mode}
                      onChange={(mode) => void changeMode(room.id, mode)}
                      options={[
                        { value: "automatic", label: "Automatic" },
                        { value: "approval", label: "Approval" },
                        { value: "manual", label: "Manual" },
                      ]}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
                      Empty-room delay
                    </p>
                    <Segmented
                      size="sm"
                      value={String(room.emptyDelayMinutes) as "5" | "10" | "15"}
                      onChange={(v) => void changeDelay(room.id, Number(v) as 5 | 10 | 15)}
                      options={[
                        { value: "5", label: "5 min" },
                        { value: "10", label: "10 min" },
                        { value: "15", label: "15 min" },
                      ]}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
