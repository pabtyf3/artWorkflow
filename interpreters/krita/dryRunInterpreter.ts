import { CoreScene } from "../../validation/zod/coreScene";

export interface KritaDryRunWorkspacePlan {
  documentOverview: {
    sceneId: string;
    sceneTitle: string;
    outputResolution: {
      width: number | null;
      height: number | null;
    };
    colorSpace: string;
    bitDepth: string;
    notes: string[];
  };
  layerHierarchy: Array<{
    name: string;
    purpose: string;
    children?: Array<{
      name: string;
      purpose: string;
    }>;
  }>;
  assetLayerMapping: Array<{
    assetId: string;
    archetype: string;
    assignedGroup: string;
    representationType: "silhouette" | "value block" | "guide shape" | "blender reference";
    notes: string[];
  }>;
  styleThemePlan: {
    theme: string | null;
    loadedResources: string[];
    scope: string;
    notes: string[];
  };
  lightingMoodPlan: {
    layers: Array<{ name: string; purpose: string }>;
    notes: string[];
  };
  blenderReferenceUsage: {
    enabled: boolean;
    referencesUsed: string[];
    incorporation: string[];
    notes: string[];
  };
  warnings: string[];
}

const KNOWN_THEMES = ["storybook_painterly"] as const;

/**
 * Build a deterministic, inspectable workspace plan for Krita without side effects.
 * The input scene is treated as validated and read-only.
 */
export function dryRunKritaInterpreter(
  scene: CoreScene,
  options?: {
    includeBlenderReference?: boolean;
    blenderDryRunPlan?: unknown;
  }
): KritaDryRunWorkspacePlan {
  const warnings: string[] = [];
  const notes: string[] = [];
  const includeBlenderReference = options?.includeBlenderReference ?? false;
  const blenderPlanProvided = Boolean(options?.blenderDryRunPlan);

  const resolution = scene.output?.resolution ?? null;
  if (!resolution) {
    notes.push("Output resolution not provided; leaving resolution unspecified.");
    warnings.push("Missing output.resolution; Krita document size is unspecified.");
  }

  const colorSpace = "RGBA (default)";
  const bitDepth = "16-bit (default)";

  const zones = scene.layout?.zones ?? [];
  const zoneGroups = zones.map((zone) => ({
    name: zone.id,
    purpose: `Assets assigned to zone: ${zone.id}.`,
  }));

  const layerHierarchy: KritaDryRunWorkspacePlan["layerHierarchy"] = [
    {
      name: "Guides",
      purpose: "Non-destructive guide layers for layout reference.",
      children: includeBlenderReference
        ? [
            {
              name: "Blender Reference",
              purpose: "Imported guide references (read-only).",
            },
          ]
        : undefined,
    },
    {
      name: "Assets",
      purpose: "Asset placeholders grouped by intent.",
      children: zoneGroups.length > 0
        ? zoneGroups
        : [
            {
              name: "Unsorted",
              purpose: "Assets without explicit zone grouping.",
            },
          ],
    },
    {
      name: "Lighting",
      purpose: "Symbolic lighting and mood guides.",
    },
    {
      name: "Effects",
      purpose: "Non-destructive atmosphere and adjustment guides.",
    },
  ];

  const assetLayerMapping = (scene.assets ?? []).map((asset) => {
    const assignedGroup = zones.find((zone) => zone.id === asset.zone)
      ? `Assets/${asset.zone}`
      : "Assets/Unsorted";

    if (!asset.zone) {
      warnings.push(`Asset ${asset.id} has no zone; assigned to Assets/Unsorted.`);
    }

    const representationType: KritaDryRunWorkspacePlan["assetLayerMapping"][number]["representationType"] =
      includeBlenderReference && blenderPlanProvided
        ? "blender reference"
        : "guide shape";

    return {
      assetId: asset.id,
      archetype: asset.archetype,
      assignedGroup,
      representationType,
      notes: [
        "No spatial or layout decisions are made here.",
        "Representation remains a placeholder for paint-over.",
      ],
    };
  });

  const styleTheme = scene.style?.theme ?? null;
  const styleNotes: string[] = [];
  if (!styleTheme) {
    styleNotes.push("No style.theme provided; using neutral defaults.");
    warnings.push("Missing style.theme; using neutral tool availability.");
  } else if (!KNOWN_THEMES.includes(styleTheme as typeof KNOWN_THEMES[number])) {
    warnings.push(`Unsupported style theme: ${styleTheme}. Using neutral defaults.`);
    styleNotes.push("Theme is unsupported; no theme resources loaded.");
  }

  const styleThemePlan = {
    theme: styleTheme && KNOWN_THEMES.includes(styleTheme as typeof KNOWN_THEMES[number])
      ? styleTheme
      : null,
    loadedResources:
      styleTheme && KNOWN_THEMES.includes(styleTheme as typeof KNOWN_THEMES[number])
        ? ["brush presets", "colour palettes", "texture sets"]
        : [],
    scope: "Resources are made available only; no automatic application.",
    notes: styleNotes,
  };

  const lightingNotes: string[] = [];
  const lightingLayers: Array<{ name: string; purpose: string }> = [
    { name: "Key Light Guide", purpose: "Symbolic key light direction." },
    { name: "Shadow Guide", purpose: "Symbolic shadow guidance." },
    { name: "Atmosphere Guide", purpose: "Symbolic fog or mood guidance." },
  ];

  if (!scene.lighting) {
    lightingNotes.push("No lighting intent provided; using neutral lighting guides.");
    lightingNotes.push(
      "Lighting guide layers are created by default for consistency across scenes."
    );
    warnings.push("Missing lighting intent; lighting guides remain neutral.");
  } else {
    lightingNotes.push(`time_of_day: ${scene.lighting.time_of_day}`);
    lightingNotes.push(`key_direction: ${scene.lighting.key_direction}`);
    lightingNotes.push(`contrast: ${scene.lighting.contrast}`);
    lightingNotes.push(`fog: ${scene.lighting.fog}`);
  }

  const blenderReferenceUsage = {
    enabled: includeBlenderReference,
    referencesUsed: includeBlenderReference && blenderPlanProvided ? ["blenderDryRunPlan"] : [],
    incorporation: includeBlenderReference && blenderPlanProvided
      ? ["Guide layers only", "No layout modifications"]
      : [],
    notes: [] as string[],
  };

  if (includeBlenderReference && !blenderPlanProvided) {
    warnings.push("Blender reference requested but no blenderDryRunPlan provided.");
    blenderReferenceUsage.notes.push("Blender reference disabled due to missing plan.");
  }

  if (!includeBlenderReference && blenderPlanProvided) {
    warnings.push("Blender dry-run plan provided but includeBlenderReference is false; ignoring input.");
  }

  return {
    documentOverview: {
      sceneId: scene.scene.id,
      sceneTitle: scene.scene.title,
      outputResolution: {
        width: resolution ? resolution[0] : null,
        height: resolution ? resolution[1] : null,
      },
      colorSpace,
      bitDepth,
      notes,
    },
    layerHierarchy,
    assetLayerMapping,
    styleThemePlan,
    lightingMoodPlan: {
      layers: lightingLayers,
      notes: lightingNotes,
    },
    blenderReferenceUsage,
    warnings,
  };
}
