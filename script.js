document.body.classList.add('loading');

/* ================= INTRO: PIXEL STAR "PORTFOLIO" ================= */
const WORD = 'PORTFOLIO';
const LETTER_DELAY = 700;   // ms between letters (bigger = slower)
const FLY_TIME = 1300;
const HOLD_TIME = 1500;

const FONT = {
  P: ['11110','10001','10001','11110','10000','10000','10000'],
  O: ['01110','10001','10001','10001','10001','10001','01110'],
  R: ['11110','10001','10001','11110','10100','10010','10001'],
  T: ['11111','00100','00100','00100','00100','00100','00100'],
  F: ['11111','10000','10000','11110','10000','10000','10000'],
  L: ['10000','10000','10000','10000','10000','10000','11111'],
  I: ['11111','00100','00100','00100','00100','00100','11111']
};

const ic = document.getElementById('introCanvas');
const ix = ic.getContext('2d');
let stars = [], pixels = [], finished = false;
const t0 = performance.now();

function buildIntro() {
  ic.width = window.innerWidth;
  ic.height = window.innerHeight;

  stars = Array.from({ length: 220 }, () => ({
    x: Math.random() * ic.width,
    y: Math.random() * ic.height,
    r: Math.random() * 1.6 + 0.3,
    s: Math.random() * 0.15 + 0.03,
    p: Math.random() * 6.28
  }));

  const cols = WORD.length * 6 - 1;
  const cell = Math.min(ic.width * 0.9 / cols, 16);
  const startX = (ic.width - cols * cell) / 2;
  const startY = (ic.height - 7 * cell) / 2;

  pixels = [];
  [...WORD].forEach((ch, i) => {
    FONT[ch].forEach((row, r) => {
      [...row].forEach((bit, c) => {
        if (bit === '1') {
          const rnd = Math.random();
          pixels.push({
            tx: startX + (i * 6 + c) * cell,
            ty: startY + r * cell,
            sx: Math.random() * ic.width,
            sy: Math.random() * ic.height,
            start: i * LETTER_DELAY,
            size: cell * 0.8,
            phase: Math.random() * 6.28,
            color: rnd > 0.7 ? '#ffffff' : rnd > 0.35 ? '#00d4ff' : '#b36bff'
          });
        }
      });
    });
  });
}
buildIntro();
window.addEventListener('resize', buildIntro);

function finishIntro() {
  if (finished) return;
  finished = true;
  document.getElementById('intro').classList.add('done');
  document.body.classList.remove('loading');
  document.body.classList.add('ready');
}
document.getElementById('intro').addEventListener('click', finishIntro);

function drawIntro(now) {
  if (finished) return;
  const t = now - t0;
  ix.clearRect(0, 0, ic.width, ic.height);

  stars.forEach(s => {
    s.y += s.s;
    if (s.y > ic.height) { s.y = 0; s.x = Math.random() * ic.width; }
    ix.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t / 700 + s.p));
    ix.fillStyle = '#ffffff';
    ix.fillRect(s.x, s.y, s.r, s.r);
  });

  pixels.forEach(p => {
    if (t < p.start) return;
    const k = Math.min((t - p.start) / FLY_TIME, 1);
    const e = 1 - Math.pow(1 - k, 3);
    const x = p.sx + (p.tx - p.sx) * e;
    const y = p.sy + (p.ty - p.sy) * e;
    ix.globalAlpha = k < 1 ? 0.4 + 0.6 * k : 0.75 + 0.25 * Math.sin(t / 180 + p.phase);
    ix.fillStyle = p.color;
    ix.shadowColor = p.color;
    ix.shadowBlur = 10;
    ix.fillRect(x, y, p.size, p.size);
  });
  ix.shadowBlur = 0;
  ix.globalAlpha = 1;

  const total = (WORD.length - 1) * LETTER_DELAY + FLY_TIME + HOLD_TIME;
  if (t > total) finishIntro();
  requestAnimationFrame(drawIntro);
}
requestAnimationFrame(drawIntro);

