import { Link, createFileRoute, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Droplets,
  Fan,
  Lightbulb,
  Snowflake,
  Sparkles,
  Thermometer,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  SectionTitle,
  Segmented,
  Toggle,
} from "@/components/ui-kit";

import { useBuilding } from "@/context/AppProvider";

import {
  comfortLabel,
  comfortStatus,
  isWasting,
  timeAgo,
  wastageMessage,
} from "@/lib/format";

import type { RoomMode } from "@/lib/types";

export const Route = createFileRoute("/_dash/rooms/$roomId")({
  head: () => ({
    meta: [
      {
        title: "Room detail — SmartBuild OS",
      },
      {
        name: "description",
        content:
          "Room conditions, occupancy, appliance controls, automation mode and recent activity for a single monitored room.",
      },
      {
        property: "og:title",
        content: "Room detail — SmartBuild OS",
      },
      {
        property: "og:description",
        content:
          "Control fan, light, AC and automation mode for a monitored room.",
      },
    ],
  }),

  component: RoomDetailPage,
});

const MODE_HELP: Record<RoomMode, string> = {
  automatic:
    "The system switches appliances OFF on its own once the empty-room delay passes.",

  approval:
    "You are asked to confirm before the system switches appliances OFF.",

  manual:
    "Appliances only change when you control them directly.",
};

