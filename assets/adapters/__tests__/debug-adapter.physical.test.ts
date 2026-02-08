import { generateChair } from "../../archetypes/chair.generator";
import { generateBed } from "../../archetypes/bed.generator";
import { generateTable } from "../../archetypes/table.generator";
import { bedBasicFixture } from "../../archetypes/fixtures/bed.basic.fixture";
import { chairBasicFixture } from "../../archetypes/fixtures/chair.basic.fixture";
import { tableBasicFixture } from "../../archetypes/fixtures/table.basic.fixture";
import {
  buildBedAdapterInput,
  buildChairAdapterInput,
  buildTableAdapterInput,
} from "../buildAdapterInput";
import { debugAdapterSummary } from "../mock/debug-adapter";

describe("debug adapter physical observability", () => {
  test("includes physical for chair adapter inputs", () => {
    const intent = generateChair(chairBasicFixture);
    const input = buildChairAdapterInput({
      assetId: "assets.furniture.chair_simple",
      intent,
    });

    const summary = debugAdapterSummary(input);

    expect(Object.prototype.hasOwnProperty.call(summary, "physical")).toBe(true);
    expect(summary.physical).toBeDefined();
  });

  test("includes physical for table adapter inputs", () => {
    const intent = generateTable(tableBasicFixture);
    const input = buildTableAdapterInput({
      assetId: "assets.furniture.table_simple",
      intent,
    });

    const summary = debugAdapterSummary(input);

    expect(Object.prototype.hasOwnProperty.call(summary, "physical")).toBe(true);
    expect(summary.physical).toBeDefined();
  });

  test("includes physical for bed adapter inputs", () => {
    const intent = generateBed(bedBasicFixture);
    const input = buildBedAdapterInput({
      assetId: "assets.furniture.bed_simple",
      intent,
    });

    const summary = debugAdapterSummary(input);

    expect(Object.prototype.hasOwnProperty.call(summary, "physical")).toBe(true);
    expect(summary.physical).toBeDefined();
  });
});
