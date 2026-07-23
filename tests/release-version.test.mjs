import assert from "node:assert/strict";
import test from "node:test";

import {
  createReleaseState,
  readProjectVersions,
  verifyProjectVersion,
} from "../scripts/release-version.mjs";

test("all release version sources remain synchronized", () => {
  assert.equal(verifyProjectVersion(), "0.2.1");
  assert.deepEqual(
    [...new Set(Object.values(readProjectVersions()))],
    ["0.2.1"],
  );
});

test("a missing tag requests a stable release", () => {
  assert.deepEqual(createReleaseState("0.2.1", []), {
    version: "0.2.1",
    tag: "v0.2.1",
    prerelease: false,
    shouldRelease: true,
  });
});

test("an existing tag prevents a duplicate release", () => {
  assert.equal(
    createReleaseState("0.2.1", ["v0.2.0", "v0.2.1"]).shouldRelease,
    false,
  );
});
