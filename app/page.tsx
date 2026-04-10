"use client";

import { InteriorExperience } from "@/components/InteriorExperience";
import { InteriorScrollCanvas } from "@/components/InteriorScrollCanvas";
import { Navbar } from "@/components/Navbar";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { ScrollProgressProvider } from "@/lib/scroll-context";
import { SITE } from "@/lib/siteConfig";
import { useScroll } from "framer-motion";
import { useRef } from "react";

export default function Home() {
  const scrollSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollSectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <ScrollProgressProvider value={scrollYProgress}>
      <Navbar />
      <main className="relative min-h-screen bg-base text-warm-light">
        <div
          ref={scrollSectionRef}
          className="relative"
          style={{ height: `${SITE.scrollLengthVh}vh` }}
        >
          <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
            <InteriorScrollCanvas />
            <InteriorExperience />
          </div>
        </div>

        <ProjectsSection />
        <AboutSection />
        <ContactSection />
      </main>
      <div className="grain-overlay" aria-hidden />
    </ScrollProgressProvider>
  );
}
