# ELEV8MI v29

ELEV8MI-preview-v27.html (project folder) is the older v27 offline preview and
was not rebuilt for v28; preview v28 by serving website/ locally
(e.g. `python3 -m http.server` inside website/).
Upload the CONTENTS of website/ to the root of your existing GitHub repository,
replacing matching files. Include assets/, vendor/, favicon.ico and all CSS/JS.
No installation or build step is required.

## v29 changes
- Nav indicator lines are brand gold (`--gold` tokens). On desktop both lines
  park exactly over and under the active link's text (re-measured on resize,
  font load, layout changes and scroll-spy updates); with no active section
  they keep looping. In the mobile menu the active link gets gold lines over
  and under its text.
- The 528 Hz pill has a sound dropdown (Tone + instruments), keyboard and
  screen-reader accessible (menu button, Arrow/Home/End/Enter/Escape).
- "Send your reading to Allison" form in the interpretation dialog
  (Web3Forms). The mailto draft stays as the fallback.

## Sound menu: adding an instrument (one line)
Add `{id:'<slug>',label:'<Name>'}` to `instruments` in `sound-config.js` and
upload `elev8mi-528hz-<slug>.ogg` and `.mp3` next to index.html. Files are
normalised to about -18 LUFS and share `sharedGain`; the Tone drone is set to
the same loudness. Listed instruments whose files are missing are hidden.

## Direct send form (Web3Forms): one-time activation
1. Open https://web3forms.com, enter elev8miangel@gmail.com, and create an
   access key. Web3Forms emails the key to that inbox.
2. In `form-config.js`, replace `PASTE-WEB3FORMS-ACCESS-KEY-HERE` with the key
   and re-upload `form-config.js`.
Until then, Send opens the visitor's email app with the same filled-in draft.
The form sends the name, email, optional question, reading style, and each
card's position, name, Upright/Reversed and image link. It has a honeypot
(`botcheck`) field.

## v28 changes
- Brighter, more vivid Earth (shader + CPU fallback), starfield and planets.
- Major moons orbit their planets: Phobos/Deimos, Io/Europa/Ganymede/Callisto,
  Rhea/Titan, Titania/Oberon, Triton (retrograde). Shaded toward the Sun;
  display orbits and time are compressed (period^0.5); they freeze with
  Pause motion and prefers-reduced-motion. Code: planet-moons.js.
- Nav item and hero CTA read "Tap into your energy". One- and three-card
  spreads both open the "Let Allison interpret your cards" email prompt.
- Inquiries go to elev8miangel@gmail.com via a mailto draft listing each
  card's position, name, Upright/Reversed and a link to its deck image. No
  form service (mailto cannot attach files); the dialog also offers
  "Download my cards" (a PNG of the drawn cards) the visitor may attach.
- Instagram @elev8mi and www.elev8mi.com
  are linked in the contact section and footer; canonical/og URLs use
  https://www.elev8mi.com/.
- Sound: the tuner pill has a Tone/Guitar choice. Guitar plays the seamless
  528 Hz loop (elev8mi-528hz-guitar.ogg/.mp3, CC0, see AUDIO-LICENSE.md).

## Swappable deck (custom 78-card art)
The custom ELEV8MI deck (600x1050 WebP, JPG fallbacks, one shared back.webp;
see assets/deck/deck.json and LICENSES.md) is installed in `assets/deck/`.
Card images load per card from `assets/deck/`, configured in `deck-config.js`
(`basePath`, `extension`, `version`). File names are listed in
`assets/deck/FILENAMES.txt`: `major-00-the-fool` … `major-21-the-world`
(slug of the site's card name, e.g. `major-12-the-hanged-one`),
`<suit>-01-ace` … `<suit>-10-ten`, `-11-page`, `-12-knight`, `-13-queen`,
`-14-king` for cups/wands/swords/pentacles, plus `back.webp`. Any file that is
missing falls back to the built-in atlas (tarot-atlas.webp), so cards can be
added gradually. Bump `version` when replacing files. With
`emailImageLinks:'auto'` the email draft lists a link per card to its image in
assets/deck/, built from the page's current address (works on a GitHub Pages
subpath and on www.elev8mi.com), for cards whose file actually loaded.

## Earlier changes (v27)
- Navigation uses translucent purple, blue and white glass with soft reflections.
  The rounded mobile dropdown matches the header.
- Two light trails loop continuously around the actual rounded pill perimeter,
  half a lap apart: top moves right and curves around to travel left below.
  They keep looping after link clicks and preserve their lap on screen resize.
  Pause motion and reduced motion freeze them in place.
- The nine face-down Draw cards are visible immediately, dimmed and disabled.
  Choosing a reading style shuffles and lights them up. Style, spread and shuffle
  remain editable until the first card is picked, then lock until completion.
  Reading options use uppercase Cinzel lettering. Instructions match this flow.
- Mobile orbits use a shallower oblique camera and a wider plane with real
  perspective, instead of tall loops. Foreground Earth remains an enlargement;
  the miniature mobile orbital plane is framed independently of that landmark.
- Moon and planet halos are brighter, with a softer outer bloom. Live Moon
  phase, Sun/Moon light directions, body spin and the shared pulse clock remain.
- Logo-based ICO/PNG favicons, an Apple touch icon and a 1200x630 share image
  are included. Open Graph and social-card metadata reference the GitHub Pages
  homepage and the versioned logo thumbnail. Upload these assets before sharing.

The existing Earth surface/weather animation, night opening, loader, subtle
complete orbit paths, curved Earth occlusion and interpretation dialog remain.
Earth surface rotation is six minutes; the Moon/daylight display cycle is
85.714 seconds. The interpretation email stays a reviewable mailto draft to
elev8miangel@gmail.com, with subject INTERPRET MY CARDS and selected cards.

Radial distances, sizes, camera framing and time are cinematic display scales.
Earth maps are historical satellite composites. Other globes use illustrative
photographs. Moon phase uses the device date. Credits/licenses are in assets/
and vendor/. This package is for manual upload; it does not deploy or send email.
