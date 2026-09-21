import { HeroSection } from "@/components/home/HeroSection";
import { TrustBadges } from "@/components/home/TrustBadges";
import { FlagshipSpotlight } from "@/components/home/FlagshipSpotlight";
import { Categories } from "@/components/home/Categories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { WhyDevam } from "@/components/home/WhyDevam";
import { ManufacturingProcess } from "@/components/home/ManufacturingProcess";
import { DistributorCTA } from "@/components/home/DistributorCTA";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <TrustBadges />
      <FlagshipSpotlight />
      <Categories />
      <FeaturedProducts />
      <WhyDevam />
      <ManufacturingProcess />
      <DistributorCTA />
    </div>
  );
}
