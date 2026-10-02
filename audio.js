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

  function setTone(on) {
    try { if (!buildTone()) return; } catch (_) { return; }
    audioCtx.resume().catch(()=>{});
    toneOn = on;
    const now = audioCtx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(on ? 0.07 : 0, now + 0.9);
    lfoGain.gain.cancelScheduledValues(now);
    lfoGain.gain.setValueAtTime(lfoGain.gain.value, now);
    lfoGain.gain.linearRampToValueAtTime(on ? 0.012 : 0, now + 0.7);
    document.getElementById('tuner').classList.toggle('on', on);
    const btn = document.getElementById('toneBtn');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Stop 528 Hz' : 'Play 528 Hz');
  }
  document.getElementById('toneBtn').addEventListener('click', () => setTone(!toneOn));
  const heroTone=document.getElementById('heroTone');
  if(heroTone) heroTone.addEventListener('click', () => setTone(!toneOn));

})();
