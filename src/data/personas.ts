import type { PlatformId } from "@/data/platforms";

export type PersonaId = "riya" | "sam";

export type Persona = {
  id: PersonaId;
  name: string;
  label: string;
  platform: PlatformId;
  answers: [number, number, number, number, number, number];
};

export const personas: Record<PersonaId, Persona> = {
  riya: {
    id: "riya",
    name: "Riya",
    label: "Try as Riya (passive)",
    platform: "instagram",
    answers: [0, 0, 0, 0, 1, 0],
  },
  sam: {
    id: "sam",
    name: "Sam",
    label: "Try as Sam (deliberate)",
    platform: "instagram",
    answers: [2, 2, 2, 2, 1, 2],
  },
};
