import type { GeneratedChair } from "../archetypes/chair.generator";
import type { GeneratedBed } from "../archetypes/bed.generator";
import type { GeneratedTable } from "../archetypes/table.generator";
import type { ReferenceBody } from "./standards/referenceBody.interface";
import type {
  BedPhysicalResolution,
  ChairPhysicalResolution,
  TablePhysicalResolution,
} from "./types/physicalResolution";
import { resolveChairPhysical } from "./resolvers/chair.resolve";
import { resolveBedPhysical } from "./resolvers/bed.resolve";
import { resolveTablePhysical } from "./resolvers/table.resolve";

export type PhysicalIntentInput =
  | { archetype: "chair"; intent: GeneratedChair }
  | { archetype: "table"; intent: GeneratedTable }
  | { archetype: "bed"; intent: GeneratedBed }
  | { archetype: string; intent: unknown };

export const resolvePhysicalIntent = (
  input: PhysicalIntentInput,
  referenceBody: ReferenceBody
): ChairPhysicalResolution | TablePhysicalResolution | BedPhysicalResolution => {
  if (input.archetype === "chair") {
    return resolveChairPhysical(input.intent as GeneratedChair, { referenceBody });
  }

  if (input.archetype === "bed") {
    return resolveBedPhysical(input.intent as GeneratedBed, { referenceBody });
  }

  if (input.archetype === "table") {
    return resolveTablePhysical(input.intent as GeneratedTable, { referenceBody });
  }

  throw new Error(
    `Unsupported archetype for physical resolution: ${input.archetype}.`
  );
};
