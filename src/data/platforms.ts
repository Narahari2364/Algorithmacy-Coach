export const platformIds = ["instagram", "uber", "email"] as const;

export type PlatformId = (typeof platformIds)[number];

export type Platform = {
  id: PlatformId;
  name: string;
  app: string;
  counterpart: string;
  blurb: string;
  diagram: { U: string; A: string; C: string };
};

export const platforms: Platform[] = [
  {
    id: "instagram",
    name: "Instagram",
    app: "Instagram",
    counterpart: "your audience",
    blurb:
      "You post. A feed ranker reads you and your audience, then both of you update from the ranker.",
    diagram: { U: "You", A: "Ranker", C: "Audience" },
  },
  {
    id: "uber",
    name: "Uber",
    app: "Uber",
    counterpart: "riders",
    blurb:
      "You go online. Dispatch reads you and the rider. The rider's next state also depends on you.",
    diagram: { U: "You", A: "Dispatch", C: "Rider" },
  },
  {
    id: "email",
    name: "Email",
    app: "Email",
    counterpart: "the people you write to",
    blurb:
      "A comparison case. The server copies the sender onward. The sender keeps its own state and does not read the recipient.",
    diagram: { U: "You", A: "Server", C: "Recipient" },
  },
];

export function getPlatform(id: PlatformId) {
  const platform = platforms.find((item) => item.id === id);
  if (!platform) throw new Error(`Unknown platform: ${id}`);
  return platform;
}

export function isPlatformId(value: unknown): value is PlatformId {
  return typeof value === "string" && (platformIds as readonly string[]).includes(value);
}
