# Tin Grgić — a personal notebook

A first-person portfolio inside a black notebook. A short camera lean brings you over a walnut desk as your hand opens the cover; the view then rests at a reading angle. Editorial serif headings, clean body copy and small handwritten notes accompany taped scrapbook prints for **Komon** and **PK Normal**. A right hand turns forward; a left hand turns back from the left page. Poses run at 10 fps. Phones present one project per page with a visible left-page/gutter edge. Swipe horizontally or use the buttons. Project thumbnails and text links both open the live sites.

## Stack
React 19, TypeScript, Vite, Three.js, GSAP and html2canvas. A genuine WebGL scene models the covers, binding, paper stacks, curved sheet and shadows. Native HTML remains interactive at rest; direct canvas snapshots become mesh textures while pages move. The ink is pre-warped to match the live text layout, avoiding a shift at landing. No server backend, analytics, external runtime fonts, or account requirements. Self-hosted Cormorant, Caveat and DM Sans; optimized WebP imagery. Source screenshots and generated-material provenance are documented in `docs/sources.md`.

## Install and run
Requires Node.js **22.12+** (Node 24 LTS recommended) and **pnpm 11**. Install pnpm using your usual Node tooling, e.g. `npm install -g pnpm@11`.

```sh
pnpm install
pnpm dev
```

Open **http://127.0.0.1:5173**. Default dev and preview scripts bind only to loopback. If that port is occupied, use `pnpm dev --port 5178`. Ports never change silently.

```sh
pnpm build
pnpm preview
```

The production output is `dist/`; preview defaults to **http://127.0.0.1:4173**. A static file server can serve the entire dist directory. No server-side environment variables are required.

## Access over your existing VPN

```sh
pnpm dev:host --port 5173
# Or use the built version:
pnpm build
pnpm preview:host --port 4173
```

From a device connected to your existing VPN, visit **http://PC-VPN-IP:5173** or **http://PC-VPN-IP:4173**. Replace PC-VPN-IP with your PC's actual VPN address. The server and PC must stay running; VPN routing must allow peer connections.

### This PC's private Tailscale address

This repository is installed as the user service `tin-portfolio.service` and proxied by Tailscale Serve. While signed into the same tailnet, use:

**https://jellyfin-server.tail253f4c.ts.net:4178/**

The service listens only on the PC's loopback interface; Tailscale provides the private HTTPS endpoint. Check it with `systemctl --user status tin-portfolio.service` and `tailscale serve status`. Rebuild after source changes with `pnpm build`, then restart it with `systemctl --user restart tin-portfolio.service`.

`:host` binds **0.0.0.0**, meaning all local interfaces, including LAN as well as VPN. Restrict the specific port to trusted VPN peers in your OS firewall. Do not enable router port forwarding. The repository does not change firewall rules, create tunnels, or publish the site. On Windows, use the appropriate trusted profile/subnet, not a broad Public network allow rule. Use the VPN IP; if using a hostname, explicitly allow only that trusted name in Vite configuration. See [local hosting notes](docs/local-hosting-notes.md).

## Change your content
Edit **`src/config.ts`**:

- `profile.linkedin`: LinkedIn URL, currently exactly the supplied URL.
- `profile.email`: empty by default. Set your real address to show email actions in intro and contact. An empty value shows no placeholder.
- `profile.role` / `profile.company`: introduction identity.
- `projects`: names, summaries, feature tags, live URLs, local image paths and alt text.

Display composition and short editorial copy are in `src/components/Spreads.tsx`. Replace project imagery in `public/images/`, maintaining declared dimensions/aspect ratio and descriptive alt text. Keep statements factual; role ownership and outcomes are intentionally not inferred. Update source notes when content changes.

## Structure

Latest mobile clarification: retain the single-page composition, with the left leaf continuing off the viewport. Material must not be clipped at the centered container edge. The static fallback mobile frame height/width is 1.72. Intro/contact overflow remains reachable inside the paper; concise work pages fit without an internal text scroller. Header branding is the supplied bold lowercase t, recreated in `public/logo.svg`, with matching browser and Apple home-screen icons.

