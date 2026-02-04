import { readFileSync } from "fs";
import { resolve } from "path";
import type { ZodIssue } from "zod";
import {
  validateAssetRegistry,
  AssetRegistry,
  AssetRegistryArchetype,
  AssetRegistryAsset,
} from "../../validation/zod/assetRegistry";

export type ResolvedAssetRegistry = {
  registry: AssetRegistry;
  archetypesById: Map<string, AssetRegistryArchetype>;
  assetsById: Map<string, AssetRegistryAsset>;
  assetsByArchetype: Map<string, AssetRegistryAsset[]>;
};

export type LoadResult =
  | {
      ok: true;
      registry: ResolvedAssetRegistry;
      warnings: string[];
    }
  | {
      ok: false;
      issues: ZodIssue[];
    };

const registryFilePath = (): string =>
  // Resolve from project root to avoid build-output path shifts.
  resolve(process.cwd(), "assets/registry/assets.json");

const parseRegistryFile = (): unknown => {
  const path = registryFilePath();
  let raw: string;

  try {
    raw = readFileSync(path, "utf-8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read asset registry: ${message}`);
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid asset registry JSON: ${message}`);
  }
};

const indexArchetypes = (
  archetypes: AssetRegistryArchetype[],
  warnings: string[]
): Map<string, AssetRegistryArchetype> => {
  const archetypesById = new Map<string, AssetRegistryArchetype>();
  const firstSeenIndex = new Map<string, number>();

  archetypes.forEach((archetype, index) => {
    const existingIndex = firstSeenIndex.get(archetype.id);
    if (existingIndex !== undefined) {
      warnings.push(
        `Duplicate archetype id "${archetype.id}" at index ${index}; ` +
          `keeping first occurrence at index ${existingIndex}.`
      );
      return;
    }
    firstSeenIndex.set(archetype.id, index);
    archetypesById.set(archetype.id, archetype);
  });

  return archetypesById;
};

const indexAssets = (
  assets: AssetRegistryAsset[],
  warnings: string[]
): Map<string, AssetRegistryAsset> => {
  const assetsById = new Map<string, AssetRegistryAsset>();
  const firstSeenIndex = new Map<string, number>();

  assets.forEach((asset, index) => {
    const existingIndex = firstSeenIndex.get(asset.asset_id);
    if (existingIndex !== undefined) {
      warnings.push(
        `Duplicate asset id "${asset.asset_id}" at index ${index}; ` +
          `keeping first occurrence at index ${existingIndex}.`
      );
      return;
    }
    firstSeenIndex.set(asset.asset_id, index);
    assetsById.set(asset.asset_id, asset);
  });

  return assetsById;
};

const indexAssetsByArchetype = (
  assets: AssetRegistryAsset[]
): Map<string, AssetRegistryAsset[]> => {
  const assetsByArchetype = new Map<string, AssetRegistryAsset[]>();

  for (const asset of assets) {
    const existing = assetsByArchetype.get(asset.archetype);
    if (existing) {
      existing.push(asset);
      continue;
    }
    assetsByArchetype.set(asset.archetype, [asset]);
  }

  return assetsByArchetype;
};

/**
 * Load and index the asset registry. Validation failures return issues without throwing.
 * IO/JSON errors throw because they are not schema validation failures.
 */
export const loadAssetRegistry = (): LoadResult => {
  const parsed = parseRegistryFile();
  const validation = validateAssetRegistry(parsed);

  if (!validation.ok) {
    return { ok: false, issues: validation.issues };
  }

  const warnings: string[] = [];
  const archetypesById = indexArchetypes(validation.data.archetypes, warnings);
  const assetsById = indexAssets(validation.data.assets, warnings);
  const assetsByArchetype = indexAssetsByArchetype(validation.data.assets);

  return {
    ok: true,
    registry: {
      registry: validation.data,
      archetypesById,
      assetsById,
      assetsByArchetype,
    },
    warnings,
  };
};

export const getArchetypeById = (
  registry: ResolvedAssetRegistry,
  id: string
): AssetRegistryArchetype | undefined => registry.archetypesById.get(id);

export const getAssetById = (
  registry: ResolvedAssetRegistry,
  id: string
): AssetRegistryAsset | undefined => registry.assetsById.get(id);

export const getAssetsForArchetype = (
  registry: ResolvedAssetRegistry,
  archetypeId: string
): AssetRegistryAsset[] => registry.assetsByArchetype.get(archetypeId) ?? [];
