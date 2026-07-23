import { describe, expect, it } from "vitest";
import {
  DEFAULT_UPDATE_SETTINGS,
  readUpdateSettings,
  writeUpdateSettings,
} from "./updateSettings";

describe("update settings", () => {
  it("defaults background checks to five minutes", () => {
    const storage = { getItem: () => null };
    expect(readUpdateSettings(storage)).toEqual(DEFAULT_UPDATE_SETTINGS);
  });

  it("falls back safely when persisted settings are invalid", () => {
    const storage = { getItem: () => '{"intervalMinutes":3}' };
    expect(readUpdateSettings(storage)).toEqual(DEFAULT_UPDATE_SETTINGS);
  });

  it("persists a supported interval", () => {
    let stored = "";
    writeUpdateSettings(
      { intervalMinutes: 30 },
      { setItem: (_key, value) => { stored = value; } },
    );
    expect(JSON.parse(stored)).toEqual({ intervalMinutes: 30 });
  });
});
