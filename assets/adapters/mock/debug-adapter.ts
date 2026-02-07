import type { AdapterInput } from "../adapter-input.interface";

export type DebugAdapterSummary = {
  assetId: string;
  archetype: string;
  detailTier: string;
  parts: Array<{ id: string; kind: string }>;
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
export const debugAdapterSummary = (input: AdapterInput): DebugAdapterSummary => ({
  assetId: input.assetId,
  archetype: input.archetype,
  detailTier: input.detailTier,
  parts: normalizeParts(input.parts),
});

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

  for (const part of normalizeParts(input.parts)) {
    lines.push(`- ${part.id} (${part.kind})`);
  }

  return lines.join("\n");
};
