# 3D motion storyboard

This replaces the CSS-strip choreography.

## Opening
The closed left cover and its pages sit above the right paper block. Their raised hinge opens through a half-turn; both objects share a Three.js scene, lighting and depth buffer. A short first-person lean moves the camera closer while the right hand guides the outer edge. The cover remains physically beneath the left pages after opening; it never fades through a photograph.

Prepare local assets, fonts and page textures before playing. Keep Skip opening available during loading. Reduced motion enters the same reading view immediately. The resting camera never drifts or orbits.

## Turning
A 1.95-second reach, grip, carry, release and retreat. Integrate 48 tangent segments to deform the sheet without shortening its arc length. Clamp tangents above the underlying stock, keeping both faces clear of the page blocks. Forward turns carry the right leaf to the left with the right hand; backward turns bring the left leaf rightward with the left hand. Six independent poses per hand, sampled at 10 fps, follow the actual mesh edge. The camera remains seated and still.

Capture source content before committing the destination, and prepare both destination textures before lift. Explicitly load fonts and decode images, paint snapshots directly to canvas (no SVG foreignObject), align their ink to the live HTML plane and upload them before movement. Text is part of the depth-tested moving mesh during movement. Keep the old stationary side until covered. Hide and inert the projected DOM during motion, then restore it and focus the heading after landing. Mobile forward versos remain blank because the opposite page lies outside the reading crop.

## Quality of life
Native buttons, arrow keys and horizontal swipes share one sequence; vertical gestures remain scroll gestures. Suppress trailing link taps after swipes. The thumbnail and explicit link both open each project. Cache textures, stop rendering at rest and drop slow frames rather than extending a turn. Resize, browser history and reduced-motion changes cancel preparation as well as active movement. Dispose GPU resources on teardown. WebGL failure preserves the static notebook.
