# Visual redesign audit — 6 October 2026

Status: Milestone 0 only. No visual rebuild, runtime source changes, new dependencies, deployment, or generated replacement artwork in this pass. This document records observed implementation, reference analysis, required assets, and the proposed sequence. A feature existing is not evidence of visual acceptance.

## Recovery and inventory

The working directory is `/home/tin/Documents/ChatGPT/Portfolio`. `git status` and `git log` report **not a git repository**. There is no `.git` directory and no usable parent repository; tracked/untracked or staged/unstaged distinctions cannot be established. Treat all current files as work to preserve. No reset, stash, Git initialization, or overwrite of existing assets was performed.

Verified backup, created before audit additions or build:

`/home/tin/Documents/ChatGPT/Portfolio-backups/pre-visual-redesign-20261006-144325/`

- `portfolio.tar.gz`: 163,971,886 bytes; 381 files, including original source, docs, public assets, lockfile, configuration, deployment files, and historical artifacts.
- `manifest-sha256.json`: every archived file verified by reading its archived bytes and comparing SHA-256 with the source.
- `git-status.txt`, `git-diff.patch`, `git-diff-staged.patch`: saved command outputs, including the no-repository errors. These are not usable patches because Git metadata does not exist.
- `RESTORE.txt`: restore instructions. Extract the archive into a separate empty directory, inspect it, and reinstall dependencies from the lockfile. Do not extract over later work indiscriminately.
- Excluded regenerable items: `node_modules`, `dist`, `test-results`, `playwright-report`, `.cache`, `tsconfig.tsbuildinfo`.

Repository inventory:

| Area | Observed responsibility |
| --- | --- |
| `src/App.tsx` (405 lines) | React state, hashes/history, desktop/mobile sequence, navigation lock, asynchronous cancellation, dynamic renderer import, fallback, keyboard/swipe/focus/reduced motion |
| `src/scene/NotebookScene.ts` (1,098 lines) | Three.js scene, camera, materials/geometry, assets, DOM projection, capture cache, opening and turning timelines, disposal |
| `src/scene/capturePage.ts` (175 lines) | html2canvas with explicit font/image readiness; object-fit rasterization, thumbnail grading/grain, capture-safe tape |
| `src/scene/warpPage.ts` (49 lines) | Inverse homography with alpha-aware sampling to align temporary ink textures and affine live HTML |
| `src/components/Spreads.tsx` (223 lines) | Semantic intro, two projects, contact; real links and buttons |
| `src/config.ts` | Identity, contact URLs, project metadata, tabs |
| `src/styles.css`, `src/materials.css` | Base artwork styles, current WebGL layout, responsive behavior, hardware fallback |
| `tests/` | 33 Playwright cases, including axe, six-size geometry, phone framing, continuity, motion, fallback, swipes |
| `scripts/` | Capture/texture audits, production checks, historical hand processing |
| `public/` | About 928 KiB: raster assets, local fonts/licenses, identity icons; no GLB/PBR set |
| `artifacts/` | About 157 MiB before this audit: historical implementations, generated sources, screenshots, source website captures; already ignored |
| `deploy/`, hosting docs | Existing local/private hosting setup; retain |

React 19, TypeScript, Vite, Three.js, GSAP and html2canvas are already present; Playwright and axe are development dependencies. No R3F or alternate renderer is needed. The installed Vite build reports 7.3.6; package.json uses version ranges and the lockfile is authoritative.

Node is available through the bundled workspace runtime, not the initial shell PATH. Blender and `gltf-transform` were not found on PATH. No `.blend` or `.glb` authoring assets were found in the enumerated project files. Authored geometry production is therefore a real prerequisite, not an already available capability to imply in a completion report.

## Reference interpretation

All four supplied images were visually inspected. Actual attachment mapping differs from the numbered descriptive list in the brief:

| Attachment | Content | Calibration role |
| --- | --- | --- |
| Photo 1, 1280×960 | Closed black notebook, elastic/ribbon, realistic right hand and green knit sleeve, knees, warm desk front edge; plant/coffee left, lamp/pencils right | Seated and hand-contact composition |
| Photo 2, 1280×853 | Open introduction left, two project prints right, three right-edge tabs, right hand, coffee upper left, plant upper right | Primary reading/work target |
| Photo 3, 1280×960 | Clay statement left, two contact actions right, paper-plane cord motif, same right-edge tabs and hand | Connect target |
| Photo 4, 1280×960 | Lookbook with paper, leather, clay colors, lettering/icons, tape, card examples, desk props | Material and artwork target, not literal runtime clutter |

