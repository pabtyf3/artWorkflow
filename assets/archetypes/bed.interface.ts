/**
 * Bed archetype interface (semantic intent only).
 * This file intentionally omits geometry, dimensions, materials,
 * variants, and any tooling (Blender/DCC) concerns.
 */

/**
 * Shared detail tiers for bed parts.
 * Tiers are monotonic and represent structural richness only.
 * The selected tier applies uniformly to all parts at generation time.
 */
export type DetailTier = "basic" | "profiled" | "carved";

/**
 * Semantic configuration for bed sleep surface.
 * No geometry, dimensions, materials, or tooling are represented here.
 */
export interface SleepSurfaceConfig {
  type: "mattress" | "pallet";
}

/**
 * Semantic configuration for bed frame (optional).
 * No geometry, dimensions, materials, or tooling are represented here.
 */
export interface FrameConfig {
  type: "low" | "standard";
}

/**
 * Bed archetype configuration.
 * Expresses only semantic intent and required parts.
 */
export interface BedArchetypeConfig {
  /**
   * Detail tier selected at generation time.
   * Applies uniformly to all bed parts.
   * This does not encode style, materials, or variants.
   */
  detailTier: DetailTier;

  /** Required sleep surface configuration. */
  sleepSurface: SleepSurfaceConfig;

  /** Optional frame configuration. */
  frame?: FrameConfig;
}
