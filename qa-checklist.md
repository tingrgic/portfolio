# QA record

## Animation-content repair — 2026-10-01

Reviewed the supplied 6.10-second iPhone recording frame by frame. The approved starting state was archived **before edits**, including its source, assets and built output. Its SHA-256 checksum was reverified after the repair; see [rollback instructions](rollback-2026-10-01.md).

Fixed missing thumbnail pixels in animated snapshots, intersecting source/destination ink before lift, and the native-content position jump at landing. Snapshots now paint decoded images and loaded fonts directly to canvas. The opaque turning sheet clears the raised ink geometry, textures upload before movement, and inverse texture mapping aligns snapshots with the live HTML. A final desktop screenshot exposed excessive affine skew; fitting all four page corners corrected it without changing notebook dimensions or camera framing.

Validation was performed in groups, not claimed as one uninterrupted run:
- Chromium: **25/25** layout, geometry, accessibility, history, keyboard, reduced-motion, phone-fit and real touch-swipe checks; **2/2** new content-continuity checks.
- Linux WebKit: **24** layout/accessibility/geometry checks and **6** motion/fallback checks passed across groups, plus **2/2** new content-continuity checks. The CDP touch-injection test is Chromium-only and explicitly skipped in WebKit. One longer motion invocation ended externally with exit 143; its remaining checks passed in a smaller follow-up run.
- After the final affine correction: **8/8 Chromium checks** (all six viewport journeys plus both content regressions) and **10/10 WebKit checks** (both content regressions, both axe scans, and all six fixed-geometry/enlarged-content checks) passed again.
- The new regressions inspect actual raster pixels for both project thumbnails, check clearance against the highest ink vertex, and compare the project-index position before/after landing in both directions (less than 3 CSS pixels difference). A test-only GSAP helper freezes the actual timeline; it does not freeze image/font/iframe loading clocks and is excluded from production.

Inspected forward/backward pre-lift, curled, landed and live frames in both engines, final six-size journeys, and the corrected desktop spread. Evidence is in `artifacts/qa/iphone-content-glitch/` and the viewport screenshots under `artifacts/qa/`. The supplied recording and extracted reference frames are retained alongside the repaired captures.

TypeScript and Vite build pass: main JS **74.10KB gzip**, dynamic scene **224.32KB gzip**, CSS **5.07KB gzip**. The direct canvas painter adds about 44KB gzip to the scene compared with the saved version. Vite still warns about a minified chunk larger than 500KB; the scene remains dynamically loaded, with cached textures and no idle render loop.

The existing private service was restarted with the new build. Private HTTPS HTML, main JS, scene JS and CSS returned HTTP 200 from the host. No firewall, routing, public deployment or system-package changes were made. Final production smoke checks passed in **both Chromium and WebKit**, each at 390×664 with normal opening/turns and 1366×768 with reduced motion. WebGL initialized, both projects retained thumbnail and text links, and both collected console/page error lists were empty. Results and screenshots are saved as `artifacts/qa/production-3d-{chromium,webkit}-*`.

Limits: Linux WebKit is Safari-engine coverage, not a physical iPhone test. Actual iOS compositor behavior, phone GPU performance and a remote VPN peer remain unverified. Small native/canvas antialiasing and lighting differences remain; the tested frames no longer lose thumbnails or overlap source/destination text.

## Real Three.js notebook — 2026-10-01

This is the initial 3D delivery record; the animation-content repair above supersedes its snapshot implementation and bundle figures. The CSS/photo records below are historical.

**31 distinct Playwright checks passed across grouped runs** in Chromium with software WebGL: 6 fixed-geometry/enlarged-content checks, 2 multi-section axe checks, 10 journey/keyboard/history/reflow checks, 5 first-load phone framing checks, 2 swipe/thumbnail checks, and 6 motion/fallback checks. Two longer combined invocations were externally terminated (exit 143); the remaining tests were rerun in smaller groups. This is not reported as an uninterrupted 31-test run.

After visual review exposed a clipped LinkedIn action at 1366×768, the short-desktop intro spacing was tightened. All **6 viewport journeys passed again**, now also asserting that intro contact actions fit within the visible page. The notebook itself does not resize to fit copy.

