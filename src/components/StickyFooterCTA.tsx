import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function StickyFooterCTA() {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 1, type: "spring", bounce: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      style={{
        background: "linear-gradient(to top, var(--background) 60%, transparent)",
      }}
    >
      <button className="btn-glow w-full flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-primary-foreground max-w-md mx-auto">
        <Sparkles className="w-5 h-5" />
        Start Your Journey
      </button>
    </motion.div>
  );
}
