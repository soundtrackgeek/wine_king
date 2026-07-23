import assert from "node:assert/strict";
import test from "node:test";

import viteConfig from "../vite.config.mjs";

test("Vite ignores Cargo-managed files", () => {
  assert.deepEqual(viteConfig.server.watch.ignored, ["**/src-tauri/**"]);
});
