import { generateBed } from "../../archetypes/bed.generator";
import { bedBasicFixture } from "../../archetypes/fixtures/bed.basic.fixture";
import { baseHumanReference } from "../standards/baseHumanReference";
import { resolveBedPhysical } from "./bed.resolve";

describe("bed physical resolution determinism", () => {
  test("returns identical output for identical inputs", () => {
    const intent = generateBed(bedBasicFixture);
    const referenceBody = baseHumanReference();

    const first = resolveBedPhysical(intent, { referenceBody });
    const second = resolveBedPhysical(intent, { referenceBody });

    expect(second).toEqual(first);
  });
});