function RoomDetailPage() {
  const { roomId } = useParams({
    from: "/_dash/rooms/$roomId",
  });

  const {
    rooms,
    activity,
    loading,
    toggleAppliance,
    turnAllOff,
    changeMode,
    changeDelay,
  } = useBuilding();

  const [pendingApproval, setPendingApproval] =
    useState(false);

  const [ignored, setIgnored] =
    useState(false);

  const room = rooms.find(
    (r) => r.id === roomId,
  );

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading room…
      </p>
    );
  }

  if (!room) {
    return (
      <EmptyState
        title="Room not found"
        detail="This room is no longer available."
      />
    );
  }

  const isRealRoom =
    room.number === "101";

  const comfort =
    comfortStatus(room);

  const wasting =
    isWasting(room) && !ignored;

  const roomActivity =
    activity.filter(
      (a) => a.roomId === room.id,
    );

  const requestOff = () => {
    if (!isRealRoom) {
      return;
    }

    if (room.mode === "approval") {
      setPendingApproval(true);
    } else {
      void turnAllOff(room.id);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/rooms"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />

        Back to rooms
      </Link>

      {/* ROOM HEADER */}

      <Card className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <h2 className="font-display truncate text-2xl font-semibold">
            Room {room.number}
          </h2>

          <p className="truncate text-sm text-muted-foreground">
            {room.name} · Floor {room.floor} · Updated{" "}
            {timeAgo(room.lastUpdated)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            tone={
              room.occupied
                ? "success"
                : "muted"
            }
            dot
          >
            {room.occupied
              ? "Occupied"
              : `Empty ${room.emptyForMinutes} min`}
          </Badge>

          {/* REAL VS SIMULATED STATUS */}

          {isRealRoom ? (
            <Badge
              tone={
                room.online
                  ? "success"
                  : "danger"
              }
            >
              {room.online ? (
                <>
                  <Wifi className="size-3.5" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="size-3.5" />
                  Offline
                </>
              )}
            </Badge>
          ) : (
            <Badge tone="muted">
              Simulated
            </Badge>
          )}
        </div>
      </Card>

      {/* ENERGY ALERT */}

      {wasting ? (
        <Card className="border-danger/40 bg-danger/5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <p className="font-medium text-danger">
                Energy wastage alert
              </p>

              <p className="mt-1 text-sm">
                {wastageMessage(room)}
              </p>
            </div>

            {isRealRoom ? (
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  onClick={requestOff}
                >
                  Turn all off
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    setIgnored(true)
                  }
                >
                  Ignore
                </Button>
              </div>
            ) : null}
          </div>

          {pendingApproval &&
          isRealRoom ? (
            <div className="mt-4 rounded-xl border border-border bg-surface-2 p-4">
              <p className="text-sm font-medium">
                Approval required
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Room {room.number} is in
                Approval mode. Confirm to
                switch Fan, Light and AC
                OFF.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    void turnAllOff(
                      room.id,
                    );

                    setPendingApproval(
                      false,
                    );
                  }}
                >
                  Approve & switch off
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setPendingApproval(
                      false,
                    )
                  }
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}

      {/* ENVIRONMENT DATA */}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Thermometer className="size-4" />
            Temperature
          </div>

          <p className="font-display mt-2 text-3xl font-semibold">
            {room.temperature.toFixed(1)}{" "}
            °C
          </p>

          {!isRealRoom ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Simulated data
            </p>
          ) : null}
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Droplets className="size-4" />
            Humidity
          </div>

          <p className="font-display mt-2 text-3xl font-semibold">
            {room.humidity}%
          </p>

          {!isRealRoom ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Simulated data
            </p>
          ) : null}
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4" />
            Environment
          </div>

          <p className="font-display mt-2 text-xl font-semibold">
            {comfortLabel[comfort]}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Comfort band 20–27 °C ·
            35–65% RH
          </p>

          {!isRealRoom ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Simulated analysis
            </p>
          ) : null}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* APPLIANCE CONTROL */}

        <Card>
          <SectionTitle
            title="Appliance control"
            subtitle={
              isRealRoom
                ? "Commands route to the ESP32 node through MQTT"
                : "Simulated room — live appliance control unavailable"
            }
          />

          <div className="space-y-3">
            {/* FAN */}

            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-surface-2 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal/15 text-teal">
                  <Fan className="size-5" />
                </span>

                <div className="min-w-0">
                  <p className="truncate font-medium">
                    Fan
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {room.fan
                      ? "Running"
                      : "Stopped"}
                  </p>
                </div>
              </div>

              <Toggle
                label="Toggle fan"
                checked={room.fan}
                disabled={
                  !isRealRoom ||
                  !room.online
                }
                onChange={(v) =>
                  void toggleAppliance(
                    room.id,
                    "fan",
                    v,
                  )
                }
              />
            </div>

            {/* LIGHT */}

            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-surface-2 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warning/15 text-warning">
                  <Lightbulb className="size-5" />
                </span>

                <div className="min-w-0">
                  <p className="truncate font-medium">
                    Light
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {room.light
                      ? "Illuminated"
                      : "Off"}
                  </p>
                </div>
              </div>

              <Toggle
                label="Toggle light"
                checked={room.light}
                disabled={
                  !isRealRoom ||
                  !room.online
                }
                onChange={(v) =>
                  void toggleAppliance(
                    room.id,
                    "light",
                    v,
                  )
                }
              />
            </div>

            {/* AC */}

            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-surface-2 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal/15 text-teal">
                  <Snowflake className="size-5" />
                </span>

                <div className="min-w-0">
                  <p className="truncate font-medium">
                    AC
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {room.ac
                      ? "Cooling"
                      : "Off"}
                  </p>
                </div>
              </div>

              <Toggle
                label="Toggle AC"
                checked={room.ac}
                disabled={
                  !isRealRoom ||
                  !room.online
                }
                onChange={(v) =>
                  void toggleAppliance(
                    room.id,
                    "ac",
                    v,
                  )
                }
              />
            </div>

            {isRealRoom ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={requestOff}
                disabled={!room.online}
              >
                Turn all appliances off
              </Button>
            ) : (
              <div className="rounded-xl border border-border bg-surface-2 p-3 text-center text-xs text-muted-foreground">
                This room uses simulated
                monitoring data.
              </div>
            )}

            {isRealRoom &&
            !room.online ? (
              <p className="text-xs text-danger">
                Device offline — controls
                resume when the node
                reconnects.
              </p>
            ) : null}
          </div>
        </Card>

        <div className="space-y-6">
          {/* AUTOMATION */}

          <Card>
            <SectionTitle
              title="Automation"
              subtitle={
                MODE_HELP[room.mode]
              }
            />

            <Segmented
              value={room.mode}
              onChange={(mode) =>
                void changeMode(
                  room.id,
                  mode,
                )
              }
              options={[
                {
                  value:
                    "automatic",
                  label:
                    "Automatic",
                },
                {
                  value:
                    "approval",
                  label:
                    "Approval",
                },
                {
                  value:
                    "manual",
                  label:
                    "Manual",
                },
              ]}
            />

            <p className="mt-5 mb-2 text-sm text-muted-foreground">
              Empty-room delay
            </p>

            <Segmented
              size="sm"
              value={
                String(
                  room.emptyDelayMinutes,
                ) as
                  | "5"
                  | "10"
                  | "15"
              }
              onChange={(v) =>
                void changeDelay(
                  room.id,
                  Number(v) as
                    | 5
                    | 10
                    | 15,
                )
              }
              options={[
                {
                  value: "5",
                  label: "5 min",
                },
                {
                  value: "10",
                  label: "10 min",
                },
                {
                  value: "15",
                  label: "15 min",
                },
              ]}
            />
          </Card>

          {/* ACTIVITY */}

          <Card>
            <SectionTitle
              title="Recent activity"
            />

            {roomActivity.length ===
            0 ? (
              <p className="text-sm text-muted-foreground">
                No activity recorded
                yet.
              </p>
            ) : (
              <div className="space-y-3">
                {roomActivity
                  .slice(0, 8)
                  .map((entry) => (
                    <div
                      key={entry.id}
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
                  ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}