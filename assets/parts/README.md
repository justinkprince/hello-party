# assets/parts/

Character parts (decisions D-35, D-37, D-41, D-43, D-44). The renderer is in `shared/character/`.

**Files.** `base.svg` is the body and head. Every other file is one part, named `<slot>_<name>.svg` (`bow_`, `hair_`, `face_`, `outfit_`, `acc_`). The ids are fixed in D-44. An empty file is a stub (not drawn yet), except `*_none.svg`, which are empty on purpose.

**Format.** Each file is an SVG on a `0 0 100 140` canvas. The art sits in groups whose `id` is a rig layer name, and the renderer copies each group into that layer. Only these groups are read from each slot:

| Slot | Groups |
|---|---|
| bow | `bow` |
| hair | `hair_back`, `hair_front` |
| face | `face` |
| outfit | `outfit`, and optionally `arm_l`, `arm_r` (sleeves, drawn on top of the skin arm so they turn with it; D-50) |
| acc | `accessory` |

`base.svg` holds `leg_l`, `leg_r`, `body`, `arm_l`, `arm_r`, `head_base`, `freckles`, `glasses`.

**Drawing rules.**
- Colors: `class="c-skin"`, `c-hair`, `c-bow`, `c-outfit` fill from the four color variables. Anything else has a fixed color inline. Accessories have fixed colors.
- Outline: add `class="ol"` (fixed dark stroke, D-43) on the same shape as the fill. No gradients, no filters, no nested `<g>`.
- Node budget: 40 or fewer per character, ceiling about 50 (D-9). The rig is 17 of them (D-47). Merge shapes with the same fill into one `<path>` with several subpaths (for example both eyes).
- Original art only, never Sanrio assets (D-09).
- Hair: the front piece's outer edge is the outline of the whole hairstyle. Do not put a bigger crown shape behind it that peeks out around the top: the strip between the two outlines reads as a headband. `hair_back` is only for what hangs or sticks out behind the head (a bun, a ponytail, pigtails, long locks).
