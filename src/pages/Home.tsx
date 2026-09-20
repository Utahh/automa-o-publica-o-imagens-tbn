import { Hero } from "../components/Hero";
import { LaunchBanner } from "../components/launch/LaunchBanner";
import { OpportunityBanner } from "../components/opportunity/OpportunityBanner";
import { FeaturedSection } from "../components/FeaturedSection";
import { MoreListingsSection } from "../components/MoreListingsSection";
import { ValuesSection } from "../components/ValuesSection";
import { AboutSection } from "../components/AboutSection";
import { CTASection } from "../components/CTASection";
import { useSeo } from "../hooks/useSeo";

export function Home() {
  useSeo({
    description:
      "Toninho Bomnome, corretor de imóveis CRECI 247711-F em Botucatu/SP. Casas e apartamentos à venda e para alugar, com a planta toda na mesa antes da visita.",
  });
  return (
    <>
      <Hero />
      <FeaturedSection />
      <LaunchBanner />
      <OpportunityBanner />
      <MoreListingsSection />
      <ValuesSection />
      <AboutSection />
      <CTASection />
    </>
  );
}
