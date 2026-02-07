/**
 * Generic adapter input for realisation layers.
 * This is a fully serializable, archetype-agnostic description of a generated asset.
 * No geometry, materials, tooling, or layout data are represented here.
 */

/**
 * Minimal part descriptor emitted by archetype generators.
 * Part identity is preserved by key in the parts map.
 */
export type GeneratedPartDescriptor = {
  kind: string;
};

/**
 * Canonical adapter input for any generated asset.
 * Adapters must rely only on these fields and not on archetype configs.
 */
export interface AdapterInput {
  /**
   * Stable asset identifier (opaque to adapters).
   */
  assetId: string;
  /**
   * Archetype identifier or label (e.g. "chair", "table", "door").
   */
  archetype: string;
  /**
   * Selected detail tier for the generated output.
   */
  detailTier: string;
  /**
   * Generated semantic parts keyed by part identity.
   */
  parts: Record<string, GeneratedPartDescriptor>;
}
