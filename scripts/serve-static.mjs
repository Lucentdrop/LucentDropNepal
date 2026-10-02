import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("out");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
};
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(
      new URL(req.url ?? "/", "http://localhost").pathname,
    );
    const target = resolve(root, "." + path);
    if (target !== root && !target.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    let file;
    for (const candidate of [
      target,
      target + ".html",
      resolve(target, "index.html"),
    ]) {
      try {
        if ((await stat(candidate)).isFile()) {
          file = candidate;
          break;
        }
      } catch {
        /* Try extensionless HTML and directory index. */
      }
    }
    const status = file ? 200 : 404;
    file ??= resolve(root, "404.html");
    res.writeHead(status, {
      "Content-Type": types[extname(file)] ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    });
    res.end(req.method === "HEAD" ? undefined : await readFile(file));
  } catch {
    res.writeHead(400);
    res.end("Bad request");
  }
}).listen(3001, "127.0.0.1", () =>
  console.log("Static production preview: http://localhost:3001"),
);
