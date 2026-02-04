import { z } from "zod";

/**
 * Schema for validating the Asset Registry JSON file.
 * Enforces required identity and semantic fields while allowing forward-compatible extensions.
 */
const archetypeSchema = z
  .object({
    id: z.string().describe("Archetype identifier."),
    category: z.string().describe("Archetype category."),
    description: z.string().describe("Archetype description."),
    structural_parts: z
      .array(z.string())
      .nonempty()
      .describe("Semantic structural parts."),
    notes: z.string().optional().describe("Optional archetype notes."),
  })
  .passthrough();

const assetSchema = z
  .object({
    asset_id: z.string().describe("Asset identifier."),
    archetype: z.string().describe("Referenced archetype identifier."),
    supported_detail_tiers: z
      .array(z.string())
      .nonempty()
      .describe("Supported detail tiers."),
    supported_variants: z
      .array(z.string())
      .nonempty()
      .describe("Supported variants."),
    description: z.string().describe("Asset description."),
    notes: z.string().optional().describe("Optional asset notes."),
  })
  .passthrough();

export const assetRegistrySchema = z
  .object({
    registry_version: z
      .string()
      .regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/)
      .describe("Registry version (semver-like)."),
    archetypes: z.array(archetypeSchema).describe("Archetype definitions."),
    assets: z.array(assetSchema).describe("Asset definitions."),
  })
  .passthrough();

export type AssetRegistry = z.infer<typeof assetRegistrySchema>;
export type AssetRegistryArchetype = z.infer<typeof archetypeSchema>;
export type AssetRegistryAsset = z.infer<typeof assetSchema>;

type ValidationResult =
  | { ok: true; data: AssetRegistry }
  | { ok: false; issues: z.ZodIssue[] };

/**
 * Validate asset registry data without throwing, allowing callers to fall back safely.
 */
export const validateAssetRegistry = (input: unknown): ValidationResult => {
  const result = assetRegistrySchema.safeParse(input);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  return { ok: false, issues: result.error.issues };
};
