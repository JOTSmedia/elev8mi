# ELEV8MI code and animation audit

## Changes with a concrete performance benefit
- Logo + nav wordmark: 1,298,000-ish bytes of PNG replaced by about 281,000 bytes
  of WebP (roughly 78% smaller combined). Runtime now references only WebP;
  the original PNG files can stay in the repository but are not required.
- Orbit guides: removed 1,288 sampled path points per display frame. Eight
  transformed ellipse paths now redraw at most 15 times/second. Orbital body
  movement still updates on every display frame. Layout reads were removed
  from the frame loop; root geometry is measured on resize/font/layout changes.
- Photographic animation: normal WebGL path replaces repeated image-strip copies
  with a six-vertex rectangle per visible scene. Shader sampling animates cloud,
  canopy, river and cave-pool regions from the original images, without double
  cloud exposures. Render buffer covers only the viewport, with capped pixel ratio.
- Panorama-wide animated color filtering was removed. Grading is applied to
  viewport-sized effect canvases. Large reading panels no longer blur the moving
  world underneath them. Below-hero scenery warms after the critical hero load.
- One shared animation clock handles orbit movement and 30-fps scenic effects.
  Hidden tabs and motion pause stop frame scheduling; reduced-motion starts paused.
  Solar updates stop offscreen. Eclipse-event searches are cached; the phase
  interval skips hidden documents. Static scene camera changes run only on scroll
  and layout changes.
- The entrance no longer runs a continuous cosmetic percentage pump or waits
  for the entire site. It has a 2.2-second independent deadline, and a separate
  3.5-second markup watchdog can reveal the page if the entrance script fails.
  Fly-in animates transforms rather than repeatedly changing left/top/size.
- Audio, entrance, tarot and scenery initialize separately; an optional subsystem
  does not own the Draw listener. Classic scripts preserve local preview behavior.

## Verification completed
- JavaScript syntax, unique IDs and references for all runtime assets.
- All controllers initialized together in a DOM test without runtime errors.
- Full 78-card uniqueness, one/three-card selection, repeat-click protection,
  no duplicate selection, safe question rendering, clear/reset and copy visibility.
- Nav streak directions, active-link parking, rapid-click cancellation and resize.
- Scroll camera descent/reverse, endpoint coverage, dynamic reading height,
  viewport resize and reduced-motion scene selection.
- Entrance completion, repeated replay, unresolved fonts and missing images.
- Animation clock per-frame orbit updates, 30-fps effect scheduling and pause.
- New/full phases, a real total-eclipse date and a Blue Moon calendar date.
- Transparent crescent/half/full masks and desktop/mobile Earth-limb occlusion.
- Scene shader compiled and rendered in Mesa/llvmpipe via an offscreen EGL context.
  Rendered frame comparisons changed 37,246 space pixels, 159,874 surface pixels
  and 26,172 cave pixels above the test's threshold over a four-second interval.
  This confirms animation/rendering, not a GPU/browser FPS benchmark.
- Rendered landscape imagery was inspected. WebGL-unavailable path retains the
  original photos; browser hardware, exact layout and live FPS remain unverified.

## Practical limits
The scenery is localized photo animation with shader refraction and layered
weather, not physically simulated fluid, trees or a full 3D reconstruction.
The supplied deck was styled as generated artwork; it is not a claim of a
pixel-identical restoration of every Rider-Waite-Smith detail. Astronomy is a
compressed visual scene with real-time Moon phase information. Review the included
standalone preview on desktop/mobile before replacing the published site.

## v11 checks
Loader visibility, bounded startup, replay, full-deck selection, completed-spread popup, encoded email subject/body/cards, question safety and reset were checked in DOM tests.
