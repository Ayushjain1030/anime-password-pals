import { useRef } from "react";
import { motion } from "framer-motion";
import mascotTips from "@/assets/mascot-tips.png";
import { Lock, Hash, Sparkles, BookOpen, KeyRound } from "lucide-react";

const tips = [
  {
    icon: Lock,
    title: "Length is Chakra",
    description: "Use at least 8 characters. Longer passwords = more powerful jutsu!",
    bgClass: "bg-kawaii-orange/10",
  },
  {
    icon: Hash,
    title: "Mix Your Jutsu",
    description: "Combine uppercase, lowercase, numbers, and symbols for max power!",
    bgClass: "bg-kawaii-blue/10",
  },
  {
    icon: Sparkles,
    title: "Unique Scrolls",
    description: "Never use the same password for different accounts — each scroll is sacred!",
    bgClass: "bg-kawaii-yellow/10",
  },
  {
    icon: BookOpen,
    title: "Secret Phrase Jutsu",
    description: "Try a fun sentence like 'My3CatsLove!Ramen' — easy to remember, hard to crack!",
    bgClass: "bg-kawaii-green/10",
  },
  {
    icon: KeyRound,
    title: "Guard Your Scroll",
    description: "Never share your password with strangers — only trusted senseis!",
    bgClass: "bg-kawaii-blue/10",
  },
];

export default function TipsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="gradient-tips px-5 py-12">
      <div className="flex items-center justify-center gap-3 mb-2">
        <img
          src={mascotTips}
          alt="Sensei mascot"
          width={512}
          height={512}
          loading="lazy"
          className="w-12 h-12 object-contain"
        />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          📜 Sensei's Tips
        </h2>
      </div>
      <p className="text-center text-sm text-muted-foreground mb-6">
        Swipe for ninja wisdom! →
      </p>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tips.map((tip, i) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`card-anime snap-center flex-shrink-0 w-64 sm:w-72 p-5 ${tip.bgClass}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-xl bg-primary/10 p-2">
                <tip.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground">{tip.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tip.description}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center gap-1.5 mt-4">
        {tips.map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-primary/30" />
        ))}
      </div>
    </section>
  );
}
