import { generateChair } from "../../archetypes/chair.generator";
import { chairBasicFixture } from "../../archetypes/fixtures/chair.basic.fixture";
import { baseHumanReference } from "../baseHumanReference";
import { resolveChairPhysical } from "../resolvers/chair.resolve";

describe("chair physical resolution determinism", () => {
  test("returns identical output for identical inputs", () => {
    const intent = generateChair(chairBasicFixture);
    const referenceBody = baseHumanReference();

    const first = resolveChairPhysical(intent, { referenceBody });
    const second = resolveChairPhysical(intent, { referenceBody });

    expect(second).toEqual(first);
  });
});
