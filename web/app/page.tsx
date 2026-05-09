import { Hero } from "@/components/site/hero";
import { FeaturedListings } from "@/components/site/featured-listings";
import { VideoShowcase } from "@/components/site/video-showcase";
import { AboutTeaser } from "@/components/site/about-teaser";
import { ContactCTA } from "@/components/site/contact-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedListings />
      <VideoShowcase />
      <AboutTeaser />
      <ContactCTA />
    </>
  );
}
