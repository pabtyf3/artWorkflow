import { z } from "zod";
import {
  archetypeDefinitionSchema,
  assetDefinitionSchema,
  partDefinitionSchema,
} from "./assetSystem";

/**
 * Schema for validating the Asset Registry JSON file.
 * Enforces semantic identity while allowing forward-compatible extensions.
 */
const archetypeSchema = archetypeDefinitionSchema;
const assetSchema = assetDefinitionSchema;
const partSchema = partDefinitionSchema;

export const assetRegistrySchema = z
  .object({
    registry_version: z
      .string()
      .regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/)
      .describe("Registry version (semver-like)."),
    parts: z.array(partSchema).describe("Reusable semantic part definitions."),
    archetypes: z.array(archetypeSchema).describe("Archetype definitions."),
    assets: z.array(assetSchema).describe("Asset definitions."),
  })
  .passthrough()
  // Enforce semantic truth: assets can only use known parts supported by their archetype.
  .superRefine((registry, ctx) => {
    const partsById = new Set(registry.parts.map((part) => part.id));
    const archetypesById = new Map(
      registry.archetypes.map((archetype) => [archetype.id, archetype])
    );

    registry.assets.forEach((asset, assetIndex) => {
      const archetype = archetypesById.get(asset.archetype);
      if (!archetype) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["assets", assetIndex, "archetype"],
          message: `Unknown archetype "${asset.archetype}" for asset "${asset.asset_id}".`,
        });
      }

      asset.allowed_parts.forEach((partId, partIndex) => {
        if (!partsById.has(partId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["assets", assetIndex, "allowed_parts", partIndex],
            message: `Unknown part "${partId}" in asset "${asset.asset_id}".`,
          });
        }

        if (archetype && !archetype.allowed_parts.includes(partId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["assets", assetIndex, "allowed_parts", partIndex],
            message:
              `Part "${partId}" is not supported by archetype "${asset.archetype}".`,
          });
        }
      });
    });
  });

export type AssetRegistry = z.infer<typeof assetRegistrySchema>;
export type AssetRegistryPart = z.infer<typeof partSchema>;
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
