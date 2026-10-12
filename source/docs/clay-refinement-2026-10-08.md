# Reference-led clay refinement — 8 October 2026

This revision addresses Tin's feedback that the first redesign still looked flat and that the hand did not match the original references. The reference images remain the acceptance target; automated tests establish behavior, not artistic equivalence.

## Rollback

No Git repository exists. Before changes, a fresh archive was created at:

`/home/tin/Documents/ChatGPT/Portfolio-backups/pre-clay-refinement-20261008-122148/workspace.tar.gz`

The directory also contains Git status/diff/staged-diff outputs and restoration instructions. Dependencies, compiled builds and historical test artifacts are excluded. Restore to a separate empty directory first.

## Changes

- Removed the separate sleeve cylinder and its visible cuff join. Complete hand/cuff/forearm sprites now supply a continuous outline. Only the lower offscreen sleeve tail is extended in mesh geometry, keeping anatomy and grip coordinates intact.
- Re-authored both photographic hand directions from the supplied reference: warm skin, broader anatomy, short ribbed charcoal/sage cuff. Twelve distinct authored poses per direction replace the former six. The left sequence is separately generated, not mirrored. Physical grip anchors and continuous transforms remain.
- New dimensional name, Connect statement, bulb/cloud cable and folded plane artwork. Stronger sidewalls, fingerprints, directional highlights and tight contact shadows make these read as sculpted clay. These remain optimized transparent images with semantic text in the DOM, as requested in the original architecture brief.
- New cotton-paper, worn walnut, leather, stoneware and wool surface assets. Paper receives both visible fiber color and real bump shading. Ceramic vessels receive authored cylindrical UVs and the reference's indigo pine/speckle decoration.
- Authored geometry now includes slight thumb-pressed irregularity in pottery, thicker leaves, uneven page laminations, gently imperfect covers and rolled leather perimeter edges.
- The notebook now rests against the desk height. Camera angle and lateral viewpoint provide more depth; root scale and FOV remain fixed. Warm directional lighting has stronger separation from ambient fill.
- Printed project/contact cards have visible layered paper edges and directional contact shadows. Desktop project screenshots are taller to show their contents. Existing factual screenshot assets remain unchanged.
- Live HTML, curved page mesh, capture/warp mapping, navigation, reduced motion and fallback remain in place. No framework migration, background video or continuous idle renderer.

## Generated asset provenance

Mode: built-in image generation. Reference inputs: the user's original closed notebook, Work, Connect and lookbook images. Generated sources are retained in `/home/tin/.codex/generated_images/01a1113c-51cc-7f70-9117-d21831d49e22/`. PNG-to-WebP conversion preserves alpha; the hand atlases are unpacked as twelve disconnected alpha sprites without mirroring. `scripts/unpack-hand-atlas.py` preserves each complete silhouette, including sleeves that cross nominal grid boundaries. No repainting or pose synthesis is used. The Connect title is cropped to remove excess transparent top padding.

| Asset | Source PNG |
|---|---|
| `public/images/hands-clay-full/forward-{1..12}.webp` | `exec-17e8d3f5-9559-4a55-ad9b-9966774f430e.png` |
| `public/images/hands-clay-full/backward-{1..12}.webp` | `exec-75cfbfef-ddd5-4450-b900-fc0a5f09cc5e.png` |
| `public/images/clay-v2/name.webp` | `exec-e0b2fedb-1b55-4bdd-bfe3-f79c9e5e53da.png` |
| `public/images/clay-v2/good-things.webp` | `exec-6a0f24ce-8f15-422c-8ed1-a876127d01a5.png` |
| `public/images/clay-v2/bulb-cloud.webp` | `exec-4d073081-e4a5-4220-9818-63d720301e1b.png` |
| `public/images/clay-v2/paper-plane.webp` | `exec-d4313488-134e-4263-b298-379250f21fdf.png` |
| `public/images/clay-v2/paper.webp` | `exec-944a2299-c435-4a3c-8283-645bc684cc50.png` |
| `public/images/clay-v2/ceramic.webp` | `exec-d61e579e-ea16-43db-b4f6-11bc8bf04e8b.png` |
| `public/images/clay-v2/walnut.webp` | `exec-469d590f-6d96-4244-9d2c-acb3cb0f4678.png` |
| `public/images/clay-v2/knit.webp` (unused sleeve study) | `exec-1a3138b8-9603-459c-979a-6df41eb1b139.png` |
| `public/images/clay-v2/leather.webp` | `exec-b07f1f30-e141-4959-a992-9a9b109625aa.png` |

## Prompt set

The prompts shared these constraints: use the supplied reference as the exact material/style target; warm upper-left light; handmade tactile stop-motion craftsmanship; no unrelated props or text; genuinely transparent alpha for decorative pieces and hand atlases; diffuse full-frame surface coverage for material textures.