References are preserved, with hashes/dimensions, in `artifacts/visual-redesign/audit-2026-10-06/references/`. These are development evidence, not publishable production backgrounds. Audit contact sheets and fresh 1440×900 screenshots are alongside them.

Visual characteristics to reproduce:

- Warm directional illumination and local contact shadows; asymmetric, lived-in desk. The visible desk edge, foreground body, ceramic rims and prop occlusion establish seated scale.
- Black cover with broad rounded corners, irregular leather microdetail, cream layered stock and a shaped gutter. Paper is unruled, rough and softly warm, not yellow parchment.
- The open spread has a slight diagonal and perspective taper; an occupied page face remains readable. Reference photography alone does not yield a unique FOV or real-world size.
- Clay title occupies much of the left page but leaves deliberate gutters and margins. The mustard accents and dark cord support the content rather than form a decorative border.
- Work cards are stacked on the right leaf, mildly rotated, with one dominant tape contact and small paper URL/note slips. Authentic screenshots must remain authentic; do not redraw their sites to imitate generated reference lettering.
- Contact separates two cream action cards, readable marker copy and blue/terracotta icons. Large black/terracotta statement remains on the left.
- Hand is photographic, with sleeve and believable scale; it is not a clay character.

Reference reconciliation: the plant changes sides between the closed and open references, and some accessories differ. A single stationary environment cannot reproduce both arrangements exactly with a modest forward lean. Use Photo 2/3 as the primary fixed environment layout and Photo 1 for seated framing, cover, hand and foreground cues. Record the resulting difference in overlays. Do not teleport props or use unrelated camera-space movement. Fit each reference without stretching; show its crop/letterbox explicitly at 16:10 or 16:9 targets. Desired viewport percentages are calibration goals, not values to infer blindly from a 4:3 photograph.

The latest user brief supersedes earlier guidance for lined paper, serif-led headings, no environmental props, and the 10 fps appearance. Preserve the deeper invariants: real 3D, semantic HTML, fixed object size, mobile continuation off the viewport, accessible navigation, and paired capture/projection mapping.

## Observed current renderer and gaps

- Physical constants: leaf `W=3.15`, `H=5.1`, raised hinge `0.34`, paper elevation `0.245`; 48-segment turn integration. No notebook-scale animation is present. Preserve one fixed notebook coordinate system; any proportion calibration happens once, not per section/content length.
- PerspectiveCamera FOV 34°, near/far 0.1/100. Reading pitch is 18° desktop/9° mobile. Seated lean adds 22° and a 30% distance factor; desktop target shifts by up to 1.3 units. Camera distance also depends on the current cover angle via `sin(left.rotation.y) * 0.18`. Remove that coupling when calibrating separate camera/cover motion.
- Camera movement is already genuine perspective translation, not CSS scale. However, with an almost empty environment it lacks strong depth/parallax evidence.
- Opening is a single 2.6-second numeric clock with no GSAP labels: after 0.5 seconds, lean and cover opening overlap; hand selection begins on the same clock. It does not establish contact before lifting. Replace this choreography within the scene lifecycle.
- Left cover **and its paper block** share one rotating group. Split the front-cover pivot from the left stock reaction so contact, lift and delayed page settle can be art-directed independently, while preserving collision clearance.
- Desk is a 70×70 plane at z=-0.13 using a 1536×1024 color image repeated 3×3. No edge thickness, normal/roughness/AO maps, or props exist. This is already a 3D desk, but the assets and framing lack the target fidelity.
- Leather uses seeded 128² noise repeated 9×14 as bump; paper uses a generated 768×1244 ruled canvas plus noise. Replace these material inputs; keep geometry/UV conventions until validated.
- Lighting: hemisphere intensity 2.4 plus warm directional intensity 2.2, 512² PCF shadow, ACES exposure 1.05. No authored environment lighting or prop AO. Rebalance after correct materials, not through heavier postprocessing.
- DPR capped at 1.5, but no pixel-area budget or tier selection. Main canvas spans desk height. Renderer is demand-driven, throttled to roughly 30 fps opening and 12.5 fps turns; hand and sheet state quantized to 10 fps. No explicit visibility pause handler.
- Twelve 480² transparent hand sprites with per-pose physical grip coordinates; independently authored left/right. Mesh depth testing is disabled and renderOrder is forced; this can place hand pixels over geometry that should occlude them. Sleeve is a textured cylinder extension. These choices need visual contact/occlusion revision.
- Tabs are a horizontal row of native HTML buttons placed from a single projected point near the top edge. Keep their semantics, replace visual surfaces with separate right-edge physical tabs and project each hit area from its anchor.
- Resting HTML is affine-projected. `warpPage` and the inverse texture transform correct the native-to-mesh handoff. Preserve both; camera revisions must update the settled-camera mapping consistently.
- Capture decodes images and loads the actually used fonts; direct canvas painting avoids the known Safari foreignObject loss. New clay alpha images should go through the same capture path. Existing screenshot-specific grading must not accidentally apply to clay art.
- Current cache is page-key/mobile/logical-width based. Asset/style/quality revisions need explicit invalidation. Audit asynchronous texture completion after disposal and constructor-failure cleanup before claiming resource-leak coverage.
- Reduced motion skips animated entry/turns; skip opening, fallback, focus, inert, aria-current, live announcements and swipe handling already exist.

