import type { ArchitecturalStandards } from "./architecturalStandards.interface";
import type { ReferenceBody } from "./referenceBody.interface";

/**
 * WorldProfile bundles the human reference model with fixed architectural standards.
 * Consumers should use these profiles instead of embedding numbers inside archetypes.
 */
export interface WorldProfile {
  referenceBody: ReferenceBody;
  standards: ArchitecturalStandards;
}
