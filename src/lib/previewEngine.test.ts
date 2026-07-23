import { describe, expect, it } from "vitest";
import { createDemoGame, demoAdvanceWeek, demoPerform } from "./previewEngine";

describe("browser preview game gateway", () => {
  it("creates a deterministic initial season", () => {
    expect(createDemoGame(42)).toEqual(createDemoGame(42));
  });

  it("supports harvesting, processing, bottling, and selling a batch", () => {
    let game = createDemoGame(42);
    game = demoPerform(game, { type: "harvest", plotId: "south-fields" });
    const batch = game.inventory.find(({ id }) => id.startsWith("south-fields"));
    expect(batch?.stage).toBe("must");

    game = demoAdvanceWeek(game);
    game = demoPerform(game, { type: "processWine", batchId: batch!.id });
    expect(game.inventory.find(({ id }) => id === batch!.id)?.stage).toBe("cellar");

    game = demoAdvanceWeek(game);
    game = demoPerform(game, { type: "bottleWine", batchId: batch!.id });
    expect(game.inventory.find(({ id }) => id === batch!.id)?.stage).toBe("bottled");

    game = demoAdvanceWeek(game);
    const revenueBefore = game.player.revenue;
    game = demoPerform(game, {
      type: "sellWine",
      batchId: batch!.id,
      marketId: "local",
    });
    expect(game.player.revenue).toBeGreaterThan(revenueBefore);
    expect(game.inventory.some(({ id }) => id === batch!.id)).toBe(false);
  });

  it("opens and resolves the week-six rival event", () => {
    let game = createDemoGame(42);
    for (let week = 1; week < 6; week += 1) game = demoAdvanceWeek(game);
    expect(game.activeEvent?.id).toBe("rival-price-war");
    game = demoPerform(game, {
      type: "respondToEvent",
      choiceId: "hold-line",
    });
    expect(game.activeEvent).toBeNull();
  });
});
