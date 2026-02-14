/**
 * ReferenceBody represents the canonical human measurements used by ergonomics helpers.
 * It exists so generation systems can derive consistent dimensions without hardcoding numbers.
 */
export interface ReferenceBody {
  /** Standing height from floor to top of head. */
  standingHeight: number;
  /** Knee height from floor to knee center. */
  kneeHeight: number;
  /** Hip height from floor to hip joint. */
  hipHeight: number;
  /** Standing eye height from floor to eye line. */
  standingEyeHeight: number;
  /** Seated eye height from floor to eye line. */
  seatedEyeHeight: number;
  /** Seated elbow height from floor to elbow. */
  seatedElbowHeight: number;
  /** Shoulder breadth (bi-acromial width). */
  shoulderWidth: number;
  /** Functional arm length from shoulder to fingertip. */
  armLength: number;
}
