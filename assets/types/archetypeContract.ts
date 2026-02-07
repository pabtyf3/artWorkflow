/**
 * Archetype generator contract (semantic only).
 * Implementations must not embed geometry or tool-specific data.
 */

export type ArchetypeGenerationInput = {
  assetId: string;
  archetypeId: string;
  requestedParts: string[];
  detailTier: string;
  variant?: string;
  notes?: string[];
};

export type ArchetypeGenerationResult =
  | {
      ok: true;
      archetypeId: string;
      summary: string;
      partsUsed: string[];
      artefactIds: string[];
      notes: string[];
    }
  | {
      ok: false;
      archetypeId: string;
      error: {
        code: string;
        message: string;
        details?: string[];
      };
    };

export type ArchetypeGeneratorContract = {
  archetypeId: string;
  allowedParts: string[];
  supportedDetailTiers: string[];
  generate: (input: ArchetypeGenerationInput) => ArchetypeGenerationResult;
};
