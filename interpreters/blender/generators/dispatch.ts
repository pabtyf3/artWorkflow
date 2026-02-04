import type {
  PrefabGenerationInput,
  PrefabGenerationResult,
} from "../types/prefabGenerator";
import { generateChairBasicWooden } from "./furniture/chair_basic_wooden";
import { generateTableBasicWooden } from "./furniture/table_basic_wooden";

const GENERATORS: Record<
  string,
  (input: PrefabGenerationInput) => PrefabGenerationResult
> = {
  "chair_simple::basic::wooden": generateChairBasicWooden,
  "table_simple::basic::wooden": generateTableBasicWooden,
};

/**
 * Dispatch prefab generation to a concrete generator based on prefab key.
 * No side effects or Blender invocation occurs here.
 */
export const generatePrefab = (
  input: PrefabGenerationInput
): PrefabGenerationResult => {
  const generator = GENERATORS[input.prefabKey];
  if (!generator) {
    return {
      ok: false,
      prefabKey: input.prefabKey,
      error: {
        code: "UNSUPPORTED_PREFAB",
        message: `No generator registered for prefab key: ${input.prefabKey}.`,
      },
    };
  }

  return generator(input);
};
