import type { ZodIssue } from "zod";
import type { ResolvedAssetRegistry } from "../../../assets/registry/loadAssetRegistry";
import {
  loadAssetRegistry,
  getAssetById,
} from "../../../assets/registry/loadAssetRegistry";
import { CoreScene } from "../../../validation/zod/coreScene";

/**
 * Destination scale profiles for resolving symbolic ergonomic intent.
 * These affect numeric realization only (if/when applied downstream).
 */
export type DestinationScale = "neutral" | "meters" | "centimeters";

/**
 * Deterministic execution plan produced by the dry-run Blender interpreter.
 * This is a structured, inspectable summary of what a real Blender interpreter
 * would create, without any side effects or geometry generation.
 */
export interface DryRunExecutionPlan {
  sceneOverview: {
    sceneId: string;
    viewType: string;
    viewVariant: string;
    ergonomicsProfile: string;
    destinationScale: DestinationScale;
  };
  globalScaleResolution: {
    ergonomicBaseline: string;
    symbolicNotes: string[];
  };
  assetPlans: Array<{
    id: string;
    archetype: string;
    category: string;
    placementIntent: {
      floor?: string;
      zone?: string;
      notes: string[];
    };
    ergonomicAdjustmentsApplied: string[];
    placeholderRepresentation: string;
  }>;
  pathPlans: Array<{
    id: string;
    archetype: string;
    category: string;
    representationType: "spline" | "strip";
    referencedBy: string[];
  }>;
  cameraPlan: {
    cameras: Array<{
      type: string;
      preset: string;
      purpose: string;
    }>;
    notes: string[];
  };
  lightingPlan: {
    summary: string[];
  };
  assetResolutionSummary: {
    resolved: Array<{
      assetId: string;
      archetype: string;
      supportedDetailTiers: string[];
      supportedVariants: string[];
      prefabPlan: {
        prefabKey: string;
        detailTier: string;
        variant: string;
        notes: string[];
      };
    }>;
    unresolved: Array<{
      assetId: string;
      reason: string;
    }>;
  };
  warnings: string[];
}

/**
 * Default ergonomic intent used when the scene omits `ergonomics`.
 */
const DEFAULT_ERGONOMICS = {
  scale_profile: "human_standard",
  door_height: "standard",
  stair_rise: "comfortable",
  reach: "human_average",
  clutter: "light",
} as const;

/**
 * Known ergonomic symbolic values supported by this interpreter.
 * Unknown values will generate warnings and fall back to defaults.
 */
const KNOWN_ERGONOMICS = {
  scale_profile: ["human_standard", "human_compact", "human_large"],
  door_height: ["low", "standard", "tall"],
  stair_rise: ["shallow", "comfortable", "steep"],
  reach: ["short", "human_average", "extended"],
  clutter: ["none", "light", "medium", "heavy"],
} as const;

/**
 * Returns true if the provided value is among the allowed symbols.
 */
const isKnownValue = (
  value: string,
  allowed: readonly string[]
): value is string => {
  return allowed.includes(value);
};

const formatIssuePath = (path: (string | number)[]): string => {
  if (path.length === 0) {
    return "<root>";
  }
  return path
    .map((segment) => (typeof segment === "number" ? `[${segment}]` : segment))
    .join(".")
    .replace(".[", "[");
};

const formatRegistryIssue = (issue: ZodIssue): string => {
  return `${formatIssuePath(issue.path)}: ${issue.message}`;
};

/**
 * Build a deterministic, inspectable execution plan for a validated Core Scene.
 *
 * Notes:
 * - The input is assumed to be validated by Zod beforehand.
 * - The input object is never mutated.
 * - The output plan is stable for the same inputs and options.
 * - No Blender APIs, filesystem IO, or side effects are used.
 */
