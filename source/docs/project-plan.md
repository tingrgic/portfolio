# Project plan — real 3D revision

1. Inspect the existing notebook, source content, prior screenshots and user references.
2. Research coherent physical-world portfolios and notebook implementation pitfalls. Record sources before changing the scene.
3. Define the new camera/material direction in `pov-redesign.md`.
4. Replace the CSS cover and photo with a real Three.js notebook: raised hinge, separate blocks, rounded covers, paper, shared camera and lighting.
5. Generate and optimize quiet walnut plus independent six-pose right/left hand atlases.
6. Build continuous, fixed-length paper curl and move both hand atlases along the actual mesh edge.
7. Preserve old stationary content, stage destination content before lift, and simplify mobile work copy.
8. Inspect opening/turn frames and all required layouts, run keyboard/swipe/reduced-motion/accessibility checks, fix findings.
9. Record actual test/build results, update documentation, and rebuild the existing private service.

Implementation is React/TypeScript/Vite/GSAP and Three.js, explicitly requested to eliminate CSS cover intersections. html-to-image prepares matching page textures; native HTML remains interactive at rest. DOM content retains native semantics and selectable text. Page flex and finger pressure remain an art-directed approximation, not a physics simulation.

Actual verification and delivery status are recorded in `qa-checklist.md`. The existing Tailscale endpoint remains private; no firewall, router or public-hosting change is part of this revision.
