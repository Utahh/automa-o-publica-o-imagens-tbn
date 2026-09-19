import { Hero } from "../components/Hero";
import { LaunchBanner } from "../components/launch/LaunchBanner";
import { OpportunityBanner } from "../components/opportunity/OpportunityBanner";
import { FeaturedSection } from "../components/FeaturedSection";
import { MoreListingsSection } from "../components/MoreListingsSection";
import { ValuesSection } from "../components/ValuesSection";
import { AboutSection } from "../components/AboutSection";
import { CTASection } from "../components/CTASection";

export function Home() {
  return (
    <>
      <Hero />
      <LaunchBanner />
      <OpportunityBanner />
      <FeaturedSection />
      <MoreListingsSection />
      <ValuesSection />
      <AboutSection />
      <CTASection />
    </>
  );
}