Verified behavior:
- Real rounded covers, separate paper blocks and raised hinge; opening clearance sampled through nine animation positions.
- Continuous sheet curl, attached content textures, forward right hand and backward left hand, live HTML inert during movement, heading focus restored on landing.
- Both source and destination snapshots ready before the turn; no blank destination interval.
- Fixed geometry across sections and text enlargement at 390×844, 430×932, 768×1024, 1366×768, 1440×900 and 1920×1080.
- First-load phone fit at 390×664, 390×844, 430×752, 430×932 and 375×600; left leaf continues beyond the viewport, right cover stays visible.
- Keyboard, swipes, thumbnail links, browser history, interrupted preparation/resize, reduced motion, delayed-asset Skip opening and WebGL failure fallback.
- No idle render loop; no application console errors in the tested ordinary journeys. Axe reports zero detected WCAG A/AA violations in the tested sections.

Visual inspection: `artifacts/qa/webgl-final-contact-sheet.png` covers all six sizes and three sections. Individual desktop/phone views and `webgl-opening-*`, `webgl-*-forward-*`, `webgl-*-backward-*` frames were reviewed. Refined the sleeve into a textured volume, removed paper/block intersections near the gutter, fixed snapshot font embedding and replaced the rigid turn with an arc-length-preserving curl.

Production build passes (TypeScript and Vite): initial JS **74.10KB gzip**, dynamically loaded scene **179.96KB gzip**, CSS **5.07KB gzip**. Vite reports the scene's minified chunk exceeds 500KB; that is a bundle-size warning, not a build failure. The full 3D renderer is intentionally larger than the superseded CSS version. Pixel ratio is capped at 1.5; shadows at 512px; textures cached and resources disposed.

Delivery: rebuilt `dist/` and restarted the existing private `tin-portfolio.service`. Origin and private HTTPS HTML, current JS, scene JS and CSS returned HTTP 200 from the host. No firewall, public deployment or network-routing changes were made. A final browser smoke check against the production origin passed at 390×664 (normal opening and turns) and 1366×768 (reduced motion): WebGL initialized, both projects had working thumbnail/link targets, and the collected console/page error list was empty. Results and screenshots are saved as `artifacts/qa/production-3d-*`.

Limits: physical iPhone Safari and a remote VPN peer were unavailable. Software WebGL screenshots establish sequence/layout, not device frame rate. Hands are independently generated pose cutouts in the 3D scene, not full anatomical meshes. Paper uses a constrained curl, not a full physical simulation.

## Historical CSS implementation records

## Concise work pages and physical content reveal — 2026-09-30

Removed mobile project tags, handwritten project notes, cross-project text links, page footers and the page scroll hint. Each work page now contains the linked taped print, project name, one factual sentence and the live link; work-page overflow is clipped rather than scrollable. The lowercase t is centered within a 56px/44px header target. Page turns now preserve the outgoing page on the twelve-strip leaf and place the destination underneath before motion begins, eliminating the blank-sheet interval and late text pop. Forward retains the right hand; backward retains the left hand.

Final full Playwright run: **29 passed** in Chromium. Coverage includes six required viewports, five additional first-load phone frames, centered logo geometry, fixed notebook proportions, work-page fit, both hand directions, touch swipes, thumbnail links, keyboard/history/reduced motion, axe scans, images and console errors. Production build passes: JS 103.13KB gzip, CSS 6.23KB gzip. Screenshots reviewed at 390×664, 390×844 and 430×932 for both projects, plus phone/desktop transition frames. Physical iPhone Safari remains a device-level validation limit.

## Clarified mobile left edge
Restored the single readable page. The material now overflows the notebook frame and is clipped only at the viewport, eliminating the artificial cut edge over the desk. Confirmed visually at 390×664. **13 tests passed**: five phone framing/image-overflow checks, six fixed-geometry checks and two touch/pivot tests. The lowercase t logo is retained. Build passes and private service updated. This supersedes the complete-spread experiment below.

