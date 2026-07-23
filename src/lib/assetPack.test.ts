import { describe, expect, it } from "vitest";
import { validatePack, type AssetPack } from "./assetPack";

function validPack(): Omit<AssetPack, "baseUrl"> {
  return {
    schemaVersion: 1,
    id: "test-pack",
    name: "Test Pack",
    version: "0.1.0",
    description: "A test fixture.",
    theme: {
      colors: {},
      fonts: {
        display: { family: "Display", regular: "display.woff2", bold: "display-bold.woff2" },
        ui: { family: "UI", regular: "ui.woff2", bold: "ui-bold.woff2" },
      },
    },
    assets: {
      "scene.estate.overview": "estate.png",
      "event.rival.priceWar": "event.png",
      "wine.reserveRed": "red.png",
      "wine.estateChardonnay": "white.png",
      "wine.hillsideRose": "rose.png",
    },
    icons: {},
    scene: {
      hotspots: [
        {
          id: "winery",
          kind: "facility",
          targetId: "winery",
          label: "Winery",
          x: 50,
          y: 50,
        },
      ],
    },
  };
}

describe("asset-pack validation", () => {
  it("accepts a complete schema-one pack", () => {
    expect(validatePack(validPack())).toEqual([]);
  });

  it("reports missing semantic artwork", () => {
    const pack = validPack();
    delete pack.assets["scene.estate.overview"];
    expect(validatePack(pack)).toContain(
      "Missing required asset: scene.estate.overview",
    );
  });
});
