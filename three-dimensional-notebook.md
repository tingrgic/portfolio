# Real 3D notebook replacement

The CSS cover and photographed spread occupy incompatible surfaces and intersect during opening. The current implementation replaces both with depth-tested geometry.

Three.js owns the desk, rounded black covers, hinge, page blocks, paper surfaces, moving sheet, shadows and hand placements. The left cover and its paper block rotate as one assembly about a raised spine; their closed positions sit above the right block. A deforming sheet mesh turns across the binding. The same camera projects all geometry.

At rest, native HTML uses a readable affine plane over the paper for selectable text, keyboard access, links and scrolling. During movement, snapshots of that same HTML become textures on the actual page meshes; the interactive layer is hidden and inert until the mesh lands. Both source and destination textures are ready before movement. This avoids the depth-order limitations of independent CSS text/cover layers.

Opening can be skipped. Reduced motion enters the same 3D reading view without animation. WebGL failure falls back to the accessible static notebook. Render only when geometry/camera changes; cap pixel density and shadow resolution on phones. Keep every asset local and preserve the existing private hosting setup.

Verify closed, quarter-open, edge-on and settled geometry; forward/backward contact and content continuity; all required viewport sizes; keyboard/swipe/reduced-motion; resource cleanup; idle rendering; delayed assets and actual production delivery. The earlier CSS test record is historical and does not certify this implementation.

Primary technical references: https://threejs.org/docs/pages/WebGLRenderer.html, https://threejs.org/docs/pages/ExtrudeGeometry.html, https://github.com/bubkoo/html-to-image.

## October 1 content-continuity repair

The user recording showed blank thumbnails in animated frames and overlapping text before lift. The approved starting state is archived with checksum; see `rollback-2026-10-01.md`.

`capturePage.ts` now paints decoded local images directly with html2canvas, with `foreignObjectRendering: false`. Fonts used by the current DOM are explicitly loaded before measuring. Object-fit, multiply grain and repeating tape/backing gradients are baked into local raster content because this painter does not support those CSS effects directly. No image server, SVG HTML embedding or arbitrary timeout is used.

The live HTML uses an explicit affine transform fitted to all four projected corners; `warpPage.ts` maps its pixels into the physical page texture using the inverse homography. This keeps the same text/image positions through landing in WebKit and Chromium. Premultiplied-alpha bilinear sampling avoids triangle seams. Paper geometry, camera, hands and resting design remain the same.

Stationary ink is opaque and writes depth; the flat turning sheet sits above the highest ink vertex. Textures upload before motion begins. The new regression checks inspect actual canvas pixels for both project images, sample clearance against the ink meshes, and compare the rendered project index at landing with live HTML.
