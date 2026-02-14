/**
 * ArchitecturalStandards captures fixed building dimensions that should not
 * be derived from a human reference each time. These are stable, code-level defaults.
 */
export interface ArchitecturalStandards {
  /** Door clear height (floor to underside of head jamb). */
  doorHeight: number;
  /** Door clear width (opening width). */
  doorWidth: number;
  /** Minimum corridor width for circulation. */
  corridorMinWidth: number;
  /** Typical ceiling height for residential spaces. */
  ceilingHeight: number;
  /** Stair rise (vertical step height). */
  stairRise: number;
  /** Stair tread (horizontal depth). */
  stairTread: number;
}