Fresh desktop measurements: projected cover bounds at 1440×900 are x=270.97…1155.10, y=150.87…804.26 across intro/work/connect, about 61.4% of full viewport width. This confirms content-independent framing at that viewport; it does not prove a reference match. The screenshots show a central ruled notebook, no prop composition, serif titles, top tabs, separate project leaves and a single contact panel. Simply increasing scale would not address these differences.

## Asset audit

All current runtime raster assets were inspected in a contact sheet, including each of the twelve hand poses; source project PNGs, historical hand assets/desk/paper and the identity icon were also inspected. Local font families, license files and their use were checked; fresh browser captures show the current typography. Historical QA screenshots are regression evidence, not candidate environment textures.

### A. Existing assets reusable unchanged

- `public/logo.svg`, `public/favicon.svg`, `public/apple-touch-icon.png`: approved lowercase t identity; keep.
- `public/images/komon.webp` and `pk-normal.webp`: authentic 1000×694 screenshots, about 8.6/30.9 KB. Keep source pixels and URLs; change surrounding card composition. The screenshot's wordmark must not be invented to match the reference's stylized rendering.
- `artifacts/source-captures/{komon,pk-normal}.png`: 1440×1000 source records for any later re-export, not additional runtime downloads.
- Local DM Sans fonts/licenses: retain readable utility/body fallback. Existing font licenses/provenance and confirmed LinkedIn/project metadata remain.

### B. Existing assets reusable after processing or qualification

- `paper-texture.webp` (768², 38.4 KB) and original source PNG: useful fiber source. Reduce its coarse contrast, make tile/UV treatment unobtrusive, generate appropriate material channels; confirm relief isn't just lighting baked into albedo.
- `walnut-desk.webp` (1536×1024, 222 KB): useful palette/grain study and interim calibration input. Reproject/crop only where quality holds; it does not provide the missing desk-edge detail or a true matched PBR set. Replace if seams/baked shading remain visible.
- Local Caveat Latin/extended fonts: useful existing handwritten notes. Test designed marker body treatment at actual projected size; keep a readable fallback. Existing Cormorant can remain bundled during migration, but is not the requested primary display system.
- Existing tape/print styling and capture workarounds: preserve techniques; rework proportions, textures, palette and remove excessive marker backings/halftone from the target work composition.

### C. Existing assets/treatments to replace in the final target

