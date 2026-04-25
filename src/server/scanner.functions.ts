import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { scanUrls } from "./scanner";

const scanInputSchema = z.object({
  urls: z.array(z.string().min(3).max(2048)).min(1).max(50),
  source: z.enum(["manual", "csv", "txt"]).default("manual"),
});

export const runScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => scanInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const results = await scanUrls(data.urls);

    const counts = results.reduce(
      (acc, r) => {
        acc[r.verdict] = (acc[r.verdict] ?? 0) + 1;
        return acc;
      },
      { safe: 0, suspicious: 0, malicious: 0, error: 0 } as Record<string, number>
    );

    const { data: scan, error: scanErr } = await supabase
      .from("scans")
      .insert({
        user_id: userId,
        source: data.source,
        total_urls: results.length,
        safe_count: counts.safe,
        suspicious_count: counts.suspicious,
        malicious_count: counts.malicious,
        error_count: counts.error,
      })
      .select()
      .single();

    if (scanErr || !scan) {
      throw new Error(scanErr?.message ?? "Failed to create scan");
    }

    const rows = results.map((r) => ({
      scan_id: scan.id,
      user_id: userId,
      url: r.url,
      hostname: r.hostname,
      verdict: r.verdict,
      risk_score: r.riskScore,
      reasons: r.reasons as unknown as Record<string, unknown>[],
      ssl_valid: r.sslValid,
      ssl_details: r.sslDetails as unknown as Record<string, unknown>,
      reputation: r.reputation as unknown as Record<string, unknown>,
    }));

    const { error: resErr } = await supabase.from("scan_results").insert(rows);
    if (resErr) throw new Error(resErr.message);

    return { scanId: scan.id, results, counts };
  });
