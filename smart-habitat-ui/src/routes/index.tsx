import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, Lock, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui-kit";
import { useAuth } from "@/context/AppProvider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — SmartBuild OS Smart Building Monitoring" },
      {
        name: "description",
        content:
          "Secure sign-in for admins and facility managers to monitor occupancy, comfort and energy use across every room of the building.",
      },
      { property: "og:title", content: "Sign in — SmartBuild OS" },
      {
        property: "og:description",
        content:
          "AI-assisted IoT monitoring for occupancy, comfort and building energy management.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, ready, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@smartbuild.io");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) void navigate({ to: "/overview" });
  }, [ready, user, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      await navigate({ to: "/overview" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-12 lg:flex">
        <div
          className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full opacity-25 blur-3xl"
          style={{ background: "var(--gradient-teal)" }}
        />
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-teal/15">
            <Building2 className="size-6 text-teal" />
          </span>
          <div>
            <p className="font-display font-semibold">SmartBuild OS</p>
            <p className="text-xs text-muted-foreground">IoT Energy Management</p>
          </div>
        </div>
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl leading-tight font-semibold">
            AI-assisted monitoring for every{" "}
            <span className="text-gradient-teal">room, sensor and watt</span>.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Occupancy-aware automation, live comfort telemetry and intelligent energy-wastage
            alerts across the whole building.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {[
              "Real-time occupancy and appliance state",
              "Automatic, Approval and Manual room control",
              "Energy wastage detection with one-tap shutdown",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <ShieldCheck className="size-4 shrink-0 text-teal" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          Connected to simulated ESP32 nodes · Demo environment
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid size-11 place-items-center rounded-xl bg-teal/15">
              <Building2 className="size-6 text-teal" />
            </span>
            <div className="min-w-0">
              <p className="font-display font-semibold">SmartBuild OS</p>
              <p className="truncate text-xs text-muted-foreground">IoT Energy Management</p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Admin and Facility Manager access.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface py-2.5 pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface py-2.5 pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in to dashboard"}
            </Button>
          </form>

          <p className="mt-6 text-xs text-muted-foreground">
            Demo credentials are pre-filled. Authentication is mocked for now and swaps to a
            real provider without UI changes.
          </p>
        </div>
      </section>
    </div>
  );
}
