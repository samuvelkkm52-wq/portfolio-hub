/* ===== HERO: PIXEL IMPLOSION TITLE (neon fire colors, no font needed) ===== */
(function () {
  const RAINBOW = false;      // true = colors keep shifting like a rainbow

  const old = document.getElementById('titleCanvas');
  if (!old) return;
  const c = old.cloneNode(false);
  old.replaceWith(c);
  c.style.cssText = 'display:block;margin:0 auto;max-width:100%;' +
    'filter:drop-shadow(0 0 10px rgba(255,159,28,.6)) drop-shadow(0 0 30px rgba(255,46,126,.5))';
  const g = c.getContext('2d');

  const F = {
    P: ['11110','10001','10001','11110','10000','10000','10000'],
    O: ['01110','10001','10001','10001','10001','10001','01110'],
    R: ['11110','10001','10001','11110','10100','10010','10001'],
    T: ['11111','00100','00100','00100','00100','00100','00100'],
    F: ['11111','10000','10000','11110','10000','10000','10000'],
    L: ['10000','10000','10000','10000','10000','10000','11111'],
    I: ['11111','00100','00100','00100','00100','00100','11111'],
    H: ['10001','10001','10001','11111','10001','10001','10001'],
    U: ['10001','10001','10001','10001','10001','10001','01110'],
    B: ['11110','10001','10001','11110','10001','10001','11110']
  };
  const span = s => [...s].reduce((a, ch) => a + (ch === ' ' ? 3 : 6), 0) - 1;

  let px = [], W = 0, H = 0, cell = 10, t0 = null;

  function build() {
    const lines = innerWidth < 700 ? ['PORTFOLIO', 'HUB'] : ['PORTFOLIO HUB'];
    const cols = Math.max(...lines.map(span));
    cell = Math.max(3, Math.floor(Math.min(innerWidth * 0.9 / cols, 15)));
    const pad = cell * 2;
    W = cols * cell + pad * 2;
    H = (lines.length * 9 - 2) * cell + pad * 2;
    c.width = W; c.height = H;

    px = [];
    lines.forEach((line, li) => {
      let col = 0;
      const startX = (W - span(line) * cell) / 2;
      [...line].forEach(ch => {
        if (ch === ' ') { col += 3; return; }
        F[ch].forEach((row, r) => [...row].forEach((bit, cc) => {
          if (bit !== '1') return;
          const tx = startX + (col + cc) * cell;
          const ty = pad + li * 9 * cell + r * cell;
          const a = Math.random() * 6.28, R = 250 + Math.random() * 450;
          const p = tx / W, rnd = Math.random();
          px.push({
            tx, ty,
            sx: W / 2 + Math.cos(a) * R,
            sy: H / 2 + Math.sin(a) * R * 0.6,
            ox: 0, oy: 0,
            d: Math.random() * 900,
            sp: 0.002 + Math.random() * 0.004,
            ph: Math.random() * 6.28,
            c: rnd > 0.9 ? '#fff8d6' : p < 0.25 ? '#ffe600' : p < 0.5 ? '#ff9f1c' : p < 0.75 ? '#ff2e7e' : '#b14dff'
          });
        }));
        col += 6;
      });
    });
  }

  function draw(now) {
    g.clearRect(0, 0, W, H);
    if (t0 === null && document.body.classList.contains('ready')) t0 = now;

    if (t0 !== null) {
      const t = now - t0;
      const r = c.getBoundingClientRect();
      const hasM = typeof mouse !== 'undefined' && mouse.x !== null;
      const mx = hasM ? mouse.x - r.left : -9999;
      const my = hasM ? mouse.y - r.top : -9999;
      const band = ((t / 1700) % 2.4 - 0.2) * (W + H * 0.6);   // glowing scan beam

      for (const p of px) {
        if (t < p.d) continue;
        const k = Math.min((t - p.d) / 1200, 1);
        const e = 1 - Math.pow(1 - k, 4);
        let x = p.sx + (p.tx - p.sx) * e;
        let y = p.sy + (p.ty - p.sy) * e;

        if (k === 1) {
          const dx = p.tx - mx, dy = p.ty - my;
          const dd = Math.sqrt(dx * dx + dy * dy) || 1;
          const push = dd < 90 ? (90 - dd) * 0.7 : 0;
          p.ox += ((dx / dd) * push - p.ox) * 0.15;
          p.oy += ((dy / dd) * push - p.oy) * 0.15;
          x += p.ox; y += p.oy;
        }

        let alpha = k < 1 ? 0.3 + 0.7 * k : 0.9 + 0.1 * Math.sin(now * p.sp + p.ph);
        let color = RAINBOW ? `hsl(${(p.tx / W * 300 + now * 0.06) % 360},100%,60%)` : p.c;
        if (k === 1 && Math.abs(p.tx + p.ty * 0.6 - band) < cell * 5) { color = '#ffffff'; alpha = 1; }

        g.globalAlpha = alpha;
        g.fillStyle = color;
        g.shadowColor = color;
        g.shadowBlur = 14;
        g.fillRect(x, y, cell - 1, cell - 1);
      }
      g.shadowBlur = 0;
      g.globalAlpha = 1;
    }
    requestAnimationFrame(draw);
  }

  build();
  addEventListener('resize', build);
  requestAnimationFrame(draw);
})();