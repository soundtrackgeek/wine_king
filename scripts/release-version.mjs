import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRepositoryRoot = path.resolve(scriptDirectory, "..");
const semanticVersionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function packageVersionFromToml(contents, fileName) {
  const packageBlock = contents.match(
    /\[package\]([\s\S]*?)(?=\r?\n\[[^\[]|$)/,
  );
  const version = packageBlock?.[1].match(
    /^\s*version\s*=\s*"([^"]+)"\s*$/m,
  )?.[1];

  if (!version) {
    throw new Error(`Could not read the package version from ${fileName}.`);
  }

  return version;
}

function packageVersionFromCargoLock(contents) {
  const version = contents.match(
    /\[\[package\]\]\s*\r?\nname = "wine-king"\s*\r?\nversion = "([^"]+)"/,
  )?.[1];

  if (!version) {
    throw new Error("Could not read the wine-king version from Cargo.lock.");
  }

  return version;
}

export function readProjectVersions(repositoryRoot = defaultRepositoryRoot) {
  const packageJson = readJson(path.join(repositoryRoot, "package.json"));
  const packageLock = readJson(path.join(repositoryRoot, "package-lock.json"));
  const tauriConfig = readJson(
    path.join(repositoryRoot, "src-tauri", "tauri.conf.json"),
  );
  const cargoToml = readFileSync(
    path.join(repositoryRoot, "src-tauri", "Cargo.toml"),
    "utf8",
  );
  const cargoLock = readFileSync(
    path.join(repositoryRoot, "src-tauri", "Cargo.lock"),
    "utf8",
  );

  return {
    "package.json": packageJson.version,
    "package-lock.json": packageLock.version,
    "Cargo.toml": packageVersionFromToml(cargoToml, "Cargo.toml"),
    "Cargo.lock": packageVersionFromCargoLock(cargoLock),
    "tauri.conf.json": tauriConfig.version,
  };
}

export function verifyProjectVersion(
  repositoryRoot = defaultRepositoryRoot,
) {
  const versions = readProjectVersions(repositoryRoot);
  const uniqueVersions = [...new Set(Object.values(versions))];

  if (uniqueVersions.length !== 1) {
    const details = Object.entries(versions)
      .map(([fileName, version]) => `${fileName}=${version}`)
      .join(", ");
    throw new Error(`Release versions are not synchronized: ${details}`);
  }

  const [version] = uniqueVersions;

  if (!semanticVersionPattern.test(version)) {
    throw new Error(`Release version is not valid semantic versioning: ${version}`);
  }

  return version;
}

export function createReleaseState(version, existingTags = []) {
  const tag = `v${version}`;

  return {
    version,
    tag,
    prerelease: version.includes("-"),
    shouldRelease: !existingTags.includes(tag),
  };
}

function localTags(repositoryRoot) {
  const output = execFileSync("git", ["tag", "--list"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });

  return output
    .split(/\r?\n/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function writeGitHubOutput(state) {
  const outputPath = process.env.GITHUB_OUTPUT;

  if (!outputPath) {
    throw new Error("GITHUB_OUTPUT is required with --github-output.");
  }

  appendFileSync(
    outputPath,
    [
      `version=${state.version}`,
      `tag=${state.tag}`,
      `prerelease=${state.prerelease}`,
      `should_release=${state.shouldRelease}`,
      "",
    ].join("\n"),
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const version = verifyProjectVersion();
  const state = createReleaseState(version, localTags(defaultRepositoryRoot));

  if (process.argv.includes("--github-output")) {
    writeGitHubOutput(state);
  } else {
    console.log(JSON.stringify(state, null, 2));
  }
}
