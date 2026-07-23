import type { AssetPack } from "../lib/assetPack";
import type { AvailableUpdate } from "../lib/updateManager";
import type { UpdatePhase } from "../hooks/useGameUpdater";
import { IconSlot } from "./IconSlot";

export function UpdateToast({
  pack,
  update,
  phase,
  progress,
  error,
  onInstall,
  onDismiss,
}: {
  pack: AssetPack;
  update: AvailableUpdate;
  phase: UpdatePhase;
  progress: number | null;
  error: string | null;
  onInstall: () => void;
  onDismiss: () => void;
}) {
  const working = ["saving", "downloading", "installing"].includes(phase);
  const phaseCopy =
    phase === "saving"
      ? "Saving your current season…"
      : phase === "downloading"
        ? progress === null
          ? "Downloading update…"
          : `Downloading update… ${progress}%`
        : phase === "installing"
          ? "Installing and preparing to restart…"
          : phase === "complete"
            ? "Preview installation complete."
            : null;

  return (
    <aside className="update-toast" role="dialog" aria-labelledby="update-title">
      <div className="update-toast-mark">
        <IconSlot pack={pack} slot="status.update" size={25} />
      </div>
      <div className="update-toast-content">
        <span className="update-kicker">Estate office notice</span>
        <h2 id="update-title">Wine King {update.version} is available</h2>
        <p className="update-version">
          Installed {update.currentVersion} · New {update.version}
        </p>
        {update.body && <p className="update-notes">{update.body}</p>}
        <p className="update-assurance">
          Updating saves the current season first, then restarts the game.
        </p>
        {phaseCopy && <p className="update-phase" role="status">{phaseCopy}</p>}
        {working && (
          <div
            className="update-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress ?? undefined}
          >
            <span style={{ width: `${progress ?? 18}%` }} />
          </div>
        )}
        {error && <p className="update-error">{error}</p>}
        <div className="update-actions">
          {phase !== "complete" && (
            <button
              type="button"
              className="update-primary"
              disabled={working}
              onClick={onInstall}
              data-testid="install-update"
            >
              <IconSlot pack={pack} slot="action.update" size={18} />
              {phase === "error" ? "Try update again" : "Update & restart"}
            </button>
          )}
          <button
            type="button"
            className="update-later"
            disabled={working}
            onClick={onDismiss}
          >
            {phase === "complete" ? "Close preview" : "Later"}
          </button>
        </div>
      </div>
    </aside>
  );
}
