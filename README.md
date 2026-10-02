# ELEV8MI v26 — deeper mobile orbits and complete pulsing paths

Open ELEV8MI-preview-v26.html for the complete offline preview.
Upload the CONTENTS of website/ to your GitHub repository root, replacing
matching files and including assets/ and vendor/. No build step is required.

## Changes
- A tilted 3D orbital plane uses a perspective camera. Mobile uses a higher
  camera angle so the system has depth instead of stretched vertical hoops.
  Aspect-aware framing keeps every complete path inside the viewport.
- Planets grow nearer the camera, shrink and soften farther away, and change
  halo strength with depth. Axial rotation and directional Sun/Moon light remain.
- Planet artwork scales independently of its 44px touch target. Conjunction
  spacing includes the enlarged near-side sprites, Saturn's rings and Moon.
- Earth occlusion follows the same analytic sphere silhouette as the rendered
  globe, across the entire sprite, ring and halo. Background planets pass
  behind the curved limb instead of clipping through a horizontal cutoff.
- Complete orbital paths remain visible as a faint overlay, including over
  foreground Earth. Rear dashed accents and front brighter arcs show depth.
  Their subtle 7.8-second pulse follows the shared pause/reduced-motion clock.
- Expanded mobile menu has 22px rounded corners matching the navigation pill.
  Its 44px menu button has rounded corners as well.
- v25 scenery framing, logo contrast, slow six-minute Earth rotation, live
  Moon phase, 85.714-second Moon/daylight cycle, loader and reading/email
  functionality are retained. No deployment or external sending is performed.

Radial distances, sizes, camera framing and time are cinematic display scales,
not a single-scale scientific simulation. Foreground Earth is an enlargement;
paths are a design overlay and remain visible through its image by request.
Earth maps are historical satellite composites. Other globes use illustrative
photographs. Moon phase uses the device date. Credits/licenses are in assets/
and vendor/; the wide scenery is generated refinement, not a 4K claim.
