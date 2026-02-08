import { roundTo } from "./roundTo";

export const computeFootprint = (
  width: number,
  depth: number,
  margin: number,
  precision = 3
): { width: number; depth: number } => ({
  width: roundTo(width + margin, precision),
  depth: roundTo(depth + margin, precision),
});
