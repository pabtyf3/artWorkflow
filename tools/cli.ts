import { readFileSync } from "fs";
import { resolve } from "path";
import type { PrefabGenerationInput } from "../interpreters/blender/types/prefabGenerator";
import { assertValidCoreScene } from "../validation/zod/validateScene";
import { loadAssetRegistry } from "../assets/registry/loadAssetRegistry";
import { dryRunBlenderInterpreter } from "../interpreters/blender/dryRunInterpreter";
import { dryRunKritaInterpreter } from "../interpreters/krita/dryRunInterpreter";
import { generatePrefab } from "../interpreters/blender/generators/dispatch";

const printUsage = (): void => {
  console.error("Usage:");
  console.error("  artworkflow <path-to-scene.json>  (validate only)");
  console.error("  artworkflow interpret blender --dry-run <path-to-scene.json>");
  console.error(
    "  artworkflow interpret krita --dry-run [--include-blender-reference] <path-to-scene.json>"
  );
  console.error(
    "  artworkflow generate prefabs <path-to-scene.json>  (no Blender execution)"
  );
};

const readSceneFile = (filePath: string): unknown => {
  const resolvedPath = resolve(process.cwd(), filePath);
  let raw: string;

  try {
    raw = readFileSync(resolvedPath, "utf-8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Unable to read file: ${message}`);
    process.exit(1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Invalid JSON: ${message}`);
    process.exit(1);
  }

  return parsed;
};

const runValidation = (filePath: string): void => {
  const parsed = readSceneFile(filePath);
  try {
    assertValidCoreScene(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }

  const resolvedPath = resolve(process.cwd(), filePath);
  console.log(`Scene is valid: ${resolvedPath}`);
  process.exit(0);
};

const runInterpretation = (args: string[]): void => {
  const interpreter = args[0];
  const rest = args.slice(1);

  if (!interpreter) {
    console.error("Missing interpreter name.");
    printUsage();
    process.exit(1);
  }

  let includeBlenderReference = false;
  let dryRun = false;
  let filePath: string | undefined;

  for (const token of rest) {
    if (token === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (token === "--include-blender-reference") {
      includeBlenderReference = true;
      continue;
    }
    if (token.startsWith("--")) {
      console.error(`Unknown flag: ${token}`);
      printUsage();
      process.exit(1);
    }
    if (!filePath) {
      filePath = token;
      continue;
    }
    console.error(`Unexpected argument: ${token}`);
    printUsage();
    process.exit(1);
  }

  if (!dryRun) {
    console.error("Missing required flag: --dry-run");
    printUsage();
    process.exit(1);
  }

  if (!filePath) {
    console.error("Missing file path.");
    printUsage();
    process.exit(1);
  }

  if (interpreter !== "blender" && interpreter !== "krita") {
    console.error(`Unknown interpreter: ${interpreter}`);
    printUsage();
    process.exit(1);
  }

  if (interpreter === "blender" && includeBlenderReference) {
    console.error("--include-blender-reference is only valid for krita.");
    printUsage();
    process.exit(1);
  }

  const parsed = readSceneFile(filePath);
  let scene;
  try {
    scene = assertValidCoreScene(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }

  if (interpreter === "blender") {
    const plan = dryRunBlenderInterpreter(scene);
    console.log(JSON.stringify(plan, null, 2));
    process.exit(0);
  }

  if (includeBlenderReference) {
    const blenderPlan = dryRunBlenderInterpreter(scene);
    const plan = dryRunKritaInterpreter(scene, {
      includeBlenderReference: true,
      blenderDryRunPlan: blenderPlan,
    });
    console.log(JSON.stringify(plan, null, 2));
    process.exit(0);
  }

  const plan = dryRunKritaInterpreter(scene, { includeBlenderReference: false });
  console.log(JSON.stringify(plan, null, 2));
  process.exit(0);
};

const runPrefabGeneration = (filePath: string): void => {
  const parsed = readSceneFile(filePath);
  let scene;
  try {
    scene = assertValidCoreScene(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }

  const plan = dryRunBlenderInterpreter(scene);
  const warnings: string[] = [...plan.warnings];

  const registryResult = loadAssetRegistry();
  const archetypesById = registryResult.ok ? registryResult.registry.archetypesById : null;
  if (registryResult.ok) {
    warnings.push(
      ...registryResult.warnings.map((warning) => `Asset registry warning: ${warning}`)
    );
  } else {
    warnings.push(
      `Asset registry validation failed (${registryResult.issues.length} issues); part data unavailable.`
    );
  }

  const resolvedPrefabs = plan.assetResolutionSummary.resolved;
  const generated: Array<ReturnType<typeof generatePrefab>> = [];
  const failed: Array<ReturnType<typeof generatePrefab>> = [];

  for (const resolved of resolvedPrefabs) {
    const structuralParts =
      archetypesById?.get(resolved.archetype)?.allowed_parts ?? [];

    const input: PrefabGenerationInput = {
      prefabKey: resolved.prefabPlan.prefabKey,
      assetId: resolved.assetId,
      archetypeId: resolved.archetype,
      structuralParts,
      detailTier: resolved.prefabPlan.detailTier,
      variant: resolved.prefabPlan.variant,
      ergonomicsProfile: plan.sceneOverview.ergonomicsProfile,
      destinationScale: plan.sceneOverview.destinationScale,
    };

    const result = generatePrefab(input);
    if (result.ok) {
      generated.push(result);
    } else {
      failed.push(result);
    }
  }

  const output = {
    sceneId: plan.sceneOverview.sceneId,
    prefabs: {
      generated,
      failed,
    },
    warnings,
  };

  console.log(JSON.stringify(output, null, 2));
  process.exit(0);
};

const main = (): void => {
  const [, , firstArg, ...restArgs] = process.argv;

  if (!firstArg) {
    console.error("Missing file path.");
    printUsage();
    process.exit(1);
  }

  if (firstArg === "interpret") {
    runInterpretation(restArgs);
    return;
  }

  if (firstArg === "generate") {
    const [command, filePath, ...extraArgs] = restArgs;
    if (!command) {
      console.error("Missing generate command.");
      printUsage();
      process.exit(1);
    }
    if (command !== "prefabs") {
      console.error(`Unknown generate command: ${command}.`);
      printUsage();
      process.exit(1);
    }
    if (!filePath) {
      console.error("Missing file path.");
      printUsage();
      process.exit(1);
    }
    if (extraArgs.length > 0) {
      console.error(`Unexpected argument: ${extraArgs[0]}`);
      printUsage();
      process.exit(1);
    }
    runPrefabGeneration(filePath);
    return;
  }

  runValidation(firstArg);
  process.exit(0);
};

main();
