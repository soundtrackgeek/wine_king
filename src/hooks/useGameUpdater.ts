import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkForUpdate,
  installPendingUpdate,
  saveThenInstall,
  type AvailableUpdate,
} from "../lib/updateManager";
import {
  readUpdateSettings,
  writeUpdateSettings,
  type UpdateIntervalMinutes,
} from "../lib/updateSettings";

export type UpdatePhase =
  | "idle"
  | "checking"
  | "available"
  | "saving"
  | "downloading"
  | "installing"
  | "complete"
  | "error";

export function useGameUpdater() {
  const [settings, setSettings] = useState(readUpdateSettings);
  const [phase, setPhase] = useState<UpdatePhase>("idle");
  const [availableUpdate, setAvailableUpdate] =
    useState<AvailableUpdate | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [statusText, setStatusText] = useState("Updates have not been checked yet.");
  const [error, setError] = useState<string | null>(null);
  const checkingRef = useRef(false);
  const installingRef = useRef(false);
  const startupCheckStartedRef = useRef(false);
  const dismissedVersionRef = useRef<string | null>(null);

  const checkNow = useCallback(async (manual = true) => {
    if (checkingRef.current || installingRef.current) return null;
    checkingRef.current = true;
    if (manual) setPhase("checking");
    setError(null);

    try {
      const update = await checkForUpdate();
      const checkedAt = new Date();
      setLastCheckedAt(checkedAt);

      if (update) {
        setStatusText(`Version ${update.version} is available.`);
        if (manual || update.version !== dismissedVersionRef.current) {
          dismissedVersionRef.current = null;
          setAvailableUpdate(update);
          setPhase("available");
        } else if (manual) {
          setPhase("idle");
        }
      } else {
        setStatusText("Wine King is up to date.");
        if (manual) setPhase("idle");
      }
      return update;
    } catch (checkError) {
      const message =
        checkError instanceof Error
          ? checkError.message
          : "The update service could not be reached.";
      setStatusText("The update service could not be reached.");
      if (manual) setError(message);
      if (manual) setPhase("idle");
      return null;
    } finally {
      checkingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (startupCheckStartedRef.current) return;
    startupCheckStartedRef.current = true;
    void checkNow(false);
  }, [checkNow]);

  useEffect(() => {
    if (settings.intervalMinutes === 0) return;
    const timer = window.setInterval(
      () => void checkNow(false),
      settings.intervalMinutes * 60_000,
    );
    return () => window.clearInterval(timer);
  }, [checkNow, settings.intervalMinutes]);

  const setIntervalMinutes = useCallback(
    (intervalMinutes: UpdateIntervalMinutes) => {
      const next = { intervalMinutes };
      setSettings(next);
      writeUpdateSettings(next);
    },
    [],
  );

  const dismiss = useCallback(() => {
    dismissedVersionRef.current = availableUpdate?.version ?? null;
    setAvailableUpdate(null);
    setError(null);
    setProgress(null);
    setPhase("idle");
  }, [availableUpdate]);

  const install = useCallback(
    async (saveCurrentGame: () => Promise<unknown>) => {
      if (!availableUpdate || installingRef.current) return;
      installingRef.current = true;
      setError(null);
      setProgress(null);
      setPhase("saving");

      try {
        await saveThenInstall(saveCurrentGame, () =>
          installPendingUpdate((installProgress) => {
            setPhase(installProgress.phase);
            setProgress(installProgress.percent);
          }),
        );
        setPhase("complete");
        setStatusText(
          `Version ${availableUpdate.version} was installed in preview mode.`,
        );
      } catch (installError) {
        setError(
          installError instanceof Error
            ? installError.message
            : "The update could not be installed.",
        );
        setPhase("error");
      } finally {
        installingRef.current = false;
      }
    },
    [availableUpdate],
  );

  return {
    availableUpdate,
    checkNow,
    dismiss,
    error,
    install,
    intervalMinutes: settings.intervalMinutes,
    lastCheckedAt,
    phase,
    progress,
    setIntervalMinutes,
    statusText,
  };
}
