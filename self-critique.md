# Final critique and refinements

## October 1 recording follow-up

The supplied physical-iPhone evidence exposed issues the earlier static screenshots did not catch. A verified archive preserves the approved starting state. Fixed three distinct problems: SVG foreignObject snapshots omitted project images in Safari; the moving leaf intersected the raised ink surface before lifting; and native text painting differed from the mesh texture's perspective mapping at landing. Direct canvas painting, opaque depth-writing ink with additional sheet clearance, and inverse texture mapping address these separately. Tests now inspect image pixels and the rendered position of a project index on both sides of the handoff, rather than merely waiting for the final page to load.

WebKit is now tested locally with isolated browser dependencies; no system packages, routing or firewall configuration were changed. Actual device GPU performance and Safari's OS compositor still need the user's device to validate. Minor native-vs-canvas antialiasing differences remain; blank images and overlapping project copy are not accepted as that tradeoff.

## Real 3D review

1. CSS cover intersections could not be fixed reliably with more masks: replaced the mechanism with real geometry and depth testing.
2. Cover and stacked pages needed distinct closed heights: use a raised hinge and independent blocks.
3. The first spine prototype was aligned vertically into the air: corrected its axis along the binding.
4. Text snapshots changed size during the camera lean: keep logical HTML dimensions based on the resting camera.
5. Camera-space DOM projection had to match the geometry: project all four page corners using the same camera.
6. Stock grazed the concave paper near the gutter: lowered the solid block and laminations below the minimum paper surface.
7. Rectangular page corners contradicted rounded covers: curve the outer paper boundary.
8. A rigid lifted sheet occupied too much of the face-level view: replace it with a continuous, fixed-length curl.
9. Body and margin-note fonts could differ in snapshots: wait for fonts after committing content and embed fonts used by the current spread.
10. Flat sleeve extensions were too dark: use a knit-textured sleeve volume and blend the photograph into it.
11. Slow graphics stretched GSAP time: disable lag stretching and render only meaningful animation frames.
12. Repeat captures caused avoidable preparation delays: cache source and destination textures per viewport/page.
13. Resize during async preparation could start an obsolete turn: invalidate operations and reconcile the requested hash immediately.
14. WebGL availability cannot be assumed: retain a working static notebook fallback.
15. A 3D canvas must not replace semantics: keep native HTML, links, focus, inner scrolling and a no-JavaScript fallback.
16. Screenshot tests are not GPU benchmarks: software-rendered Chromium verifies layout and sequence, not physical-phone frame rate.
17. The short laptop intro pushed LinkedIn below the visible sheet: tightened only the short-desktop headline and spacing; added a visible-contact bounds regression at all six main sizes.

Residual limitations: generated 2D hand poses in a 3D scene; a constrained paper model rather than full material simulation; WebKit/physical-device performance still needs a real-device check. The current QA log records actual verification, not this checklist alone.

## Historical CSS implementation reviews

The following entries describe superseded implementations; the real 3D review above governs the current version.

## Field-journal / fixed-object review
1. Notebook dimensions depended on content: replaced intrinsic sizing with explicit responsive width-based geometry.
2. Fixed dimensions could clip enlarged text: page areas scroll and are keyboard focusable.
3. Destination page could inherit old scroll position: reset page scroll on completed/reduced-motion navigation.
4. Mobile turn snapshot could exceed the physical page: snapshot the visible book-content viewport instead of the full spread.
5. Beige desk felt detached from the reference: added original aged-oak texture.
6. Blank paper lacked journal character: added faint ruled lines and warm material grading.
7. Photographic hand looked too pristine: added monochrome print grain, warm ink grading and a subtle cut-paper edge.
8. Sleeve extension mismatched the graded sprite: matched brown-grey cloth and feathered the join.
9. Hint was too close to the cover: moved it into the lower paper margin and increased size.
10. Fixed background rendering left a band below short viewports: changed material to normal scrolling background.
11. Animated clones confused tests: scope assertions to the live notebook content, keep clones inert/hidden from accessibility.
12. New generation could bloat delivery: optimized the desk to local WebP; no runtime image service.

Remaining tradeoff: intro/contact pages can need internal scrolling after text enlargement. Project pages are intentionally limited to the image, name, one sentence and live link so ordinary phone layouts do not scroll. Hand/paper remain art-directed approximations, not physical simulation.

## Historical user correction
- Full handwriting felt excessive: retained it only for small personal annotations, using serif headings and sans prose.
- Backward phone motion incorrectly hinged at the right edge: both directions now pivot at the gutter; mobile material includes a left-page sliver.
- User now requests a left hand for back: backward atlas renders left-handed with reflected anchors and sleeve, superseding prior right-only rule.
- Midpoint content commits could leave text on an unsettled spread: destination content mounts only at completion; moving source text is hidden behind its inert leaf clone.
- Touch navigation was missing: added directional swipes, vertical-scroll preservation and trailing-click suppression.
- Project printouts looked clickable but were not: each is now a keyboard-accessible link with destination name and new-tab announcement.
- Decorative emoji-like glyphs removed; external-link arrows are simple SVG strokes.


## Historical reference revision
1. Flat notebook shell: replaced with original photoreal blank notebook material.
2. Wrong typography: local Caveat handwriting now covers page text, with readable 24–26px prose.
3. Long mobile project stack: each project now has its own turnable page.
4. Static hand: six forward poses and four distinct backward poses, sampled at 10 fps.
5. Incorrect anatomy in two backward assets: rejected frames 5/6; no mirroring.
6. Detached atlas fragments: preparation retains only the largest connected cutout.
7. Wrist cut off in midair: extended the dark sleeve below the viewport.
8. Rigid blank turn: twelve bending strips carry inert copies of content.
9. Mobile backward page outside frame: pivot moved to the opposite edge.
10. Short screens hid the grip: moved grip to the lower outer edge.
11. Different page heights caused overlapping footer copies: freeze height during turn and hide leaf after travel.
12. Mobile page numbers touched cover: added bottom clearance.
13. Inline name lacked spacing: added explicit mobile word gap.
14. History/resize could interrupt motion: explicit cleanup and regression coverage.
15. Raw textures inflated deployment: moved raw sources outside public.
16. Real-device coverage unavailable: emulated Chromium does not establish iOS Safari or remote VPN-peer behavior.

