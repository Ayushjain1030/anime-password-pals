import { useState } from "react";
import { motion } from "framer-motion";
import heroGuardian from "@/assets/hero-guardian.png";
import { Swords } from "lucide-react";
import NinjaJourneyModal from "./NinjaJourneyModal";

export default function HeroSection() {
  const [open, setOpen] = useState(false);

  return (
    <section className="gradient-hero px-5 pt-12 pb-10 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="mx-auto w-48 sm:w-56 md:w-64"
      >
        <img
          src={heroGuardian}
          alt="Ninja Password Guardian"
          width={512}
          height={512}
          className="w-full h-auto drop-shadow-lg"
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="mt-4 flex items-center justify-center gap-2">
          <Swords className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">
            Password Guardian
          </span>
          <Swords className="h-5 w-5 text-primary" />
        </div>

        <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-gradient-hero">
          Protect Your Secrets Like a Ninja!
        </h1>

        <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
          Master the art of strong passwords and become the ultimate Hokage of cybersecurity! 🍥✨
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-6"
      >
        <button
          onClick={() => setOpen(true)}
          className="btn-glow inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground"
        >
          <span>🍥</span> Begin Your Ninja Training
        </button>
      </motion.div>

      <NinjaJourneyModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
