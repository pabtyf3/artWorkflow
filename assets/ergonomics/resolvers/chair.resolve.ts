import type { GeneratedChair } from "../../archetypes/chair.generator";
import type { ReferenceBody } from "../standards/referenceBody.interface";
import type { ChairPhysicalResolution } from "../types/physicalResolution";

import { computeFootprint } from "../internal/footprint";
import { roundTo } from "../internal/roundTo";

export const resolveChairPhysical = (
  intent: GeneratedChair,
  options: { referenceBody: ReferenceBody }
): ChairPhysicalResolution => {
  const { referenceBody } = options;

  const seatHeight = roundTo(referenceBody.kneeHeight * 0.95, 3);
  const seatDepth = roundTo(referenceBody.hipHeight * 0.5, 3);
  const seatWidth = roundTo(referenceBody.shoulderWidth + 0.1, 3);

  const backHeight = roundTo(
    Math.max(0.4, referenceBody.seatedEyeHeight - seatHeight - 0.2),
    3
  );

  const armHeight = intent.arms
    ? roundTo(
        Math.max(0.18, referenceBody.seatedElbowHeight - seatHeight - 0.05),
        3
      )
    : undefined;

  const totalHeight = roundTo(seatHeight + backHeight, 3);
  const footprint = computeFootprint(seatWidth, seatDepth, 0.08);

  return {
    seatHeight,
    seatDepth,
    seatWidth,
    backHeight,
    armHeight,
    totalHeight,
    footprint,
  };
};
