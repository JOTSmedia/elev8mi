# ELEV8MI v24 — visible motion and clear navigation streaks

Open ELEV8MI-preview-v24.html for the complete offline preview.
Upload the CONTENTS of website/ to your GitHub repository root, replacing
matching files and including assets/ and vendor/. No build step is required.

## Changes
- v24 lifts moonlit Earth/cloud detail, cool reflected planet light and landscape color, while retaining a dark night sky. Orbital timing is unchanged.
- Celestial speed matches the live https://jotsmedia.github.io/elev8mi/ code
  retrieved on October 2, 2026: orbit rate 0.4; Earth display year 17.5 seconds;
  Moon/daylight cycle 24 / 0.7 / 0.4 = 85.714 seconds; Earth rotation 48 / 0.4 = 120 seconds;
  small planet axial base 10 / 0.4 = 25 seconds with their different spin factors.
  The live lunar texture and night opening are retained.
- Refined space, forest and cave imagery has clearer photographic detail.
  Phones now receive the full 941 × 1672 backgrounds rather than 640 × 1137 versions.
  The detail refinements retain the original resolution; they are not 4K photos.
- GPU and particle canvases support up to 2× pixel density. NASA surface/cloud
  maps use up to 4K textures on supported phones as well as desktop. Mipmapping
  improves the globe's distant detail; hardware texture limits are respected.
- Cloud banks move together; river/cave ripples and forest breeze are clearer.
  Twinkling stars are denser. Earth weather advects independently.
- Nav flights stay clear of text. Fresh playback, pause/resume, and mobile
  layout refinements and the complete card/email flow are retained.

The preview and website use the same code. Lighting, orbit distances and time
are cinematic display scales, rather than a single-scale scientific model.
Weather is animated historical imagery, not live local conditions. Moon phase
uses the device date. Credits and licenses remain under assets/ and vendor/.