/* ================= PARTICLES BACKGROUND ================= */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
const mouse = { x: null, y: null };

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
    this.size = Math.random() * 2 + 0.5;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 212, 255, 0.8)';
    ctx.fill();
  }
}

const count = window.innerWidth < 700 ? 40 : 90;
for (let i = 0; i < count; i++) particles.push(new Particle());

function connect() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a + 1; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.strokeStyle = `rgba(138, 43, 226, ${1 - dist / 120})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
    if (mouse.x !== null) {
      const mx = particles[a].x - mouse.x;
      const my = particles[a].y - mouse.y;
      const md = Math.sqrt(mx * mx + my * my);
      if (md < 160) {
        ctx.strokeStyle = `rgba(0, 212, 255, ${1 - md / 160})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  connect();
  requestAnimationFrame(animate);
}
animate();

/* ================= CURSOR GLOW ================= */
const glow = document.querySelector('.cursor-glow');
let glowX = window.innerWidth / 2, glowY = window.innerHeight / 2;

window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

function followGlow() {
  if (mouse.x !== null) {
    glowX += (mouse.x - glowX) * 0.12;
    glowY += (mouse.y - glowY) * 0.12;
  }
  glow.style.left = glowX + 'px';
  glow.style.top = glowY + 'px';
  requestAnimationFrame(followGlow);
}
followGlow();

/* ================= PIXEL STAR TITLE ================= */
const titleCanvas = document.getElementById('titleCanvas');
const titleCtx = titleCanvas.getContext('2d');
const TITLE_TEXT = 'Portfolio Hub';
let titlePixels = [];
let titleStart = null;

function buildTitle() {
  const w = Math.min(window.innerWidth * 0.94, 1250);
  const fontSize = Math.min(w / 11.5, 110);
  const h = Math.round(fontSize * 1.4);

  titleCanvas.width = w;
  titleCanvas.height = h;

  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const o = off.getContext('2d');
  o.fillStyle = '#fff';
  o.font = `800 ${fontSize}px Orbitron, sans-serif`;
  o.textAlign = 'center';
  o.textBaseline = 'middle';
  o.fillText(TITLE_TEXT, w / 2, h / 2);

  const data = o.getImageData(0, 0, w, h).data;
  const gap = Math.max(4, Math.round(fontSize / 20));
  titlePixels = [];

  for (let y = 0; y < h; y += gap) {
    for (let x = 0; x < w; x += gap) {
      if (data[(y * w + x) * 4 + 3] > 128) {
        const pos = x / w;
        const r = Math.random();
        let color = pos < 0.5 ? '#00d4ff' : '#9d6bff';
        if (r > 0.82) color = '#ffffff';
        titlePixels.push({
          tx: x, ty: y,
          sx: Math.random() * w,
          sy: (Math.random() - 0.5) * h * 4 + h / 2,
          ox: 0, oy: 0,
          delay: pos * 1800 + Math.random() * 300,
          size: gap * 0.78,
          phase: Math.random() * 6.28,
          speed: 0.002 + Math.random() * 0.004,
          star: Math.random() > 0.9,
          color
        });
      }
    }
  }
}

