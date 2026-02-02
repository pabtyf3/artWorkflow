import { readFileSync } from "fs";
import { resolve } from "path";
import { assertValidCoreScene } from "../validation/zod/validateScene";

const printUsage = (): void => {
  console.error("Usage: artworkflow <path-to-scene.json>");
};

const main = (): void => {
  const [, , filePath] = process.argv;

  if (!filePath) {
    console.error("Missing file path.");
    printUsage();
    process.exit(1);
  }

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

  try {
    assertValidCoreScene(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }

  console.log(`Scene is valid: ${resolvedPath}`);
  process.exit(0);
};

main();
