/**
 * Server-only URL scanning pipeline.
 * - Rule-based heuristics
 * - SSL/TLS validation via HTTPS HEAD request (uses Web fetch — works on Workers)
 * - Domain reputation lookup STUB (extension point for Phase 2)
 *
 * Returns a structured per-URL result. Designed to be called from a server fn.
 */

export type Verdict = "safe" | "suspicious" | "malicious" | "error";

export interface ScanReason {
  code: string;
  weight: number;
  message: string;
}

export interface UrlScanResult {
  url: string;
  hostname: string | null;
  verdict: Verdict;
  riskScore: number; // 0-100
  reasons: ScanReason[];
  sslValid: boolean | null;
  sslDetails: { checkedUrl: string; status?: number; error?: string } | null;
  reputation: { source: string; listed: boolean; note: string };
}

// Rough TLD/keyword indicators (extend as needed)
const SUSPICIOUS_TLDS = new Set([
  "zip", "review", "country", "kim", "cricket", "science", "work",
  "party", "gq", "ml", "cf", "tk", "top", "click", "loan", "men",
]);

const PHISHING_KEYWORDS = [
  "login", "secure", "verify", "account", "update", "confirm", "banking",
  "paypal", "appleid", "wallet", "signin", "webscr", "support-team",
];

const KNOWN_BRANDS = [
  "paypal", "apple", "microsoft", "google", "amazon", "facebook", "instagram",
  "netflix", "bankofamerica", "chase", "wellsfargo", "binance", "coinbase",
];

// Demo blocklist — Phase 2 swaps this for Google Safe Browsing / PhishTank / etc.
const DEMO_BLOCKLIST = new Set<string>([
  "malicious-example.com",
  "phishing-test.com",
]);