- Six poses per direction in `hands-pov/` (roughly 22.8–27.8 KB each): useful rig/anchor references, insufficient dense motion. Skin/sleeve art direction also differs. Do not call frame interpolation alone newly authored finger motion.
- `knit-sleeve.webp` (150×130) and generic cylinder extension: low-detail join, inappropriate as a final reference-matched forearm.
- `notebook-open.webp` (1536×1024 RGBA, 84.2 KB): too neutral/front-facing for final fallback. Retain until an approved replacement is available.
- Procedural ruled paper, simple noise-only leather, narrow straight elastic, flat ribbon and printed gold cover monogram: target needs unruled stock, subtler worn leather, woven elastic/ribbon and the reference's plain closed cover.
- Serif title artwork and boxed marker headers: replace with clay image accents plus accessible semantic equivalents and designed handwriting.
- Top-edge tab artwork: replace with sage Hello, mustard Work, terracotta Connect on the right.
- Historical hands/desk/static sources: archived alternatives are not evidence of a sufficient new environment or high-density hand sequence.

### D. Missing assets — REQUIRED production specifications

Dimensions below are proposed authoring/export targets, not claims of existing files. Current notebook units are the calibration unit (one leaf 3.15×5.1); GLBs must use documented axis conversion from Blender Y-up glTF into the application's XY desk/Z-up convention. No root scale animation is permitted. Bake large lighting information only where it remains plausible throughout the camera move.

| Asset / purpose | Format and dimensions | Transparency / view | Material and lighting | Placement / mobile |
| --- | --- | --- | --- | --- |
| **REQUIRED `portfolio-environment.glb` + source `.blend`**: authored desk and props | Separate named meshes; desk starting envelope ~20×16 units, thickness ~0.3; 2K shared textures, smaller prop maps | Opaque except necessary leaf cutouts; calibrated from reading and seated cameras | Walnut/honey rough wood, dents, real front edge; ceramic glaze, matte terracotta, metal clips; baked crevice AO plus dynamic notebook shadows | Desk center; coffee upper left, plant upper right for reading target; lamp/pencil cup peripheral, dish on one side. Low tier omits distant accessories, retains desk |
| **REQUIRED prop nodes**: CoffeeCup, Plant, Lamp, PencilCup, PencilMeshes, ClipDish, BackgroundProps | In environment GLB or split logical GLBs; initial cup diameter ~1.0, plant pot ~1.4, lamp base ~2.0, pencil cup ~0.9, dish ~1.3 units; refine by overlay | Real volume, both camera states; no billboard cup silhouettes | Uneven ceramic rims, visible dark coffee surface, leaf thickness, knit/metal distinction, warm practical lamp cue | Asymmetric outside cover/page bounds; simplify peripheral foliage/metal on phone |
| **REQUIRED desk material set** | 2048² color/normal/roughness, optional AO; 1K low tier; lossless source maps | Opaque, UV-matched | No baked specular in albedo, moderate/high roughness, restrained grain height | Desk mesh; no CSS repeat as main environment |
| **REQUIRED notebook authored surface set** | `notebook-shell.glb` optional plus `.blend`; named BackCover, FrontCover, Spine, LeftPaperBlock, RightPaperBlock, Ribbon, ElasticBand; envelope compatible with calibrated W/H and raised hinge | Opaque, both closed/open; independent pivots and local anchors | Black rough leather; subtle cover warp/corner asymmetry, woven strap/ribbon, layered cream edges; moving surfaces shaded live | NotebookRoot; same dimensions every route/tier. Keep existing procedural sheet, never bake it into shell |
| **REQUIRED leather/paper/edge textures** | Leather 1024² color/normal/roughness; paper 1024² or 1024×1664 per leaf; edge strip 1024×128; sources retained | Opaque, unruled UV layout | Cream fiber, slight roughness variance, very mild edge aging; fine leather grain, no heavy random noise | Covers and pages; 512–1K low tier with same color/UVs |
| **REQUIRED physical tabs** | Independently named GLB nodes or authored small meshes; visible ~0.45×0.38×0.025 units as starting size; 256² shared texture | Opaque, positioned at right edge in notebook coordinates | Sage/mustard/terracotta textured stock, slightly irregular thickness, contact shadow; labels can remain DOM | Three vertically staggered right-edge positions; native projected hit areas at least 44px and kept reachable on phone |
| **REQUIRED `clay-name-tin-grgic.webp`** | RGBA WebP, source ≥1600×1100, export ~1000×700 after crop calibration | Transparent with padded edges; page-local near-orthographic render, not prewarped screen view | Black clay, red period, soft thickness/fingerprints; baked close-contact shadow matching warm key | Upper left introduction; smaller page-local artwork on phone, semantic h1 retained |
| **REQUIRED `clay-good-things.webp`** | RGBA WebP, source ≥1600×1800; export ~1000×1200, split lines if responsive layout requires | Transparent; page-local view | Black words, terracotta hello.; matte, subtle handmade thickness, consistent key/shadow | Connect left leaf; compact readable phone treatment, never shrink essential contact copy |
| **REQUIRED clay motif set**: lightbulb, cloud, paper-plane, cord, mustard marks; optional hello display | RGBA WebP components 256–512²; combined bulb/cord/cloud strip ~1200×320 and plane/cord strip ~1200×380 | Transparent, page-local view with breathing room for shadows | Mustard/charcoal/cream, small dimensional shadows; coherent scale and light | Bottom of intro/connect pages; simplified strip or omit decorative fragments on phone |
| **REQUIRED contact/tape art**: clay LinkedIn, envelope, tape and paper slip surfaces | Icons 256–512² RGBA WebP; tape ~512×160 RGBA; stock ~1024×512 | Alpha icons/torn edges, opaque cream card centers; page-local view | Muted blue LinkedIn, terracotta envelope, translucent fibrous tape; consistent soft contacts, avoid baking text into action images | Connect right page and project cards; real HTML labels/URLs, same assets scaled on phone |
| **REQUIRED dense hand/sleeve sequences** | Separate opening/right-forward/left-backward sources; transparent 768–1024² frames, runtime ~512–768²; aim 18–24 distinct visual samples/sec, derive frame count from actual hand-visible timing | Exact first-person camera/pose plan, independent left and right; alpha with edge padding, grip/wrist metadata per frame | Realistic skin, reference knit sleeve, warm light consistent with scene; no mirrored left hand, no baked dark rectangle or unrelated cast shadow | Approach from lower right, physically anchored contact, release; mobile crop/scale calibrated separately without anatomy distortion |
| **REQUIRED foreground body cue** | Separable GLB coarse clothing volumes with authored textures or approved perspective cutouts ~1024² per side | Alpha if cutouts; seated camera-specific review | Dark trousers/knit, deliberately peripheral, soft natural light | Bottom foreground during seated phase; exits naturally with camera translation; omitted on phone |
| **REQUIRED fallback artwork** | Desk JPG/WebP ~1920×1200; open notebook RGBA WebP ~1800×1400; phone crop exported only if needed | Clean blank pages, alpha around notebook; fixed fallback camera | Derived from approved final scene, matching material/lighting; no duplicate text baked in | Semantic HTML over static paper, independently calibrated fallback bounds, 1.72 mobile frame retained |

