import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  ActivityEntry,
  Alert,
  AlertStatus,
  EnergyStats,
  Recommendation,
  Room,
  RoomMode,
  User,
} from "@/lib/types";

import * as api from "@/services/api";

import {
  onDeviceStatusChange,
  onRelayStateChange,
} from "@/services/mqtt";

/* ---------------------------------- auth --------------------------------- */

const STORAGE_KEY = "sbms.user";

interface AuthValue {
  user: User | null;
  ready: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<void>;
  signOut: () => void;
}

const AuthContext =
  createContext<AuthValue | null>(null);

/* ---------------------------------- data --------------------------------- */

interface BuildingValue {
  rooms: Room[];
  alerts: Alert[];
  activity: ActivityEntry[];
  energy: EnergyStats | null;
  recommendations: Recommendation[];
  loading: boolean;

  refresh: () => Promise<void>;

  toggleAppliance: (
    roomId: string,
    appliance: "fan" | "light" | "ac",
    value: boolean,
  ) => Promise<void>;

  turnAllOff: (
    roomId: string,
  ) => Promise<void>;

  changeMode: (
    roomId: string,
    mode: RoomMode,
  ) => Promise<void>;

  changeDelay: (
    roomId: string,
    minutes: 5 | 10 | 15,
  ) => Promise<void>;

  updateAlert: (
    alertId: string,
    status: AlertStatus,
  ) => Promise<void>;
}

const BuildingContext =
  createContext<BuildingValue | null>(null);

