import { Hero } from "../components/Hero";
import { FeaturedSection } from "../components/FeaturedSection";
import { MoreListingsSection } from "../components/MoreListingsSection";
import { ValuesSection } from "../components/ValuesSection";
import { AboutSection } from "../components/AboutSection";
import { CTASection } from "../components/CTASection";

export function Home() {
  return (
    <>
      <Hero />
      <FeaturedSection />
      <MoreListingsSection />
      <ValuesSection />
      <AboutSection />
      <CTASection />
    </>
  );
}
