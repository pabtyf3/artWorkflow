import type { AdapterInput } from "../adapter-input.interface";

export type DebugAdapterSummary = {
  assetId: string;
  archetype: string;
  detailTier: string;
  parts: Array<{ id: string; kind: string }>;
  physical?: unknown;
};

const normalizeParts = (
  parts: AdapterInput["parts"]
): Array<{ id: string; kind: string }> =>
  Object.keys(parts)
    .sort()
    .map((id) => ({ id, kind: parts[id].kind }));

/**
 * Deterministic, human-readable summary of an adapter input.
 * Uses only opaque fields and explicit key ordering.
 */
export const debugAdapterSummary = (input: AdapterInput): DebugAdapterSummary => {
  const summary: DebugAdapterSummary = {
    assetId: input.assetId,
    archetype: input.archetype,
    detailTier: input.detailTier,
    parts: normalizeParts(input.parts),
  };

  if (
    (input.archetype === "chair" ||
      input.archetype === "table" ||
      input.archetype === "bed") &&
    input.physical
  ) {
    summary.physical = input.physical;
  }

  return summary;
};

/**
 * Deterministic ASCII output for quick inspection.
 */
export const debugAdapterAscii = (input: AdapterInput): string => {
  const lines = [
    `asset: ${input.assetId}`,
    `archetype: ${input.archetype}`,
    `detailTier: ${input.detailTier}`,
    "parts:",
  ];
  if (
    (input.archetype === "chair" ||
      input.archetype === "table" ||
      input.archetype === "bed") &&
    input.physical
  ) {
    lines.push(`physical: ${JSON.stringify(input.physical)}`);
  }

  for (const part of normalizeParts(input.parts)) {
    lines.push(`- ${part.id} (${part.kind})`);
  }

  return lines.join("\n");
};
