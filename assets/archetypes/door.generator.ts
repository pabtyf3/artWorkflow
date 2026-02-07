import type { DoorArchetypeConfig } from "./door.interface";

/**
 * Abstract output of a door archetype generator.
 * This is purely semantic and contains no geometry, materials, or tooling data.
 */
export type GeneratedDoor = {
  /**
   * Detail tier applied uniformly to all generated parts.
   */
  detailTier: DoorArchetypeConfig["detailTier"];
  /**
   * Generated frame descriptor.
   */
  frame: { kind: "frame" };
  /**
   * Generated panel descriptor.
   */
  panel: { kind: "panel" };
  /**
   * Generated handle descriptor, if present in the input config.
   */
  handle?: { kind: "handle" };
};

/**
 * Door archetype generator contract.
 * Guarantees deterministic, serializable output for a given input config.
 * Does not create geometry, materials, or any tool-specific instructions.
 */
export type DoorArchetypeGenerator = (
  config: DoorArchetypeConfig
) => GeneratedDoor;

/**
 * Minimal deterministic door generator.
 * Reflects part presence only and copies the selected detail tier.
 */
export const generateDoor: DoorArchetypeGenerator = (
  config: DoorArchetypeConfig
): GeneratedDoor => {
  const result: GeneratedDoor = {
    detailTier: config.detailTier,
    frame: { kind: "frame" },
    panel: { kind: "panel" },
  };

  if (config.handle) {
    result.handle = { kind: "handle" };
  }

  return result;
};
