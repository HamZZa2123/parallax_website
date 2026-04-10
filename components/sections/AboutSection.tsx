import { SITE } from "@/lib/siteConfig";

export function AboutSection() {
  return (
    <section
      id="about"
      className="scroll-mt-24 border-t border-accent/15 bg-neutral/25 px-6 py-24 md:px-10"
    >
      <div className="mx-auto max-w-3xl">
        <p className="font-heading text-2xl text-warm-light md:text-3xl">About the studio</p>
        <p className="mt-8 font-body text-base leading-relaxed text-warm-light/80">
          {SITE.studioName} designs interiors as slow revelations: structure first, then material,
          then light, then life. Each project balances precision with warmth — spaces that feel
          grounded, human, and quietly cinematic.
        </p>
      </div>
    </section>
  );
}
