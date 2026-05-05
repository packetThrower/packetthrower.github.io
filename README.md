# packetthrower.github.io

Landing page at <https://packetthrower.github.io/> — a portal that
links to [PortFinder](https://github.com/packetThrower/PortFinder) and
[Baudrun](https://github.com/packetThrower/Baudrun). Single-page
static site built with [Astro](https://astro.build/).

## Develop

```bash
pnpm install
pnpm dev        # local preview at http://localhost:4321
pnpm build      # production build into dist/
```

## Deploy

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on
every push to `main`. Pages source must be set to **GitHub Actions**
in the repo settings (one-time).
