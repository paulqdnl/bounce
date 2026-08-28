import { mkdir, readFile, writeFile } from "node:fs/promises";

const sourceRoot = new URL("./src/", import.meta.url);
const outputRoot = new URL("./dist/", import.meta.url);
const requestedBasePath = process.argv[2] || "/";
const basePath =
  requestedBasePath === "/"
    ? "/"
    : `/${requestedBasePath.replace(/^\/+|\/+$/g, "")}`;

const [template, styles, script] = await Promise.all([
  readFile(new URL("index.html", sourceRoot), "utf8"),
  readFile(new URL("styles.css", sourceRoot), "utf8"),
  readFile(new URL("app.cjs", sourceRoot), "utf8"),
]);

const html = template
  .replace("/* __DVD_BOUNCE_STYLES__ */", styles.trim())
  .replace("__DVD_BOUNCE_BASE_PATH_JSON__", JSON.stringify(basePath))
  .replace("/* __DVD_BOUNCE_SCRIPT__ */", script.trim());

await mkdir(outputRoot, { recursive: true });
await Promise.all([
  writeFile(new URL("index.html", outputRoot), html),
  writeFile(new URL("404.html", outputRoot), html),
  writeFile(new URL(".nojekyll", outputRoot), ""),
]);

console.log(`Built GitHub Pages files for base path ${basePath}`);
