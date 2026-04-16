import { motion } from "framer-motion";
import guardianWeak from "@/assets/guardian-weak.png";
import guardianMedium from "@/assets/guardian-medium.png";
import guardianStrong from "@/assets/guardian-strong.png";

const features = [
  {
    image: guardianWeak,
    title: "Beginner Shield",
    description: "Short & simple passwords are easy to crack. Your guardian is just starting out!",
    color: "bg-strength-weak/15 border-strength-weak/30",
    emoji: "😟",
  },
  {
    image: guardianMedium,
    title: "Rising Warrior",
    description: "Mix letters and numbers — your guardian gets stronger armor!",
    color: "bg-strength-medium/15 border-strength-medium/30",
    emoji: "💪",
  },
  {
    image: guardianStrong,
    title: "Legendary Hero",
    description: "Symbols + uppercase + length = UNSTOPPABLE! Full golden armor unlocked!",
    color: "bg-strength-strong/15 border-strength-strong/30",
    emoji: "🏆",
  },
];

export default function FeaturesSection() {
  return (
    <section className="gradient-features px-5 py-12">
      <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-foreground">
        ⚔️ Guardian Evolution
      </h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Stronger passwords = Stronger guardian!
      </p>

      <div className="mt-8 flex flex-col gap-5 max-w-lg mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ x: i % 2 === 0 ? -30 : 30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className={`card-anime flex items-center gap-4 p-4 border-2 ${f.color}`}
          >
            <img
              src={f.image}
              alt={f.title}
              width={512}
              height={512}
              loading="lazy"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-foreground">
                {f.emoji} {f.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
