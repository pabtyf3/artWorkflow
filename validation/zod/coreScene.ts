import { z } from "zod";
import { assetIdSchema } from "./assetSystem";

export const coreSceneSchema = z
  .object({
    scene: z
      .object({
        id: z.string().describe("Stable scene identifier."),
        title: z.string().describe("Human-readable scene title."),
        description: z.string().describe("Brief scene description."),
        tags: z.array(z.string()).describe("Freeform tags describing the scene."),
        mood: z.array(z.string()).describe("High-level mood descriptors."),
      })
      .passthrough(),
    view: z
      .object({
        type: z
          .enum([
            "text",
            "text_image",
            "scene_2_5d",
            "top_down",
            "isometric",
            "external_3d",
          ])
          .describe("View projection type."),
        variant: z.enum(["fixed", "free"]).describe("View variant."),
        camera_preset: z.string().describe("Named camera preset."),
      })
      .passthrough(),
    layout: z
      .object({
        grid: z
          .object({
            type: z.enum(["logical"]).describe("Grid type."),
            unit: z.enum(["meter"]).describe("Grid unit."),
            snap: z.boolean().describe("Whether snap-to-grid is enabled."),
          })
          .passthrough(),
        floors: z
          .array(
            z
              .object({
                id: z.string().describe("Floor identifier."),
                active: z.boolean().describe("Whether the floor is active."),
              })
              .passthrough()
          )
          .describe("Logical floors within the scene."),
        zones: z
          .array(
            z
              .object({
                id: z.string().describe("Zone identifier."),
                purpose: z.string().describe("Zone purpose."),
              })
              .passthrough()
          )
          .describe("Scene zones with purpose descriptions."),
      })
      .passthrough()
      .optional(),
    ergonomics: z
      .object({
        scale_profile: z
          .enum(["human_standard", "human_compact", "human_large"])
          .describe("Ergonomic scale profile."),
        door_height: z
          .enum(["low", "standard", "tall"])
          .describe("Door height profile."),
        stair_rise: z
          .enum(["shallow", "comfortable", "steep"])
          .describe("Stair rise profile."),
        reach: z
          .enum(["short", "human_average", "extended"])
          .describe("Reach profile."),
        clutter: z
          .enum(["none", "light", "medium", "heavy"])
          .describe("Clutter density profile."),
      })
      .passthrough()
      .optional(),
    assets: z
      .array(
        z
          .object({
            id: assetIdSchema.describe("Canonical asset identifier."),
            archetype: z.string().describe("Asset archetype name."),
            category: z.string().describe("Asset category."),
            floor: z.string().describe("Target floor identifier."),
            zone: z.string().describe("Target zone identifier."),
            state: z
              .object({})
              .passthrough()
              .describe("Asset state values."),
          })
          .passthrough()
      )
      .describe("Asset intent entries.")
      .optional(),
    lighting: z
      .object({
        time_of_day: z
          .enum(["dawn", "day", "dusk", "night"])
          .describe("Lighting time of day."),
        key_direction: z
          .enum(["left", "right", "front", "back"])
          .describe("Key light direction."),
        contrast: z
          .enum(["low", "medium", "high"])
          .describe("Lighting contrast intent."),
        fog: z
          .enum(["none", "light", "medium", "heavy"])
          .describe("Fog density intent."),
      })
      .passthrough()
      .optional(),
    style: z
      .object({
        theme: z.enum(["storybook_painterly"]).describe("Style theme identifier."),
        overrides: z
          .object({})
          .passthrough()
          .describe("Theme overrides."),
      })
      .passthrough()
      .optional(),
    output: z
      .object({
        targets: z
          .array(z.enum(["blender", "krita"]))
          .describe("Output target interpreters."),
        resolution: z
          .tuple([z.number().int().positive(), z.number().int().positive()])
          .describe("Output resolution [width, height]."),
        deterministic: z
          .boolean()
          .describe("Whether deterministic output is required."),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type CoreScene = z.infer<typeof coreSceneSchema>;
