
(() => {
  const canvas = document.getElementById('universe');
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let w, h, dpr, stars = [];
  let rafId = null;
  let warp = 0;        // current warp amount (smoothed)
  let warpTarget = 0;  // requested warp amount, 0..1
  let tone = 0;        // 0 = night (light stars), 1 = day (ink stars)
  let toneTarget = 0;
  let resizeTimer = null;

  function makeStar(x, y) {
    return {
      x, y,
      px: x, py: y,
      r: Math.random() * 1.25 + .2,
      a: Math.random() * .65 + .15,
      p: Math.random() * 6.28
    };
  }

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(220, Math.floor(w * h / 5500));
    stars = Array.from({ length: count }, () => makeStar(Math.random() * w, Math.random() * h));

    if (reduceMotion.matches) drawFrame(0);
  }

  // During the Descent the stars stream outward from the centre,
  // giving the impression of falling forward through space.
  function advanceWarp() {
    const cx = w / 2, cy = h / 2;
    const maxR = Math.hypot(cx, cy);

    for (const s of stars) {
      s.px = s.x;
      s.py = s.y;

      const dx = s.x - cx, dy = s.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const speed = warp * (0.6 + dist / maxR * 9);

      s.x += dx / dist * speed;
      s.y += dy / dist * speed;

      if (s.x < -20 || s.x > w + 20 || s.y < -20 || s.y > h + 20) {
        const a = Math.random() * Math.PI * 2;
        const r = 12 + Math.random() * maxR * .35;
        s.x = cx + Math.cos(a) * r;
        s.y = cy + Math.sin(a) * r;
        s.px = s.x;
        s.py = s.y;
      }
    }
  }

  // starlight at night, ink dots on the day-side atlas plate
  function starRgb() {
    const k = tone;
    return Math.round(233 + (14 - 233) * k) + ',' +
           Math.round(236 + (23 - 236) * k) + ',' +
           Math.round(246 + (51 - 246) * k);
  }

  function drawFrame(t) {
    ctx.clearRect(0, 0, w, h);

    const rgb = starRgb();
    const boost = 1 + tone * .9;
    const grow = 1 + tone * .35;

    const warping = warp > 0.02;
    if (warping) advanceWarp();

    for (const s of stars) {
      s.p += .012;
      const alpha = Math.min(1, s.a * (.65 + .35 * Math.sin(s.p)) * boost);

      if (warping) {
        ctx.strokeStyle = `rgba(${rgb},${Math.min(1, alpha + warp * .35)})`;
        ctx.lineWidth = s.r * (1 + warp * .8);
        ctx.beginPath();
        ctx.moveTo(s.px, s.py);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(s.x + Math.sin(t * .0001 + s.p) * 2, s.y, s.r * grow, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${alpha})`;
        ctx.fill();
      }
    }
  }

  function loop(t) {
    warp += (warpTarget - warp) * .06;
    if (Math.abs(warpTarget - warp) < .002) warp = warpTarget;

    tone += (toneTarget - tone) * .05;
    if (Math.abs(toneTarget - tone) < .004) tone = toneTarget;

    drawFrame(t);
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (rafId !== null || reduceMotion.matches || document.hidden) return;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  // No work while the tab is in the background.
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  reduceMotion.addEventListener?.('change', () => {
    if (reduceMotion.matches) { stop(); warp = warpTarget = 0; drawFrame(0); } else { start(); }
  });

  window.BeyondStarfield = {
    setTone(name) {
      toneTarget = name === 'day' ? 1 : 0;
      if (reduceMotion.matches) { tone = toneTarget; drawFrame(0); }
    },
    setWarp(value) {
      warpTarget = reduceMotion.matches ? 0 : Math.max(0, Math.min(1, value));
    }
  };

  resize();
  if (reduceMotion.matches) drawFrame(0); else start();
})();
