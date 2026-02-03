import { readFileSync } from "fs";
import { resolve } from "path";
import { assertValidCoreScene } from "../validation/zod/validateScene";
import { dryRunBlenderInterpreter } from "../interpreters/blender/dryRunInterpreter";
import { dryRunKritaInterpreter } from "../interpreters/krita/dryRunInterpreter";

const printUsage = (): void => {
  console.error("Usage:");
  console.error("  artworkflow <path-to-scene.json>  (validate only)");
  console.error("  artworkflow interpret blender --dry-run <path-to-scene.json>");
  console.error(
    "  artworkflow interpret krita --dry-run [--include-blender-reference] <path-to-scene.json>"
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

  runValidation(firstArg);
  process.exit(0);
};

main();
