import type { GeneratedChair } from "../archetypes/chair.generator";
import type { GeneratedBed } from "../archetypes/bed.generator";
import type { GeneratedTable } from "../archetypes/table.generator";
import { baseHumanReference } from "../ergonomics/baseHumanReference";
import { resolvePhysicalIntent } from "../ergonomics/resolvePhysicalIntent";
import type { AdapterInput, GeneratedPartDescriptor } from "./adapter-input.interface";

const buildChairParts = (
  intent: GeneratedChair
): Record<string, GeneratedPartDescriptor> => {
  const parts: Record<string, GeneratedPartDescriptor> = {
    supports: { kind: intent.supports.kind },
    seat: { kind: intent.seat.kind },
    back: { kind: intent.back.kind },
  };

  if (intent.arms) {
    parts.arms = { kind: intent.arms.kind };
  }

  return parts;
};

const buildTableParts = (
  intent: GeneratedTable
): Record<string, GeneratedPartDescriptor> => ({
  supports: { kind: intent.supports.kind },
  surface: { kind: intent.surface.kind },
});

const buildBedParts = (
  intent: GeneratedBed
): Record<string, GeneratedPartDescriptor> => {
  const parts: Record<string, GeneratedPartDescriptor> = {
    sleepSurface: { kind: intent.sleepSurface.kind },
  };

  if (intent.frame) {
    parts.frame = { kind: intent.frame.kind };
  }

  return parts;
};

export const buildChairAdapterInput = (params: {
  assetId: string;
  intent: GeneratedChair;
  archetype?: "chair";
}): AdapterInput => {
  const archetype = params.archetype ?? "chair";
  const referenceBody = baseHumanReference();
  const physical = resolvePhysicalIntent(
    { archetype, intent: params.intent },
    referenceBody
  );

  if (archetype === "chair" && !physical) {
    throw new Error(
      "Chair adapter input missing physical resolution. " +
        "Ergonomics must be applied via buildChairAdapterInput."
    );
  }

  return {
    assetId: params.assetId,
    archetype,
    detailTier: params.intent.detailTier,
    parts: buildChairParts(params.intent),
    physical,
  };
};

export const buildTableAdapterInput = (params: {
  assetId: string;
  intent: GeneratedTable;
  archetype?: "table";
}): AdapterInput => {
  const archetype = params.archetype ?? "table";
  const referenceBody = baseHumanReference();
  const physical = resolvePhysicalIntent(
    { archetype, intent: params.intent },
    referenceBody
  );

  if (archetype === "table" && !physical) {
    throw new Error(
      "Table adapter input missing physical resolution. " +
        "Ergonomics must be applied via buildTableAdapterInput."
    );
  }

  return {
    assetId: params.assetId,
    archetype,
    detailTier: params.intent.detailTier,
    parts: buildTableParts(params.intent),
    physical,
  };
};

export const buildBedAdapterInput = (params: {
  assetId: string;
  intent: GeneratedBed;
  archetype?: "bed";
}): AdapterInput => {
  const archetype = params.archetype ?? "bed";
  const referenceBody = baseHumanReference();
  const physical = resolvePhysicalIntent(
    { archetype, intent: params.intent },
    referenceBody
  );

  if (archetype === "bed" && !physical) {
    throw new Error(
      "Bed adapter input missing physical resolution. " +
        "Ergonomics must be applied via buildBedAdapterInput."
    );
  }

  return {
    assetId: params.assetId,
    archetype,
    detailTier: params.intent.detailTier,
    parts: buildBedParts(params.intent),
    physical,
  };
};
