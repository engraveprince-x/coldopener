import dynamic from "next/dynamic";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowSection from "@/components/landing/HowSection";
import DemoSection from "@/components/landing/DemoSection";
import PricingSection from "@/components/landing/PricingSection";
import FooterSection from "@/components/landing/FooterSection";

const WebGLCanvas = dynamic(
  () => import("@/components/webgl/WebGLCanvas"),
  { ssr: false },
);

export default function HomePage() {
  return (
    <>
      <WebGLCanvas />
      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <HowSection />
        <DemoSection />
        <PricingSection />
        <FooterSection />
      </main>
    </>
  );
}
