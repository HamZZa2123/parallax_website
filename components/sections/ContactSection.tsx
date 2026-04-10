export function ContactSection() {
  return (
    <section
      id="contact"
      className="scroll-mt-24 border-t border-accent/15 bg-base px-6 py-24 md:px-10"
    >
      <div className="mx-auto max-w-xl">
        <p className="font-heading text-2xl text-warm-light md:text-3xl">Contact</p>
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
  );
}
