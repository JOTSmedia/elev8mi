(() => {
'use strict';
  const FREQ = 528;
  let audioCtx = null;
  let osc = null;
  let gain = null;
  let lfo = null;
  let lfoGain = null;
  let toneOn = false;

  function buildTone() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    audioCtx = audioCtx || new Ctx();
    if (osc) return true;
    osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = FREQ;
    gain = audioCtx.createGain();
    gain.gain.value = 0;
    lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    lfo.start();
    return true;
  }

  // Second sound option: a seamless 2:00 528 Hz guitar loop (CC0, see
  // AUDIO-LICENSE.md). Web Audio buffer looping avoids the <audio> loop gap.
  // Measured: drone -23.7 LUFS, track -21.4 LUFS, so the track plays at 0.77.
  const GUITAR_GAIN = 0.77;
  const modeBtn = document.getElementById('toneMode');
  let mode = 'drone', guitarBuffer = null, guitarLoading = null, guitarSource = null, guitarGain = null, guitarAvailable = true;
  function guitarUrls() {
    const probe = document.createElement('audio');
    const ogg = probe.canPlayType && probe.canPlayType('audio/ogg; codecs="vorbis"');
    return ogg ? ['elev8mi-528hz-guitar.ogg', 'elev8mi-528hz-guitar.mp3'] : ['elev8mi-528hz-guitar.mp3'];
  }
  async function loadGuitar() {
    if (guitarBuffer) return guitarBuffer;
    if (guitarLoading) return guitarLoading;
    guitarLoading = (async () => {
      for (const url of guitarUrls()) {
        try {
          const response = await fetch(url);
          if (!response.ok) continue;
          const data = await response.arrayBuffer();
          guitarBuffer = await new Promise((resolve, reject) => {
            const result = audioCtx.decodeAudioData(data, resolve, reject);
            if (result && result.then) result.then(resolve, reject);
          });
          return guitarBuffer;
        } catch (_) { /* try the next format */ }
      }
      guitarLoading = null;
      return null;
    })();
    return guitarLoading;
  }
  function stopGuitar(fade) {
    if (!guitarSource || !audioCtx) return;
    const source = guitarSource, g = guitarGain, now = audioCtx.currentTime;
    g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(g.gain.value, now);
    g.gain.linearRampToValueAtTime(0, now + fade);
    try { source.stop(now + fade + .05); } catch (_) {}
    guitarSource = null; guitarGain = null;
  }
  async function startGuitar() {
    const buffer = await loadGuitar();
    if (!buffer) {
      // Files missing or undecodable: keep the drone option working.
      guitarAvailable = false; mode = 'drone'; syncMode();
      if (toneOn) setDrone(true);
      return;
    }
    if (!toneOn || mode !== 'guitar' || guitarSource) return;
    guitarSource = audioCtx.createBufferSource(); guitarSource.buffer = buffer; guitarSource.loop = true;
    guitarGain = audioCtx.createGain(); guitarGain.gain.value = 0;
    guitarSource.connect(guitarGain); guitarGain.connect(audioCtx.destination);
    guitarSource.start();
    const now = audioCtx.currentTime;
    guitarGain.gain.setValueAtTime(0, now); guitarGain.gain.linearRampToValueAtTime(GUITAR_GAIN, now + 1.2);
  }
  function setDrone(on) {
    const now = audioCtx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(on ? 0.07 : 0, now + 0.9);
    lfoGain.gain.cancelScheduledValues(now);
    lfoGain.gain.setValueAtTime(lfoGain.gain.value, now);
    lfoGain.gain.linearRampToValueAtTime(on ? 0.012 : 0, now + 0.7);
  }
  function label() { return mode === 'guitar' ? '528 Hz guitar' : '528 Hz tone'; }
  function syncMode() {
    if (!modeBtn) return;
    modeBtn.textContent = mode === 'guitar' ? 'Guitar' : 'Tone';
    modeBtn.hidden = !guitarAvailable;
    modeBtn.setAttribute('aria-label', `Sound: ${label()}. Switch to ${mode === 'guitar' ? '528 Hz tone' : '528 Hz guitar'}`);
    const btn = document.getElementById('toneBtn');
    btn.setAttribute('aria-label', toneOn ? `Stop ${label()}` : `Play ${label()}`);
  }

  function setTone(on) {
    try { if (!buildTone()) return; } catch (_) { return; }
    audioCtx.resume().catch(()=>{});
    toneOn = on;
    setDrone(on && mode === 'drone');
    if (on && mode === 'guitar') startGuitar(); else stopGuitar(0.9);
    document.getElementById('tuner').classList.toggle('on', on);
    const btn = document.getElementById('toneBtn');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    syncMode();
  }
  modeBtn?.addEventListener('click', () => {
    mode = mode === 'guitar' ? 'drone' : 'guitar';
    if (toneOn) setTone(true); else syncMode();
  });
  syncMode();
  document.getElementById('toneBtn').addEventListener('click', () => setTone(!toneOn));
  const heroTone=document.getElementById('heroTone');
  if(heroTone) heroTone.addEventListener('click', () => setTone(!toneOn));

})();
