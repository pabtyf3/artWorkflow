/**
 * Door archetype interface (semantic intent only).
 * This file intentionally omits geometry, dimensions, materials,
 * variants, and any tooling (Blender/DCC) concerns.
 */

/**
 * Shared detail tiers for door parts.
 * Tiers are monotonic and represent structural richness only.
 * The selected tier applies uniformly to all parts at generation time.
 */
export type DetailTier = "basic" | "profiled" | "carved";

/**
 * Semantic configuration for door frame.
 * No geometry, dimensions, materials, or tooling are represented here.
 */
export interface FrameConfig {}

/**
 * Semantic configuration for door panel.
 * No geometry, dimensions, materials, or tooling are represented here.
 */
export interface PanelConfig {}

/**
 * Semantic configuration for door handle (optional part).
 * No geometry, dimensions, materials, or tooling are represented here.
 */
export interface HandleConfig {}

/**
 * Door archetype configuration.
 * Expresses only semantic intent and required parts.
 */
export interface DoorArchetypeConfig {
  /**
   * Detail tier selected at generation time.
   * Applies uniformly to all door parts.
   * This does not encode style, materials, or variants.
   */
  detailTier: DetailTier;

  /** Required frame configuration. */
  frame: FrameConfig;

  /** Required panel configuration. */
  panel: PanelConfig;

  /** Optional handle configuration. */
  handle?: HandleConfig;
}
