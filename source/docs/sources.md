# Sources

Logo reference supplied in attachment B3012ACD-C751-43E3-B1CB-869B69686703/1-Pasted-Image-1.jpg: bold black lowercase t. Recreated as a small vector letterform in `public/logo.svg`; screenshot background and domain label are not part of the logo. Matching favicon and 180px Apple touch icon added. User's second screenshot identifies the unwanted left-book crop; mobile now displays the complete original notebook image at 100% width with no offset.

Latest reference: user-supplied photo of an open lined notebook and a hand resting on a worn wooden desk (attachment 7FB5875D-EE83-40AB-919D-0A0EC3A9C8B0/1-Photo-1.jpg). Used for physical proportions, ruling, warmth and human scale. Its handwriting, illustration and branding are not reproduced. The desk asset is newly generated, not extracted from the reference. See `docs/image-generation.md` for exact prompt and provenance.

Inspected 2026-09-29. Seven subsequently supplied visual references inform the revised design.

- https://komon.hr — live HTML and browser screenshot. Title: “Komon | Prva pomoć za bespovratna EU sredstva”. Visible services include project proposals, project management, EU project/public procurement consulting, and education. Portfolio summary: a website for an EU funding consultancy. No ownership detail, delivery metric or project role claimed.
- https://tingrgic.github.io/pk-normal — live HTML and browser screenshot. Title: “Pikado klub Normal | Zagreb”. Visible team, match information, interactive match map, darts counter and multilingual navigation. Summary: a digital home for a Zagreb darts club. No unverified outcomes or role claimed.
- https://linkedin.com/in/tingrgic — exact contact URL supplied by user; not used to infer additional personal data.
- Name and role at Rimac Technology supplied directly by user.
- Visual references: two open black notebook stock-image search screenshots; three mixed-media cutout/marker examples; two Tom print-texture screenshots. Used for material and composition direction only; no watermarked stock image or cartoon character is incorporated into the site.
- Cormorant Garamond and DM Sans: Google Fonts distributions, SIL Open Font License, bundled locally with licenses.
- Hand: original atlases are historical. The current revision uses six separately authored right poses and six left poses in `public/images/hands-pov/`, with no reflection. These are generated editorial assets, not photographs of Tin. See `image-generation.md`.
- Notebook: the main notebook is now original code-authored Three.js geometry. The earlier generated blank notebook cutout (84KB WebP) is retained only for hardware/context failure. Reference notebook screenshots informed the material direction, but are not used as site assets.
- Paper: original generated cream fiber texture; selectively composited over project prints and turning leaves.
- Caveat: Google Fonts, SIL Open Font License, local Latin/Latin Extended WOFF2 subsets. License in public/fonts/Caveat-LICENSE.txt.

Screenshots are faithful captures of the user-supplied portfolio sites. They are not fictitious redesigns. Site content may change after capture.

## Seated POV revision — 2026-09-30

- https://www.awwwards.com/sites/bruno-simon-portfolio — primary award record, SOTD November 11, 2019, score 8.04. Studied consistent object-based navigation and commitment to a coherent world; no car/game elements copied.
- https://henryheffernan.com/ — directly browsed the physical desk and staged entry. Used to reason about arrival into a space. Our camera remains first person and does not orbit the room.
- https://adamsnotebook.com/projects/a-singular-reading-experience/ — creator's explanation of real HTML on a physical book, especially page/text synchronization. Closest notebook reference, not claimed as award-winning.
- New generated assets: quiet walnut desktop plus separate six-pose right and left hand atlases, generated with the built-in image tool. Each arm includes its photographed knit sleeve. Left-hand poses are independently generated; no CSS mirroring remains. Source atlases remain under the Codex generated-images folder; optimized application assets live in `public/images/hands-pov/` and `public/images/walnut-desk.webp`.
- The earlier note saying mobile shows the complete notebook is historical and superseded: current phone framing shows the readable right page with the left leaf naturally continuing off the viewport.

## Real 3D implementation references

