import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Loader2, Upload, ScanLine, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { parseUrlList, isLikelyUrl } from "@/lib/url-utils";
import { toast } from "sonner";
import type { UrlScanResult } from "@/server/scanner";

const MAX_URLS = 50;

interface Props {
  onComplete: (results: UrlScanResult[], scanId: string) => void;
}

export function ScanForm({ onComplete }: Props) {
  const [single, setSingle] = useState("");
  const [bulk, setBulk] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) {
      toast.error("File too large (max 1 MB)");
      return;
    }
    const text = await file.text();
    setBulk((prev) => (prev ? prev + "\n" + text : text));
    setFileName(file.name);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const combined = [single.trim(), bulk].filter(Boolean).join("\n");
    const urls = parseUrlList(combined);

    if (urls.length === 0) {
      toast.error("Add at least one URL");
      return;
    }
    if (urls.length > MAX_URLS) {
      toast.error(`Limit is ${MAX_URLS} URLs per scan`);
      return;
    }
    const invalid = urls.filter((u) => !isLikelyUrl(u));
    if (invalid.length) {
      toast.error(`Invalid URL: ${invalid[0]}`);
      return;
    }

    setRunning(true);
    try {
      // Server function call via authenticated POST
      const { runScan } = await import("@/server/scanner.functions");
      const res = await runScan({
        data: { urls, source: fileName ? (fileName.endsWith(".csv") ? "csv" : "txt") : "manual" },
      });
      toast.success(`Scanned ${res.results.length} URL${res.results.length === 1 ? "" : "s"}`);
      onComplete(res.results, res.scanId);
      setSingle("");
      setBulk("");
      setFileName(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Scan failed";
      toast.error(msg);
    } finally {
      setRunning(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass space-y-5 rounded-2xl p-6">
      <div className="space-y-2">
        <Label htmlFor="single" className="text-xs uppercase tracking-wider text-muted-foreground">
          Single URL
        </Label>
        <Input
          id="single"
          placeholder="https://example.com/login"
          value={single}
          onChange={(e) => setSingle(e.target.value)}
          className="bg-background/60 font-mono text-sm"
          maxLength={2048}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="bulk" className="text-xs uppercase tracking-wider text-muted-foreground">
            Bulk URLs (one per line)
          </Label>
          <div className="flex items-center gap-2">
            {fileName && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                <FileText className="h-3 w-3" /> {fileName}
                <button
                  type="button"
                  onClick={() => {
                    setFileName(null);
                    setBulk("");
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              className="border-primary/30 hover:bg-primary/10"
            >
              <Upload className="h-3 w-3" /> Upload CSV/TXT
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              onChange={handleFile}
              className="hidden"
            />
          </div>
        </div>
        <Textarea
          id="bulk"
          placeholder={"https://site-one.com\nhttps://site-two.com"}
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          rows={6}
          className="bg-background/60 font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">Up to {MAX_URLS} URLs per scan.</p>
      </div>

      <Button type="submit" disabled={running} className="w-full glow-primary">
        {running ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Scanning…
          </>
        ) : (
          <>
            <ScanLine className="h-4 w-4" /> Run scan
          </>
        )}
      </Button>
    </form>
  );
}
