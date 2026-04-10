export type InteriorPhase = {
  id: "empty" | "forming" | "design" | "final";
  start: number;
  end: number;
  lines: readonly [string, string];
  align: string;
};

export function createInteriorPhases(studioName: string): readonly InteriorPhase[] {
  return [
    {
      id: "empty",
      start: 0,
      end: 0.25,
      lines: ["Space begins", "Silence. Volume. Light."],
      align: "items-end justify-start text-left pb-10 pl-6 md:pl-10",
    },
    {
      id: "forming",
      start: 0.25,
      end: 0.6,
      lines: ["Material emerges", "Light finds surfaces"],
      align: "items-start justify-end text-right pr-6 pt-10 md:pr-10",
    },
    {
      id: "design",
      start: 0.6,
      end: 0.85,
      lines: ["Function meets emotion", "Living takes shape"],
      align: "items-end justify-end text-right pb-10 pr-6 md:pr-10",
    },
    {
      id: "final",
      start: 0.85,
      end: 1,
      lines: ["Designed for living", studioName] as const,
      align: "items-start justify-start text-left pt-10 pl-6 md:pl-10",
    },
  ];
}
