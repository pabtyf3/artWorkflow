import { generateTable } from "../../archetypes/table.generator";
import { tableBasicFixture } from "../../archetypes/fixtures/table.basic.fixture";
import { baseHumanReference } from "../standards/baseHumanReference";
import { resolveTablePhysical } from "./table.resolve";

describe("table physical resolution determinism", () => {
  test("returns identical output for identical inputs", () => {
    const intent = generateTable(tableBasicFixture);
    const referenceBody = baseHumanReference();

    const first = resolveTablePhysical(intent, { referenceBody });
    const second = resolveTablePhysical(intent, { referenceBody });

    expect(second).toEqual(first);
  });
});
