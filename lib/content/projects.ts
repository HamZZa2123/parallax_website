export type ProjectCard = {
  readonly title: string;
  readonly meta: string;
  readonly description: string;
};

export const PROJECTS: readonly ProjectCard[] = [
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
