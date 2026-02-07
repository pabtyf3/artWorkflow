import type { TableArchetypeConfig } from "./table.interface";

/**
 * Abstract output of a table archetype generator.
 * This is purely semantic and contains no geometry, materials, or tooling data.
 */
export type GeneratedTable = {
  /**
   * Detail tier applied uniformly to all generated parts.
   */
  detailTier: TableArchetypeConfig["detailTier"];
  /**
   * Generated supports (legs) descriptor.
   */
  supports: { kind: "supports" };
  /**
   * Generated surface (tabletop) descriptor.
   */
  surface: { kind: "surface" };
};

/**
 * Table archetype generator contract.
 * Guarantees deterministic, serializable output for a given input config.
 * Does not create geometry, materials, or any tool-specific instructions.
 */
export type TableArchetypeGenerator = (
  config: TableArchetypeConfig
) => GeneratedTable;

/**
 * Minimal deterministic table generator.
 * Reflects part presence only and copies the selected detail tier.
 */
export const generateTable: TableArchetypeGenerator = (
  config: TableArchetypeConfig
): GeneratedTable => ({
  detailTier: config.detailTier,
  supports: { kind: "supports" },
  surface: { kind: "surface" },
});