function drawTitle(now) {
  titleCtx.clearRect(0, 0, titleCanvas.width, titleCanvas.height);

  if (titleStart === null && document.body.classList.contains('ready')) titleStart = now;

  if (titleStart !== null) {
    const t = now - titleStart;
    const rect = titleCanvas.getBoundingClientRect();
    const hasMouse = mouse.x !== null;
    const mx = hasMouse ? mouse.x - rect.left : -9999;
    const my = hasMouse ? mouse.y - rect.top : -9999;

    for (const p of titlePixels) {
      if (t < p.delay) continue;
      const k = Math.min((t - p.delay) / 1400, 1);
      const e = 1 - Math.pow(1 - k, 3);
      let x = p.sx + (p.tx - p.sx) * e;
      let y = p.sy + (p.ty - p.sy) * e;

      if (k === 1) {
        const dx = p.tx - mx, dy = p.ty - my;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const push = d < 90 ? (90 - d) * 0.7 : 0;
        p.ox += ((dx / d) * push - p.ox) * 0.15;
        p.oy += ((dy / d) * push - p.oy) * 0.15;
        x += p.ox; y += p.oy;
      }

      const twinkle = 0.55 + 0.45 * Math.sin(now * p.speed * 3 + p.phase);
      titleCtx.globalAlpha = k < 1 ? 0.3 + 0.7 * k : twinkle;
      titleCtx.fillStyle = p.color;
      titleCtx.fillRect(x, y, p.size, p.size);

      if (p.star && k === 1) {
        const s = p.size * (1 + twinkle * 1.4);
        titleCtx.fillRect(x + p.size / 2 - s, y + p.size / 2 - 0.6, s * 2, 1.2);
        titleCtx.fillRect(x + p.size / 2 - 0.6, y + p.size / 2 - s, 1.2, s * 2);
      }
    }
    titleCtx.globalAlpha = 1;
  }
  requestAnimationFrame(drawTitle);
}

const fontReady = document.fonts ? document.fonts.load('800 100px Orbitron') : Promise.resolve();
fontReady.then(() => { buildTitle(); requestAnimationFrame(drawTitle); });
window.addEventListener('resize', buildTitle);

/* ================= STUDENT CARDS ================= */
const slider = document.getElementById('slider');
const searchBox = document.getElementById('search');
const emptyMsg = document.getElementById('empty');

const studentList = (typeof students !== 'undefined') ? students : [];
if (typeof SUBMIT_LINK !== 'undefined') {
  document.getElementById('submitBtn').href = SUBMIT_LINK;
}

