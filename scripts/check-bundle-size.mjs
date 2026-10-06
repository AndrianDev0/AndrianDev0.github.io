import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const assetsDirectory = fileURLToPath(new URL("../dist-vercel/assets/", import.meta.url));
const limits = { ".js": 100 * 1024, ".css": 30 * 1024 };
const labels = { ".js": "JavaScript", ".css": "CSS" };
let failed = false;

for (const file of readdirSync(assetsDirectory)) {
  const extension = extname(file);
  if (!(extension in limits)) continue;
  const size = gzipSync(readFileSync(join(assetsDirectory, file))).byteLength;
  const limit = limits[extension];
  console.log(`${labels[extension]} ${file}: ${(size / 1024).toFixed(1)} KB gzip (limit ${(limit / 1024).toFixed(0)} KB)`);
  if (size > limit) failed = true;
}

if (failed) process.exitCode = 1;
