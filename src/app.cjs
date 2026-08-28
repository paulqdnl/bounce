const SPEED = 156;
const HUES = [194, 264, 326, 24, 92, 166];

function normalizeBasePath(basePath) {
  const value = String(basePath || "/").trim();
  if (!value || value === "/") return "/";
  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

function encodedImageFromPath(pathname, basePath = "/") {
  const normalizedBase = normalizeBasePath(basePath);
  let route = String(pathname || "/");

  if (normalizedBase !== "/") {
    if (route === normalizedBase || route === `${normalizedBase}/`) return null;
    if (!route.startsWith(`${normalizedBase}/`)) return null;
    route = route.slice(normalizedBase.length);
  }

  const encoded = route.replace(/^\/+/, "");
  return encoded || null;
}

function encodedImageFromHash(hash) {
  const encoded = String(hash || "").replace(/^#\/?/, "");
  return encoded || null;
}

function decodeImageUrl(encodedValue) {
  if (!encodedValue) return null;
  let encoded = String(encodedValue);

  try {
    encoded = decodeURIComponent(encoded);
  } catch {
    // Continue with the raw path value when percent encoding is malformed.
  }

  try {
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const candidate = new TextDecoder().decode(bytes);
    const url = new URL(candidate);

    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function startScreensaver() {
  const stage = document.getElementById("screensaver");
  const logo = document.getElementById("bouncing-logo");
  const customLogo = document.getElementById("custom-logo");
  const defaultLogo = document.getElementById("default-logo");

  if (!stage || !logo || !customLogo || !defaultLogo) return;

  const basePath = window.__DVD_BOUNCE_BASE_PATH__ || "/";
  const encodedImage =
    encodedImageFromHash(window.location.hash) ||
    encodedImageFromPath(window.location.pathname, basePath);
  const imageUrl = decodeImageUrl(encodedImage);
  const position = { x: 36, y: 36 };
  const velocity = { x: SPEED, y: SPEED * 0.72 };
  let ready = !imageUrl;
  let lastTime = null;
  let hueIndex = 0;

  function moveLogo(x, y) {
    position.x = x;
    position.y = y;
    logo.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function fitInsideStage() {
    const maxX = Math.max(0, stage.clientWidth - logo.offsetWidth);
    const maxY = Math.max(0, stage.clientHeight - logo.offsetHeight);
    moveLogo(
      Math.min(maxX, Math.max(0, position.x)),
      Math.min(maxY, Math.max(0, position.y)),
    );
  }

  if (imageUrl) {
    defaultLogo.style.display = "none";
    customLogo.addEventListener("load", () => {
      ready = true;
      requestAnimationFrame(fitInsideStage);
    });
    customLogo.addEventListener("error", () => {
      customLogo.style.display = "none";
      defaultLogo.style.display = "grid";
      ready = true;
      requestAnimationFrame(fitInsideStage);
    });
    customLogo.style.display = "block";
    customLogo.src = imageUrl;
  }

  const startX = Math.max(20, (stage.clientWidth - logo.offsetWidth) * 0.18);
  const startY = Math.max(20, (stage.clientHeight - logo.offsetHeight) * 0.22);
  moveLogo(startX, startY);

  function animate(time) {
    if (lastTime === null) lastTime = time;
    const elapsed = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    if (ready) {
      const maxX = Math.max(0, stage.clientWidth - logo.offsetWidth);
      const maxY = Math.max(0, stage.clientHeight - logo.offsetHeight);
      let nextX = position.x + velocity.x * elapsed;
      let nextY = position.y + velocity.y * elapsed;
      let collided = false;

      if (nextX <= 0 || nextX >= maxX) {
        nextX = Math.min(maxX, Math.max(0, nextX));
        velocity.x *= -1;
        collided = true;
      }

      if (nextY <= 0 || nextY >= maxY) {
        nextY = Math.min(maxY, Math.max(0, nextY));
        velocity.y *= -1;
        collided = true;
      }

      if (collided) {
        hueIndex = (hueIndex + 1) % HUES.length;
        document.documentElement.style.setProperty("--accent-hue", HUES[hueIndex]);
      }

      moveLogo(nextX, nextY);
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", fitInsideStage);
  requestAnimationFrame(animate);
}

if (typeof document !== "undefined") {
  startScreensaver();
}

if (typeof module !== "undefined") {
  module.exports = {
    decodeImageUrl,
    encodedImageFromHash,
    encodedImageFromPath,
    normalizeBasePath,
  };
}