- https://threejs.org/docs/pages/WebGLRenderer.html — renderer, local textures and depth/shadow rendering.
- https://threejs.org/docs/pages/ExtrudeGeometry.html — rounded extruded cover and paper-block geometry.
- https://github.com/bubkoo/html-to-image — original DOM snapshot implementation, replaced during the October 1 repair below.
- Three.js and html2canvas are installed dependencies with lockfile versions; no Spline account, remote scene embed or hosted asset dependency is introduced.
- The notebook model and paper/cover surface textures are code-authored. The prior generated notebook image remains a hardware-failure fallback, not the normal animated object.

## October 1 animation-content repair
- User-provided iPhone screen recording, 6.10 seconds: inspected at quarter-second intervals. Visible findings: missing thumbnail pixels throughout the moving texture, overlapping project text before lift, complete native content after the turn. Extracted audit frames remain in `artifacts/qa/iphone-content-glitch/`.
- [html-to-image maintainer repository](https://github.com/bubkoo/html-to-image): explains its SVG foreignObject pipeline; [Safari image report](https://github.com/bubkoo/html-to-image/issues/488) describes blank embedded images. The recording independently establishes the symptom here.
- [html2canvas configuration](https://html2canvas.hertzen.com/configuration) and [supported features](https://html2canvas.hertzen.com/features): direct canvas rendering, clone customization, and unsupported object-fit/filter/repeating-gradient effects. Those needed by this design are rasterized explicitly in the snapshot helper.
- New code-authored inverse texture mapping preserves alignment with the native HTML plane; no new visual assets or externally hosted services.

## Visual redesign audit — 6 October 2026

Four new user-supplied JPEG references supersede the earlier lined-journal visual direction: `1-Photo-1.jpg` is the closed seated composition; `2-Photo-2.jpg` the open introduction/work spread; `3-Photo-3.jpg` the connect spread; `4-Photo-4.jpg` the asset lookbook. They establish warm wood, unruled cream paper, charcoal leather, dimensional clay titles/icons, handwritten copy, right-edge tabs and photographic hands. Reference originals and checksums are preserved for development in `artifacts/visual-redesign/audit-2026-10-06/references/`; they have not been copied into production assets. Their depicted website imagery is stylized and does not replace authentic local Komon/PK Normal screenshots.

The user explicitly supplied `info@tingrgic.com` for the redesign; existing config still has an empty email during this audit-only pass. The configured LinkedIn address remains `https://linkedin.com/in/tingrgic`. No new biography, authorship claim or project outcome was inferred.

See `visual-redesign-audit.md` for the verified pre-change backup, current architecture/asset inventory, actual baseline evidence and proposed implementation sequence. No new GLB, clay artwork or hand sequence has been produced or represented as complete.

## Clay notebook implementation — 7 October 2026

The six dimensional page assets in `public/images/clay/` were generated with the built-in image-generation tool for this project: name, connect statement, bulb/cloud cord, paper-plane cord, LinkedIn tile, and envelope. They retain transparent alpha and are decorative complements to semantic HTML. The generated source PNGs remain in the Codex generated-images directory; optimized WebP files are copied into the project. These are new artworks informed by the supplied visual language, not extracted reference-image fragments.

The wood material `walnut-clay-desk.webp`, leather material `notebook-leather.webp`, and hardware-only `notebook-clay-fallback.webp` are also original generated assets. Exact prompts and source paths are recorded in `clay-asset-prompts.md`. They are illustrative materials, not measured PBR scans.

`public/models/portfolio-environment.glb` is authored through Blender 4.3.2 with the reproducible `scripts/author-environment.py`; the editable `.blend` source is in `artifacts/visual-redesign/authoring/`. The portable Blender runtime was downloaded from the official Blender release server into `/tmp`; it is an offline authoring dependency, not a browser runtime or system installation. The environment includes separately named desk, coffee, plant, lamp, pencil cup/pencils, dish/clips and foreground clothing. Repeated static detail is consolidated by role/material. The interactive notebook, cover, paper stock, turning sheet and tabs retain independently controlled Three.js geometry.

The hand atlas remains the previously documented generated photographic sequence (six independent poses per direction). Camera/hand/page interpolation is smoother, but this revision does not claim newly authored 18–24 fps finger articulation or identity-accurate hands.


## Reference-led refinement, October 2026

See [clay refinement provenance and prompt set](clay-refinement-2026-10-08.md) for the new separately authored hand atlases and all replacement clay/material assets. These are generated illustrations/materials, not photographs of Tin. The live project screenshots and configured destinations remain authentic and unchanged.
