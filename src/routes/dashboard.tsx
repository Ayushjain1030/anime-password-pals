import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, LogOut, ScanLine, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { ScanForm } from "@/components/ScanForm";
import { ResultsTable } from "@/components/ResultsTable";
import type { UrlScanResult, Verdict } from "@/server/scanner";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — PhishGuard" },
      { name: "description", content: "Scan URLs, view results, and access scan history." },
    ],
  }),
});

interface ScanRow {
  id: string;
  source: string;
  total_urls: number;
  safe_count: number;
  suspicious_count: number;
  malicious_count: number;
  error_count: number;
  created_at: string;
}

function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [latest, setLatest] = useState<UrlScanResult[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const history = useQuery({
    queryKey: ["scans", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ScanRow[]> => {
      const { data, error } = await supabase
        .from("scans")
        .select("id, source, total_urls, safe_count, suspicious_count, malicious_count, error_count, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <div className="relative">
        <header className="flex items-center justify-between border-b border-border/40 px-6 py-4 backdrop-blur sm:px-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/40">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display text-lg font-semibold">PhishGuard</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut();
                navigate({ to: "/" });
              }}
              className="border-border/60"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 sm:px-10 lg:grid-cols-[1.1fr_1fr]">
          {/* Left: scan form + latest results */}
          <section className="space-y-6">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
                <ScanLine className="h-3 w-3" /> Scan
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                Inspect a URL or batch
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste a single link, dump a list, or upload a CSV/TXT file.
              </p>
            </div>
            <ScanForm onComplete={(r) => {
              setLatest(r);
              history.refetch();
            }} />
            {latest.length > 0 && <ResultsTable results={latest} title="Latest scan" />}
          </section>

          {/* Right: history */}
          <aside className="space-y-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
                <History className="h-3 w-3" /> History
              </div>
              <h2 className="font-display text-xl font-semibold tracking-tight">Recent scans</h2>
            </div>
            <div className="glass rounded-2xl p-2">
              {history.isLoading && (
                <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
              )}
              {history.data && history.data.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No scans yet. Run your first one →
                </div>
              )}
              <ul className="divide-y divide-border/40">
                {history.data?.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 px-3 py-3">
                    <div className="min-w-0">
                      <div className="text-sm">
                        <span className="font-medium">{s.total_urls}</span>{" "}
                        <span className="text-muted-foreground">URL{s.total_urls === 1 ? "" : "s"}</span>{" "}
                        <span className="ml-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {s.source}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(s.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 text-xs">
                      <Pill v="safe" n={s.safe_count} />
                      <Pill v="suspicious" n={s.suspicious_count} />
                      <Pill v="malicious" n={s.malicious_count} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Pill({ v, n }: { v: Verdict; n: number }) {
  if (n === 0) return null;
  const cls = v === "safe" ? "bg-verdict-safe verdict-safe" : v === "suspicious" ? "bg-verdict-suspicious verdict-suspicious" : "bg-verdict-malicious verdict-malicious";
  return (
    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 font-medium ${cls}`}>
      {n}
    </span>
  );
}
