import { CoreScene } from "../../validation/zod/coreScene";

export type DestinationScale = "neutral" | "meters" | "centimeters";

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
  warnings: string[];
}

const DEFAULT_ERGONOMICS = {
  scale_profile: "human_standard",
  door_height: "standard",
  stair_rise: "comfortable",
  reach: "human_average",
  clutter: "light",
} as const;

const KNOWN_ERGONOMICS = {
  scale_profile: ["human_standard", "human_compact", "human_large"],
  door_height: ["low", "standard", "tall"],
  stair_rise: ["shallow", "comfortable", "steep"],
  reach: ["short", "human_average", "extended"],
  clutter: ["none", "light", "medium", "heavy"],
} as const;

const isKnownValue = (
  value: string,
  allowed: readonly string[]
): value is string => {
  return allowed.includes(value);
};

export function dryRunBlenderInterpreter(
  scene: CoreScene,
  options?: {
    destinationScale?: DestinationScale;
  }
): DryRunExecutionPlan {
  const destinationScale = options?.destinationScale ?? "neutral";
  const warnings: string[] = [];
  const fallbackNotes: string[] = [];

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
    warnings,
  };
}
