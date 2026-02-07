import type { ChairArchetypeConfig } from "./chair.interface";

/**
 * Abstract output of a chair archetype generator.
 * This is purely semantic and contains no geometry, materials, or tooling data.
 */
export type GeneratedChair = {
  /**
   * Detail tier applied uniformly to all generated parts.
   */
  detailTier: ChairArchetypeConfig["detailTier"];
  /**
   * Generated supports (legs) descriptor.
   */
  supports: { kind: "supports" };
  /**
   * Generated seat descriptor.
   */
  seat: { kind: "seat" };
  /**
   * Generated back descriptor.
   */
  back: { kind: "back" };
  /**
   * Generated arms descriptor, if present in the input config.
   */
  arms?: { kind: "arms" };
};

/**
 * Chair archetype generator contract.
 * Guarantees deterministic, serializable output for a given input config.
 * Does not create geometry, materials, or any tool-specific instructions.
 */
export type ChairArchetypeGenerator = (
  config: ChairArchetypeConfig
) => GeneratedChair;

/**
 * Minimal deterministic chair generator.
 * Reflects part presence only and copies the selected detail tier.
 */
export const generateChair: ChairArchetypeGenerator = (
  config: ChairArchetypeConfig
): GeneratedChair => {
  const result: GeneratedChair = {
    detailTier: config.detailTier,
    supports: { kind: "supports" },
    seat: { kind: "seat" },
    back: { kind: "back" },
  };

  if (config.arms) {
    result.arms = { kind: "arms" };
  }

  return result;
};
