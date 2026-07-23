const UPDATE_SETTINGS_KEY = "wine-king-update-settings-v1";

export const UPDATE_INTERVAL_OPTIONS = [0, 5, 15, 30, 60] as const;
export type UpdateIntervalMinutes = (typeof UPDATE_INTERVAL_OPTIONS)[number];

export interface UpdateSettings {
  intervalMinutes: UpdateIntervalMinutes;
}

export const DEFAULT_UPDATE_SETTINGS: UpdateSettings = {
  intervalMinutes: 5,
};

export function isUpdateInterval(
  value: unknown,
): value is UpdateIntervalMinutes {
  return (
    typeof value === "number" &&
    UPDATE_INTERVAL_OPTIONS.includes(value as UpdateIntervalMinutes)
  );
}

export function readUpdateSettings(
  storage: Pick<Storage, "getItem"> = localStorage,
): UpdateSettings {
  try {
    const stored = storage.getItem(UPDATE_SETTINGS_KEY);
    if (!stored) return DEFAULT_UPDATE_SETTINGS;
    const parsed = JSON.parse(stored) as Partial<UpdateSettings>;
    if (!isUpdateInterval(parsed.intervalMinutes)) {
      return DEFAULT_UPDATE_SETTINGS;
    }
    return { intervalMinutes: parsed.intervalMinutes };
  } catch {
    return DEFAULT_UPDATE_SETTINGS;
  }
}

export function writeUpdateSettings(
  settings: UpdateSettings,
  storage: Pick<Storage, "setItem"> = localStorage,
): void {
  storage.setItem(UPDATE_SETTINGS_KEY, JSON.stringify(settings));
}
