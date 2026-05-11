import { Hero } from "@/components/site/hero";
import { FeaturedCollection } from "@/components/site/featured-collection";
import { VideoShowcase } from "@/components/site/video-showcase";
import { AboutTeaser } from "@/components/site/about-teaser";
import { ContactCTA } from "@/components/site/contact-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCollection />
      <VideoShowcase />
      <AboutTeaser />
      <ContactCTA />
    </>
  );
}
