# DVD Bounce for GitHub Pages

A dependency-free, full-screen bouncing logo built specifically for GitHub Pages and narrowcasting displays. No Node server is needed after deployment.

## Logo URL

Base64-encode the complete HTTPS image URL. URL-safe Base64 is recommended:

```bash
node -p "Buffer.from('https://example.com/logo.png').toString('base64url')"
```

Append the result to the public Pages URL:

```text
https://username.github.io/repository/aHR0cHM6Ly9leGFtcGxlLmNvbS9sb2dvLnBuZw
```

Standard Base64 is supported too. Invalid or unavailable images fall back silently to the default DVD mark.

## Build and test

```bash
npm run build
npm test
```

The static site is generated in `dist/`. Its `index.html` and `404.html` are deliberately self-contained so Base64 paths work without external asset paths.

## Publish with GitHub Pages

1. Push this repository to GitHub.
2. Open **Settings → Pages**.
3. Select **GitHub Actions** as the source.
4. Push or merge a change into `main`, or run the workflow manually.

The workflow under `.github/workflows/` detects the repository’s Pages base path, builds the static files, and deploys them automatically.

GitHub Pages serves arbitrary Base64 paths through the custom `404.html` entry point. The animation still renders, although the initial response for such a path has HTTP status 404 because GitHub Pages does not support route rewrites.