The physical model lives in `src/scene/NotebookScene.ts`; `src/materials.css` controls the viewport stage and static fallback. The notebook keeps the same world dimensions across sections. Mobile frames one readable page with the left leaf extending offscreen; available screen height and width control the camera, not content length. Intro/contact text enlargement remains reachable through inner-page scrolling. The fallback retains the previous 1.72 phone frame ratio.

The model has two rounded covers, a raised hinge, separate paper blocks, curved paper surfaces and an inextensible turning mesh. The left cover and stack rotate together above the right stack when opening. Forward turns use the right-hand atlas; backward turns use the independently authored left-hand atlas. See [3D architecture](docs/three-dimensional-notebook.md).


```text
src/App.tsx                 navigation, opening and page-turn orchestration
src/components/Spreads.tsx intro, work, contact content
src/config.ts              profile, contacts, projects
src/scene/NotebookScene.ts geometry, camera, textures, page curl and hands
src/scene/capturePage.ts   decoded images/fonts painted without SVG foreignObject
src/scene/warpPage.ts      consistent canvas/live-content alignment
src/styles.css             responsive materials, layout and type
public/images/             optimized screenshots, walnut, paper and hand poses
public/fonts/              local WOFF2 fonts and licenses
tests/                     interaction, viewport and axe accessibility checks
artifacts/qa/              inspected browser screenshots
artifacts/source-captures/ original live-site screenshots
docs/                      brief, storyboard, sources, QA and hosting notes
AGENTS.md                  rules for future changes
```

## Accessibility and motion
Native buttons and links; keyboard-accessible section tabs and next/previous controls; skip link, visible focus and announced section changes. New section headings receive focus. Browser back and direct hashes (`#intro`, `#work`, `#connect`) work. External links identify that they open a new tab. No email is invented.

The opening waits for local fonts and notebook/hand images to decode; **Skip opening** immediately reaches the introduction. OS **prefers-reduced-motion** removes the camera arrival and cover/hand/page animation while retaining the same 3D reading view. If WebGL cannot initialize or its context is lost, an accessible static notebook remains available. Arrow keys also navigate pages. The footer also offers a session-only manual motion toggle. If the OS requests reduced motion, the site respects it without allowing an accidental override. All content remains available. Without JavaScript, a concise fallback exposes identity and project/contact links.

## Tests

```sh
pnpm exec playwright install chromium
pnpm test
# Optional Safari-engine coverage (requires its platform libraries):
pnpm exec playwright install webkit
TEST_BROWSER=webkit pnpm test
```

Tests use port **5178** and start the server if needed. The optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` environment variable selects an already installed Chromium executable. `PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH` provides the corresponding WebKit override. The CDP touch-injection check runs only in Chromium. Tests cover six required viewport sizes, section transitions, keyboard focus, history, deep links, absent email, image loading, console errors and reduced motion; axe checks all three sections at phone and desktop widths. See [QA record](docs/qa-checklist.md).

## Performance
The real 3D renderer increases the JavaScript cost compared with the old CSS version. It is loaded as a separate chunk; exact build measurements are recorded in the QA log. Notebook, paper, screenshot and hand assets are optimized local WebP files. Fonts are local Latin/Latin Extended subsets. No remote requests are needed after local assets load. The canvas renders on changes only, with no perpetual rendering loop. Pixel ratio is capped at 1.5 and shadow maps at 512px. Content textures are cached by page and viewport, then discarded on resize; GPU resources are disposed on teardown. Slow frames are dropped rather than stretching animation duration. Original captures live outside public and are excluded from dist.

## Known limitations
Page flex uses a continuous mesh whose integrated tangent preserves the sheet’s length. It is a constrained model rather than a cloth or finite-element simulation. Hands are generated photographic cutouts positioned in the 3D scene, not full anatomical hand meshes or photographs of Tin. Pose changes are deliberately stepped. Mobile work uses one concise, non-scrolling page per project. Browser validation uses Chromium and Linux WebKit, including mobile viewports. Physical iOS/Android devices and an actual VPN peer were not available for testing. Vite preview is intended for trusted personal use, not hardened public hosting. External project sites can change after capture.

## Saved rollback version

The approved version before the October 1 animation-content repair is archived outside the project, with its built output and a verified SHA-256 checksum. See [rollback instructions](docs/rollback-2026-10-01.md).