Remaining limitation: lightweight art-directed 2.5D paper and sprite animation, not a simulation of finger pressure or paper physics. The hand is illustrative, not Tin's actual hand.

## Historical first-version review (superseded above)

1. **Desktop work spread grew too tall.** Cropped printouts to a deliberate landscape ratio and reduced spacing at laptop heights. Content can still scroll on short screens rather than clip.
2. **Hand followed changing mobile document height.** Anchored it to the reader's viewport; it enters from below consistently.
3. **Mobile identity copy was too small.** Increased role to 15px and main prose to 16px; tags are secondary 12px metadata.
4. **Mobile contact headline lost a space when hiding a line break.** Kept the intentional three-line composition; verified in refreshed screenshots.
5. **Rapid section presses could race animations.** Added synchronous transition lock plus disabled section controls during turns.
6. **Reduced motion could change during a turn.** Completing active timeline then hiding decorative transforms preserves content and unlocks navigation.
7. **Browser back could leave a decorative layer visible.** Kill active timeline, clear both overlays, restore section and focus.
8. **Unconfigured email could become a fake contact.** Central empty config; render no mail link until configured.
9. **Screenshot colors were initially described from assumptions.** Corrected Komon alt text and source/style notes against actual captured image.
10. **Large raw images and font files would ship unnecessarily.** Deploy only optimized WebP/WOFF2. Keep source captures in artifacts, not public assets.
11. **Deep links could show an irrelevant opening cover.** Direct work/contact URLs bypass the intro cover.
12. **Collage and muted colors could harm contrast.** Automated WCAG A/AA checks run on all sections at mobile and desktop widths; readable captions remain separate from printouts.
13. **A visually convincing hand could imply it is Tin's actual hand.** Documented as a generated asset. This is an illustrative first-person hand, not an identity claim.
14. **Paper motion isn't a physical simulation.** Deliberate limitation: lightweight CSS hinged leaf with gradient curvature, no deformable mesh. Keeps mobile performance and DOM accessibility.
15. **Automated browser coverage is not real-device coverage.** Chromium at six requested sizes; real iOS Safari and an actual remote VPN connection remain manual checks. No unsupported claims of device or network testing.
16. **No attached visual references were available.** The collage interprets the written brief; source documentation says so explicitly.

17. **Footer navigation could animate below the visible notebook.** Scroll to the top before starting a section turn; a targeted mobile regression verifies scroll and focus.

Second review: fixed viewpoint, restrained object framing, clear primary actions, factual projects and strong mobile typesetting hold together. Residual limitations are documented, not hidden.

## Seated POV review — 2026-09-30

1. The flat overhead photograph did not establish the viewer's body position. Added one shared perspective rig and a short seated lean-in.
2. The desk texture repeated with visible tile seams. Changed to a single continuous texture across the perspective surface.
3. The artificial sleeve looked disconnected. Replaced both hand sequences with full hand-and-knit-sleeve photographic cutouts.
4. Backward motion used a reflected atlas. Added six independently articulated left-hand poses with separate grip anchors.
5. The text box turned while the actual page margins remained static. Geometry now follows the material's full leaf, including blank margins and physical gutter.
6. Destination text could duplicate on both mobile leaf faces. The departing phone verso is blank; forward destination stays underneath, backward destination rides the arriving front.
7. Desktop's stationary page changed too soon. Preserve it until covered by the moving sheet and remove its inert snapshot on landing.
8. The old camera and hand used incompatible coordinate spaces. Both now use local notebook geometry projected by the same camera.
9. Twelve sheet segments had visible seams. Increased subpixel overlap, aligned texture coordinates, and restrained paper texture contrast.
10. Initial fonts/images could arrive during the opening on VPN. Hold the closed cover until local images decode and fonts resolve; preload project prints.
11. Busy pages could accept link focus mid-turn. Live content is inert during movement; destination focus occurs after landing.
12. The intro imposed a cinematic delay. Added a 44px skip-opening action and retained immediate reduced-motion entry.
13. Small tab numbers had insufficient contrast. Darkened their ink and reran axe.
14. A projected bounding-box ratio no longer represents physical notebook proportions. Test unprojected physical dimensions plus screen fit; preserve content-independent size.
15. Generated hands remain an approximation of the user's hand, not identity-accurate captured motion. This limitation is explicit. Real device Safari testing is still not available from this environment.

16. Generated atlas cells leaked small isolated sleeve fragments from neighbors. Keep the main connected alpha component in each frame.
17. Sleeve cutoffs remained visible in mid-turn captures. Extend the same knit material beyond the viewport and blend the frame boundary.
18. A paused-clock test advanced before image decode, leaving the deliberately held cover in place. Wait for asset readiness before advancing simulated animation time; add a separate blocked-asset/skip regression.
19. Earlier unused assets still shipped. Archive them outside `public/` so the production bundle includes only active materials.

Second POV review: the scene has one consistent perspective, fingers follow the physical leaf, destination copy stays attached to paper, and the resting pages remain concise. Residual limits are the sprite-based wrist transitions, approximated paper flex and unverified real-device Safari rendering; no claim of motion-capture realism or measured browser FPS is made.

