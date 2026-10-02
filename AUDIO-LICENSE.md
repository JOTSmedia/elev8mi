# ELEV8MI 528 Hz Acoustic Guitar Loop — Audio License & Credits

**Files:** `elev8mi-528hz-guitar.mp3` (160 kbps CBR, 44.1 kHz stereo), `elev8mi-528hz-guitar.ogg` (Vorbis q4)
**Length:** 2:00 (120.0 s), seamless loop — **Created:** 2026-10-02 by JOTS.MEDIA for ELEV8MI

## License: CC0 1.0 Universal (Public Domain Dedication)
To the extent possible under law, JOTS.MEDIA has waived all copyright and related or
neighboring rights to this recording and composition under CC0 1.0
(https://creativecommons.org/publicdomain/zero/1.0/). No attribution required; free for any
use, commercial or otherwise, with no royalties.

## How it was made (why it is license-free)
- **Original composition** (fingerpicked progression Cmaj7–Am7–Fmaj7–G6 / Am7–Em7–Fmaj7–C …
  with a simple melody resting on C5), written in code for this project. Common chord
  progressions are not copyrightable; no existing song, melody or recording was used.
- **100% synthesized** in Python/numpy: extended Karplus-Strong plucked-string physical model
  (two string polarizations, pick-position comb filter, fractional-delay tuning, natural decay
  and string damping), a synthetic guitar-body resonator, and a synthetic stereo reverb.
- **No samples, loops, presets, sample libraries or third-party recordings** were used, so
  there are no sample licenses to track. Tools used (numpy, scipy, numba, ffmpeg/LAME/Vorbis)
  place no restrictions on their output.

## Tuning (528 Hz)
Equal temperament with **A4 = 444 Hz**, so **C5 = 528.0 Hz** (tonal center C). FFT check of the
finished track: C5 528.10 Hz, C4 264.03 Hz, C3 132.10 Hz, A4 443.91 Hz; isolated C5 pluck
527.98 Hz. The strongest spectral peaks sit a median 1.0 cent off the A444 grid vs 16 cents
off standard A440.

## Looping note
The track is rendered as a circular buffer (note decays and reverb tail wrap into the start),
so end→start is seamless. For gap-free looping in browsers, prefer Web Audio
(`decodeAudioData` + `source.loop = true`) or the OGG; plain `<audio loop>` with MP3 may add a
tiny gap in some browsers due to MP3 encoder padding.

Regeneration script: `synth_guitar.py` (deterministic, seed 528).
