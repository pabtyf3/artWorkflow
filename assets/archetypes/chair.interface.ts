/**
 * Chair archetype interface (semantic intent only).
 * This file intentionally omits geometry, dimensions, materials,
 * variants, and any tooling (Blender/DCC) concerns.
 */

/**
 * Shared detail tiers for chair parts.
 * Tiers are monotonic and represent structural richness only.
 * The selected tier applies uniformly to all parts at generation time.
 */
export type DetailTier = "basic" | "profiled" | "carved";

/**
 * Semantic configuration for chair supports (legs).
 * No geometry, dimensions, materials, or tooling are represented here.
 */
export interface SupportsConfig {}

/**
 * Semantic configuration for chair seat.
 * No geometry, dimensions, materials, or tooling are represented here.
 */
export interface SeatConfig {}

/**
 * Semantic configuration for chair back.
 * No geometry, dimensions, materials, or tooling are represented here.
 */
export interface BackConfig {}

/**
 * Semantic configuration for chair arms (optional part).
 * No geometry, dimensions, materials, or tooling are represented here.
 */
export interface ArmsConfig {}

/**
 * Chair archetype configuration.
 * Expresses only semantic intent and required parts.
 */
export interface ChairArchetypeConfig {
  /**
   * Detail tier selected at generation time.
   * Applies uniformly to all chair parts.
   * This does not encode style, materials, or variants.
   */
  detailTier: DetailTier;

  /** Required supports (legs) configuration. */
  supports: SupportsConfig;

  /** Required seat configuration. */
  seat: SeatConfig;

  /** Required back configuration. */
  back: BackConfig;

  /** Optional arms configuration. */
  arms?: ArmsConfig;
}
