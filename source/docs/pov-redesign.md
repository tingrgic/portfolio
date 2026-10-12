# Seated POV redesign — 2026-09-30

Historical CSS-stage design. The real 3D mechanism in `three-dimensional-notebook.md` supersedes the implementation below; the seated viewpoint and hand art direction remain applicable.

## Diagnosis
The previous screen reads as a front-facing image of a notebook with UI laid over it. A static full-screen wood texture offers no camera depth. The artificial sleeve and viewport-positioned hand disagree with the paper's coordinate system. Forward mobile turns repeat the destination on both sides of the leaf. The opening cover doesn't share the notebook's physical dimensions. Passing interaction tests did not establish the intended feeling.

## Direction
A seated reader leans forward over a walnut writing desk. The top of the notebook recedes away from the face; the bottom is closer. The whole world shares one perspective plane. A short opening moves from a more distant, steeper view into a calm reading angle, then the black right cover hinges left. No orbit and no idle camera motion. An always available skip action and reduced-motion preference settle immediately.

The notebook is the primary object: charcoal leather, warm ivory stock, stacked page edges, soft gutter shadow, small paper tabs. The wood is darker and quieter than the previous rustic surface. Daylight enters from upper left. Decorative interface chrome stays sparse. Editorial typography uses existing local fonts, with only small margin annotations in handwriting.

## Mechanism
CSS 3D/GSAP remains appropriate because every page is accessible live HTML and the camera stays constrained. The new parent perspective affects desk, notebook, tabs and hands together. Twelve narrow sheet segments approximate page flex. Old stationary pages remain under the moving leaf until physically covered; next-page content exists underneath from lift. A forward phone turn shows the outgoing page on the front and blank verso as it leaves screen; the destination stays on the right. A backward phone turn carries the destination from the left onto the right. No duplicate projects on opposite faces.

## Research
- https://www.awwwards.com/sites/bruno-simon-portfolio — verified SOTD Nov 11 2019, score 8.04. Used for the principle of one consistent interactive world, not its car/game mechanics.
- https://henryheffernan.com/ — directly inspected the staged physical desk and opening interaction. Used for spatial arrival; no third-person room tour is copied.
- https://adamsnotebook.com/projects/a-singular-reading-experience/ — author describes hybrid physical-book/HTML architecture and synchronization pitfalls. Closest subject reference; no award claim.

## Acceptance
Capture opening at multiple times, both directions mid-turn, desktop and mobile settled compositions. Validate all six required viewport sizes, smaller Safari-like phone heights, fixed geometry, no mobile work text scrolling, native linked thumbnails, keyboard, reduced motion and interruption. Rebuild the existing private service only after verification.
