import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AboutSection from "@/features/public/components/landing/AboutSection";
import CertificateSection from "@/features/public/components/landing/CertificateSection";
import CourseFlowSection from "@/features/public/components/landing/CourseFlowSection";
import CtaSection from "@/features/public/components/landing/CtaSection";
import FeatureSection from "@/features/public/components/landing/FeatureSection";
import HeroSection from "@/features/public/components/landing/HeroSection";
import LandingFooter from "@/features/public/components/landing/LandingFooter";
import LandingNavbar from "@/features/public/components/landing/LandingNavbar";
import PortalSection from "@/features/public/components/landing/PortalSection";

export default function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const targetId = decodeURIComponent(location.hash.slice(1));
    const animationFrameId = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <LandingNavbar />

      <main>
        <HeroSection />
        <FeatureSection />
        <PortalSection />
        <CourseFlowSection />
        <CertificateSection />
        <AboutSection />
        <CtaSection />
      </main>

      <LandingFooter />
    </div>
  );
}