A scene assembled around missing items must label them REQUIRED in development and in delivery notes. Existing plain geometry and low-density hands are not final stand-ins. No new generated assets were made in this audit.

## Proposed architecture and exact implementation sequence

Keep App's navigation/state contract, dynamic scene loading, native HTML at rest, capture readiness, texture caching, paired warp mapping, the 48-segment curved sheet, direction/staging/locking, cleanup hooks, fallback and accessibility. No React/Three/GSAP/html2canvas replacement is justified.

Targeted refactoring is warranted inside the visual layer:

- Add a small `EnvironmentAssets.ts` loader with GLTFLoader, named-node/material validation, shared texture ownership/disposal and explicit loading errors. A missing critical asset is reported, not replaced silently.
- Keep `NotebookScene` as coordinator. Extract a `CameraRig.ts` for seated/leaned/reading poses and paths in notebook units, and `OpeningSequence.ts` for one labeled GSAP timeline. This changes choreography without replacing application state.
- Introduce separate cover and stock pivots and anchored tab meshes. Keep turning sheet/projection under the same physical coordinate contract. Preserve existing constants until static calibration demonstrates a proportion adjustment is necessary.
- Add `VisualCalibration.ts` as a dynamic **development-only** import gated by `import.meta.env.DEV`. Reference files stay outside public and are made available only to Vite development through an explicit allowlisted asset route/module; production build must contain neither controls nor reference images.
- Diagnostics controls: `?reference=work|connect|closed|lookbook`, opacity 0–100%, enable/disable image, fit/crop mode, geometry/wireframe, page/HTML bounds separately, camera target/light helpers, FPS/draw calls/triangles/textures/renderer memory, internal canvas size/DPR/tier, camera position/target, root scale, timeline label/time. Freeze/seek deterministic labels for screenshots. Only update metrics on rendering/interaction; the panel must not cause an idle render loop.
- Plan pixel-area-based high/medium/low policies in addition to the DPR cap. Choose budgets from measured hardware results, not unverified FPS estimates. Keep the content/geometry footprint constant across tiers. Pause timeline work while hidden and handle resume/resize deterministically.

