(() => {
  'use strict';

  const journey = document.getElementById('journey');
  const world = document.getElementById('journeyWorld');
  const plates = [...document.querySelectorAll('.journey-plate')];
  if (!journey || !world || plates.length !== 3) return;

  const label = document.getElementById('journeyStage');
  const progress = document.getElementById('journeyProgress');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sections = ['about', 'services', 'portfolio', 'reading'].map(id => document.getElementById(id));
  let path = [];
  let thresholds = [];
  let plateHeight = 0;
  let seam = 0;
  let travel = 0;
  let scrollRange = 1;
  let frame = 0;
  let layoutDirty = true;
  let previousStage = '';
  let previousPlate = -1;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function measure() {
    // The reduced-motion stills do not contribute layout height, so use the
    // normal panorama geometry in that mode. Normal mode measures the CSS.
    plateHeight = reducedMotion.matches
      ? Math.max(window.innerHeight * 1.8, window.innerWidth * 16 / 9)
      : plates[0].offsetHeight;
    seam = clamp(window.innerHeight * .28, 160, 360);
    if (!reducedMotion.matches) {
      seam = plates[0].offsetHeight - plates[1].offsetTop;
    }
    const surfaceTop = plateHeight - seam;
    const undergroundTop = 2 * (plateHeight - seam);
    const height = 3 * plateHeight - 2 * seam;
    travel = Math.max(0, height - window.innerHeight);
    scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    // Tie landmarks to content positions so mobile wrapping, font loading,
    // and the expansion of a three-card reading cannot skip the underground.
    const targets = [plateHeight * .48, surfaceTop + plateHeight * .12,
      surfaceTop + plateHeight * .52, undergroundTop + plateHeight * .12];
    path = [{ scroll: 0, camera: 0 }];
    sections.forEach((section, index) => {
      if (!section) return;
      const scroll = clamp(section.getBoundingClientRect().top + window.scrollY - 108, 0, scrollRange);
      const camera = clamp(targets[index], path[path.length - 1].camera, travel);
      if (scroll > path[path.length - 1].scroll && scroll < scrollRange) {
        path.push({ scroll, camera });
      }
    });
    path.push({ scroll: scrollRange, camera: travel });
    thresholds = [
      [0, '01 / Space'],
      [plateHeight * .56, '02 / Atmosphere'],
      [surfaceTop + plateHeight * .3, '03 / Earth'],
      [undergroundTop + plateHeight * .08, '04 / Roots'],
      [undergroundTop + plateHeight * .49, '05 / Subterranean']
    ];
    layoutDirty = false;
  }

  function paint() {
    frame = 0;
    if (layoutDirty) measure();
    const scroll = clamp(window.scrollY, 0, scrollRange);
    let segment = 1;
    while (segment < path.length - 1 && scroll > path[segment].scroll) segment++;
    const a = path[segment - 1];
    const b = path[segment];
    const t = clamp((scroll - a.scroll) / Math.max(1, b.scroll - a.scroll), 0, 1);
    const camera = a.camera + (b.camera - a.camera) * t;
    const center = camera + window.innerHeight * .5;
    window.elev8miJourney = {camera, center, plateHeight, seam, travel,
      width: window.innerWidth, height: window.innerHeight};

    if (reducedMotion.matches) {
      const active = center < plateHeight - seam * .5 ? 0
        : center < 2 * plateHeight - seam * 1.5 ? 1 : 2;
      if (active !== previousPlate) {
        plates.forEach((plate, index) => plate.classList.toggle('is-active', index === active));
        previousPlate = active;
      }
    } else {
      world.style.transform = `translate3d(0, ${-camera.toFixed(2)}px, 0)`;
    }

    let stage = thresholds[0][1];
    for (const [start, name] of thresholds) {
      if (center >= start) stage = name;
    }
    if (label && stage !== previousStage) {
      label.textContent = stage;
      previousStage = stage;
    }
    if (progress) progress.style.transform = `scaleX(${scroll / scrollRange})`;
  }

  function schedule(remeasure = false) {
    layoutDirty = layoutDirty || remeasure;
    if (!frame) frame = window.requestAnimationFrame(paint);
  }

  window.addEventListener('scroll', () => schedule(), { passive: true });
  window.addEventListener('resize', () => schedule(true), { passive: true });
  window.addEventListener('pageshow', () => schedule(true));
  reducedMotion.addEventListener('change', () => {
    previousPlate = -1;
    schedule(true);
  });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => schedule(true));
    observer.observe(document.querySelector('main'));
    observer.observe(document.querySelector('footer'));
    observer.observe(journey);
  }
  if (document.fonts?.ready) document.fonts.ready.then(() => schedule(true));
  schedule(true);
})();
