import { generateChair } from "../../archetypes/chair.generator";
import { chairBasicFixture } from "../../archetypes/fixtures/chair.basic.fixture";
import { buildChairAdapterInput } from "../buildAdapterInput";

describe("adapter input physical resolution", () => {
  test("includes resolved physical dimensions for chairs", () => {
    const intent = generateChair(chairBasicFixture);
    const input = buildChairAdapterInput({
      assetId: "assets.furniture.chair_simple",
      intent,
    });

    expect(input.physical).toBeDefined();
  });
});
