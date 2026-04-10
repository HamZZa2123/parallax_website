"use client";

import { InteriorExperience } from "@/components/InteriorExperience";
import { InteriorScrollCanvas } from "@/components/InteriorScrollCanvas";
import { Navbar } from "@/components/Navbar";
import { ScrollProgressProvider } from "@/lib/scroll-context";
import { SITE } from "@/lib/siteConfig";
import { useScroll } from "framer-motion";
import { useRef } from "react";

const PROJECTS = [
  {
    title: "Lakeside Residence",
    meta: "Residential · 2025",
    description: "Warm timber, soft daylight, and quiet restraint.",
  },
  {
    title: "Urban Loft",
    meta: "Renovation · 2024",
    description: "Volume recovered, light redirected, life re-centered.",
  },
  {
    title: "Studio Atelier",
    meta: "Workspace · 2024",
    description: "Minimal structure, tactile materials, focused calm.",
  },
];

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

        <section
          id="projects"
          className="scroll-mt-24 border-t border-accent/15 bg-base px-6 py-24 md:px-10"
        >
          <div className="mx-auto max-w-6xl">
            <p className="font-heading text-2xl text-warm-light md:text-3xl">
              Selected work
            </p>
            <p className="mt-3 max-w-xl font-body text-sm text-warm-light/65">
              Real projects, distilled to atmosphere and proportion.
            </p>
            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {PROJECTS.map((p) => (
                <article
                  key={p.title}
                  className="group border border-accent/10 bg-neutral/40 p-6 transition hover:border-accent/25"
                >
                  <h2 className="font-heading text-lg text-warm-light">{p.title}</h2>
                  <p className="mt-1 font-body text-xs uppercase tracking-wider text-accent/90">
                    {p.meta}
                  </p>
                  <p className="mt-4 font-body text-sm leading-relaxed text-warm-light/75">
                    {p.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="about"
          className="scroll-mt-24 border-t border-accent/15 bg-neutral/25 px-6 py-24 md:px-10"
        >
          <div className="mx-auto max-w-3xl">
            <p className="font-heading text-2xl text-warm-light md:text-3xl">
              About the studio
            </p>
            <p className="mt-8 font-body text-base leading-relaxed text-warm-light/80">
              {SITE.studioName} designs interiors as slow revelations: structure first,
              then material, then light, then life. Each project balances precision with
              warmth — spaces that feel grounded, human, and quietly cinematic.
            </p>
          </div>
        </section>

        <section
          id="contact"
          className="scroll-mt-24 border-t border-accent/15 bg-base px-6 py-24 md:px-10"
        >
          <div className="mx-auto max-w-xl">
            <p className="font-heading text-2xl text-warm-light md:text-3xl">
              Contact
            </p>
            <p className="mt-6 font-body text-sm text-warm-light/70">
              New projects, collaborations, or conversations about space.
            </p>
            <a
              href="mailto:hello@example.com"
              className="mt-8 inline-block font-body text-accent underline-offset-4 transition hover:text-warm-light"
            >
              hello@example.com
            </a>
          </div>
        </section>
      </main>
      <div className="grain-overlay" aria-hidden />
    </ScrollProgressProvider>
  );
}
