import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function KonohaGateIntro() {
  const [show, setShow] = useState(true);
  const [opening, setOpening] = useState(false);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(() => setShow(false), 1700);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Dark backdrop */}
          <div className="absolute inset-0 bg-background" />

          {/* Glow seam between doors (only when opening) */}
          {opening && (
            <motion.div
              className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, transparent, oklch(0.85 0.2 55), transparent)",
                boxShadow:
                  "0 0 40px oklch(0.85 0.2 55), 0 0 80px oklch(0.75 0.2 55)",
              }}
              initial={{ opacity: 0, scaleY: 0.2 }}
              animate={{ opacity: [0, 1, 1, 0], scaleY: [0.2, 1, 1, 1] }}
              transition={{ duration: 1.5, times: [0, 0.25, 0.7, 1] }}
            />
          )}

          {/* Left gate */}
          <motion.div
            className="absolute top-0 bottom-0 left-0 w-1/2"
            initial={{ x: 0 }}
            animate={opening ? { x: "-100%" } : { x: 0 }}
            transition={{ duration: 1.2, delay: opening ? 0.4 : 0, ease: [0.7, 0, 0.3, 1] }}
            style={{
              background:
                "linear-gradient(90deg, oklch(0.18 0.05 40) 0%, oklch(0.28 0.08 35) 60%, oklch(0.22 0.07 35) 100%)",
              borderRight: "4px solid oklch(0.12 0.04 30)",
              boxShadow: "inset -20px 0 40px oklch(0.08 0.03 30)",
            }}
          >
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent 0 60px, oklch(0.12 0.04 30) 60px 62px)",
              }}
            />
            <div className="absolute inset-0 flex flex-col justify-around items-end pr-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, oklch(0.6 0.05 60), oklch(0.25 0.03 50))",
                    boxShadow: "0 2px 4px oklch(0 0 0 / 0.5)",
                  }}
                />
              ))}
            </div>
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 sm:w-56 sm:h-56 flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.7 0.18 150) 0%, oklch(0.5 0.18 150) 70%, transparent 71%)",
                  clipPath: "inset(0 50% 0 0)",
                }}
              />
              <span
                className="relative text-7xl sm:text-9xl font-extrabold"
                style={{
                  color: "oklch(0.95 0.02 60)",
                  clipPath: "inset(0 50% 0 0)",
                }}
              >
                🍃
              </span>
            </div>
          </motion.div>

          {/* Right gate */}
          <motion.div
            className="absolute top-0 bottom-0 right-0 w-1/2"
            initial={{ x: 0 }}
            animate={opening ? { x: "100%" } : { x: 0 }}
            transition={{ duration: 1.2, delay: opening ? 0.4 : 0, ease: [0.7, 0, 0.3, 1] }}
            style={{
              background:
                "linear-gradient(270deg, oklch(0.18 0.05 40) 0%, oklch(0.28 0.08 35) 60%, oklch(0.22 0.07 35) 100%)",
              borderLeft: "4px solid oklch(0.12 0.04 30)",
              boxShadow: "inset 20px 0 40px oklch(0.08 0.03 30)",
            }}
          >
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent 0 60px, oklch(0.12 0.04 30) 60px 62px)",
              }}
            />
            <div className="absolute inset-0 flex flex-col justify-around items-start pl-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, oklch(0.6 0.05 60), oklch(0.25 0.03 50))",
                    boxShadow: "0 2px 4px oklch(0 0 0 / 0.5)",
                  }}
                />
              ))}
            </div>
            <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-40 h-40 sm:w-56 sm:h-56 flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.7 0.18 150) 0%, oklch(0.5 0.18 150) 70%, transparent 71%)",
                  clipPath: "inset(0 0 0 50%)",
                }}
              />
              <span
                className="relative text-7xl sm:text-9xl font-extrabold"
                style={{
                  color: "oklch(0.95 0.02 60)",
                  clipPath: "inset(0 0 0 50%)",
                }}
              >
                🍃
              </span>
            </div>
          </motion.div>

          {/* Burst flash when opening */}
          {opening && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at center, oklch(0.95 0.18 60 / 0.5), transparent 60%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0.8, 0] }}
              transition={{ duration: 1.5, times: [0, 0.4, 0.55, 1] }}
            />
          )}

          {/* Bottom button — fades out when opening */}
          <AnimatePresence>
            {!opening && (
              <motion.div
                className="absolute inset-x-0 bottom-10 sm:bottom-16 flex justify-center z-10"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={handleOpen}
                  className="btn-glow group relative inline-flex items-center gap-3 rounded-2xl px-8 py-5 text-xl sm:text-2xl font-extrabold text-primary-foreground bg-primary"
                >
                  <span className="text-2xl">🍃</span>
                  <span>Enter Konoha Village</span>
                  <span className="text-2xl group-hover:translate-x-1 transition-transform">
                    ⛩️
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