## Complete mobile notebook and supplied t logo
Latest correction: no mobile image crop/offset. Five phone framing tests assert the material image bounds match the notebook and its width/height stays 1.24. Initial geometry/accessibility/framing run: **13 passed**. Final follow-up after splitting intro across both pages: **12 passed** (five phone sizes, both accessibility widths, both hand directions, resize/history, real touch swipes/thumbnail taps, left-gutter pivot). Inspected 390×844 screenshot showing the whole notebook and t logo. Production build passes; local service rebuilt/restarted. Header and favicon use vector t; Apple touch icon is 180px PNG.

## Phone first-load framing / header
2026-09-29: **13 passed**: five first-load phone framing checks (390×664, 390×844, 430×752, 430×932, 375×600), six fixed-geometry checks, two accessibility scans. Notebook and footer fit without document scrolling; physical phone ratio remains 1.72. Size uses the small viewport (`svh`) to reserve expanded browser controls. Screenshots saved as `phone-fit-*`; 390×664 inspected. Header tagline/edition removed; existing tg mark retained because the supplied attachment contains a site screenshot, not a separate logo asset. Actual Safari hardware remains untested.

## Latest field-journal / fixed-object revision
Production delivery: build passes (JS 103.18KB gzip, CSS 6.09KB gzip). Existing private Tailscale service restarted; current HTML bundle reference and wood asset verified over HTTPS with HTTP 200 from the host.
Verified 2026-09-29. All six geometry regressions pass: intro, work, contact and 42px repeated overflow text leave the notebook's width and height unchanged at 390×844, 430×932, 768×1024, 1366×768, 1440×900 and 1920×1080. Enlarged content remains scrollable inside the paper.

Final targeted run: **11 passed** (six geometry checks, two multi-section accessibility scans, two directional-hand checks, resize/history cleanup). Earlier current-revision runs passed both touch-swipe/thumbnail tests and all eleven notebook journey/keyboard/reduced-motion/reflow checks. Two motion-test failures were test issues: selector matched decorative clones, and screenshot capture consumed the animation duration. Corrected selectors/timing; final motion checks pass.

Reviewed `field-journal-contact-sheet.png` covering 18 screenshots, individual phone intro, desktop work and hand transition images. New wood is local WebP (~244KB). Body copy remains selectable. No public hosting/network changes. Real iPhone Safari remains untested.

## Current reference-driven revision
Final follow-up: **6 passed** after sleeve alignment and mobile contact spacing fixes (both accessibility widths, both directional-motion widths, 390px and 430px journeys). Final production build: JS 102.61KB gzip, CSS 4.61KB gzip, complete dist 812KB. Restarted `tin-portfolio.service`; private Tailscale HTTPS page, current hashed JS and notebook WebP each returned HTTP 200 from the host. Actual remote-phone reachability remains a user-device check.

2026-09-29: full suite **16 passed**. After the final sleeve/leaf cleanup, all **3 targeted motion regressions passed** again. Production build passes: JS 102.58KB gzip, CSS about 4.6KB gzip. These figures supersede the historical record below.

Reviewed screenshots across all six required viewports: 390×844, 430×932, 768×1024, 1366×768, 1440×900, 1920×1080. `artifacts/qa/revision-contact-sheet.png` compares all 18 primary views; separate Komon phone captures and forward/backward grip/carry frames are saved alongside them. Inspected desktop intro/work, phone work and directional motion at readable scale. Fixed mobile word spacing and page-number clearance following review.

Passing checks: boot, no console/page errors, loaded images, absent empty email, all project links, mobile project pagination, six viewport journeys, no horizontal overflow, keyboard focus/skip link, reduced motion, browser back/deep links, rapid-control locking, resize during motion, forward/backward distinct hand poses, overlay cleanup, 320px reflow and 720px zoom-equivalent reflow. Axe scans report zero WCAG A/AA violations for intro/work/contact at 390px and 1440px. Real iOS Safari and a remote VPN peer remain untested.

## Historical first-version record

Completed 2026-09-29. Chromium, local Linux. Evidence is in `artifacts/qa/`.

## Build and runtime
- [x] TypeScript and Vite production build pass.
- [x] Production preview booted on loopback and navigated to both project links.
- [x] No page or console errors in tested interaction paths.
- [x] Optimized images load; no missing local assets.
- [x] Runtime JS 101.06 KB gzip; CSS 6.54 KB gzip; complete dist about 576 KB.
- [x] Komon and PK Normal live URLs returned HTTP 200. LinkedIn href matches user input exactly; no attempt to bypass LinkedIn access controls.

