/**
 * Table archetype interface (semantic intent only).
 * This file intentionally omits geometry, dimensions, materials,
 * variants, and any tooling (Blender/DCC) concerns.
 */

/**
 * Shared detail tiers for table parts.
 * Tiers are monotonic and represent structural richness only.
 * The selected tier applies uniformly to all parts at generation time.
 */
export type DetailTier = "basic" | "profiled" | "carved";

/**
 * Semantic configuration for table supports (legs).
 * No geometry, dimensions, materials, or tooling are represented here.
 */
export interface SupportsConfig {}

/**
 * Semantic configuration for table surface (tabletop).
 * No geometry, dimensions, materials, or tooling are represented here.
 */
export interface SurfaceConfig {}

/**
 * Table archetype configuration.
 * Expresses only semantic intent and required parts.
 */
export interface TableArchetypeConfig {
  /**
   * Detail tier selected at generation time.
   * Applies uniformly to all table parts.
   * This does not encode style, materials, or variants.
   */
  detailTier: DetailTier;

  /** Required supports (legs) configuration. */
  supports: SupportsConfig;

  /** Required surface (tabletop) configuration. */
  surface: SurfaceConfig;
}
