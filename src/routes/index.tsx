import { createFileRoute, Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Lock, Globe2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

const ParticleShieldScene = lazy(() =>
  import("@/components/ParticleShieldScene").then((m) => ({ default: m.ParticleShieldScene })),
);

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "PhishGuard — Detect Phishing & Malicious Links" },
      { name: "description", content: "Scan URLs in real time with a 3D cyber interface. Rule-based detection, SSL validation, and reputation analysis." },
    ],
  }),
});

function LandingPage() {
  const { user } = useAuth();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* 3D background */}
      <div className="absolute inset-0 -z-10">
        <ClientOnly fallback={<div className="absolute inset-0 grid-bg" />}>
          <Suspense fallback={<div className="absolute inset-0 grid-bg" />}>
            <ParticleShieldScene />
          </Suspense>
        </ClientOnly>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-40" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/40 to-background" />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/40">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">PhishGuard</span>
        </div>
        <nav className="flex items-center gap-2">
          {user ? (
            <Link to="/dashboard">
              <Button variant="default" className="glow-primary">
                Open dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="default" className="glow-primary">
                Sign in <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-10 sm:px-10 lg:grid-cols-2 lg:gap-8 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center"
        >
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Live phishing detection — MVP
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Catch the <span className="text-gradient-cyber">phish</span><br />before it bites.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Scan a single URL or upload a CSV/TXT batch. PhishGuard runs rule-based
            heuristics, validates SSL/TLS, and checks domain reputation — then flags each
            link as <span className="verdict-safe font-semibold">Safe</span>,{" "}
            <span className="verdict-suspicious font-semibold">Suspicious</span>, or{" "}
            <span className="verdict-malicious font-semibold">Malicious</span>.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={user ? "/dashboard" : "/auth"}>
              <Button size="lg" className="glow-primary">
                {user ? "Go to dashboard" : "Start scanning free"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10">
                See how it works
              </Button>
            </a>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 text-sm">
            <Stat label="Heuristic checks" value="12+" />
            <Stat label="Per scan" value="≤50 URLs" />
            <Stat label="TLS validated" value="Edge" />
          </div>
        </motion.div>

        {/* Right: visual placeholder — keeps Three.js readable on small screens */}
        <div className="relative hidden min-h-[420px] lg:block" aria-hidden />
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 pb-28 sm:px-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Feature icon={Zap} title="Rule-based engine" desc="12+ heuristics: punycode, IP hosts, brand impersonation, suspicious TLDs, keyword traps." />
          <Feature icon={Lock} title="SSL/TLS validation" desc="Live HTTPS handshake check via the edge runtime — no client trust needed." />
          <Feature icon={Globe2} title="Reputation lookup" desc="Pluggable provider stub today; Google Safe Browsing & PhishTank in Phase 2." />
          <Feature icon={Shield} title="Bulk + history" desc="CSV / TXT upload, per-URL verdicts, persistent scan history, CSV export." />
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/40 px-6 py-8 text-center text-xs text-muted-foreground sm:px-10">
        PhishGuard MVP · Built on TanStack Start + Lovable Cloud
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold text-foreground">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Shield;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-5"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
    </motion.div>
  );
}
