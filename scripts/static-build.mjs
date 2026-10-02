import { spawn } from "node:child_process";
const command =
  process.platform === "win32"
    ? "node_modules/next/dist/bin/next"
    : "node_modules/next/dist/bin/next";
const child = spawn(process.execPath, [command, "build"], {
  stdio: "inherit",
  env: { ...process.env, STATIC_EXPORT: "1", NEXT_TELEMETRY_DISABLED: "1" },
});
child.on("exit", (code) => process.exit(code ?? 1));
