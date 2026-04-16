import { createFileRoute } from "@tanstack/react-router";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import InteractiveSection from "@/components/InteractiveSection";
import TipsSection from "@/components/TipsSection";
import StickyFooterCTA from "@/components/StickyFooterCTA";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Password Guardian — Learn Passwords Like a Hero!" },
      { name: "description", content: "A fun anime-themed app that teaches kids aged 6-12 how to create strong, safe passwords through interactive games and cute characters." },
      { property: "og:title", content: "Password Guardian — Learn Passwords Like a Hero!" },
      { property: "og:description", content: "A fun anime-themed app that teaches kids aged 6-12 how to create strong, safe passwords." },
    ],
  }),
});

function Index() {
  return (
    <main className="min-h-screen pb-24">
      <HeroSection />
      <FeaturesSection />
      <InteractiveSection />
      <TipsSection />
      <StickyFooterCTA />
    </main>
  );
}
