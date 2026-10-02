# ELEV8MI — audited living-world build

Unzip this package and open ELEV8MI-preview-v11.html for the complete standalone
preview. For GitHub Pages, upload the CONTENTS of website/ to your repository
root, replacing matching files. Include every JS/CSS file, assets/ and vendor/.
No installation or build step is required. All scripts are classic scripts, so
there is no ES-module/file-origin requirement. Google Fonts uses the internet;
system fallbacks allow the site to work offline.

## What is included
- Independent surface rotation with NASA axial tilts and signed sidereal periods;
  spin speeds are logarithmically compressed. Saturn rings retain their plane.
  Surface textures are approximate wraps of the existing disc photographs.
- Kepler ellipse animation now preserves relative orbital periods instead of
  square-root time compression; glowing planet halos and sparkling stars.
- Restored visible entrance with a 1.4-second minimum on standard motion.
- Completed spreads open an interpretation popup with selected cards and an
  email draft addressed to readings@allison.grok.me. Subject: INTERPRET MY CARDS.
  The requested message is preserved exactly, followed by cards and any question.
  Email opens in the visitor’s mail app for review and sending.
- GPU photo animation for the existing space, mountain forest and cave images:
  cloud drift, tree breeze, flowing river highlights and cave-pool refraction.
  Mist, particles, stars and distant birds form separate light animation layers.
  Static photos and a 2D effect path provide fallbacks when WebGL is unavailable.
- A small, bounded entrance, fail-open watchdog, cached CSS, compressed logos,
  and independent audio, reading and animation controllers.
- Logo remains above every orbit. Its halo breathes; the enlarged Moon glows
  around only its illuminated shape and disappears behind Earth's limb.
- A full illustrated 78-card deck matching the provided reference's style, with
  one/three-card selection, upright/reversed meanings and repeat readings.
- Opposite nav streaks that park around the active link, mobile menu, visible
  draw instructions, instruction dialog, motion pause and reduced-motion defaults.

## Astronomical and visual scope
The photographed foreground Earth is the hero's Earth anchor. Its solar orbit
is highlighted; the viewing frame follows Earth. Starting planetary phases are
calculated by Astronomy Engine. Distances and sizes are
compressed for composition; orbital time uses one common accelerated scale, and the logo is the symbolic Sun. This is an artistic
solar-system illustration, not a single physical scale or live ephemeris diagram.
The Moon's 24-second display orbit is accelerated; its illuminated phase is
calculated from the device's real date/time, refreshed every minute while visible.
Phase orientation is Northern Hemisphere. Actual global eclipse intervals receive
red/orange tint. Blue Moon is a calendar label, not automatic blue coloration.
The informational Moon panel remains visible when the scene's Moon is occluded.
The 90-second day/night lighting demonstration is driven separately from lunar
motion. Earth rotation causes sunrise; the Moon passing behind Earth does not.
This is not location-based live weather or a live view from a specified location.
The environments are animated photographs, not a fully reconstructed 3D world.
Blender was not installed and was not used. Planet rotation uses approximate
wrapped photo textures, not complete scientific longitude maps. Earth remains
the foreground photographic anchor. This is a two-body Kepler approximation,
not an N-body gravitational simulation.
NASA rotation/tilt data: https://nssdc.gsfc.nasa.gov/planetary/factsheet/

## Licenses and artwork
Astronomy Engine v2.1.19: https://github.com/cosinekitty/astronomy
Its MIT license is preserved in vendor/astronomy.browser.min.js.
Generated imagery and prompt records are in assets/PROMPTS.md and TAROT-ART.md.
HTML supplies reliable card names; generated lettering and tiny details may vary
from the classic reference. The reading text is for reflection.
NASA context: https://science.nasa.gov/moon/eclipses/
https://science.nasa.gov/solar-system/moon/super-blue-moons-your-questions-answered/

## Verification
See AUDIT.md for the performance changes and completed checks. All scripts were
syntax-checked; DOM interaction tests exercised the complete script set, card
selection, menu, live phase, startup failures and replay. The photo shader compiled
and rendered all three scenes in an offscreen Mesa graphics test, and rendered
frames were visually inspected. Full browser layout/animation-rate verification
was unavailable; no hardware FPS or cross-browser performance claim is made.
