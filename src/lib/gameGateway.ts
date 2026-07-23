import { invoke } from "@tauri-apps/api/core";
import type { GameState, PlayerAction } from "../types/game";
import { createDemoGame, demoAdvanceWeek, demoPerform } from "./previewEngine";
import { isTauriRuntime } from "./runtime";

const WEB_SAVE_KEY = "wine-king-v0.1.0-save";
let previewGame = createDemoGame();

export async function getGame(): Promise<GameState> {
  if (isTauriRuntime()) return invoke<GameState>("get_game");
  return structuredClone(previewGame);
}

export async function newGame(seed = 2_026_072_300_1): Promise<GameState> {
  if (isTauriRuntime()) return invoke<GameState>("new_game", { seed });
  previewGame = createDemoGame(seed);
  return structuredClone(previewGame);
}

export async function performAction(action: PlayerAction): Promise<GameState> {
  if (isTauriRuntime()) return invoke<GameState>("perform_action", { action });
  previewGame = demoPerform(previewGame, action);
  return structuredClone(previewGame);
}

export async function advanceWeek(): Promise<GameState> {
  if (isTauriRuntime()) return invoke<GameState>("advance_week");
  previewGame = demoAdvanceWeek(previewGame);
  return structuredClone(previewGame);
}

export async function saveGame(): Promise<string> {
  if (isTauriRuntime()) return invoke<string>("save_game");
  localStorage.setItem(WEB_SAVE_KEY, JSON.stringify(previewGame));
  return "Browser preview storage";
}

export async function loadGame(): Promise<GameState> {
  if (isTauriRuntime()) return invoke<GameState>("load_game");
  const saved = localStorage.getItem(WEB_SAVE_KEY);
  if (!saved) throw new Error("No saved season was found yet.");
  previewGame = JSON.parse(saved) as GameState;
  return structuredClone(previewGame);
}
