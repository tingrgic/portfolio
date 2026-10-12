# Clay notebook implementation — 7 October 2026

Historical first-pass record. Superseded visual assets and hand details are documented in [the 8 October reference-led refinement](clay-refinement-2026-10-08.md).

## Delivered

- Six generated, transparent WebP clay artworks: name, connect statement, bulb/cloud cord, paper-plane cord, LinkedIn and envelope. Exact prompts/source paths: `clay-asset-prompts.md`.
- Live semantic Hello/Work/Connect layouts with the requested identity/copy, authentic project screenshots, physical print treatment and two contact links. Email is `info@tingrgic.com`; LinkedIn and project destinations retain supplied values.
- Desktop identity-left/work-right spread and separate connect spread. Hello and Work retain distinct existing navigation states while sharing the reference composition; Hello includes the work navigation action. Phone sequence stays Intro → Komon → PK Normal → Connect.
- Blender-authored desk, cup/coffee, plant, lamp, pencil cup/pencils, clip dish/clips, pen and foreground clothing. Source: `scripts/author-environment.py` and ignored `artifacts/visual-redesign/authoring/portfolio-environment.blend`. Delivery: `public/models/portfolio-environment.glb`.
- Environment optimized from 158 meshes to 23 nodes / 25 material primitives, approximately 781 KiB and 29,778 triangles. This is a local authored GLB, not a downloaded stock scene. Compression decoders were not added: this geometry payload is under 1 MiB and material consolidation supplies the more immediate draw-call benefit.
- New wood and leather material images, unruled warm paper, independent cover/stock pivots, textured 3D right-edge tabs, existing curved turn mesh retained.
- One labeled 4.8-second opening sequence: hold, physical lean, hand approach/contact, cover lift, delayed stock response, release and stable reading. FOV remains 34°, zoom 1, NotebookRoot scale [1,1,1]. Separate cover/stock articulation replaces the former coupled assembly.
- Demand-driven rendering; 30 fps animation paint cap, pixel-area/DPR cap, high/medium/low tier, peripheral geometry reduction on phones, hidden-document timeline pause/resume.
- Existing capture/warp pairing retained. New clay images are included in captures; retired screenshot grading no longer changes clean prints on landing. Capture allocations completing after disposal are discarded.
- Native keyboard/swipe navigation, transition locking, aria-current, inert, focus and reduced motion retained. Live HTML is synchronously unlocked before the post-turn focus request to avoid the observed focus race.
- New blank warm notebook fallback asset, with live HTML and the same clay artwork. Context-failure cleanup also clears per-tab projected styles.

## Development calibration

Run the loopback-only Vite server and open:

- `http://127.0.0.1:5178/?reference=work#work`
- `http://127.0.0.1:5178/?reference=connect#connect`
- `http://127.0.0.1:5178/?reference=closed&timeline=paused`

Use `pnpm dev --port 5178`; ports remain configurable. The panel supports opacity, reference selection/visibility, contain/crop, geometry/page/HTML bounds, light/target helpers, stats visibility and timeline seeking. Stats include render calls, triangles, texture/geometry memory, DPR/resolution/tier, camera/target/root scale, label/time. It observes real renders rather than creating a permanent render loop. The reference JPEGs and calibration module are development-only and excluded from production by `import.meta.env.DEV`.

`?timeline=paused` is development-only. It holds the genuine opening timeline after assets and font/image captures are ready; screenshot tools then seek the real GSAP timeline. There is no alternate fake pose renderer.

## Verification and evidence

- TypeScript/Vite production build passes. The dynamically loaded Three.js/capture/GLTF scene remains the largest chunk; the build warning is recorded rather than suppressed.
- Final full regression run after camera calibration: **36/36 passed (5.8 minutes)**, including all 33 existing cases and three new redesign cases. Log: `artifacts/visual-redesign/acceptance-tests.log`. Final tablet-only contact-card spacing was then visually checked and its affected tablet/short-desktop geometry and navigation cases rerun: **4/4 passed (42.6 seconds)**. The final production build also passes.
- The three new cases verify camera translation with fixed FOV/zoom/root scale and 65–75% desktop open framing; bounded actual WebGL texture allocations across repeated animated navigation plus stopped idle rendering; and reference-overlay opacity/image loading plus reachable ≥44px tabs.
- Existing checks include axe on all three sections, capture-thumbnail pixels, inverse-mapping landing continuity, paper/ink/cover clearance, forward/backward turns, focus/keyboard/history, delayed-asset skip, fallback, swipes, fixed dimensions across six viewports, enlarged copy, phone framing and document overflow.
- Captures: `artifacts/visual-redesign/final/`; script: `scripts/capture-clay-redesign.mjs`. The matrix covers 1440×900, 1920×1080, 2560×1440, 1366×768, 1280×800, 768×1024, 390×844 and 430×932. Desktop states include seated, mid-lean, lean complete, contact, 25/50/75% cover, settle, work and connect. `report.json` records bounds, root/camera state, page scroll extents and runtime errors.
- Final 64-frame matrix: all 24 static routes used WebGL, with no uncaught page errors or horizontal document overflow. Work leaves fit at all eight sizes; desktop Intro/Connect fit without inner overflow. Tablet Connect retains reachable inner scrolling. The phone Connect sequence uses the existing shared scroll container. Content never resizes notebook geometry.
- Production smoke check: WebGL initialized, the configured email link resolved correctly, no page errors occurred, and `?reference=work` did not expose development calibration UI. Evidence: `artifacts/visual-redesign/production-smoke.json`.
- Original pre-redesign evidence remains preserved; new screenshots use a separate ignored directory. Backup details remain in `visual-redesign-audit.md`.

## Honest visual and hardware limits

This is a working visual redesign, not a claim that the supplied photographs and rendered scene are indistinguishable. Clay page art is materially closer to the target, but the authored props remain stylized and the six-pose photographic hand sequence is unchanged. Continuous transforms improve motion without manufacturing additional finger poses. A denser correctly anchored hand sequence and more detailed ceramic/foliage materials are the main remaining fidelity improvements. No rigged generic hand or video substitute was introduced.

The source photos also disagree about plant placement; this implementation uses one stationary environment rather than teleporting props during the lean. Final camera calibration puts the closed cover at approximately 37% of the 1440px viewport in the seated capture. The open projected notebook bounds occupy 74.5% at 1440×900, 69.2% at 1920×1080 and 64.7% at 1366×768. Camera translation changes the relative perspective of the props; notebook scale remains fixed. Props and material microdetail still require further art-direction to reproduce the photographic references closely.

Testing uses headless Chromium with software WebGL. This establishes geometry, content, state and pixel continuity, not modern-laptop GPU FPS or physical Safari/iPhone compositor quality. No new real-device benchmark, cross-device VPN session, HDR/PMREM study, KTX2 optimization or high-density hand-asset approval is claimed. The materials are generated illustrative images with scalar roughness and restrained bump, not a fully scanned normal/roughness/AO PBR set. The static fallback is separately authored artwork rather than a baked frame of the GLB scene.

No public deployment, tunnel, firewall change, added browser framework or remote runtime asset service was performed.
