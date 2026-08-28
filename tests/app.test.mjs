import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import test from "node:test";

const require = createRequire(import.meta.url);
const {
  decodeImageUrl,
  encodedImageFromPath,
  normalizeBasePath,
} = require("../src/app.cjs");

test("decodes standard and URL-safe Base64 image URLs", () => {
  const imageUrl = "https://cdn.example.com/logo.png?width=800&format=webp";
  const standard = Buffer.from(imageUrl).toString("base64");
  const urlSafe = Buffer.from(imageUrl).toString("base64url");

  assert.equal(decodeImageUrl(standard), imageUrl);
  assert.equal(decodeImageUrl(urlSafe), imageUrl);
  assert.equal(decodeImageUrl("not-an-image-url"), null);
});

test("extracts the encoded route beneath a GitHub project base path", () => {
  const encoded = Buffer.from("https://example.com/logo.png").toString("base64url");

  assert.equal(normalizeBasePath("dvd-bounce/"), "/dvd-bounce");
  assert.equal(encodedImageFromPath(`/dvd-bounce/${encoded}`, "/dvd-bounce"), encoded);
  assert.equal(encodedImageFromPath("/dvd-bounce/", "/dvd-bounce"), null);
  assert.equal(encodedImageFromPath(`/${encoded}`, "/"), encoded);
});

test("builds self-contained index and 404 entry points", async () => {
  const [index, notFound] = await Promise.all([
    readFile(new URL("../dist/index.html", import.meta.url), "utf8"),
    readFile(new URL("../dist/404.html", import.meta.url), "utf8"),
  ]);

  assert.equal(index, notFound);
  assert.match(index, /window\.__DVD_BOUNCE_BASE_PATH__ = "\/dvd-bounce"/);
  assert.match(index, /function decodeImageUrl/);
  assert.match(index, /class="screensaver"/);
  assert.doesNotMatch(
    index,
    /__DVD_BOUNCE_(?:STYLES|SCRIPT|BASE_PATH_JSON)__|<link|<script[^>]+src=/,
  );
  assert.doesNotMatch(index, /Pause|Resume|CUSTOM LOGO|Space/);
});
