# Loading and animation responsiveness — 11 October 2026

## Recovery

This workspace has no Git repository. Before editing, a filesystem archive and the Git command outputs were saved at:

`/home/tin/Documents/ChatGPT/Portfolio-backups/pre-loading-performance-20261011-135119/`

The archive is `workspace.tar.gz`. Original full-resolution artwork remains in `public/images/clay-v2/`.

## Changes

- Load the environment model and material textures concurrently. Start page rasterization alongside material transfer.
- Start the existing physical camera lean once the environment is ready. Gate hand entry/cover reveal on the actual hand and page snapshot; never reveal blank paper. Keep calibration seeking deterministic, visibility pausing, cancellation and reduced-motion behavior.
- Static/reduced-motion reading no longer waits for hand sequences or captures an unnecessary initial page.
- Replace the capture pipeline's PNG/base64 encode/decode round trip with canvas copies inside html2canvas's cloned document. Preserve crop/filter handling and both sides of the page warp.
- Prepare page snapshots after arrival in an isolated, invisible same-origin document. This finite job shares the existing viewport cache, stops on interaction/resize, and removes itself afterward. Live semantic HTML remains authoritative. This is not a second visible UI or permanent canvas portfolio.
- Deliver smaller material/artwork WebPs from `public/images/optimized/`; original authored images remain intact. Reproduce with `python3 scripts/optimize-notebook-assets.py` (Pillow required). The eight derivatives save approximately 1.9 MB. Avoid downloading fallback-only desk/photo assets in WebGL mode and preload the font actually used.
- Precompress JS, CSS and GLB during build. The existing private Vite preview serves those files with encoding negotiation, validators, and immutable caching for hashed bundles. Host restrictions remain in place. Other hosts must configure their own compression/caching.

## Measured results

One before/after production run per viewport, using local Chromium with SwiftShader at heights of 900px; no network throttling. These are diagnostic comparisons, not physical-phone or hardware-GPU benchmarks. Times begin at navigation.

| Measurement | Before | After |
| --- | ---: | ---: |
| Opening phase begins, 390px | 4.61s | 2.65s |
| Opening phase begins, 1440px | 6.86s | 3.33s |
| Reading phase, 390px | 9.74s | 8.55s |
| Reading phase, 1440px | 13.12s | 11.98s |
| First Connect turn startup in sampled sequence, 390px | 969ms | 55ms |
| First Connect turn startup in sampled sequence, 1440px | 2638ms | 51ms |
| Work turn startup in sampled sequence, 390px | 727ms | 54ms |
| Work turn startup in sampled sequence, 1440px | 2652ms | 45ms |

The original 4.8-second cinematic is retained. Software rendering can stretch wall time, and the hand/ink readiness gate can pause before reveal. Background preparation now starts with the adjacent physical page; in this sampled sequence, all three turns began in 31–55ms. A user can still select an uncached destination before finite background preparation reaches it, so this is not a guarantee that every cold click is instantaneous.

Delivered renderer bundle: 956,429 raw bytes / 251,471 precompressed bytes. Environment GLB: 827,292 / 428,865 bytes. An earlier HEAD-only observation overstated the renderer transfer saving: Vite already dynamically compressed some GET responses. Precompression avoids repeated server compression and adds explicit caching; material/artwork reductions are independent verified byte savings.

Raw measurements and screenshots are in ignored `artifacts/loading-performance/`: `before.json`, `final.json`, `prepared-navigation.json`, `compression.json`, and `production-*.png`. Re-run the cold sequence with `REPORT=artifacts/loading-performance/new.json node scripts/measure-loading.mjs` while the preview runs on 4178.

## Verification

- Production TypeScript/Vite build passed.
- 12 targeted content-continuity, motion and redesign tests passed, including real snapshot imagery, page landing alignment, cover clearance, delayed-hand skip, resize/history, texture-allocation bounds and renderer stopping at rest.
- 8 additional loading, cover and accessibility tests passed, including reduced motion while hand requests are blocked, prepared navigation without recapture at 390/1440px, cover close/reopen, compact Connect with no inner scrolling, and axe checks.
- Production gzip bodies decompress byte-for-byte to originals; conditional requests return 304; unknown Host remains blocked.
- Existing `tin-portfolio.service` restarted successfully with unchanged loopback binding and port. The existing private HTTPS endpoint returned 200. No public hosting, network exposure or firewall changes were made.

Physical iPhone/Safari performance and live VPN-peer network latency remain unmeasured.
