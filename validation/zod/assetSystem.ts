import { z } from "zod";

/**
 * Asset system schemas capture semantic identity only (no geometry or tooling data).
 */

const categoryIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9_]*$/)
  .describe("Lowercase category identifier.");

const archetypeIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/)
  .describe("Archetype identifier: <category>.<identity>.");

export const assetIdSchema = z
  .string()
  .regex(/^assets\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/)
  .describe("Asset identifier: assets.<category>.<identity>.");

const partIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9_]*$/)
  .describe("Semantic part identifier (lowercase, underscore allowed).");

const detailTierSchema = z
  .string()
  .regex(/^[a-z][a-z0-9_]*$/)
  .describe("Detail tier identifier.");

const variantSchema = z
  .string()
  .regex(/^[a-z][a-z0-9_]*$/)
  .describe("Variant identifier.");

export const partDefinitionSchema = z
  .object({
    id: partIdSchema,
    description: z.string().describe("Human-readable part description."),
    notes: z.string().optional().describe("Optional part notes."),
  })
  .passthrough();

export const archetypeDefinitionSchema = z
  .object({
    id: archetypeIdSchema,
    category: categoryIdSchema,
    description: z.string().describe("Archetype description."),
    allowed_parts: z
      .array(partIdSchema)
      .nonempty()
      .describe("Semantic parts the archetype can assemble."),
    supported_detail_tiers: z
      .array(detailTierSchema)
      .nonempty()
      .describe("Detail tiers supported by this archetype."),
    notes: z.string().optional().describe("Optional archetype notes."),
  })
  .passthrough()
  .superRefine((value, ctx) => {
    const expectedPrefix = `${value.category}.`;
    if (!value.id.startsWith(expectedPrefix)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["id"],
        message: `Archetype id must start with "${expectedPrefix}" to match category.`,
      });
    }
  });

export const assetDefinitionSchema = z
  .object({
    asset_id: assetIdSchema,
    category: categoryIdSchema,
    archetype: archetypeIdSchema,
    allowed_parts: z
      .array(partIdSchema)
      .nonempty()
      .describe("Parts allowed for this asset (subset of archetype parts)."),
    supported_detail_tiers: z
      .array(detailTierSchema)
      .nonempty()
      .describe("Supported detail tiers."),
    supported_variants: z
      .array(variantSchema)
      .default([])
      .describe("Optional bounded variants."),
    description: z.string().describe("Asset description."),
    notes: z.string().optional().describe("Optional asset notes."),
  })
  .passthrough()
  .superRefine((value, ctx) => {
    const expectedPrefix = `assets.${value.category}.`;
    if (!value.asset_id.startsWith(expectedPrefix)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["asset_id"],
        message: `Asset id must start with "${expectedPrefix}" to match category.`,
      });
    }
  });

export type AssetDefinition = z.infer<typeof assetDefinitionSchema>;
export type ArchetypeDefinition = z.infer<typeof archetypeDefinitionSchema>;
export type PartDefinition = z.infer<typeof partDefinitionSchema>;
