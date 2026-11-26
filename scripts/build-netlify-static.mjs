import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const apiDir = path.join(rootDir, "src", "app", "api");
const apiBackupDir = path.join(rootDir, ".tmp-api-backup");
const outDir = path.join(rootDir, "out");
const netlifyDir = path.join(rootDir, "netlify-static");
const nextDir = path.join(rootDir, ".next");

function safeRemove(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

let movedApi = false;

try {
  // Clean previous build artifacts so static output is spotless
  safeRemove(outDir);
  safeRemove(nextDir);
  safeRemove(netlifyDir);

  if (fs.existsSync(apiDir)) {
    safeRemove(apiBackupDir);
    fs.renameSync(apiDir, apiBackupDir);
    movedApi = true;
  }

  console.log("Building Hakku static export for Netlify Drop...");
  execSync("npx next build", {
    cwd: rootDir,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_OPTIONS: "--dns-result-order=ipv4first",
      NEXT_TELEMETRY_DISABLED: "1",
      HAKKU_STATIC_EXPORT: "true",
      NEXT_PUBLIC_STATIC_EXPORT: "true",
    },
  });

  if (!fs.existsSync(outDir)) {
    throw new Error("Next.js static export did not produce an out/ directory.");
  }

  fs.cpSync(outDir, netlifyDir, { recursive: true });

  // Netlify Drop redirects & clean fallback routing
  fs.writeFileSync(
    path.join(netlifyDir, "_redirects"),
    [
      "/workspace /workspace/index.html 200",
      "/portals /portals/index.html 200",
      "/portals/perkeso /portals/perkeso/index.html 200",
      "/portals/kwsp /portals/kwsp/index.html 200",
      "/portals/kesuma /portals/kesuma/index.html 200",
      "/portals/mytax /portals/mytax/index.html 200",
      "/vision /vision/index.html 200",
    ].join("\n") + "\n",
    "utf8"
  );

  console.log(`Static site bundle ready at: ${netlifyDir}`);
} finally {
  if (movedApi && fs.existsSync(apiBackupDir)) {
    safeRemove(apiDir);
    fs.renameSync(apiBackupDir, apiDir);
  }
  safeRemove(outDir);
}
