import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const useShell = process.platform === "win32";

const dashboards = [
  {
    name: "noiseguard",
    cwd: "IT22101310/noiseguard-dashboard-main",
    url: "http://localhost:8080",
  },
  {
    name: "liftguard",
    cwd: "IT22587824/liftguard-dashboard",
    url: "http://localhost:8081",
  },
  {
    name: "iot-dashboard",
    cwd: "IT22114358/IOT_Dashboard",
    url: "http://localhost:3000",
  },
  {
    name: "temperature",
    cwd: "temperature",
    url: "http://localhost:8099",
  },
];

const children = [];
let shuttingDown = false;

console.log("Starting frontend dashboards...\n");
for (const dashboard of dashboards) {
  console.log(`- ${dashboard.name}: ${dashboard.url}`);
}
console.log("");

for (const dashboard of dashboards) {
  const child = spawn("npm", ["run", "dev"], {
    cwd: resolve(repoRoot, dashboard.cwd),
    shell: useShell,
    stdio: ["inherit", "pipe", "pipe"],
  });

  children.push(child);

  child.stdout.on("data", (data) => {
    prefixLines(dashboard.name, data, process.stdout);
  });

  child.stderr.on("data", (data) => {
    prefixLines(dashboard.name, data, process.stderr);
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.error(`\n${dashboard.name} stopped with ${reason}. Stopping the other dashboards...`);
    shutdown(code ?? 1);
  });

  child.on("error", (error) => {
    console.error(`\nFailed to start ${dashboard.name}: ${error.message}`);
    shutdown(1);
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

function prefixLines(name, data, stream) {
  const lines = data.toString().split(/\r?\n/);
  for (const line of lines) {
    if (line.trim().length > 0) {
      stream.write(`[${name}] ${line}\n`);
    }
  }
}

function shutdown(exitCode) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }

  setTimeout(() => {
    process.exit(exitCode);
  }, 250);
}
