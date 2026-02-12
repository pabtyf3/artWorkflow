import { ReferenceBody } from "./referenceBody.interface";

export const baseHumanReference = (): ReferenceBody => ({
  standingHeight: 1.7,
  kneeHeight: 0.46,
  
  hipHeight: 0.9,
  standingEyeHeight: 1.6,
  seatedEyeHeight: 1.2,
  seatedElbowHeight: 0.7,
  shoulderWidth: 0.45,
  armLength: 0.65,
});
