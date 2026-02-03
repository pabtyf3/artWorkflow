import { z } from "zod";

/**
 * Schema for validating Krita style theme JSON files.
 * The schema enforces required metadata, while all other sections are optional.
 * Unknown keys are allowed to preserve forward compatibility.
 */
export const kritaThemeSchema = z
  .object({
    id: z.string().describe("Theme identifier."),
    name: z.string().describe("Human-readable theme name."),
    version: z
      .string()
      .regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/)
      .describe("Semver version string."),
    description: z.string().describe("Theme description."),
    target: z.literal("krita").describe("Target interpreter."),
    tools: z
      .object({
        brush_presets: z.array(z.string()).optional(),
        erasers: z.array(z.string()).optional(),
        blending_modes: z.array(z.string()).optional(),
      })
      .passthrough()
      .optional()
      .describe("Tool availability guidance."),
    colour_guidance: z
      .object({
        palette: z.string().optional(),
        value_range: z.string().optional(),
        contrast: z.string().optional(),
        saturation: z.string().optional(),
      })
      .passthrough()
      .optional()
      .describe("Colour and value guidance."),
    texture_guidance: z
      .object({
        allowed: z.array(z.string()).optional(),
        usage_notes: z.string().optional(),
      })
      .passthrough()
      .optional()
      .describe("Texture and surface guidance."),
    workflow_hints: z
      .object({
        preferred_layers: z.array(z.string()).optional(),
        separate_lighting: z.boolean().optional(),
        notes: z.string().optional(),
      })
      .passthrough()
      .optional()
      .describe("Workflow and layer hints."),
    restrictions: z
      .object({
        disallowed_tools: z.array(z.string()).optional(),
        notes: z.string().optional(),
      })
      .passthrough()
      .optional()
      .describe("Optional restrictions to preserve consistency."),
  })
  .passthrough();

export type KritaTheme = z.infer<typeof kritaThemeSchema>;

type ValidationResult =
  | { ok: true; data: KritaTheme }
  | { ok: false; issues: z.ZodIssue[] };

/**
 * Validate a theme payload without throwing. Callers can inspect issues and
 * fall back to neutral defaults when validation fails.
 */
export const validateKritaTheme = (input: unknown): ValidationResult => {
  const result = kritaThemeSchema.safeParse(input);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  return { ok: false, issues: result.error.issues };
};
