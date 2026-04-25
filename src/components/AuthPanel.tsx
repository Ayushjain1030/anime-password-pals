import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Shield, ScanLine, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

type Mode = "signin" | "signup";

export function AuthPanel() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created. You're in.");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back, agent.");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="glass w-full max-w-md rounded-2xl p-7 glow-primary"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/40">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {mode === "signin" ? "Access PhishGuard" : "Create your shield"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {mode === "signin" ? "Authenticate to start scanning." : "One account. Unlimited scans."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence>
          {mode === "signup" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5 overflow-hidden"
            >
              <Label htmlFor="display_name" className="text-xs uppercase tracking-wider text-muted-foreground">
                Display name
              </Label>
              <Input
                id="display_name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Agent Smith"
                className="bg-background/60"
                maxLength={64}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="agent@domain.com"
            className="bg-background/60"
            maxLength={255}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-background/60"
            minLength={6}
            maxLength={72}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full glow-primary">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ScanLine className="h-4 w-4" />
              {mode === "signin" ? "Sign in" : "Create account"}
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-5 text-center text-sm text-muted-foreground">
        {mode === "signin" ? (
          <>
            New here?{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => setMode("signup")}
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have one?{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => setMode("signin")}
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
