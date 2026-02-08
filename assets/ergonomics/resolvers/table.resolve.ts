import type { GeneratedTable } from "../../archetypes/table.generator";
import type { ReferenceBody } from "../referenceBody.interface";
import type { TablePhysicalResolution } from "../types/physicalResolution";

import { computeFootprint } from "../internal/footprint";
import { roundTo } from "../internal/roundTo";

export const resolveTablePhysical = (
  _intent: GeneratedTable,
  ctx: { referenceBody: ReferenceBody }
): TablePhysicalResolution => {
  const { referenceBody } = ctx;

  const surfaceHeight = roundTo(referenceBody.seatedElbowHeight + 0.03, 3);
  const clearanceHeight = roundTo(referenceBody.kneeHeight + 0.05, 3);
  const surfaceWidth = roundTo(referenceBody.shoulderWidth * 2.0, 3);
  const surfaceDepth = roundTo(referenceBody.armLength * 0.75, 3);

  const footprint = computeFootprint(surfaceWidth, surfaceDepth, 0.12);

  return {
    surfaceHeight,
    surfaceWidth,
    surfaceDepth,
    clearanceHeight,
    footprint,
  };
};
