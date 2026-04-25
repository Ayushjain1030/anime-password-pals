/** Parse newline / comma separated URLs from raw text. */
export function parseUrlList(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[\r\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => (s.match(/^https?:\/\//i) ? s : `http://${s}`))
    )
  );
}

export function isLikelyUrl(input: string): boolean {
  try {
    const u = new URL(input.match(/^https?:\/\//i) ? input : `http://${input}`);
    return !!u.hostname && u.hostname.includes(".");
  } catch {
    return false;
  }
}

export type Verdict = "safe" | "suspicious" | "malicious" | "error";

export const verdictLabel: Record<Verdict, string> = {
  safe: "Safe",
  suspicious: "Suspicious",
  malicious: "Malicious",
  error: "Error",
};