/* ------------------------------ provider -------------------------------- */

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [ready, setReady] =
    useState(false);

  const [rooms, setRooms] =
    useState<Room[]>([]);

  const [alerts, setAlerts] =
    useState<Alert[]>([]);

  const [activity, setActivity] =
    useState<ActivityEntry[]>([]);

  const [energy, setEnergy] =
    useState<EnergyStats | null>(null);

  const [
    recommendations,
    setRecommendations,
  ] = useState<Recommendation[]>([]);

  const [loading, setLoading] =
    useState(true);

  /* ------------------------------- auth load ------------------------------ */

  useEffect(() => {
    try {
      const raw =
        window.localStorage.getItem(
          STORAGE_KEY,
        );

      if (raw) {
        setUser(
          JSON.parse(raw) as User,
        );
      }
    } catch {
      /* ignore */
    }

    setReady(true);
  }, []);

  /* ------------------------------- refresh -------------------------------- */

  const refresh =
    useCallback(async () => {
      const [r, a, l, e, rec] =
        await Promise.all([
          api.getRooms(),
          api.getAlerts(),
          api.getActivity(),
          api.getEnergyStats(),
          api.getRecommendations(),
        ]);

      setRooms(r);
      setAlerts(a);
      setActivity(l);
      setEnergy(e);
      setRecommendations(rec);
      setLoading(false);
    }, []);

  useEffect(() => {
    if (user) {
      void refresh();
    }
  }, [user, refresh]);

  /* ----------------------- REAL MQTT DEVICE STATUS ------------------------ */

  useEffect(() => {
    const unsubscribeDevice =
      onDeviceStatusChange(
        (online) => {
          setRooms((currentRooms) =>
            currentRooms.map(
              (room) =>
                room.number === "101"
                  ? {
                      ...room,
                      online,
                      lastUpdated:
                        new Date().toISOString(),
                    }
                  : room,
            ),
          );
        },
      );

    return () => {
      unsubscribeDevice();
    };
  }, []);

  /* ------------------------- REAL MQTT RELAYS ----------------------------- */

  useEffect(() => {
    const unsubscribeRelay =
      onRelayStateChange(
        (relayId, state) => {
          setRooms((currentRooms) =>
            currentRooms.map(
              (room) => {
                if (
                  room.number !== "101"
                ) {
                  return room;
                }

                if (
                  relayId === "fan_1"
                ) {
                  return {
                    ...room,
                    fan: state,
                    lastUpdated:
                      new Date().toISOString(),
                  };
                }

                if (
                  relayId === "light_1"
                ) {
                  return {
                    ...room,
                    light: state,
                    lastUpdated:
                      new Date().toISOString(),
                  };
                }

                if (
                  relayId === "ac_unit"
                ) {
                  return {
                    ...room,
                    ac: state,
                    lastUpdated:
                      new Date().toISOString(),
                  };
                }

                return room;
              },
            ),
          );
        },
      );

    return () => {
      unsubscribeRelay();
    };
  }, []);

  /* -------------------------------- auth ---------------------------------- */

  const signIn =
    useCallback(
      async (
        email: string,
        password: string,
      ) => {
        const u =
          await api.login(
            email,
            password,
          );

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(u),
        );

        setUser(u);
      },
      [],
    );

  const signOut =
    useCallback(() => {
      window.localStorage.removeItem(
        STORAGE_KEY,
      );

      setUser(null);

      setRooms([]);
      setAlerts([]);
      setActivity([]);
      setEnergy(null);
      setRecommendations([]);
    }, []);

  /* --------------------------- appliances -------------------------------- */

  const toggleAppliance =
    useCallback(
      async (
        roomId: string,
        appliance:
          | "fan"
          | "light"
          | "ac",
        value: boolean,
      ) => {
        await api.setAppliance(
          roomId,
          appliance,
          value,
        );

        /*
         * refresh keeps activity and
         * other data synchronized.
         *
         * MQTT listener also updates
         * Fan / Light / AC immediately
         * when device confirmation arrives.
         */
        await refresh();
      },
      [refresh],
    );

  const turnAllOff =
    useCallback(
      async (roomId: string) => {
        await api.turnAllOff(
          roomId,
        );

        await refresh();
      },
      [refresh],
    );

  /* ------------------------------ modes ---------------------------------- */

  const changeMode =
    useCallback(
      async (
        roomId: string,
        mode: RoomMode,
      ) => {
        await api.setRoomMode(
          roomId,
          mode,
        );

        await refresh();
      },
      [refresh],
    );

  const changeDelay =
    useCallback(
      async (
        roomId: string,
        minutes: 5 | 10 | 15,
      ) => {
        await api.setEmptyDelay(
          roomId,
          minutes,
        );

        await refresh();
      },
      [refresh],
    );

  /* ------------------------------ alerts --------------------------------- */

  const updateAlert =
    useCallback(
      async (
        alertId: string,
        status: AlertStatus,
      ) => {
        await api.setAlertStatus(
          alertId,
          status,
        );

        await refresh();
      },
      [refresh],
    );

  /* ------------------------------ contexts -------------------------------- */

  const authValue =
    useMemo<AuthValue>(
      () => ({
        user,
        ready,
        signIn,
        signOut,
      }),
      [
        user,
        ready,
        signIn,
        signOut,
      ],
    );

  const buildingValue =
    useMemo<BuildingValue>(
      () => ({
        rooms,
        alerts,
        activity,
        energy,
        recommendations,
        loading,
        refresh,
        toggleAppliance,
        turnAllOff,
        changeMode,
        changeDelay,
        updateAlert,
      }),
      [
        rooms,
        alerts,
        activity,
        energy,
        recommendations,
        loading,
        refresh,
        toggleAppliance,
        turnAllOff,
        changeMode,
        changeDelay,
        updateAlert,
      ],
    );

  return (
    <AuthContext.Provider
      value={authValue}
    >
      <BuildingContext.Provider
        value={buildingValue}
      >
        {children}
      </BuildingContext.Provider>
    </AuthContext.Provider>
  );
}

/* -------------------------------- hooks ---------------------------------- */

export function useAuth() {
  const ctx =
    useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used inside AppProvider",
    );
  }

  return ctx;
}

export function useBuilding() {
  const ctx =
    useContext(BuildingContext);

  if (!ctx) {
    throw new Error(
      "useBuilding must be used inside AppProvider",
    );
  }

  return ctx;
}