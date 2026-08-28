# Bounce

A dependency-free DVD-style bouncing logo for narrowcasting screens. It fills the viewport, has no visible controls, and runs entirely in the browser on GitHub Pages.

Repository: [github.com/paulqdnl/bounce](https://github.com/paulqdnl/bounce)

## Use it

Opening the site without a logo URL shows the default DVD mark:

<https://paulqdnl.github.io/bounce/>

To display another image, URL-safe Base64-encode its complete HTTPS URL:

```bash
node -p "Buffer.from('https://example.com/logo.png').toString('base64url')"
```

Append the result to the Pages URL after a `#`:

```text
https://paulqdnl.github.io/bounce/#aHR0cHM6Ly9leGFtcGxlLmNvbS9sb2dvLnBuZw
```

Standard Base64 is also supported, but URL-safe Base64 is recommended because it avoids special path characters. Invalid or unavailable images fall back silently to the default DVD mark.

The hash keeps the encoded value in the browser. Static hosting only receives a request for `/bounce/`, so the initial document response has HTTP status `200`.

## Development

The project has no runtime dependencies. Node is only used to assemble and test the static deployment files.

```bash
npm run build
npm test
```

The build writes the deployable site to `dist/`:

- `index.html` handles the Pages root.
- `404.html` keeps legacy path-based links working in regular browsers.
- `.nojekyll` disables Jekyll processing.

The HTML files are self-contained, so no stylesheet or script asset paths can break when the site is opened at a nested Base64 route.

## Deployment

The workflow in `.github/workflows/deploy-pages.yml` builds and deploys the site whenever `main` changes. It also supports manual runs.

To enable the first deployment:

1. Open [the repository’s Pages settings](https://github.com/paulqdnl/bounce/settings/pages).
2. Select **GitHub Actions** as the publishing source.
3. Merge or push a change to `master`, or run the workflow manually.

## Static hosting

The recommended hash URL format works without server-side rewrites because URL fragments are handled entirely by the browser. GitHub Pages serves `index.html` from the site root with HTTP status `200`, and the application reads the encoded image URL from the hash.

Legacy links that put the Base64 value in the path remain supported through `404.html`, although static hosts return those paths with HTTP status `404`.
