import { HeroSection } from "@/components/home/HeroSection";
import { TrustBadges } from "@/components/home/TrustBadges";
import { Categories } from "@/components/home/Categories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { WhyDevam } from "@/components/home/WhyDevam";
import { CustomerReviews } from "@/components/home/CustomerReviews";
import { ManufacturingProcess } from "@/components/home/ManufacturingProcess";
import { DistributorCTA } from "@/components/home/DistributorCTA";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <TrustBadges />
      <Categories />
      <FeaturedProducts />
      <WhyDevam />
      <CustomerReviews />
      <ManufacturingProcess />
      <DistributorCTA />
    </div>
  );
}
