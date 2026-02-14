import type { ReferenceBody } from "./referenceBody.interface";

/**
 * Returns a modern 50th percentile adult reference body in meters.
 * This is a neutral baseline used by ergonomics helpers; consumers should not hardcode values.
 */
export const baseHumanReference = (): ReferenceBody => ({
  standingHeight: 1.7,
  kneeHeight: 0.5,
  hipHeight: 0.9,
  standingEyeHeight: 1.6,
  seatedEyeHeight: 1.2,
  seatedElbowHeight: 0.75,
  shoulderWidth: 0.45,
  armLength: 0.65,
});
