import assert from "node:assert/strict";
import test from "node:test";

import {
  createReleaseState,
  readProjectVersions,
  verifyProjectVersion,
} from "../scripts/release-version.mjs";

test("all release version sources remain synchronized", () => {
  assert.equal(verifyProjectVersion(), "0.2.0");
  assert.deepEqual(
    [...new Set(Object.values(readProjectVersions()))],
    ["0.2.0"],
  );
});

test("a missing tag requests a stable release", () => {
  assert.deepEqual(createReleaseState("0.2.0", []), {
    version: "0.2.0",
    tag: "v0.2.0",
    prerelease: false,
    shouldRelease: true,
  });
});

test("an existing tag prevents a duplicate release", () => {
  assert.equal(
    createReleaseState("0.2.0", ["v0.1.2", "v0.2.0"]).shouldRelease,
    false,
  );
});
