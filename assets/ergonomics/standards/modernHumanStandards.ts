import type { ArchitecturalStandards } from "./architecturalStandards.interface";

/**
 * Common residential architectural defaults in meters.
 * These are fixed standards, not derived from the reference body.
 */
export const modernHumanStandards: ArchitecturalStandards = {
  doorHeight: 2.0,
  doorWidth: 0.8,
  corridorMinWidth: 1.0,
  ceilingHeight: 2.4,
  stairRise: 0.18,
  stairTread: 0.28,
};