function esc(t) {
  return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function renderCards(list) {
  slider.innerHTML = list.map(s => `
    <div class="card">
      <div class="avatar">
        ${s.photo ? `<img src="${esc(s.photo)}" alt="${esc(s.name)}">` : esc(initials(s.name))}
      </div>
      <h4>${esc(s.name)}</h4>
      <p class="dept">${esc(s.dept)}</p>
      <p class="year">${esc(s.year)}</p>
      <div class="tags">${s.skills.map(k => `<span>${esc(k)}</span>`).join('')}</div>
      <a class="visit" href="${esc(s.link)}" target="_blank" rel="noopener">View Portfolio</a>
    </div>
  `).join('');
  emptyMsg.style.display = list.length ? 'none' : 'block';
}
renderCards(studentList);

searchBox.addEventListener('input', () => {
  const q = searchBox.value.toLowerCase().trim();
  renderCards(studentList.filter(s =>
    (s.name + ' ' + s.dept + ' ' + s.year + ' ' + s.skills.join(' ')).toLowerCase().includes(q)
  ));
});

document.getElementById('next').onclick = () => slider.scrollBy({ left: 320, behavior: 'smooth' });
document.getElementById('prev').onclick = () => slider.scrollBy({ left: -320, behavior: 'smooth' });

/* ================= SCROLL REVEAL ================= */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
/* ===== PREMIUM CARD ===== */
(function () {
  const sl = document.getElementById('slider');
  const esc2 = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ini = n => n.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

  window.renderCards = function (list) {
    sl.innerHTML = list.map((s, i) => `
      <div class="card" style="--i:${i}">
        <span class="num">${String(i + 1).padStart(2, '0')}</span>
        <div class="avatar-wrap">
          <div class="avatar">${s.photo
            ? `<img src="${esc2(s.photo)}" alt="${esc2(s.name)}" onerror="this.parentElement.textContent='${esc2(ini(s.name))}'">`
            : esc2(ini(s.name))}</div>
        </div>
        <h4>${esc2(s.name)}</h4>
        <p class="dept">${esc2(s.dept)}</p>
        <p class="year">${esc2(s.year)}</p>
        <div class="tags">${(s.skills || []).map(k => `<span>${esc2(k)}</span>`).join('')}</div>
        <a class="visit" href="${esc2(s.link)}" target="_blank" rel="noopener">View Portfolio</a>
      </div>`).join('');
    const em = document.getElementById('empty');
    if (em) em.style.display = list.length ? 'none' : 'block';
  };
  renderCards(typeof students !== 'undefined' ? students : []);

  sl.addEventListener('mousemove', e => {
    const card = e.target.closest('.card'); if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.setProperty('--mx', x * 100 + '%');
    card.style.setProperty('--my', y * 100 + '%');
    card.style.transform = `rotateY(${(x - .5) * 16}deg) rotateX(${-(y - .5) * 16}deg) translateY(-8px) scale(1.02)`;
  });
  sl.addEventListener('mouseout', e => {
    const card = e.target.closest('.card');
    if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
  });
})();
/* ===== INTRO BACKGROUND: PIXEL RAIN + SHOOTING STARS ===== */
(function () {
  const intro = document.getElementById('intro');
  if (!intro) return;
  const c = document.createElement('canvas');
  c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
  intro.insertBefore(c, intro.firstChild);
  const g = c.getContext('2d');
  const COL = ['#00d4ff', '#b36bff', '#ffffff', '#ff4fd8'];
  let W, H, rain = [], shots = [], last = 0;

  function size() {
    W = c.width = innerWidth; H = c.height = innerHeight;
    rain = Array.from({ length: Math.round(W * H / 9000) }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      v: 0.3 + Math.random() * 1.2,
      s: 2 + Math.floor(Math.random() * 3) * 2,
      c: COL[Math.random() * 4 | 0], p: Math.random() * 6.28
    }));
  }
  size();
  addEventListener('resize', size);

  (function loop(t) {
    if (intro.classList.contains('done')) return;
    g.clearRect(0, 0, W, H);

    rain.forEach(p => {
      p.y += p.v;
      if (p.y > H) { p.y = -6; p.x = Math.random() * W; }
      g.globalAlpha = 0.25 + 0.5 * Math.abs(Math.sin(t / 600 + p.p));
      g.fillStyle = p.c;
      g.fillRect(Math.round(p.x / 4) * 4, Math.round(p.y / 4) * 4, p.s, p.s);
    });

    if (t - last > 900) {
      shots.push({ x: Math.random() * W, y: -10, vx: -(2 + Math.random() * 3), vy: 3 + Math.random() * 3, c: COL[Math.random() * 4 | 0] });
      last = t;
    }
    shots = shots.filter(s => s.y < H + 60 && s.x > -80);
    shots.forEach(s => {
      s.x += s.vx; s.y += s.vy;
      for (let i = 0; i < 10; i++) {
        g.globalAlpha = 1 - i / 10;
        g.fillStyle = s.c;
        g.fillRect(Math.round((s.x - s.vx * i * 1.6) / 4) * 4, Math.round((s.y - s.vy * i * 1.6) / 4) * 4, 6 - i * 0.4, 6 - i * 0.4);
      }
    });
    g.globalAlpha = 1;
    requestAnimationFrame(loop);
  })(0);
})();

