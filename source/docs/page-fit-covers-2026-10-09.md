# Page fit and physical covers — 9 October 2026

The user requested an uncut Connect bookmark, no scrolling inside any notebook page, a simpler Connect layout, reachable closed covers, and verified desktop page turns.

## Rollback

There is no Git repository. A fresh filesystem archive was saved before edits:

`/home/tin/Documents/ChatGPT/Portfolio-backups/pre-page-fit-covers-20261009-103422/workspace.tar.gz`

The same directory contains Git status/diff/staged-diff outputs and restoration instructions. Dependencies, build output and testing artifacts are excluded. Extract into a separate empty directory before restoring.

## Changes

- The Connect label uses a slightly smaller handwritten size inside the same physical tab and unchanged 44px-plus hit area. The accessible name stays “03 Connect”.
- Connect keeps the dimensional statement, “Let’s connect”, LinkedIn and email cards. Introductory prose, bottom note and redundant back-to-start link are removed. Both cards fit on a small phone without scrolling.
- Pages use fixed leaf bounds and no inner scroller. Mobile identity artwork flexes within the available space; project print spacing and the small-phone crop are tightened, and duplicate mobile page numbers are omitted in favor of the existing footer counter. Content remains real HTML with native links.
- Previous from Hello closes the front cover. Next from Connect closes the back cover. The covers and their attached paper rotate through the actual Three.js spine pivots. Tabs now belong to the right paper assembly so they do not remain floating on the desk when the back closes.
- Click a closed cover, use “Open notebook”, or press the appropriate arrow key to reopen. Native focus, inert content during movement, reduced-motion bypass, browser history and cover deep links (`#cover/front`, `#cover/back`) are supported. Closing/opening does not change notebook scale or camera FOV.
- The existing curved-sheet page-turn system, old/destination snapshots, capture-safe artwork, inverse projection mapping and hand poses remain in use. No new runtime dependency or generated asset was needed.

## Verification

Captures and logs are stored in `artifacts/page-fit-covers/`. The initial fit matrix covers 390×844, 375×600, 768×1024 and 1440×900, including both project routes and front/back covers. The 375×600 project footer overflow it exposed was corrected. Updated geometry tests verify actual content fits all six required viewports and cannot be scrolled inside a leaf; the previous synthetic long-text scrolling assertion is superseded by this explicit user request.

The first cover tests exposed a status-timing issue: “reopening” was published while the asynchronous snapshot was still preparing. Motion phases now begin only when the timeline is ready. Final results are recorded below.

No public deployment, tunnel, firewall or hosting configuration changes. The existing private Tailscale preview serves the rebuilt `dist` directory.


## Completed checks

- Six fixed-geometry/page-fit viewport cases passed, plus the smallest-phone route/link/tab check.
- Both physical-cover tests passed at 390px and 1440px: real intermediate rotation, hidden/inert live content, focus restoration, fixed root scale, and idle renderer shutdown. `cover-tests.log`: 3/3 passed.
- TypeScript/Vite production build passed. The pre-existing dynamically loaded Three.js chunk warning remains.
- Direct desktop captures confirm the existing page-turn sheet bends in both directions with the correct hand and attached artwork. The new back-cover captures also verify that physical tabs rotate with the paper assembly.

Browser verification uses headless Chromium/software WebGL. No new physical iPhone/Safari or laptop GPU benchmark is claimed.


The no-scroll revision exposed an older fallback dependency on inner scrolling. Its artwork and taped prints now flex within fixed leaves too; the shortest fallback omits decorative project stickers to keep the actual project link visible. The existing fallback interaction test passes after this correction. Six layout tests also referenced the deliberately removed “Back to the beginning” button; they now use the Hello tab and retain their focus assertions.


## Final verification

All **40 distinct Playwright cases** have passing results across the targeted and regression runs: six geometry cases, three cover cases, nine accessibility/content/motion cases, the corrected fallback case, and the remaining 21 navigation/framing/resource/swipe cases. The interrupted first regression log retains its superseded failures for traceability; `cover-tests.log`, `fallback-test.log`, and `remaining-tests.log` record the successful reruns. The final remaining run passed 21/21 in 4.4 minutes.

The final production build passes (`build-final.log`). At 375×600 the compiled fallback fits Intro, both projects and Connect with matching scroll/client heights and visible links (`fallback-final.log`, `fallback-final-*.png`). A direct request to the existing private HTTPS preview returned HTTP 200. No new physical-device testing is claimed.

The compiled preview also passed all ten route/cover checks at phone and desktop widths, including reloading each closed cover, browser back navigation, resizing while closed and reopening. No console/page errors, horizontal overflow or development calibration UI were recorded. Evidence: `production.json` and `production-*.png`; reproduction: `node scripts/check-notebook-covers.mjs`.
