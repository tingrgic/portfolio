# Generated materials — seated POV revision, 2026-09-30

Generated with the built-in image-generation tool; optimized files are in this repository. No external generation API key or third-party runtime request is needed. These depict an illustrative reader, not Tin's actual hands.

## Selected assets

| Asset | Source filename | Application output |
|---|---|---|
| Walnut desk | exec-6307cb8e-f569-4af3-a6a8-56da1b209522.png | public/images/walnut-desk.webp |
| Six right-hand poses | exec-3ac09b99-bf8d-4287-affb-30f020addb1f.png | public/images/hands-pov/forward-1.webp through forward-6.webp |
| Six independent left-hand poses | exec-0a35af34-bcc6-41a4-b351-d8c4f2cd6b3b.png | public/images/hands-pov/backward-1.webp through backward-6.webp |

Original source directory: `/home/tin/.codex/generated_images/01a0eca4-5a90-7970-a71a-76c7f073d9ca/`.

Transparent atlases are 1536×1024 with six 512px cells. `scripts/process-pov-hands.mjs` extracts 480px WebP frames, retains alpha, and removes detached fragments from neighboring cells. The tiny `knit-sleeve.webp` texture is cropped from the generated sleeve and extends fabric beyond the viewport. It is not a separate stock asset. Left-hand anatomy is authored separately; neither atlas is reflected in CSS.

## Generation prompt records

Walnut prompt:

> Create a photorealistic material texture for the horizontal surface of a premium personal writing desk, wide landscape 1536x1024. Full bleed warm dark walnut wood, long fine horizontal grain, muted chocolate and tobacco browns, delicately worn satin finish, subtle small hairline scratches, sophisticated quiet material with absolutely no dominant knots, plank joins or high contrast swirls. Uniform soft diffuse studio light across the surface, no vignette or shadows baked in, no objects, no notebook, no hands, no lettering. This image will be placed on a 3D perspective plane and lit with code; output only the walnut texture. Natural editorial analog photograph, extremely fine organic detail rather than distressed rustic floorboards. Entire composition is the clean tabletop surface.

Right-hand generation brief: a consistent adult right hand with light olive skin, anatomically plausible back-of-hand view, forearm entering from the lower right and fingers reaching upper left. Full charcoal knitted sleeve. Six poses in a three-column/two-row transparent atlas: relaxed reach, index finger finding the edge, thumb/index pinch, lifted wrist carrying paper, release/press, retreat. Photographic editorial treatment with restrained grain; no page, props, lettering or grid. Each cell keeps consistent scale, light and hand identity.

Left-hand generation brief: use the right-hand atlas as a material/style reference, but create an independently articulated anatomical LEFT hand. Forearm enters lower left, fingers point upper right. Six poses: reach, curling toward paper, pinch, clockwise carry, flat press, release. Match skin, charcoal knit, scale and light; transparent three-column/two-row atlas. This is not a mirrored right-hand image.

## Historical material

The earlier oak texture and original hand sprites are preserved in `artifacts/legacy-materials/`, excluded from production. The notebook cutout and paper texture from the earlier revision remain in use. The historical desk prompt is retained below.

### Earlier field-journal desk asset

Built-in image-generation tool, 2026-09-29. Original output:
`/home/tin/.codex/generated_images/01a0eca4-5a90-7970-a71a-76c7f073d9ca/exec-ad5630be-6b19-4026-b214-1c1425a23103.png`

Selected optimized project asset: `public/images/writing-desk.webp` (1536×1024, WebP quality 76). The original is retained. This asset has been superseded by the walnut surface.

Exact prompt:

> Use case: photorealistic-natural. Asset type: background material for a first-person notebook portfolio. Create a seamless-looking overhead texture of a warm aged oak writing table, quiet medium brown, fine worn horizontal grain, subtle hairline scratches and gentle irregular patina, natural matte finish. Inspired by a well-used European cafe writing desk. Entire image is only the wood surface, evenly illuminated with broad soft daylight. No objects, no notebook, no hands, no writing, no logos, no dramatic knots, no vignette, no high contrast planks or repeated obvious pattern. Tasteful editorial photograph with a little scanned print grain. Landscape 1536x1024. This will sit behind a cream notebook, so restrain contrast and detail.

The original hand atlases and SVG filter have been superseded by the six-pose photographic sequences above. No claim is made that these depict Tin's actual hand. Notebook lines and typography remain code-native, accessible and selectable.
