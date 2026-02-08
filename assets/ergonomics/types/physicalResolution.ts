export type ChairPhysicalResolution = {
  /** Floor to seat surface. */
  seatHeight: number;
  /** Front-to-back seat depth. */
  seatDepth: number;
  /** Left-to-right seat width. */
  seatWidth: number;
  /** Height of backrest above seat surface. */
  backHeight?: number;
  /** Height of armrest above seat surface (if present). */
  armHeight?: number;
  /** Floor to top of the chair. */
  totalHeight: number;
  /** Footprint on the ground plane. */
  footprint: { width: number; depth: number };
};

export type TablePhysicalResolution = {
  /** Floor to table surface. */
  surfaceHeight: number;
  /** Left-to-right surface width. */
  surfaceWidth: number;
  /** Front-to-back surface depth. */
  surfaceDepth: number;
  /** Floor to underside clearance. */
  clearanceHeight: number;
  /** Footprint on the ground plane. */
  footprint: { width: number; depth: number };
};

export type BedPhysicalResolution = {
  /** Top of mattress from floor. */
  sleepingHeight: number;
  sleepingWidth: number;
  sleepingLength: number;
  mattressThickness: number;
  /** Clearance below frame. */
  clearanceUnder: number;
  /** Frame + mattress height. */
  totalHeight: number;
  /** Footprint on the ground plane. */
  footprint: { width: number; depth: number };
};