function tryParse(rawUrl: string): URL | null {
  try {
    return new URL(rawUrl.match(/^https?:\/\//i) ? rawUrl : `http://${rawUrl}`);
  } catch {
    return null;
  }
}

function isIpHostname(host: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || /^\[[0-9a-f:]+\]$/i.test(host);
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function brandImpersonation(host: string): string | null {
  const core = host.split(".").slice(-2)[0] ?? "";
  for (const brand of KNOWN_BRANDS) {
    if (host.includes(brand) && core !== brand) return brand;
    const d = levenshtein(core, brand);
    if (d > 0 && d <= 2 && core.length >= brand.length - 1) return brand;
  }
  return null;
}

async function checkSsl(url: URL, signal: AbortSignal): Promise<{ valid: boolean | null; status?: number; error?: string }> {
  if (url.protocol !== "https:") return { valid: false, error: "no_https" };
  try {
    const res = await fetch(url.toString(), { method: "HEAD", redirect: "follow", signal });
    return { valid: true, status: res.status };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // TLS handshake / cert errors typically surface as fetch failures on the edge runtime.
    return { valid: false, error: msg.slice(0, 200) };
  }
}

async function checkReputation(host: string): Promise<{ source: string; listed: boolean; note: string }> {
  // STUB: replace with real provider in Phase 2 (Google Safe Browsing, PhishTank, VirusTotal).
  const listed = DEMO_BLOCKLIST.has(host);
  return {
    source: "demo-blocklist",
    listed,
    note: listed ? "Host present in local demo blocklist" : "No reputation data (stub)",
  };
}

function classify(score: number): Verdict {
  if (score >= 70) return "malicious";
  if (score >= 35) return "suspicious";
  return "safe";
}

export async function scanUrl(rawUrl: string): Promise<UrlScanResult> {
  const url = tryParse(rawUrl);
  if (!url) {
    return {
      url: rawUrl,
      hostname: null,
      verdict: "error",
      riskScore: 0,
      reasons: [{ code: "invalid_url", weight: 0, message: "Could not parse URL" }],
      sslValid: null,
      sslDetails: null,
      reputation: { source: "n/a", listed: false, note: "skipped" },
    };
  }

  const host = url.hostname.toLowerCase();
  const reasons: ScanReason[] = [];
  let score = 0;

  // Heuristic checks
  if (url.protocol !== "https:") {
    reasons.push({ code: "no_https", weight: 15, message: "URL does not use HTTPS" });
    score += 15;
  }
  if (isIpHostname(host)) {
    reasons.push({ code: "ip_host", weight: 30, message: "Host is a raw IP address" });
    score += 30;
  }
  if (host.length > 40) {
    reasons.push({ code: "long_host", weight: 8, message: "Unusually long hostname" });
    score += 8;
  }
  const subdomainCount = host.split(".").length - 2;
  if (subdomainCount >= 3) {
    reasons.push({ code: "deep_subdomains", weight: 12, message: `Deep subdomain nesting (${subdomainCount})` });
    score += 12;
  }
  if (host.includes("@") || url.toString().includes("@")) {
    reasons.push({ code: "user_info", weight: 25, message: "URL contains userinfo (@) — common in phishing" });
    score += 25;
  }
  if (/[^\x00-\x7F]/.test(host) || host.includes("xn--")) {
    reasons.push({ code: "punycode", weight: 20, message: "Punycode / non-ASCII characters in host (possible homograph)" });
    score += 20;
  }
  const tld = host.split(".").pop() ?? "";
  if (SUSPICIOUS_TLDS.has(tld)) {
    reasons.push({ code: "suspicious_tld", weight: 15, message: `TLD .${tld} commonly abused for phishing` });
    score += 15;
  }
  for (const kw of PHISHING_KEYWORDS) {
    if (host.includes(kw) || url.pathname.toLowerCase().includes(kw)) {
      reasons.push({ code: "keyword", weight: 8, message: `Suspicious keyword "${kw}" in URL` });
      score += 8;
      break;
    }
  }
  const brand = brandImpersonation(host);
  if (brand) {
    reasons.push({ code: "brand_impersonation", weight: 35, message: `Possible impersonation of "${brand}"` });
    score += 35;
  }
  if (url.toString().length > 120) {
    reasons.push({ code: "long_url", weight: 5, message: "URL is unusually long" });
    score += 5;
  }
  if ((url.toString().match(/-/g) ?? []).length >= 4) {
    reasons.push({ code: "many_hyphens", weight: 5, message: "Many hyphens in URL" });
    score += 5;
  }

  // SSL + reputation in parallel with hard timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  let ssl: Awaited<ReturnType<typeof checkSsl>>;
  let rep: Awaited<ReturnType<typeof checkReputation>>;
  try {
    [ssl, rep] = await Promise.all([checkSsl(url, controller.signal), checkReputation(host)]);
  } finally {
    clearTimeout(timeout);
  }

  if (ssl.valid === false && url.protocol === "https:") {
    reasons.push({ code: "ssl_invalid", weight: 25, message: `SSL/TLS check failed: ${ssl.error ?? "unknown"}` });
    score += 25;
  }
  if (rep.listed) {
    reasons.push({ code: "blocklisted", weight: 60, message: `Listed in ${rep.source}` });
    score += 60;
  }

  const riskScore = Math.min(100, score);
  return {
    url: url.toString(),
    hostname: host,
    verdict: classify(riskScore),
    riskScore,
    reasons,
    sslValid: ssl.valid,
    sslDetails: { checkedUrl: url.toString(), status: ssl.status, error: ssl.error },
    reputation: rep,
  };
}

export async function scanUrls(urls: string[]): Promise<UrlScanResult[]> {
  // Modest concurrency to avoid hammering the runtime.
  const limit = 5;
  const results: UrlScanResult[] = [];
  for (let i = 0; i < urls.length; i += limit) {
    const batch = urls.slice(i, i + limit);
    const out = await Promise.all(batch.map((u) => scanUrl(u).catch((e) => ({
      url: u,
      hostname: null,
      verdict: "error" as Verdict,
      riskScore: 0,
      reasons: [{ code: "exception", weight: 0, message: e instanceof Error ? e.message : "Scan failed" }],
      sslValid: null,
      sslDetails: null,
      reputation: { source: "n/a", listed: false, note: "skipped" },
    }))));
    results.push(...out);
  }
  return results;
}
