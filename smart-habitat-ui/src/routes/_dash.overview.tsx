import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  DoorOpen,
  Gauge,
  Sparkles,
  Thermometer,
  TriangleAlert,
  UsersRound,
  Wifi,
} from "lucide-react";

import { RoomCard } from "@/components/RoomCard";
import { StatCard } from "@/components/StatCard";
import {
  Badge,
  Button,
  Card,
  SectionTitle,
} from "@/components/ui-kit";

import { useBuilding } from "@/context/AppProvider";
import {
  isWasting,
  timeAgo,
  wastageMessage,
} from "@/lib/format";
import { computeOverview } from "@/services/api";

export const Route = createFileRoute("/_dash/overview")({
  head: () => ({
    meta: [
      {
        title: "Overview — SmartBuild OS Building Monitoring",
      },
      {
        name: "description",
        content:
          "Smart building overview with one live MQTT-connected IoT room and additional simulated monitoring rooms.",
      },
      {
        property: "og:title",
        content: "Overview — SmartBuild OS",
      },
      {
        property: "og:description",
        content:
          "Live IoT control with simulated building monitoring and analytics.",
      },
    ],
  }),

  component: OverviewPage,
});

function OverviewPage() {
  const {
    rooms,
    alerts,
    activity,
    recommendations,
    loading,
    turnAllOff,
  } = useBuilding();

  const stats = computeOverview(
    rooms,
    alerts,
  );

  const realRoom = rooms.find(
    (room) => room.number === "101",
  );

  const realNodeOnline =
    realRoom?.online ?? false;

  const simulatedRooms =
    rooms.filter(
      (room) =>
        room.number !== "101",
    ).length;

  const wasting =
    rooms.filter(isWasting);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading building data…
      </p>
    );
  }

  const statusTone =
    realNodeOnline
      ? "success"
      : "danger";

  return (
    <div className="space-y-6">
      {/* MAIN STATUS */}

      <Card className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            IoT system status
          </p>

          <p className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            {realNodeOnline
              ? "Live IoT node connected"
              : "IoT node offline"}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Room 101 is the live MQTT-connected room ·{" "}
            {simulatedRooms} simulated rooms
          </p>
        </div>

        <Badge
          tone={statusTone}
          dot
          className="shrink-0"
        >
          {realNodeOnline
            ? "LIVE"
            : "OFFLINE"}
        </Badge>
      </Card>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          icon={Building2}
          label="Total rooms"
          value={stats.totalRooms}
          hint={`1 live · ${simulatedRooms} simulated`}
        />

        <StatCard
          icon={UsersRound}
          label="Occupied"
          value={stats.occupiedRooms}
          tone="success"
          hint="includes simulated rooms"
        />

        <StatCard
          icon={DoorOpen}
          label="Empty"
          value={stats.emptyRooms}
          tone="warning"
          hint="includes simulated rooms"
        />

        <StatCard
          icon={TriangleAlert}
          label="Energy alerts"
          value={stats.energyAlerts}
          tone="danger"
          hint="demo analytics"
        />

        <StatCard
          icon={Thermometer}
          label="Avg temperature"
          value={`${stats.averageTemperature} °C`}
          hint="simulated sensor data"
        />

        <StatCard
          icon={Wifi}
          label="Live IoT node"
          value={
            realNodeOnline
              ? "Online"
              : "Offline"
          }
          hint="Room 101 · MQTT"
          tone={
            realNodeOnline
              ? "success"
              : "danger"
          }
        />

        <StatCard
          icon={Gauge}
          label="Automation"
          value={
            rooms.filter(
              (r) =>
                r.mode ===
                "automatic",
            ).length
          }
          hint="demo room modes"
        />

        <StatCard
          icon={Sparkles}
          label="AI insights"
          value={
            recommendations.length
          }
          hint="simulated recommendations"
        />
      </div>

      {/* ENERGY WASTAGE */}

      {wasting.length > 0 ? (
        <div>
          <SectionTitle
            title="Energy wastage detected"
            subtitle="Analytics generated from live and simulated room data"
          />

          <div className="space-y-3">
            {wasting.map(
              (room) => {
                const isRealRoom =
                  room.number ===
                  "101";

                return (
                  <Card
                    key={room.id}
                    className="grid gap-3 border-danger/30 bg-danger/5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-sm">
                        {wastageMessage(
                          room,
                        )}
                      </p>

                      {!isRealRoom ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Simulated room
                          alert
                        </p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {isRealRoom ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            void turnAllOff(
                              room.id,
                            )
                          }
                        >
                          Turn all off
                        </Button>
                      ) : null}

                      <Link
                        to="/rooms/$roomId"
                        params={{
                          roomId:
                            room.id,
                        }}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          View room
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              },
            )}
          </div>
        </div>
      ) : null}

      {/* ROOMS + SIDE CONTENT */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <SectionTitle
            title="Rooms"
            subtitle="Room 101 is live; remaining rooms use simulated monitoring data"
            action={
              <Link to="/rooms">
                <Button
                  size="sm"
                  variant="outline"
                >
                  View all
                </Button>
              </Link>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {rooms
              .slice(0, 4)
              .map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                />
              ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* AI RECOMMENDATIONS */}

          <div>
            <SectionTitle
              title="AI recommendations"
              subtitle="Simulated ML predictions"
            />

            <div className="space-y-3">
              {recommendations.map(
                (rec) => (
                  <Card
                    key={rec.id}
                    className="p-4"
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <p className="min-w-0 text-sm font-medium">
                        {rec.title}
                      </p>

                      <Badge tone="teal">
                        {Math.round(
                          rec.confidence *
                            100,
                        )}
                        %
                      </Badge>
                    </div>

                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {rec.detail}
                    </p>
                  </Card>
                ),
              )}
            </div>
          </div>

          {/* RECENT ACTIVITY */}

          <div>
            <SectionTitle
              title="Recent activity"
            />

            <Card className="space-y-3 p-4">
              {activity
                .slice(0, 6)
                .map(
                  (entry) => (
                    <div
                      key={
                        entry.id
                      }
                      className="flex gap-3"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-teal" />

                      <div className="min-w-0">
                        <p className="text-sm">
                          {
                            entry.message
                          }
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {timeAgo(
                            entry.createdAt,
                          )}
                        </p>
                      </div>
                    </div>
                  ),
                )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}