export function dryRunBlenderInterpreter(
  scene: CoreScene,
  options?: {
    destinationScale?: DestinationScale;
  }
): DryRunExecutionPlan {
  const destinationScale = options?.destinationScale ?? "neutral";
  const warnings: string[] = [];
  const fallbackNotes: string[] = [];
  // Asset registry awareness is optional; failures degrade to warnings only.
  let registryAvailable = false;
  let resolvedRegistry: ResolvedAssetRegistry | null = null;

  try {
    const registryResult = loadAssetRegistry();
    if (registryResult.ok) {
      registryAvailable = true;
      resolvedRegistry = registryResult.registry;
      if (registryResult.warnings.length > 0) {
        warnings.push(
          ...registryResult.warnings.map((warning) => `Asset registry warning: ${warning}`)
        );
      }
    } else {
      warnings.push(
        `Asset registry validation failed (${registryResult.issues.length} issues); asset awareness disabled.`
      );
      warnings.push(
        ...registryResult.issues.map(
          (issue) => `Asset registry issue: ${formatRegistryIssue(issue)}`
        )
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    warnings.push(`Asset registry load failed: ${message}. Asset awareness disabled.`);
  }

  const ergonomics = scene.ergonomics;
  const resolvedErgonomics = {
    scale_profile: ergonomics?.scale_profile ?? DEFAULT_ERGONOMICS.scale_profile,
    door_height: ergonomics?.door_height ?? DEFAULT_ERGONOMICS.door_height,
    stair_rise: ergonomics?.stair_rise ?? DEFAULT_ERGONOMICS.stair_rise,
    reach: ergonomics?.reach ?? DEFAULT_ERGONOMICS.reach,
    clutter: ergonomics?.clutter ?? DEFAULT_ERGONOMICS.clutter,
  };

  if (!ergonomics) {
    warnings.push("No ergonomics provided; using default human_standard baseline.");
    fallbackNotes.push("Ergonomics defaulted to human_standard baseline.");
  }

  if (!isKnownValue(resolvedErgonomics.scale_profile, KNOWN_ERGONOMICS.scale_profile)) {
    warnings.push(
      `Unsupported ergonomics.scale_profile: ${resolvedErgonomics.scale_profile}. Using ${DEFAULT_ERGONOMICS.scale_profile}.`
    );
    fallbackNotes.push(
      `Fallback applied: ergonomics.scale_profile -> ${DEFAULT_ERGONOMICS.scale_profile}.`
    );
    resolvedErgonomics.scale_profile = DEFAULT_ERGONOMICS.scale_profile;
  }

  if (!isKnownValue(resolvedErgonomics.door_height, KNOWN_ERGONOMICS.door_height)) {
    warnings.push(
      `Unsupported ergonomics.door_height: ${resolvedErgonomics.door_height}. Using ${DEFAULT_ERGONOMICS.door_height}.`
    );
    fallbackNotes.push(
      `Fallback applied: ergonomics.door_height -> ${DEFAULT_ERGONOMICS.door_height}.`
    );
    resolvedErgonomics.door_height = DEFAULT_ERGONOMICS.door_height;
  }

  if (!isKnownValue(resolvedErgonomics.stair_rise, KNOWN_ERGONOMICS.stair_rise)) {
    warnings.push(
      `Unsupported ergonomics.stair_rise: ${resolvedErgonomics.stair_rise}. Using ${DEFAULT_ERGONOMICS.stair_rise}.`
    );
    fallbackNotes.push(
      `Fallback applied: ergonomics.stair_rise -> ${DEFAULT_ERGONOMICS.stair_rise}.`
    );
    resolvedErgonomics.stair_rise = DEFAULT_ERGONOMICS.stair_rise;
  }

  if (!isKnownValue(resolvedErgonomics.reach, KNOWN_ERGONOMICS.reach)) {
    warnings.push(
      `Unsupported ergonomics.reach: ${resolvedErgonomics.reach}. Using ${DEFAULT_ERGONOMICS.reach}.`
    );
    fallbackNotes.push(
      `Fallback applied: ergonomics.reach -> ${DEFAULT_ERGONOMICS.reach}.`
    );
    resolvedErgonomics.reach = DEFAULT_ERGONOMICS.reach;
  }

  if (!isKnownValue(resolvedErgonomics.clutter, KNOWN_ERGONOMICS.clutter)) {
    warnings.push(
      `Unsupported ergonomics.clutter: ${resolvedErgonomics.clutter}. Using ${DEFAULT_ERGONOMICS.clutter}.`
    );
    fallbackNotes.push(
      `Fallback applied: ergonomics.clutter -> ${DEFAULT_ERGONOMICS.clutter}.`
    );
    resolvedErgonomics.clutter = DEFAULT_ERGONOMICS.clutter;
  }

  const layoutFloors = scene.layout?.floors ?? [];
  const layoutZones = scene.layout?.zones ?? [];
  const floorIds = new Set(layoutFloors.map((floor) => floor.id));
  const zoneIds = new Set(layoutZones.map((zone) => zone.id));

  const assetPlans = (scene.assets ?? []).map((asset) => {
    if (!asset.floor) {
      warnings.push(`Asset ${asset.id} is missing a floor reference.`);
    } else if (floorIds.size > 0 && !floorIds.has(asset.floor)) {
      warnings.push(`Asset ${asset.id} references unknown floor: ${asset.floor}.`);
    }

    if (!asset.zone) {
      warnings.push(`Asset ${asset.id} is missing a zone reference.`);
    } else if (zoneIds.size > 0 && !zoneIds.has(asset.zone)) {
      warnings.push(`Asset ${asset.id} references unknown zone: ${asset.zone}.`);
    }

    if (!asset.archetype.trim()) {
      warnings.push(`Asset ${asset.id} has an empty archetype value.`);
      warnings.push(`Unsupported archetype for asset ${asset.id}: <empty>.`);
    }

    const placementNotes: string[] = [];
    if (!asset.floor) {
      placementNotes.push("No floor specified.");
    }
    if (!asset.zone) {
      placementNotes.push("No zone specified.");
    }
    if (placementNotes.length === 0) {
      placementNotes.push("Placement intent derived from floor and zone only.");
    }

    const ergonomicAdjustmentsApplied = [
      `Scale profile: ${resolvedErgonomics.scale_profile}`,
      `Door height: ${resolvedErgonomics.door_height}`,
      `Stair rise: ${resolvedErgonomics.stair_rise}`,
      `Reach: ${resolvedErgonomics.reach}`,
      `Clutter: ${resolvedErgonomics.clutter}`,
    ];

    return {
      id: asset.id,
      archetype: asset.archetype,
      category: asset.category,
      placementIntent: {
        floor: asset.floor,
        zone: asset.zone,
        notes: placementNotes,
      },
      ergonomicAdjustmentsApplied,
      placeholderRepresentation: `Primitive placeholder for ${asset.archetype} (${asset.category}).`,
    };
  });

  const assetResolutionSummary: DryRunExecutionPlan["assetResolutionSummary"] = {
    resolved: [],
    unresolved: [],
  };

  for (const asset of scene.assets ?? []) {
    if (!registryAvailable || !resolvedRegistry) {
      assetResolutionSummary.unresolved.push({
        assetId: asset.id,
        reason: "Asset registry unavailable; resolution skipped.",
      });
      continue;
    }

    const registryAsset = getAssetById(resolvedRegistry, asset.id);
    if (!registryAsset) {
      warnings.push(`Unresolved asset reference: ${asset.id}.`);
      assetResolutionSummary.unresolved.push({
        assetId: asset.id,
        reason: "Asset id not found in registry.",
      });
      continue;
    }

    if (registryAsset.supported_detail_tiers.length === 0) {
      warnings.push(
        `Asset ${asset.id} has no supported detail tiers; prefab planning skipped.`
      );
      assetResolutionSummary.unresolved.push({
        assetId: asset.id,
        reason: "No supported detail tiers available for prefab planning.",
      });
      continue;
    }

    if (registryAsset.supported_variants.length === 0) {
      warnings.push(
        `Asset ${asset.id} has no supported variants; prefab planning skipped.`
      );
      assetResolutionSummary.unresolved.push({
        assetId: asset.id,
        reason: "No supported variants available for prefab planning.",
      });
      continue;
    }

    // Deterministic placeholder rule: choose first listed tier/variant in registry order.
    const selectedDetailTier = registryAsset.supported_detail_tiers[0];
    const selectedVariant = registryAsset.supported_variants[0];
    const prefabKey = `${asset.id}::${selectedDetailTier}::${selectedVariant}`;

    assetResolutionSummary.resolved.push({
      assetId: asset.id,
      archetype: registryAsset.archetype,
      supportedDetailTiers: registryAsset.supported_detail_tiers,
      supportedVariants: registryAsset.supported_variants,
      prefabPlan: {
        prefabKey,
        detailTier: selectedDetailTier,
        variant: selectedVariant,
        notes: [
          "Prefab selection is provisional and ordering-based.",
          "First supported detail tier/variant chosen as a temporary placeholder.",
          "No geometry or Blender assets are generated in dry-run.",
        ],
      },
    });
  }

  const pathPlans: DryRunExecutionPlan["pathPlans"] = [];
if ((scene.assets ?? []).some(a => a.category === "road" || a.category === "water")) {
  warnings.push(
    "Assets suggest possible linear features, but no explicit linear intent fields are defined; path planning skipped."
  );
}

  if (!scene.layout) {
    warnings.push("No layout provided; spatial defaults will be used.");
  }

  const lightingSummary: string[] = [];
  if (scene.lighting) {
    lightingSummary.push(`time_of_day: ${scene.lighting.time_of_day}`);
    lightingSummary.push(`key_direction: ${scene.lighting.key_direction}`);
    lightingSummary.push(`contrast: ${scene.lighting.contrast}`);
    lightingSummary.push(`fog: ${scene.lighting.fog}`);
  } else {
    lightingSummary.push("No lighting intent provided.");
  }

  const viewType = scene.view.type;
  const viewVariant = scene.view.variant;

  return {
    sceneOverview: {
      sceneId: scene.scene.id,
      viewType,
      viewVariant,
      ergonomicsProfile: resolvedErgonomics.scale_profile,
      destinationScale,
    },
    globalScaleResolution: {
      ergonomicBaseline: resolvedErgonomics.scale_profile,
      symbolicNotes: [
        `Door height: ${resolvedErgonomics.door_height}`,
        `Stair rise: ${resolvedErgonomics.stair_rise}`,
        `Reach: ${resolvedErgonomics.reach}`,
        `Clutter: ${resolvedErgonomics.clutter}`,
        `Destination scale: ${destinationScale}`,
        "No numeric conversion applied in dry-run.",
        ...fallbackNotes,
      ],
    },
    assetPlans,
    pathPlans,
    cameraPlan: {
      cameras: [
        {
          type: viewType,
          preset: scene.view.camera_preset,
          purpose: `View intent: ${viewType}.`,
        },
      ],
      notes: [`View variant: ${viewVariant}.`],
    },
    lightingPlan: {
      summary: lightingSummary,
    },
    assetResolutionSummary,
    warnings,
  };
}
