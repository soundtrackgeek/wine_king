import { relaunch } from "@tauri-apps/plugin-process";
import {
  check,
  type DownloadEvent,
  type Update,
} from "@tauri-apps/plugin-updater";
import packageInfo from "../../package.json";
import { isTauriRuntime } from "./runtime";

export interface AvailableUpdate {
  currentVersion: string;
  version: string;
  date?: string;
  body?: string;
}

export interface InstallProgress {
  phase: "downloading" | "installing";
  percent: number | null;
  downloadedBytes: number;
  totalBytes?: number;
}

let pendingUpdate: Update | "browser-preview" | null = null;

function isBrowserUpdatePreview(): boolean {
  if (isTauriRuntime()) return false;
  return new URLSearchParams(window.location.search).get("update-preview") === "1";
}

export async function checkForUpdate(): Promise<AvailableUpdate | null> {
  if (isBrowserUpdatePreview()) {
    pendingUpdate = "browser-preview";
    return {
      currentVersion: packageInfo.version,
      version: "0.2.1",
      date: new Date().toISOString(),
      body:
        "A preview update with balance refinements and estate presentation improvements.",
    };
  }

  if (!isTauriRuntime()) {
    pendingUpdate = null;
    return null;
  }

  const previousUpdate =
    pendingUpdate && pendingUpdate !== "browser-preview" ? pendingUpdate : null;
  const update = await check({ timeout: 30_000 });
  if (previousUpdate) {
    await previousUpdate.close().catch(() => undefined);
  }
  pendingUpdate = update;
  if (!update) return null;

  return {
    currentVersion: update.currentVersion,
    version: update.version,
    date: update.date,
    body: update.body,
  };
}

export async function installPendingUpdate(
  onProgress: (progress: InstallProgress) => void,
): Promise<void> {
  if (!pendingUpdate) {
    throw new Error("The available update is no longer ready. Check again.");
  }

  if (pendingUpdate === "browser-preview") {
    const totalBytes = 12_000_000;
    for (const percent of [8, 28, 57, 83, 100]) {
      onProgress({
        phase: "downloading",
        percent,
        downloadedBytes: (totalBytes * percent) / 100,
        totalBytes,
      });
      await wait(120);
    }
    onProgress({
      phase: "installing",
      percent: 100,
      downloadedBytes: totalBytes,
      totalBytes,
    });
    await wait(240);
    return;
  }

  let downloadedBytes = 0;
  let totalBytes: number | undefined;
  const reportProgress = (event: DownloadEvent) => {
    if (event.event === "Started") {
      totalBytes = event.data.contentLength;
    } else if (event.event === "Progress") {
      downloadedBytes += event.data.chunkLength;
    } else {
      onProgress({
        phase: "installing",
        percent: 100,
        downloadedBytes,
        totalBytes,
      });
      return;
    }

    onProgress({
      phase: "downloading",
      percent: totalBytes
        ? Math.min(100, Math.round((downloadedBytes / totalBytes) * 100))
        : null,
      downloadedBytes,
      totalBytes,
    });
  };

  await pendingUpdate.downloadAndInstall(reportProgress, {
    timeout: 10 * 60_000,
  });
  await relaunch();
}

export async function saveThenInstall(
  save: () => Promise<unknown>,
  install: () => Promise<void>,
): Promise<void> {
  await save();
  await install();
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
