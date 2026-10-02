# ELEV8MI — slower orbits and a living atmosphere

Unzip and open ELEV8MI-preview-v18.html to view the complete site offline.
Upload the CONTENTS of website/ to your existing GitHub repository root,
replacing matching files. Include all scripts/styles, assets/ and vendor/.
No install or build step is required. Images, fonts, styles and scripts are
embedded in the preview; the production website serves the local files.

## Changes in this version
- Planetary orbits and the Moon/daylight cycle run at 40% of the v17 speed:
  a 60% reduction. The compressed Earth year is 17.5 seconds; the Moon display
  orbit and linked day/night cycle are approximately 85.7 seconds.
- Earth rotates independently on a 120-second display period. Small planetary
  surface spins also run at 40% of their former speed.
- Atmospheric cloud layers move independently of land and water. Their
  lighting, haze and atmospheric rim follow the same celestial clock.
- The horizon Sun travels from dawn through daytime to dusk. Sunrise lights
  the clouds in warm gold; sunset shifts them into deeper coral and rose,
  then fades through twilight into night. The same state follows the descent
  from space through the atmosphere and into the landscape.
- Motion pause, reduced-motion stills and a lightweight non-WebGL fallback
  are retained. GPU effects draw at a capped 30 frames per second and process
  only the visible scene.

## Existing features
Smooth percentage-based loader; readable styled navigation; pulsing hero
logo; live lunar phase and illuminated-only Moon; eight planetary markers
with perspective; opposing nav streaks; animated forest, river and cave pool;
78 authentic Rider–Waite–Smith cards; nine reading styles; one/three-card draws;
centered interpretation popup and the requested prefilled email draft.

## Visual scope and sources
The scene uses compressed display distances and separate artistic clocks;
it is not a single-scale astronomical simulation. Sunrise is synchronized
with the Moon moving behind Earth as requested, rather than a physical
prediction. The Moon's illuminated phase uses the device date and time.
Sky and weather are animated cinematic states, not live local conditions.
The NASA globe/cloud maps are historical composites; Google Earth was used
as a visual reference and its imagery is not embedded. Landscapes remain
animated photographs rather than a reconstructed navigable 3D world.

Credits are in assets/EARTH-IMAGERY.md, assets/PROMPTS.md,
assets/TAROT-ART.md and assets/TAROT-SOURCES.json. Font licenses are under
assets/fonts/; Astronomy Engine's MIT license is in vendor/.
AUDIT.md records the verification and practical rendering limits.