/* ===== "STUDENT PORTFOLIOS" STAR PIXEL TITLE ===== */
(function () {
  const old = document.getElementById('sectionCanvas');
  if (!old) return;
  const c = old.cloneNode(false);
  old.replaceWith(c);
  const g = c.getContext('2d');
  const TEXT = 'Student Portfolios';
  let px = [], dust = [], t0 = null, W = 0, H = 0;

  function build() {
    W = Math.min(innerWidth * 0.94, 900);
    let fs = Math.min(W / 15, 60);
    H = Math.round(fs * 1.9);
    c.width = W; c.height = H;

    const o = document.createElement('canvas');
    o.width = W; o.height = H;
    const x = o.getContext('2d');
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `800 ${fs}px Orbitron, sans-serif`;
    const tw = x.measureText(TEXT).width;
    if (tw > W * 0.96) { fs *= W * 0.96 / tw; x.font = `800 ${fs}px Orbitron, sans-serif`; }
    x.fillText(TEXT, W / 2, H / 2);

    const d = x.getImageData(0, 0, W, H).data;
    const gap = Math.max(4, Math.round(fs / 9));
    px = [];
    for (let y = 0; y < H; y += gap) {
      for (let xx = 0; xx < W; xx += gap) {
        if (d[(y * W + xx) * 4 + 3] > 128) {
          const r = Math.random(), p = xx / W;
          px.push({
            tx: xx, ty: y, sx: Math.random() * W, sy: Math.random() * H * 3 - H,
            ox: 0, oy: 0, delay: p * 1100 + Math.random() * 300,
            s: gap * 0.82, ph: Math.random() * 6.28, sp: 0.002 + Math.random() * 0.004,
            star: r > 0.78,
            c: r > 0.85 ? '#ffffff' : (p < 0.5 ? '#00d4ff' : '#b36bff')
          });
        }
      }
    }
    dust = Array.from({ length: 30 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      s: 2 + Math.random() * 3, ph: Math.random() * 6.28, sp: 0.001 + Math.random() * 0.003
    }));
  }

  function sparkle(x, y, s, a) {            // pixel-art "+" star
    g.fillRect(x, y, s, s);
    g.fillRect(x - s * a, y, s * a, s);
    g.fillRect(x + s, y, s * a, s);
    g.fillRect(x, y - s * a, s, s * a);
    g.fillRect(x, y + s, s, s * a);
  }

  function draw(now) {
    g.clearRect(0, 0, W, H);
    if (t0 !== null) {
      const t = now - t0;
      const r = c.getBoundingClientRect();
      const m = (typeof mouse !== 'undefined' && mouse.x !== null);
      const mx = m ? mouse.x - r.left : -9999, my = m ? mouse.y - r.top : -9999;

      for (const p of px) {
        if (t < p.delay) continue;
        const k = Math.min((t - p.delay) / 1300, 1);
        const e = 1 - Math.pow(1 - k, 3);
        let x = p.sx + (p.tx - p.sx) * e, y = p.sy + (p.ty - p.sy) * e;
        if (k === 1) {
          const dx = p.tx - mx, dy = p.ty - my;
          const dd = Math.sqrt(dx * dx + dy * dy) || 1;
          const push = dd < 80 ? (80 - dd) * 0.65 : 0;
          p.ox += ((dx / dd) * push - p.ox) * 0.15;
          p.oy += ((dy / dd) * push - p.oy) * 0.15;
          x += p.ox; y += p.oy;
        }
        const tw = 0.5 + 0.5 * Math.sin(now * p.sp * 3 + p.ph);
        g.globalAlpha = k < 1 ? 0.3 + 0.7 * k : 0.55 + 0.45 * tw;
        g.fillStyle = p.c;
        g.fillRect(x, y, p.s, p.s);
        if (p.star && k === 1 && tw > 0.45) sparkle(x, y, p.s, 0.6 + tw * 1.2);
      }
      if (t > 1200) {                         // floating star dust
        for (const d of dust) {
          const a = Math.max(0, Math.sin(now * d.sp * 3 + d.ph));
          g.globalAlpha = a; g.fillStyle = '#fff';
          sparkle(d.x, d.y, d.s * 0.6, a * 1.5);
        }
      }
      g.globalAlpha = 1;
    }
    requestAnimationFrame(draw);
  }

  new IntersectionObserver(es => es.forEach(e => { t0 = e.isIntersecting ? performance.now() : null; }),
    { threshold: 0.4 }).observe(c);

  (document.fonts ? document.fonts.load('800 50px Orbitron') : Promise.resolve())
    .then(() => { build(); requestAnimationFrame(draw); });
  addEventListener('resize', build);
})();
/* ===== HERO: PIXEL IMPLOSION TITLE (no font needed) ===== */
(function () {
  const old = document.getElementById('titleCanvas');
  if (!old) return;
  const c = old.cloneNode(false);
  old.replaceWith(c);
  c.style.cssText = 'display:block;margin:0 auto;max-width:100%;' +
    'filter:drop-shadow(0 0 10px rgba(0,212,255,.55)) drop-shadow(0 0 28px rgba(138,43,226,.45))';
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
            c: rnd > 0.88 ? '#ffffff' : p < 0.4 ? '#00d4ff' : p < 0.7 ? '#9d6bff' : '#ff4fd8'
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

        let alpha = k < 1 ? 0.25 + 0.75 * k : 0.72 + 0.28 * Math.sin(now * p.sp + p.ph);
        let color = p.c;
        if (k === 1 && Math.abs(p.tx + p.ty * 0.6 - band) < cell * 5) { color = '#ffffff'; alpha = 1; }

        g.globalAlpha = alpha;
        g.fillStyle = color;
        g.fillRect(x, y, cell - 1, cell - 1);
      }
      g.globalAlpha = 1;
    }
    requestAnimationFrame(draw);
  }

  build();
  addEventListener('resize', build);
  requestAnimationFrame(draw);
})();
/* ===== ADD URL: add a new student portfolio from the page ===== */
(function () {
  const KEY = 'ph_students';
  const slider = document.getElementById('slider');
  const all = (typeof students !== 'undefined') ? students : [];

  /* load saved cards */
  try { (JSON.parse(localStorage.getItem(KEY)) || []).forEach(s => { s._local = true; all.push(s); }); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(all.filter(s => s._local))); } catch (e) {} };

  /* wrap card renderer: add a remove (x) button on added cards */
  const orig = window.renderCards;
  window.renderCards = function (list) {
    orig(list);
    list.forEach((s, i) => {
      const card = slider.children[i];
      if (!s._local || !card) return;
      const b = document.createElement('button');
      b.className = 'rm'; b.textContent = '✕'; b.title = 'Remove this card';
      b.onclick = () => { all.splice(all.indexOf(s), 1); save(); window.renderCards(all); };
      card.appendChild(b);
    });
  };
  window.renderCards(all);

  /* styles */
  const st = document.createElement('style');
  st.textContent = `
  .add-url{display:inline-block;margin:0 0 40px 12px;padding:14px 26px;border-radius:50px;cursor:pointer;
    font:600 .95rem Poppins,sans-serif;color:#fff;border:0;background:linear-gradient(90deg,#ff9f1c,#ff2e7e);
    box-shadow:0 0 24px rgba(255,46,126,.45);transition:.3s;vertical-align:top}
  .add-url:hover{transform:translateY(-3px);box-shadow:0 0 38px rgba(255,159,28,.7)}
  @media(max-width:700px){.add-url{margin:-20px 0 40px}}
  .rm{position:absolute;top:12px;right:14px;width:28px;height:28px;border-radius:50%;cursor:pointer;
    border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff;transform:translateZ(30px)}
  .rm:hover{background:#ff2e7e}
  .m-bg{position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;
    background:rgba(2,2,10,.75);backdrop-filter:blur(6px);padding:16px}
  .m-bg.on{display:flex}
  .m-box{width:min(440px,100%);max-height:92vh;overflow:auto;padding:26px;border-radius:22px;text-align:left;
    background:linear-gradient(160deg,#1b1740,#0c0a1e);border:1px solid rgba(0,212,255,.4);
    box-shadow:0 0 50px rgba(138,43,226,.4)}
  .m-box h3{font-family:Orbitron,sans-serif;margin-bottom:16px;color:#00d4ff;font-size:1.1rem}
  .m-box label{display:block;font-size:.78rem;opacity:.75;margin:12px 0 4px}
  .m-box input{width:100%;padding:11px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.2);
    background:rgba(255,255,255,.06);color:#e8ecff;font:inherit;outline:none}
  .m-box input:focus{border-color:#00d4ff;box-shadow:0 0 14px rgba(0,212,255,.35)}
  .m-err{color:#ff6b8b;font-size:.8rem;min-height:18px;margin-top:10px}
  .m-row{display:flex;gap:10px;margin-top:14px}
  .m-row button{flex:1;padding:12px;border-radius:50px;border:0;cursor:pointer;font:600 .9rem Poppins,sans-serif;color:#fff}
  .m-ok{background:linear-gradient(90deg,#00d4ff,#8a2be2)}
  .m-no{background:rgba(255,255,255,.1)}
  .toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:210;display:none;gap:12px;
    align-items:center;padding:12px 18px;border-radius:50px;background:#14112e;border:1px solid #00d4ff;
    box-shadow:0 0 30px rgba(0,212,255,.35);font-size:.85rem}
  .toast.on{display:flex}
  .toast button{padding:7px 14px;border-radius:50px;border:0;cursor:pointer;background:#00d4ff;color:#000;font-weight:600}`;
  document.head.appendChild(st);

  /* button next to the search box */
  const btn = document.createElement('button');
  btn.className = 'add-url'; btn.textContent = '＋ Add URL';
  document.getElementById('search').insertAdjacentElement('afterend', btn);

  /* popup */
  const bg = document.createElement('div');
  bg.className = 'm-bg';
  bg.innerHTML = `<div class="m-box" role="dialog" aria-label="Add portfolio">
    <h3>Add a portfolio</h3>
    <label>Portfolio URL *</label><input id="a-link" placeholder="https://yourname.netlify.app">
    <label>Name *</label><input id="a-name" placeholder="Arun Kumar">
    <label>Department</label><input id="a-dept" placeholder="Computer Science">
    <label>Year</label><input id="a-year" placeholder="2nd Year">
    <label>Skills (comma separated)</label><input id="a-skills" placeholder="Python, React, SQL">
    <label>Photo URL (optional)</label><input id="a-photo" placeholder="photos/arun.jpg or https://...">
    <div class="m-err" id="a-err"></div>
    <div class="m-row"><button class="m-no" id="a-cancel">Cancel</button><button class="m-ok" id="a-add">Add card</button></div>
  </div>`;
  document.body.appendChild(bg);

  const toast = document.createElement('div');
  toast.className = 'toast';
  document.body.appendChild(toast);

  const $ = id => document.getElementById(id);
  const open = () => { bg.classList.add('on'); $('a-link').focus(); };
  const close = () => { bg.classList.remove('on'); $('a-err').textContent = ''; };
  btn.onclick = open;
  $('a-cancel').onclick = close;
  bg.addEventListener('click', e => { if (e.target === bg) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  $('a-add').onclick = () => {
    let link = $('a-link').value.trim();
    const name = $('a-name').value.trim();
    if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link;
    if (!/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(link)) { $('a-err').textContent = 'Enter a valid portfolio URL.'; return; }
    if (!name) { $('a-err').textContent = 'Enter the student name.'; return; }

    const s = {
      name, link,
      dept: $('a-dept').value.trim() || 'Student',
      year: $('a-year').value.trim(),
      skills: $('a-skills').value.split(',').map(x => x.trim()).filter(Boolean),
      photo: $('a-photo').value.trim(),
      _local: true
    };
    all.push(s); save(); window.renderCards(all);
    slider.scrollTo({ left: slider.scrollWidth, behavior: 'smooth' });
    ['a-link', 'a-name', 'a-dept', 'a-year', 'a-skills', 'a-photo'].forEach(id => $(id).value = '');
    close();

    const code = `  {\n    name: ${JSON.stringify(s.name)},\n    dept: ${JSON.stringify(s.dept)},\n    year: ${JSON.stringify(s.year)},\n    skills: ${JSON.stringify(s.skills)},\n    link: ${JSON.stringify(s.link)},\n    photo: ${JSON.stringify(s.photo)}\n  },`;
    toast.innerHTML = 'Added on this browser ✅ <button id="a-copy">Copy code for students.js</button>';
    toast.classList.add('on');
    $('a-copy').onclick = () => { navigator.clipboard.writeText(code).then(() => { $('a-copy').textContent = 'Copied ✓'; }); };
    setTimeout(() => toast.classList.remove('on'), 9000);
  };
})();