| Milestone | Exact work and evidence required before calling it complete |
| --- | --- |
| 0 — current pass | Verified external backup, source/asset/reference audit, baseline build/tests and captures, this plan; stop before rebuilding |
| 1 — static reading | Build calibration mode first. Produce/inspect environment and material assets. Fit the open notebook/props at 1440×900 using Photo 2/3, then other desktop targets; unruled warm stock, real right-edge tabs, no opening timeline. Use a development-only static artwork proof to judge page composition before full content integration; never ship it as permanent canvas UI |
| 2 — closed | Separate cover pivot/stock response and elastic/ribbon; compose plain black closed notebook, desk edge and foreground. Validate both camera states with identical world object scales and fixed props |
| 3 — lean only | Camera path from seated to leaned; FOV 34° initial baseline, no zoom/root scale changes; measure differing prop parallax, notebook screen ratio and clear foreground exit. Cover held closed, hand absent |
| 4 — hand contact | Integrate approved denser opening sequence, metadata anchors, natural wrist/approach/overshoot and contact hold. Inspect occlusion and sleeve joins before lifting |
| 5 — opening | Cover rotates about real spine after contact; delayed paper reaction, moving shadow, modest elastic/settle response. Check cover/block/desk/ink/hand clearance at 25/50/75% |
| 6 — release/settle | Complete single labeled timeline and readiness/skip/cancel/reduced-motion integration. Initial timing proposal: idle 0–0.6s; lean 0.6–2.0; approach 2.0–2.55; contact 2.55; lift/open 2.65–3.95; pages settle ~4.05; release 4.05–4.45; camera settle ~4.55; interactive ~4.7. Tune from reviewed motion, not elapsed timers |
| 7 — live compositions | New page art and semantic DOM: exact name/role/personal line; paired introduction/work composition and connect cards. Configure supplied email, preserve confirmed LinkedIn. Retain mobile Intro→Komon→PK Normal→Connect |
| 8 — turn integration | New art captured safely; correct front/back/stationary destination, no pop/blank captures/landing jump; revise continuous hand/sheet sampling together. Re-run pixel continuity and clearance assertions |
| 9 — responsive | Phone single right leaf, left material continues beyond viewport; visible/touchable side tabs; 390×844, 430×932 and short-height cases; tablet 768×1024. Keep intro/contact scroll, work essentials readable without normal-page scroll, enlarged copy reachable |
| 10 — validation | Quality tiers/asset optimization, idle/hidden behavior, resource accounting, keyboard/axe/reduced motion/fallback, full screenshot matrix and real hardware performance notes; document residual visual differences honestly |

Timeline labels: `idle`, `leanStart`, `leanMid`, `leanEnd`, `handEnter`, `handContact`, `coverLift`, `coverOpen`, `pagesSettle`, `handRelease`, `cameraSettle`, `interactive`. Keep one owner and kill it on cleanup/interruption.

Desktop information architecture proposal: retain the three public sections/hashes. Hello opens the reference identity-left/work-right spread. Work intentionally focuses/announces the Selected work region of the same composition rather than turning to duplicate pages. Connect changes the spread normally. This limited navigation refinement is justified by the reference's shared intro/work spread; implement only after static visual calibration and test keyboard/history/focus semantics. Phone retains four sequential pages. If preserving a distinct desktop turn is preferred later, it needs a specified second composition rather than invented extra portfolio content.

