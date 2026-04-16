import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import guardianWeak from "@/assets/guardian-weak.png";
import guardianMedium from "@/assets/guardian-medium.png";
import guardianStrong from "@/assets/guardian-strong.png";
import { Eye, EyeOff } from "lucide-react";

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: "weak", label: "Beginner Shield", image: guardianWeak, color: "var(--strength-weak)", percent: 25, feedback: "Too easy to guess! Add more characters 😟" };
  if (score <= 3) return { level: "medium", label: "Rising Warrior", image: guardianMedium, color: "var(--strength-medium)", percent: 60, feedback: "Getting stronger! Try adding symbols 💪" };
  return { level: "strong", label: "Legendary Hero!", image: guardianStrong, color: "var(--strength-strong)", percent: 100, feedback: "AMAZING! Unbreakable password! 🏆✨" };
}

export default function InteractiveSection() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const strength = useMemo(() => getStrength(password), [password]);

  return (
    <section className="gradient-interactive px-5 py-12">
      <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-foreground">
        🧠 Test Your Password!
      </h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Type a password and watch your guardian evolve!
      </p>

      <div className="mt-8 max-w-md mx-auto">
        {/* Character display */}
        <div className="flex justify-center mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={strength.level}
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-32 h-32 sm:w-40 sm:h-40"
            >
              <img
                src={password.length === 0 ? guardianWeak : strength.image}
                alt={strength.label}
                width={512}
                height={512}
                className="w-full h-full object-contain drop-shadow-md"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Password input */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type your secret password..."
            className="w-full rounded-2xl border-2 border-border bg-card px-5 py-4 pr-14 text-lg font-medium text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
          </button>
        </div>

        {/* Strength meter */}
        {password.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold" style={{ color: strength.color }}>
                {strength.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {strength.percent}%
              </span>
            </div>
            <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${strength.percent}%` }}
                transition={{ duration: 0.5, type: "spring" }}
                className="h-full rounded-full transition-colors"
                style={{ backgroundColor: strength.color }}
              />
            </div>
            <p className="mt-3 text-center text-sm font-medium text-muted-foreground">
              {strength.feedback}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
