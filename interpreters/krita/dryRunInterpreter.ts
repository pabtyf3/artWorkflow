import { readFileSync } from "fs";
import { resolve } from "path";
import { CoreScene } from "../../validation/zod/coreScene";
import { KritaTheme, validateKritaTheme } from "../../validation/zod/kritaTheme";

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
    version: string | null;
    loadedResources: string[];
    scope: string;
    appliedOverrides: string[];
    ignoredOverrides: string[];
    warnings: string[];
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

type ResolvedTheme = {
  theme: KritaTheme | null;
  loadedResources: string[];
  warnings: string[];
};

const loadThemeFromDisk = (themeId: string): ResolvedTheme => {
  const warnings: string[] = [];
  const themePath = resolve(
    process.cwd(),
    "styles",
    "themes",
    themeId,
    "theme.json"
  );

  let raw: string;
  try {
    raw = readFileSync(themePath, "utf-8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    warnings.push(`Theme not found: ${themeId}. ${message}`);
    return { theme: null, loadedResources: [], warnings };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    warnings.push(`Theme JSON invalid for ${themeId}: ${message}`);
    return { theme: null, loadedResources: [], warnings };
  }

  const validation = validateKritaTheme(parsed);
  if (!validation.ok) {
    warnings.push(`Theme validation failed for ${themeId}.`);
    return { theme: null, loadedResources: [], warnings };
  }

  if (validation.data.target !== "krita") {
    warnings.push(`Theme target mismatch for ${themeId}: ${validation.data.target}.`);
    return { theme: null, loadedResources: [], warnings };
  }

  const loadedResources: string[] = [];
  if (validation.data.tools?.brush_presets) {
    loadedResources.push(...validation.data.tools.brush_presets);
  }
  if (validation.data.tools?.erasers) {
    loadedResources.push(...validation.data.tools.erasers);
  }
  if (validation.data.tools?.blending_modes) {
    loadedResources.push(...validation.data.tools.blending_modes);
  }
  if (validation.data.colour_guidance?.palette) {
    loadedResources.push(validation.data.colour_guidance.palette);
  }
  if (validation.data.texture_guidance?.allowed) {
    loadedResources.push(...validation.data.texture_guidance.allowed);
  }

  return { theme: validation.data, loadedResources, warnings };
};

const describeOverride = (path: string, value: unknown): string => {
  const renderedValue = typeof value === "string" ? value : JSON.stringify(value);
  return `${path}=${renderedValue}`;
};

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

  const styleThemeId = scene.style?.theme ?? null;
  const styleNotes: string[] = [];
  const styleWarnings: string[] = [];
  const appliedOverrides: string[] = [];
  const ignoredOverrides: string[] = [];

  let resolvedTheme: KritaTheme | null = null;
  let loadedResources: string[] = [];

  if (!styleThemeId) {
    styleNotes.push("No style.theme provided; using neutral defaults.");
    styleWarnings.push("Missing style.theme; using neutral tool availability.");
  } else {
    const resolved = loadThemeFromDisk(styleThemeId);
    resolvedTheme = resolved.theme;
    loadedResources = resolved.loadedResources;
    if (resolved.warnings.length > 0) {
      styleWarnings.push(...resolved.warnings);
    }
    if (!resolvedTheme) {
      styleNotes.push("Theme could not be resolved; using neutral defaults.");
    }
  }

  const overrides = scene.style?.overrides ?? {};
  if (resolvedTheme) {
    for (const [path, value] of Object.entries(overrides)) {
      const segments = path.split(".");
      if (segments.length !== 2) {
        ignoredOverrides.push(describeOverride(path, value));
        styleWarnings.push(`Ignored override (invalid path): ${path}.`);
        continue;
      }
      const [section, field] = segments;
      const sectionValue = (resolvedTheme as Record<string, unknown>)[section];
      if (!sectionValue || typeof sectionValue !== "object") {
        ignoredOverrides.push(describeOverride(path, value));
        styleWarnings.push(`Ignored override (unknown section): ${path}.`);
        continue;
      }
      if (!(field in (sectionValue as Record<string, unknown>))) {
        ignoredOverrides.push(describeOverride(path, value));
        styleWarnings.push(`Ignored override (unknown field): ${path}.`);
        continue;
      }
      appliedOverrides.push(describeOverride(path, value));
    }
  } else if (Object.keys(overrides).length > 0) {
    for (const [path, value] of Object.entries(overrides)) {
      ignoredOverrides.push(describeOverride(path, value));
    }
    styleWarnings.push("Scene overrides ignored because no valid theme is loaded.");
  }

  const styleThemePlan = {
    theme: resolvedTheme?.id ?? null,
    version: resolvedTheme?.version ?? null,
    loadedResources,
    scope: "Resources are made available only; no automatic application.",
    appliedOverrides,
    ignoredOverrides,
    warnings: styleWarnings,
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