`src/config.ts` currently has email `""`, not a newer address. The supplied `info@tingrgic.com` should populate it during content implementation. LinkedIn remains `https://linkedin.com/in/tingrgic`; projects remain `https://komon.hr` and `https://tingrgic.github.io/pk-normal`. No metrics, clients, authorship claims or outcomes need inventing.

Authored delivery: retain `.blend` sources outside runtime public assets; export separate animated nodes with tested pivots; inspect GLB counts/materials/textures; deduplicate/prune first, evaluate Meshopt where worthwhile. Compare KTX2 benefits against loader cost for environment maps; keep DOM artwork/screenshots WebP. Establish measured byte/triangle/draw-call budgets on the approved static scene. Do not install a large runtime or choose compression solely from fashion.

## Verification strategy and present evidence

Fresh screenshots in `artifacts/visual-redesign/audit-2026-10-06/`: intro, work and connect at 1440×900, reduced motion. They were inspected, not merely generated. No uncaught page errors were recorded in this capture run. This is not a new-scene acceptance or animation/GPU performance result.

- Production build: **passed**, TypeScript and Vite; existing warning for the large dynamically loaded scene chunk (850.89 KB minified / 224.32 KB gzip). No bundle changes were made.
- Chromium baseline suite: result appended below after completion.
- No fresh WebKit/device/Safari performance claim. Existing historical docs are not substituted for current evidence.
- No GLB optimization, visual-overlay calibration, new opening, final screenshot matrix or missing-artwork acceptance has occurred; those are later milestones.

Future required matrix: 1280×800, 1366×768, 1440×900, 1920×1080, 2560×1440, 768×1024, 390×844 and 430×932, plus short-phone cases. At each desktop target, capture closed seated, mid lean, lean complete, hand contact, cover 25/50/75%, open settle, work and connect in an ignored testing directory. Use deterministic labeled timeline seeks after real image/font readiness.

Preserve existing checks and add: root scale stays [1,1,1]; camera translates with fixed FOV/zoom; closed/open notebook screen ratios; multiple prop projected positions demonstrate actual parallax; tabs are on-screen and ≥44px; projected HTML/page polygons and snapshot landmarks match at landing; no horizontal document overflow/errors; stable renderer counts at rest and hidden state; repeated mount/resize/navigation/disposal resource accounting; reduced-motion entry has no cinematic; forced WebGL/context failure yields usable aligned semantic fallback. Repeat fixed-world-dimension and enlarged-copy assertions on all required viewport sizes. Update selectors when artwork changes without weakening invariants.

## Rewrite decision

No existing application subsystem needs wholesale replacement. Keep the renderer platform, state/navigation foundations, accessibility layer, capture/warp pipeline and page-turn geometry. Replace the visual assets and material inputs, and refactor the **opening choreography**, **camera pose definition**, **cover/stock articulation** and **physical tab presentation** where observed evidence justifies it. The major risk is quality and consistency of authored environment/clay/hand assets, not choice of React or Three.js architecture.

### Completed baseline test record

Chromium Playwright reported **33 passed (4.2m)**. `test-results/.last-run.json` independently records `status: passed` and an empty failedTests list; a copy is preserved in the audit artifacts. This covers existing axe, fixed geometry/enlarged copy, capture pixels/landing continuity, cover/sheet clearance, forward/backward motion, idle rendering, navigation/keyboard/history/swipes, delayed-assets skip, reduced motion, phone framing and forced fallback cases. It does not cover new reference fidelity, real laptop GPU FPS, new asset resource budgets or the proposed camera/root-scale diagnostics.

The command wrapper returned exit 143 and an ELIFECYCLE message despite Playwright finishing with all 33 passes; record this harness/teardown discrepancy rather than claiming a clean test-process exit. There are no reported failing assertions. No application change was made to address it in this audit-only pass.

Existing tests write directly into `artifacts/qa/`, refreshing 50 previously existing evidence images. Their newly generated versions were moved into `artifacts/visual-redesign/audit-2026-10-06/baseline-test-captures/`, and the original 50 files restored byte-for-byte from the verified backup. After restoration, all 381 original archived files matched their original hashes. Only the new audit document/artifacts existed at that verification point; the subsequent provenance note in `docs/sources.md` is intentional. Build/test output directories are regenerable and were excluded from the archive.
