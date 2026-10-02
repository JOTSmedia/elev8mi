# ELEV8MI v18 verification

- Runtime and standalone inline scripts parse. HTML identifiers, internal
  links, local asset references, embedded assets and ZIP integrity checked.
- Orbital timing verifies the 0.4 speed factor for planetary years and the
  Moon/daylight cycle. Axial spins use the same reduction from v17.
- Moon occlusion, planetary separation, perspective and offscreen lighting
  remain intact. Sunrise and sunset include twilight below the horizon.
- Actual shader compilation and rendered frame comparisons verify cloud
  movement independently of Earth rotation, visibly different night/dawn/day/
  dusk states and time-coherent light on the atmospheric rim and clouds.
- Chromium checks cover desktop and mobile layouts, scene rendering, pause,
  reduced motion and no-WebGL fallback. Deterministic phase fixtures are used
  for repeatable visual snapshots; normal runtime receives separate checks.
- Loader unlocks, one/three-card drawing, exact interpretation email payload,
  centered dialogs and keyboard focus recovery remain functional.
- Local fonts, all 78 authentic card tiles and their source/license records
  are included. The standalone preview works without external requests.

## Rendering limits
WebGL provides the spherical rotating Earth and richer atmospheric effects.
Without WebGL, photographed cloud layers and lightweight weather remain; the
full globe rotation is unavailable. Reduced motion uses still imagery.
Frame rate depends on the device; browser checks do not guarantee 30fps on
all hardware. Scene lighting is cinematic rather than live local weather.
Satellite detail is bounded by the 2K source imagery. No Google imagery,
Google Earth API or Blender scene is required at runtime.
