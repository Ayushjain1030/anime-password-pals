import { ShieldCheck, AlertTriangle, ShieldAlert, HelpCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UrlScanResult, Verdict } from "@/server/scanner";

interface Props {
  results: UrlScanResult[];
  title?: string;
}

const verdictMeta: Record<Verdict, { label: string; cls: string; bg: string; Icon: typeof ShieldCheck }> = {
  safe: { label: "Safe", cls: "verdict-safe", bg: "bg-verdict-safe", Icon: ShieldCheck },
  suspicious: { label: "Suspicious", cls: "verdict-suspicious", bg: "bg-verdict-suspicious", Icon: AlertTriangle },
  malicious: { label: "Malicious", cls: "verdict-malicious", bg: "bg-verdict-malicious", Icon: ShieldAlert },
  error: { label: "Error", cls: "text-muted-foreground", bg: "bg-muted/40", Icon: HelpCircle },
};

function toCsv(results: UrlScanResult[]): string {
  const header = ["url", "hostname", "verdict", "risk_score", "ssl_valid", "reasons"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [header.join(",")];
  for (const r of results) {
    lines.push(
      [
        escape(r.url),
        escape(r.hostname ?? ""),
        r.verdict,
        String(r.riskScore),
        r.sslValid === null ? "" : String(r.sslValid),
        escape(r.reasons.map((x) => `${x.code}:${x.message}`).join(" | ")),
      ].join(","),
    );
  }
  return lines.join("\n");
}

export function ResultsTable({ results, title = "Latest scan" }: Props) {
  if (results.length === 0) return null;

  const exportCsv = () => {
    const blob = new Blob([toCsv(results)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phishguard-scan-${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdfStub = () => {
    // PDF export stub for MVP — Phase 2 swaps in jsPDF/server PDF render.
    const w = window.open("", "_blank");
    if (!w) return;
    const rows = results
      .map(
        (r) =>
          `<tr><td>${escapeHtml(r.url)}</td><td>${r.verdict}</td><td>${r.riskScore}</td></tr>`,
      )
      .join("");
    w.document.write(`<html><head><title>PhishGuard report</title><style>
      body{font-family:system-ui;padding:24px;color:#111}
      table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:6px;font-size:12px;text-align:left}
      th{background:#f3f4f6}
    </style></head><body><h1>PhishGuard scan report</h1>
    <p>${new Date().toISOString()}</p>
    <table><thead><tr><th>URL</th><th>Verdict</th><th>Risk</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <script>window.print()</script></body></html>`);
    w.document.close();
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCsv} className="border-primary/30">
            <Download className="h-3 w-3" /> CSV
          </Button>
          <Button size="sm" variant="outline" onClick={exportPdfStub} className="border-primary/30">
            <Download className="h-3 w-3" /> PDF
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">URL</TableHead>
              <TableHead>Verdict</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>SSL</TableHead>
              <TableHead>Reasons</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((r, i) => {
              const m = verdictMeta[r.verdict];
              return (
                <TableRow key={i}>
                  <TableCell className="max-w-[280px] truncate font-mono text-xs" title={r.url}>
                    {r.url}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${m.bg} ${m.cls}`}
                    >
                      <m.Icon className="h-3 w-3" />
                      {m.label}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{r.riskScore}</TableCell>
                  <TableCell className="text-xs">
                    {r.sslValid === null ? "—" : r.sslValid ? "✓" : "✗"}
                  </TableCell>
                  <TableCell className="max-w-[260px] text-xs text-muted-foreground">
                    {r.reasons.length === 0
                      ? "No flags"
                      : r.reasons.slice(0, 2).map((x) => x.message).join(" · ") +
                        (r.reasons.length > 2 ? ` (+${r.reasons.length - 2})` : "")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
