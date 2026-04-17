import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Sparkles } from "lucide-react";
import guardianWeak from "@/assets/guardian-weak.png";
import guardianMedium from "@/assets/guardian-medium.png";
import guardianStrong from "@/assets/guardian-strong.png";

interface Props {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "Step 1: Academy Student",
    subtitle: "鍛錬 • Begin Training",
    description: "Every ninja starts here! Learn the basics of password chakra and the way of the Shinobi.",
    image: guardianWeak,
    color: "var(--strength-weak)",
    rank: "GENIN",
    emoji: "📜",
  },
  {
    title: "Step 2: Chūnin Warrior",
    subtitle: "修行 • Master Your Jutsu",
    description: "You're getting stronger! Mix letters, numbers and symbols to forge an unbreakable jutsu.",
    image: guardianMedium,
    color: "var(--strength-medium)",
    rank: "CHŪNIN",
    emoji: "⚔️",
  },
  {
    title: "Step 3: Hokage Legend!",
    subtitle: "伝説 • Become a Legend",
    description: "You've mastered the Shadow Password Jutsu! Protect your village and your secrets forever.",
    image: guardianStrong,
    color: "var(--strength-strong)",
    rank: "HOKAGE",
    emoji: "🔥",
  },
];

export default function NinjaJourneyModal({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [showFinale, setShowFinale] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setShowFinale(false);
    }
  }, [open]);

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setShowFinale(true);
    }
  };

  const current = steps[step];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in oklch, var(--background) 85%, black) 0%, color-mix(in oklch, var(--background) 95%, black) 100%)",
          }}
        >
          {/* Floating shuriken particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  rotate: 0,
                  opacity: 0,
                }}
                animate={{
                  y: ["0%", "-120%"],
                  rotate: 720,
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "linear",
                }}
                className="absolute text-2xl"
                style={{ left: `${Math.random() * 100}%` }}
              >
                ✦
              </motion.div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 rounded-full bg-card p-2 text-foreground shadow-lg hover:scale-110 transition-transform"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ scale: 0.7, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, y: 50 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="relative w-full max-w-md card-anime p-6 sm:p-8"
          >
            {!showFinale ? (
              <>
                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-6">
                  {steps.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        width: i === step ? 32 : 8,
                        backgroundColor:
                          i <= step ? "var(--primary)" : "var(--muted)",
                      }}
                      className="h-2 rounded-full"
                    />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Character with energy aura */}
                    <div className="relative flex justify-center mb-4">
                      <motion.div
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 m-auto w-40 h-40 rounded-full blur-2xl"
                        style={{ backgroundColor: current.color }}
                      />
                      <motion.img
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                        src={current.image}
                        alt={current.rank}
                        width={512}
                        height={512}
                        className="relative w-40 h-40 object-contain drop-shadow-2xl"
                      />
                    </div>

                    {/* Rank badge */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex justify-center mb-3"
                    >
                      <span
                        className="px-4 py-1 rounded-full text-xs font-extrabold tracking-widest"
                        style={{
                          backgroundColor: `color-mix(in oklch, ${current.color} 25%, transparent)`,
                          color: current.color,
                          border: `2px solid ${current.color}`,
                        }}
                      >
                        {current.emoji} {current.rank} RANK
                      </span>
                    </motion.div>

                    <h3 className="text-center text-2xl font-extrabold text-gradient-hero mb-1">
                      {current.title}
                    </h3>
                    <p className="text-center text-xs font-semibold text-primary mb-3 tracking-wider">
                      {current.subtitle}
                    </p>
                    <p className="text-center text-sm text-muted-foreground leading-relaxed mb-6">
                      {current.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <button
                  onClick={next}
                  className="btn-glow w-full flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground"
                >
                  {step < steps.length - 1 ? "Next Level" : "Become Hokage!"}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            ) : (
              // FINALE
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="text-center py-4"
              >
                {/* Rasengan */}
                <div className="relative flex justify-center mb-6 h-40">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 m-auto w-40 h-40 rounded-full"
                    style={{
                      background:
                        "conic-gradient(from 0deg, var(--secondary), var(--primary), var(--accent), var(--secondary))",
                      filter: "blur(8px)",
                      opacity: 0.7,
                    }}
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        "0 0 40px var(--secondary)",
                        "0 0 80px var(--primary)",
                        "0 0 40px var(--secondary)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyan-300 via-blue-500 to-blue-700 flex items-center justify-center"
                  >
                    <Sparkles className="w-12 h-12 text-white drop-shadow-lg" />
                  </motion.div>
                </div>

                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-extrabold text-gradient-hero mb-2"
                >
                  RASENGAN UNLOCKED! ⚡
                </motion.h3>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-muted-foreground mb-6"
                >
                  You are now a true Password Guardian. Go forth and protect your village! 🍥
                </motion.p>

                <button
                  onClick={onClose}
                  className="btn-glow w-full rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground"
                >
                  Begin My Journey 🥷
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
