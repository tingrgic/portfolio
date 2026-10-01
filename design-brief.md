# Tin's notebook — design brief

## Real 3D replacement
The explicit request for a modeled notebook supersedes the CSS implementation decision below. See `three-dimensional-notebook.md`: cover, spine, paper block and continuous curled sheet now share a WebGL depth buffer. Native HTML is projected onto the pages at rest. The photographic book is only a context-failure fallback. Geometry and camera framing are content-independent. Previous CSS proportions describe that historical renderer, not the current mesh.

See [POV redesign](pov-redesign.md) for the researched direction and latest physical model.

## Latest material direction
The supplied open lined journal on a worn wooden desk is the current notebook/hand reference. Preserve the calm serif/sans typography, add faint blue-grey ruling and warm worn paper, use an quiet walnut background and six photographic cutout poses per hand. Treat the notebook as a fixed physical object: desktop width/height 1.5 (tablet 1.24); cropped phone frame height/width 1.72. Sections and text enlargement must not alter these ratios. Intro/contact overflow is reachable inside the paper; work copy is deliberately reduced until each mobile project page fits without scrolling. `src/materials.css` owns this layer. No camera orbit, artificial props or copied reference text.

## 1. Concept
A personal black notebook, opened on a warm desk from the seated reader's point of view. This physical object is the entire interface, not decoration around a conventional portfolio.
## 2. Audience
Collaborators, fellow builders, and people curious about Tin's work.
## 3. Main message
Tin Grgić builds systems, interfaces, and experiments. Hybrid Cloud Infrastructure Engineer at Rimac Technology; occasional AI tinkerer.
## 4. Information architecture
Three directly accessible notebook sections: Introduction, Selected work, Connect. Work contains two clear project clippings. Persistent edge tabs and next/previous controls supplement in-page actions.
## 5. Art direction
Warm editorial minimalism in the introduction; curated, slightly irreverent collage on the work pages. A short first-person lean over the table settles into a stable reading viewpoint. No room camera, glass cards, floating interface or ornamental props.
## 6. Material system
Charcoal cover, layered ivory page edges, shaded central gutter, subtle paper noise, diffuse desk shadow. Work adds semitransparent tape, torn scraps, photocopy textures and a single red pencil/marker accent. Materials are primarily CSS, so copy stays selectable and readable.
## 7. Typography
Latest user feedback: reduce the dominant handwriting. Use self-hosted Cormorant serif headings, DM Sans body and controls, and Caveat only for personal margin notes/signature. Primary body text is 15px at core viewports; secondary labels are smaller. No emoji ornamentation.
## 8. Color system
Ink #252821; paper #f2eee3; cover #242623; desk #382a21; red #a83c2b; yellow tape #dbc786. Muted green is reserved for Komon's existing screenshot. Contrast must survive texture overlays.
## 9. Motion language
One settle/open sequence; deliberate page turns. GSAP transforms and opacity, no continuous movement. Right hand turns forward, left hand turns back; fingers follow the physical page edge in the same perspective space. Reduced motion bypasses complex transforms.
## 10. Notebook behavior
Desktop: two-page spread with black cover lip, curved page shading and thread/gutter. Book stays anchored. Cover swings open on load; no mandatory wait to access navigation. Page navigation preserves focus and announces current section.
## 11. Scrapbook behavior
Two actual site screenshots serve as pasted printouts. Each project has name, factual summary, live link, without excess metadata. Asymmetric tilt, tape and hand-drawn marks support hierarchy rather than compete with it.
## 12. Mobile strategy
Below 700px, compose a single-page notebook. Introduction's title and identity share one page. Each project gets its own turnable page, preserving full-size copy and touch targets. Contact is one compact page. Desk remains visible at edges. Tabs become a horizontal row attached to the book. Scrolling is allowed; never force tiny text to fit.
## 13. Accessibility strategy
Semantic headings, links, buttons, navigation and main landmark. Visible focus, 44px touch controls, content independent of motion. Respect prefers-reduced-motion and allow manual motion toggle. No essential gestures or hover-only content. On section change focus the new heading after motion. Decorative hand and textures are hidden from accessibility tree.
## 14. Performance constraints
React + TypeScript + Vite + GSAP, CSS 3D; no WebGL runtime. Self-hosted subset fonts, optimized WebP screenshots and hand. Target initial JS <150KB gzip, local assets only, no analytics. Image dimensions reserved; no autoplay background video. Static dist supports local/VPN serving.
## 15. Anti-patterns
Do not flatten into a generic hero and grid. Do not fabricate outcomes, dates, roles or emails. No excessive props, perpetual floating, giant hand closeups, tiny illegible collage, keyboard traps, public deployment or automatic firewall changes.
