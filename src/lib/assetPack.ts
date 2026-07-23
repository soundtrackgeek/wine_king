export interface PackFont {
  family: string;
  regular: string;
  bold: string;
}

export interface SceneHotspot {
  id: string;
  kind: "plot" | "facility";
  targetId: string;
  label: string;
  x: number;
  y: number;
}

export interface AssetPack {
  schemaVersion: number;
  id: string;
  name: string;
  version: string;
  description: string;
  theme: {
    colors: Record<string, string>;
    fonts: {
      display: PackFont;
      ui: PackFont;
    };
  };
  assets: Record<string, string>;
  icons: Record<string, string>;
  scene: {
    hotspots: SceneHotspot[];
  };
  baseUrl: string;
}

interface PackIndex {
  schemaVersion: number;
  defaultPack: string;
  packs: Array<{ id: string; manifest: string }>;
}

const REQUIRED_ASSETS = [
  "scene.estate.overview",
  "event.rival.priceWar",
  "wine.reserveRed",
  "wine.estateChardonnay",
  "wine.hillsideRose",
];

export function validatePack(pack: Omit<AssetPack, "baseUrl">): string[] {
  const errors: string[] = [];
  if (pack.schemaVersion !== 1) errors.push("Unsupported asset-pack schema.");
  if (!pack.id || !pack.name) errors.push("The pack needs an id and name.");
  for (const key of REQUIRED_ASSETS) {
    if (!pack.assets[key]) errors.push(`Missing required asset: ${key}`);
  }
  if (!pack.scene?.hotspots?.length) errors.push("The estate scene has no hotspots.");
  return errors;
}

export async function loadAssetPack(preferredId?: string): Promise<AssetPack> {
  const indexResponse = await fetch("/packs/index.json");
  if (!indexResponse.ok) throw new Error("The asset-pack index could not be loaded.");
  const index = (await indexResponse.json()) as PackIndex;
  const packId = preferredId ?? index.defaultPack;
  const entry =
    index.packs.find((pack) => pack.id === packId) ??
    index.packs.find((pack) => pack.id === index.defaultPack);
  if (!entry) throw new Error("No compatible asset pack is installed.");

  const response = await fetch(entry.manifest);
  if (!response.ok) throw new Error(`The ${entry.id} asset pack could not be loaded.`);
  const raw = (await response.json()) as Omit<AssetPack, "baseUrl">;
  const errors = validatePack(raw);
  if (errors.length) throw new Error(errors.join(" "));

  const baseUrl = entry.manifest.slice(0, entry.manifest.lastIndexOf("/") + 1);
  const pack: AssetPack = { ...raw, baseUrl };
  installTheme(pack);
  return pack;
}

export function assetUrl(pack: AssetPack, key: string): string {
  const path = pack.assets[key];
  if (!path) return "";
  return packFileUrl(pack, path);
}

export function packFileUrl(pack: AssetPack, path: string): string {
  return new URL(path, new URL(pack.baseUrl, window.location.origin)).toString();
}

function installTheme(pack: AssetPack) {
  const root = document.documentElement;
  for (const [name, value] of Object.entries(pack.theme.colors)) {
    root.style.setProperty(`--color-${toKebab(name)}`, value);
  }
  root.style.setProperty("--font-display", `"${pack.theme.fonts.display.family}"`);
  root.style.setProperty("--font-ui", `"${pack.theme.fonts.ui.family}"`);

  const fontStyleId = "wine-king-pack-fonts";
  document.getElementById(fontStyleId)?.remove();
  const style = document.createElement("style");
  style.id = fontStyleId;
  const display = pack.theme.fonts.display;
  const ui = pack.theme.fonts.ui;
  style.textContent = `
    @font-face {
      font-family: "${display.family}";
      src: url("${packFileUrl(pack, display.regular)}") format("woff2");
      font-weight: 600;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "${display.family}";
      src: url("${packFileUrl(pack, display.bold)}") format("woff2");
      font-weight: 700;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "${ui.family}";
      src: url("${packFileUrl(pack, ui.regular)}") format("woff2");
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "${ui.family}";
      src: url("${packFileUrl(pack, ui.bold)}") format("woff2");
      font-weight: 600;
      font-style: normal;
      font-display: swap;
    }
  `;
  document.head.append(style);
}

function toKebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