- Right hand: 4×3 atlas of twelve matching adult right-hand poses from first-person POV, back of hand toward camera, thumb left, short charcoal/sage ribbed sleeve entering lower right. Warm terracotta skin, broader rounded anatomy, short nails. Small sequential reach, curl, pinch, wrist rotation and release changes; complete fingers within each cell.
- Left hand: companion separately authored 4×3 left-hand atlas, thumb right and sleeve lower left. Keep upper-left light rather than mirroring its direction. Same anatomy, fabric and twelve-stage movement.
- Name: exact two-line text `Tin` / `Grgić.` with acute ć and small red clay period. Thick rounded charcoal plasticine, fingerprints, warm highlights and contact shadows; mustard rays beside Tin; no paper background.
- Statement: exact four-line text `Good` / `things` / `start with` / `a hello.`. Charcoal words with terracotta `hello.`, thick rounded matte clay and tiny dents, mustard rays beside Good, transparent counters and background.
- Bulb/cloud: reference's mustard light bulb, thick charcoal cable with one loop, cream puffy cloud, mustard rays. Sculpted rounded clay and dark contact shadows, 3:1 transparent composition.
- Plane: thick charcoal cable with one loop leading to folded warm-cream clay paper plane pointing upper right, mustard rays, sculpted folds and contact shadow, 3:1 transparent composition.
- Paper: blank warm-cream cotton paper, tiny fibers, pressed pulp, restrained flecks and undulations; no ruling, text, stains, edge or parchment aging; diffuse macro surface.
- Pottery: flat unwrapped oatmeal stoneware glaze, irregular brown/indigo speckles and tiny granules; hand-painted navy pine forest along lower quarter; no vessel silhouette or perspective.
- Walnut: orthographic worn warm walnut/dark-honey broad planks, swirling grain, knots, dents and scratches, restrained saturation, no objects or perspective, diffuse material color.
- Knit: seamless charcoal wool with subtle sage/olive cast, chunky vertical ribs, fuzzy yarn, warmth and brightness matching the hand cuff; no cuff edge or skin.
- Leather: seamless very dark charcoal supple notebook leather, fine pebbling and diagonal wrinkles, pressed dents and rubbed warm-gray highlights; matte, no strap, seams, outline or text.

### Final continuous-arm prompt additions

Both final atlases retained the hand-reference constraints above, with these additions: exactly four columns and three rows of portrait 3:5 sprites; entire continuous ribbed sweater forearm from wrist to bottom of every cell; hand in upper 35%, sleeve in lower 65%; sleeve naturally attached, no disconnected cuff, no labels or grid; fingers inset; constant scale/placement. The left atlas was separately authored with upper-left lighting. Short-cuff atlases and the separate knit study were rejected after render review exposed the join. Final delivery uses only `hands-clay-full`.

## Verification

Evidence is stored separately under `artifacts/clay-refinement/`.

- Full regression: 35/36 passed. One rapid history/resize case exposed a stale capture failure.
- The stale navigation catch and stale capture publication are now guarded by operation tokens. A later contended software-rendering run passed 8/9 affected cases but exceeded the 5-second UI assertion in the resize case. Its isolated rerun passed.
- Final serial rerun of all six motion cases plus all three redesign cases: **9/9 passed (2.1 minutes)**. This includes both page-turn directions, fixed-scale camera translation, overlay controls, bounded texture allocation, stopped idle rendering, delayed-asset skip and hardware-failure fallback.
- The final continuous-arm assets were followed by another serial 9/9 motion/redesign pass and 40 refreshed opening-state captures.
- Production mobile smoke testing then exposed a hidden-image capture edge case: a `display:none` plane motif produced a zero-size `data:,` image. Capture now omits hidden images in its isolated clone, and a regression explicitly checks that mobile Connect retains WebGL. The repeated-navigation GPU test now asserts WebGL after every navigation so fallback cannot masquerade as successful resource cleanup.
- The existing Three.js chunk-size warning remains; the scene is dynamically imported. This is not a claim of physical iPhone/Safari or hardware-GPU performance testing.

- Final complete regression after the capture fix: **37/37 passed (7.5 minutes)** with one Chromium worker. Log: `artifacts/clay-refinement/final-regression.log`. Includes axe accessibility, content continuity, fixed geometry, opening/page turns, keyboard/history, responsive layouts, enlarged copy, texture allocation, reduced motion, fallback and touch gestures.
- Production TypeScript/Vite build passed; log: `artifacts/clay-refinement/build-final.log`. The dynamic Three.js chunk warning remains.

## Final visual matrix

`artifacts/clay-refinement/final/` contains 64 direct browser captures: three static sections at eight viewport sizes, plus eight opening states at five desktop sizes. The refreshed opening matrix uses the final complete-arm sprites. All recorded root scales are `[1,1,1]`; the static matrix reports no horizontal overflow or uncaught page errors. Open-book width is 73.1% at 1440×900, 68.0% at 1920×1080, 70.7% at 2560×1440, 63.5% at the shorter 1366×768 viewport, and 71.3% at 1280×800. The shorter viewport intentionally prioritizes vertical fit.

Tablet project images use a 2:1 print crop to eliminate the observed 11px inner overflow. Connect still permits intentional inner scrolling. No notebook dimensions depend on content.

## Remaining visual and test limits

The original reference images remain the visual target. This revision supplies substantially thicker clay artwork, matching warm hand/sleeve styling and tactile surfaces; it does not establish that the rendered scene is indistinguishable from the reference photographs. Props remain stylized authored geometry. Hands have twelve authored poses per direction with continuous scene movement, rather than 18–24 unique photographic frames per second. Materials use generated color and derived bump with scalar roughness, not measured PBR scans. Static clay artwork uses baked depth inside the semantic HTML plane, as specified by the hybrid architecture.

Verification uses Chromium with software WebGL. Physical iPhone/Safari and laptop GPU performance have not been newly measured. The existing private Tailscale endpoint is reused without network or hosting configuration changes.


## Compiled preview verification — 9 October

All twelve production routes (Hello, Work, Connect at 390×844, 430×932, 768×1024 and 1440×900) reached the stable WebGL reading state. No console/page errors, broken images, horizontal overflow or visible calibration UI were recorded. Final static captures for these sizes replace the development images in the 64-frame matrix. Evidence: `artifacts/clay-refinement/production-smoke.json`; reproducible check: `node scripts/check-production-preview.mjs`.

The existing private HTTPS preview and a new complete-hand asset both returned HTTP 200 through the configured Tailscale address. This verifies the host endpoint, not a separate phone connection.
