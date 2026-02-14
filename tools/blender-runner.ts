import { spawnSync } from "child_process";
import { writeFileSync } from "fs";
import { resolve } from "path";
import type { AdapterInput } from "../assets/adapters/adapter-input.interface";
import { buildBedAdapterInput } from "../assets/adapters/buildAdapterInput";
import { buildChairAdapterInput } from "../assets/adapters/buildAdapterInput";
import { buildTableAdapterInput } from "../assets/adapters/buildAdapterInput";
import { generateBed } from "../assets/archetypes/bed.generator";
import { generateChair } from "../assets/archetypes/chair.generator";
import { generateTable } from "../assets/archetypes/table.generator";
import { bedBasicFixture } from "../assets/archetypes/fixtures/bed.basic.fixture";
import { chairBasicFixture } from "../assets/archetypes/fixtures/chair.basic.fixture";
import { tableBasicFixture } from "../assets/archetypes/fixtures/table.basic.fixture";

type ArchetypeKey = "chair" | "table" | "bed";

type RegistryEntry = {
  assetId: string;
  generator: (fixture: any) => any;
  fixture: any;
  buildAdapter: (params: { assetId: string; intent: any }) => AdapterInput;
};

const ASSET_REGISTRY: Record<ArchetypeKey, RegistryEntry> = {
  chair: {
    assetId: "assets.furniture.chair_simple",
    generator: generateChair,
    fixture: chairBasicFixture,
    buildAdapter: buildChairAdapterInput,
  },
  table: {
    assetId: "assets.furniture.table_simple",
    generator: generateTable,
    fixture: tableBasicFixture,
    buildAdapter: buildTableAdapterInput,
  },
  bed: {
    assetId: "assets.furniture.bed_simple",
    generator: generateBed,
    fixture: bedBasicFixture,
    buildAdapter: buildBedAdapterInput,
  },
};

const requested = process.argv[2] as ArchetypeKey | undefined;
const archetype: ArchetypeKey = requested ?? "chair";
const entry = ASSET_REGISTRY[archetype];

if (!entry) {
  console.error(`Unsupported archetype: ${requested ?? "(none)"}.`);
  process.exit(1);
}

const inputPath = resolve(process.cwd(), `${archetype}_input.json`);
const outputPath = resolve(process.cwd(), `${archetype}_output.blend`);

const intent = entry.generator(entry.fixture) as unknown;
const adapterInput = entry.buildAdapter({
  assetId: entry.assetId,
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
