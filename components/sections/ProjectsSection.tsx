import { PROJECTS } from "@/lib/content/projects";

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="scroll-mt-24 border-t border-accent/15 bg-base px-6 py-24 md:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <p className="font-heading text-2xl text-warm-light md:text-3xl">Selected work</p>
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
  );
}
