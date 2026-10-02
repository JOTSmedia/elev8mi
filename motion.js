(() => {
  'use strict';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.getElementById('motionToggle');
  const subscribers = new Set();
  let paused = preference.matches;
  let time = 0, previous = 0, frame = 0;
  try { paused = paused || localStorage.getItem('elev8mi-motion') === 'paused'; } catch (_) {}

  function tick(now) {
    frame = 0;
    if (paused || document.hidden) return;
    if (!previous) previous = now;
    const elapsed = now - previous;
    if (elapsed >= 1000 / 30) {
      const dt = Math.min(.1, elapsed / 1000);
      previous = now;
      time += dt;
      subscribers.forEach(render => render(time, dt));
    }
    frame = requestAnimationFrame(tick);
  }
  function synchronize() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; previous = 0;
    const stopped = paused || document.hidden;
    document.documentElement.dataset.motion = stopped ? 'paused' : 'playing';
    if (button) {
      button.textContent = paused ? 'Play motion' : 'Pause motion';
      button.setAttribute('aria-pressed', String(paused));
    }
    window.dispatchEvent(new CustomEvent('elev8mi:motion', {detail:{paused:stopped}}));
    subscribers.forEach(render => render(time, 0));
    if (!stopped) frame = requestAnimationFrame(tick);
  }
  window.Elev8Motion = {
    add(render) { subscribers.add(render); render(time, 0); return () => subscribers.delete(render); },
    get paused() { return paused || document.hidden; },
    get time() { return time; }
  };
  button?.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('elev8mi-motion', paused ? 'paused' : 'playing'); } catch (_) {}
    synchronize();
  });
  preference.addEventListener('change', event => { paused = event.matches; synchronize(); });
  document.addEventListener('visibilitychange', synchronize);
  synchronize();
})();
