import type { BedArchetypeConfig } from "./bed.interface";

/**
 * Abstract output of a bed archetype generator.
 * This is purely semantic and contains no geometry, materials, or tooling data.
 */
export type GeneratedBed = {
  /**
   * Detail tier applied uniformly to all generated parts.
   */
  detailTier: BedArchetypeConfig["detailTier"];
  /**
   * Generated sleep surface descriptor.
   */
  sleepSurface: { kind: "sleepSurface"; type: BedArchetypeConfig["sleepSurface"]["type"] };
  /**
   * Generated frame descriptor, if present in the input config.
   */
  frame?: { kind: "frame"; type: BedArchetypeConfig["frame"]["type"] };
};

/**
 * Bed archetype generator contract.
 * Guarantees deterministic, serializable output for a given input config.
 * Does not create geometry, materials, or any tool-specific instructions.
 */
export type BedArchetypeGenerator = (config: BedArchetypeConfig) => GeneratedBed;

/**
 * Minimal deterministic bed generator.
 * Reflects part presence only and copies the selected detail tier.
 */
export const generateBed: BedArchetypeGenerator = (
  config: BedArchetypeConfig
): GeneratedBed => {
  const result: GeneratedBed = {
    detailTier: config.detailTier,
    sleepSurface: { kind: "sleepSurface", type: config.sleepSurface.type },
  };

  if (config.frame) {
    result.frame = { kind: "frame", type: config.frame.type };
  }

  return result;
};
