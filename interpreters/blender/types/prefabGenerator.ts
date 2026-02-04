export type PrefabPlan = {
  prefabKey: string;
  detailTier: string;
  variant: string;
  notes: string[];
};

export type PrefabGenerationInput = {
  prefabKey: string;
  assetId: string;
  archetypeId: string;
  structuralParts: string[];
  detailTier: string;
  variant: string;
  ergonomicsProfile: string;
  destinationScale: string;
};

export type PrefabGenerationResult =
  | {
      ok: true;
      prefabKey: string;
      created: {
        summary: string;
        artefactIds: string[];
        notes: string[];
      };
    }
  | {
      ok: false;
      prefabKey: string;
      error: {
        code: string;
        message: string;
        details?: string[];
      };
    };
