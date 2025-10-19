// file: scripts/dev.mjs
import { spawn } from "node:child_process";
import net from "node:net";

const ports = [3002, 3003, 3004];

function isFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => resolve(false));
    srv.once("listening", () => srv.close(() => resolve(true)));
    srv.listen(port, "127.0.0.1");
  });
}

const port = await (async () => {
  for (const p of ports) if (await isFree(p)) return p;
  return ports[0];
})();

const child = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "dev", "--", "-p", String(port)], {
  stdio: "inherit",
  env: { ...process.env, PORT: String(port) },
});

child.on("exit", (code) => process.exit(code ?? 0));
console.log(`\n➡️  Dev server launching at http://localhost:${port}\n`);