## Interaction and accessibility
- [x] Intro introduces Tin, role, company and interests.
- [x] See my work, LinkedIn, all three section tabs and next/previous controls work.
- [x] Normal page turns show the transparent hand and rotating leaf.
- [x] Mobile footer navigation returns to the top before the page turn.
- [x] Reduced-motion OS preference and manual toggle remove decorative transforms.
- [x] Keyboard skip link, button activation and new-heading focus pass.
- [x] Direct work hash, browser back and rapid presses remain consistent.
- [x] Email is absent from UI when configuration is empty.
- [x] Axe WCAG 2 A/AA and 2.1 AA scans: zero violations across all three sections at 390px and 1440px.
- [x] No horizontal document overflow in the required sizes and additional 320px / 720px checks.

## Viewports and visual inspection
Each size was tested through intro → work → connect → intro. Each section has a saved full-page screenshot.

| Viewport | Interaction | Screenshot review |
|---|---|---|
| 390×844 | Pass | Composed single page; full-size text; work scrolls naturally |
| 430×932 | Pass | Contact headline break corrected; generous touch controls |
| 768×1024 | Pass | Two-page tablet spread; labels and controls fit |
| 1366×768 | Pass | Reduced vertical spacing; notebook and controls remain clear |
| 1440×900 | Pass | Stable spread, clipped prints, restrained desktop framing |
| 1920×1080 | Pass | Larger physical notebook footprint; no stretched text |

Additional captures: desktop and mobile hand transitions; reduced motion; 320px narrow work; 720 CSS-pixel reflow equivalent to 200% zoom on a 1440px window; production preview. The zoom-equivalent test verifies layout reflow, not a browser UI zoom setting. `contact-sheet.png` compares all 18 core screenshots. Individual views were inspected at readable scale, including mobile work/contact and desktop/tablet intro/work.

## Final test runs
- Full Playwright suite: **12 passed** (six viewport journeys, two multi-section axe checks, keyboard/history/reduced motion, deep links/racing, 320px reflow, 200% zoom-equivalent reflow).
- Added final targeted regression: **1 passed**, mobile footer navigation scroll/focus behavior.
- Final production build passes after formatting and the scroll correction.

## Design and delivery
- [x] Fixed first-person desk view, black cover, paper stack, gutter and bookmark.
- [x] Intro opening and understated motion; no continuous animation.
- [x] Factual project summaries and actual live-site captures.
- [x] Two collage compositions with paper, tape, halftone and marker accents.
- [x] Central contact configuration; no invented email or project outcomes.
- [x] AGENTS, README, brief, plan, storyboard, scrapbook notes, sources and hosting docs present.
- [x] At least ten weaknesses reviewed; corrections and limitations in `self-critique.md`.
- [x] Loopback defaults, opt-in all-interface scripts, configurable strict ports; no firewall or router changes.

## Manual follow-up limits
Not claimed as tested: physical touch devices, Safari/WebKit, screen-reader speech output, real VPN peer routing or Windows firewall behavior. CSS page geometry is an approximation, not a physical simulation. No screenshot references were supplied. These limitations do not block local use.

## Private VPN endpoint repair — 2026-09-29

- [x] Confirmed the home PC's Tailscale address is `100.112.131.112` and the iPhone is enrolled in the same tailnet.
- [x] Identified `127.0.0.1` on the iPhone as the phone itself, not the PC.
- [x] Identified ports 4173 and 5173 as a different local project (PK Normal), avoiding a collision.
- [x] Installed and enabled `tin-portfolio.service`, serving the production build on PC loopback port 4178.
- [x] Added the exact Tailscale hostname to Vite's allowlist; wildcard host acceptance remains disabled.
- [x] Configured background Tailscale Serve on private HTTPS port 4178 without changing the existing Jellyfin/Overseerr endpoints.
- [x] Verified local origin, hostname forwarding, and the final private HTTPS URL all return HTTP 200; TLS verification succeeds.
