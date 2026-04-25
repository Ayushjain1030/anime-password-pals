import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect } from "react";
import { AuthPanel } from "@/components/AuthPanel";
import { useAuth } from "@/lib/auth-context";
import { Shield } from "lucide-react";

const ParticleShieldScene = lazy(() =>
  import("@/components/ParticleShieldScene").then((m) => ({ default: m.ParticleShieldScene })),
);

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — PhishGuard" },
      { name: "description", content: "Authenticate to access the PhishGuard dashboard." },
    ],
  }),
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 -z-10">
        <ClientOnly fallback={<div className="absolute inset-0 grid-bg" />}>
          <Suspense fallback={<div className="absolute inset-0 grid-bg" />}>
            <ParticleShieldScene />
          </Suspense>
        </ClientOnly>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-background/30 via-background/60 to-background" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/40">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">PhishGuard</span>
        </div>
        <AuthPanel />
      </div>
    </main>
  );
}
