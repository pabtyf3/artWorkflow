import { generateChair } from "../chair.generator";
import { chairBasicFixture } from "../fixtures/chair.basic.fixture";
import { generateTable } from "../table.generator";
import { tableBasicFixture } from "../fixtures/table.basic.fixture";
import { generateDoor } from "../door.generator";
import { doorBasicFixture } from "../fixtures/door.basic.fixture";
import { generateBed } from "../bed.generator";
import { bedBasicFixture } from "../fixtures/bed.basic.fixture";

describe("archetype generator determinism", () => {
  test("chair generator is deterministic", () => {
    const first = generateChair(chairBasicFixture);
    const second = generateChair(chairBasicFixture);
    expect(first).toEqual(second);
  });

  test("table generator is deterministic", () => {
    const first = generateTable(tableBasicFixture);
    const second = generateTable(tableBasicFixture);
    expect(first).toEqual(second);
  });

  test("door generator is deterministic", () => {
    const first = generateDoor(doorBasicFixture);
    const second = generateDoor(doorBasicFixture);
    expect(first).toEqual(second);
  });

  test("bed generator is deterministic", () => {
    const first = generateBed(bedBasicFixture);
    const second = generateBed(bedBasicFixture);
    expect(first).toEqual(second);
  });
});
