import type { GeneratedBed } from "../../archetypes/bed.generator";
import type { ReferenceBody } from "../standards/referenceBody.interface";
import type { BedPhysicalResolution } from "../types/physicalResolution";

import { computeFootprint } from "../internal/footprint";
import { roundTo } from "../internal/roundTo";

export const resolveBedPhysical = (
  _intent: GeneratedBed,
  ctx: { referenceBody: ReferenceBody }
): BedPhysicalResolution => {
  const { referenceBody } = ctx;

  const mattressThickness = roundTo(0.22, 3);
  const clearanceUnder = roundTo(0.18, 3);
  const sleepingHeight = roundTo(clearanceUnder + mattressThickness, 3);

  const sleepingWidth = roundTo(referenceBody.shoulderWidth * 1.8, 3);
  const sleepingLength = roundTo(referenceBody.standingHeight + 0.25, 3);

  const totalHeight = sleepingHeight;
  const footprint = computeFootprint(sleepingWidth, sleepingLength, 0.12);

  return {
    sleepingHeight,
    sleepingWidth,
    sleepingLength,
    mattressThickness,
    clearanceUnder,
    totalHeight,
    footprint,
  };
};
