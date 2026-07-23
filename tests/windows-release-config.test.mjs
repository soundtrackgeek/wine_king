import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const mainSource = readFileSync(
  new URL("../src-tauri/src/main.rs", import.meta.url),
  "utf8",
);

test("release builds use the Windows GUI subsystem", () => {
  assert.match(
    mainSource,
    /^#!\[cfg_attr\(not\(debug_assertions\), windows_subsystem = "windows"\)\]/m,
  );
});
