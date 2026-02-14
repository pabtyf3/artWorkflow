import type { ReferenceBody } from "./referenceBody.interface";

/**
 * Ergonomic helper functions derive usable dimensions from a ReferenceBody.
 * Use these helpers instead of hardcoding numbers in archetypes or generators.
 */

/**
 * Seat height suitable for neutral seated posture.
 * Derived from knee height so the feet rest comfortably on the floor.
 */
export const seatHeight = (reference: ReferenceBody): number =>
  reference.kneeHeight * 0.95;

/**
 * Table height for general-purpose seated work.
 * Based on seated elbow height with a small clearance.
 */
export const tableHeight = (reference: ReferenceBody): number =>
  reference.seatedElbowHeight + 0.03;

/**
 * Comfortable corridor width for two-way pedestrian flow.
 * Derived from shoulder breadth with a conservative minimum.
 */
export const comfortableCorridorWidth = (reference: ReferenceBody): number =>
  Math.max(1.0, reference.shoulderWidth * 2.5);

/**
 * Minimum clear door width for single-person passage.
 * Derived from shoulder breadth with a conservative minimum.
 */
export const minimumDoorClearWidth = (reference: ReferenceBody): number =>
  Math.max(0.75, reference.shoulderWidth * 1.6);
