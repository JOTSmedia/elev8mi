# ELEV8MI — living world update

Open ELEV8MI-preview-v2.html from the ZIP for a self-contained preview.
Upload the CONTENTS of website/ to your existing GitHub repository root,
replacing matching files and retaining the assets folder. No build is needed.
The live website changes only after you upload and GitHub Pages redeploys.

## Changes
- Crisp ELEV8MI navigation wordmark on an opaque dark panel.
- Top navigation streak enters from the right; bottom enters from the left.
  Clicking a link parks the streaks above and below it. Scroll tracking updates
  the active link. Mobile lines appear while the menu is open.
- Hero logo represents the Sun, surrounded by eight textured planets.
  The Moon orbits Earth. Hover, focus, or tap a planet for its information.
- Continuous space-to-subterranean scroll with drifting cloud layers and mist,
  twinkling stars, occasional shooting stars, airborne particles, and moving
  cave-pool reflections. The photographic base plates remain images; layered
  animation gives the environments movement.
- Pause motion control; reduced-motion defaults; animation pauses in hidden tabs.
  Solar animation stops offscreen. A shared clock caps canvas rendering at 30 fps.
- Existing tarot readings and optional audio remain included.

## Solar-system scale
Planet globe diameters and orbital-period ratios use NASA/NSSDCA data:
https://nssdc.gsfc.nasa.gov/planetary/factsheet/
Earth completes a year in 24 seconds; the other planets retain relative periods.
Kepler's equation provides elliptical motion with the published eccentricities.
Distances are compressed to fit the hero, the Sun is a symbolic logo, and initial
phases and orbit orientations are artist-composed, not current astronomical positions.
Saturn's ring-sprite globe size is approximate. Moon distance is enlarged for visibility.
Inner planets and the Moon are naturally tiny at a common diameter scale; selecting
one shows a larger portrait. Textures are generated illustrations, not NASA photos.

## Files and verification
Deploy index.html, both CSS files, all five JS files, elev8mi-logo.png, and assets/.
Documentation and the legacy wordmark PNG are optional. Google Fonts is the only
external visual dependency; fallback fonts are provided.
JavaScript syntax, unique IDs, packaged asset references, forward/reverse scrolling,
resize, reduced motion, and nav entry/parking/rapid-click behavior were checked.
Visual browser verification was unavailable in this session.
