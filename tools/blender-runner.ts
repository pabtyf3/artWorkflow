import { writeFileSync } from "fs";
import { spawnSync } from "child_process";
import { resolve } from "path";
import { generateChair } from "../assets/archetypes/chair.generator";
import { chairBasicFixture } from "../assets/archetypes/fixtures/chair.basic.fixture";
import { buildChairAdapterInput } from "../assets/adapters/buildAdapterInput";

const inputPath = resolve(process.cwd(), "chair_input.json");
const outputPath = resolve(process.cwd(), "chair_output.blend");

const intent = generateChair(chairBasicFixture);
const adapterInput = buildChairAdapterInput({
  assetId: "assets.furniture.chair_simple",
  intent,
});

writeFileSync(inputPath, JSON.stringify(adapterInput, null, 2));

const BLENDER_BIN =
  process.env.BLENDER_BIN ??
  "/Applications/Blender.app/Contents/MacOS/Blender";

const env = { ...process.env };
delete env.PYTHONHOME;
delete env.PYTHONPATH;
delete env.VIRTUAL_ENV;

const result = spawnSync(
  BLENDER_BIN,
  [
    "--background",
    "--factory-startup",
    "--python",
    resolve(process.cwd(), "tools", "run_blender.py"),
    "--",
    inputPath,
    outputPath,
  ],
  {
    stdio: "inherit",
    env,
  }
);




if (result.error) {
  console.error("Failed to launch Blender", result.error);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
