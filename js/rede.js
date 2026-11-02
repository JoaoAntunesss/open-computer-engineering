/* Rede neural do curso: cadeiras = neurónios, tópicos = dendrites, pré-requisitos = sinapses.
   O que dominas acende cor de fogo e envia impulsos para as cadeiras seguintes. Canvas 2D, sem dependências.
   Modo "ambient": imagem viva de fundo (sem rótulos nem interação), usada no topo da página inicial. */
(() => {
'use strict';
const TAU = Math.PI * 2;
const COL = { cold: [58, 150, 255], dendrite: [90, 180, 255], hot: [255, 128, 48], core: [8, 14, 32] };
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

function sprite(c, size = 128) { // soft glow, stamped with additive blending (cheaper than shadowBlur)
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const g = cv.getContext('2d'), r = size / 2, grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, rgba(c, 1)); grad.addColorStop(.16, rgba(c, .6)); grad.addColorStop(.42, rgba(c, .15)); grad.addColorStop(1, rgba(c, 0));
  g.fillStyle = grad; g.fillRect(0, 0, size, size); return cv;
}

function mount(host, api) {
  const { courses, sems, deps, pct, isDone, name, topicName, onPick, reduced } = api;
  const ambient = !!api.ambient;
  const canvas = document.createElement('canvas'); canvas.className = 'rede-canvas';
  if (ambient) canvas.setAttribute('aria-hidden', 'true'); else { canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', api.label); }
  host.appendChild(canvas);
  const tip = document.createElement('div'); tip.className = 'rede-tip'; tip.hidden = true; if (!ambient) host.appendChild(tip);
  const ctx = canvas.getContext('2d');
  const S = { cold: sprite(COL.cold), dendrite: sprite(COL.dendrite, 64), hot: sprite(COL.hot) };

  /* ---------- graph ---------- */
  const N = [], E = [], byId = {}, order = {};
  courses.forEach((c, i) => { order[c.id] = i; });
  const semIx = Object.fromEntries(sems.map((s, i) => [s.id, i]));
  const SPAN = 300;
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const rowOf = {}, colCount = {}; courses.forEach(c => { rowOf[c.id] = colCount[c.sem] = (colCount[c.sem] || 0) + 1; });
  courses.forEach(c => {
    const x = (semIx[c.sem] - (sems.length - 1) / 2) * SPAN + (rnd() - .5) * 70;
    const y = (rowOf[c.id] - 1 - (colCount[c.sem] - 1) / 2) * 165 + (semIx[c.sem] % 2 ? 60 : 0) + (rnd() - .5) * 50;
    const n = { id: c.id, kind: 'c', c, x, y, vx: 0, vy: 0, ax: x, ay: y, r: 9 + c.topics.length * .45, o: order[c.id] }; N.push(n); byId[c.id] = n;
    c.topics.forEach((t, j) => { const a = rnd() * TAU, d = 40 + rnd() * 30; const tn = { id: c.id + '#' + j, kind: 't', c, j, parent: n, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, vx: 0, vy: 0, r: 2.6, o: order[c.id] }; N.push(tn); E.push({ a: n, b: tn, kind: 'd', len: 46 + (j % 3) * 12 }); });
  });
  courses.forEach(c => c.pre.forEach(p => E.push({ a: byId[p], b: byId[c.id], kind: 's', len: SPAN * .9 })));

  function tick(alpha) { // courses stay near their semester column; topics settle around them
    for (let i = 0; i < N.length; i++) {
      const a = N[i];
      for (let j = i + 1; j < N.length; j++) {
        const b = N[j]; let dx = b.x - a.x, dy = b.y - a.y; const d2 = dx * dx + dy * dy || .01;
        const both = a.kind === 'c' && b.kind === 'c', range = both ? 260 : 90; if (d2 > range * range) continue;
        const k = Math.min(12, (both ? 5200 : a.kind === 'c' || b.kind === 'c' ? 700 : 160) * alpha / Math.max(d2, 64)), d = Math.sqrt(d2);
        dx /= d; dy /= d; a.vx -= dx * k; a.vy -= dy * k; b.vx += dx * k; b.vy += dy * k;
      }
    }
    E.forEach(e => { const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, d = Math.hypot(dx, dy) || .01, k = (d - e.len) * (e.kind === 'd' ? .09 : .012) * alpha; const fx = dx / d * k, fy = dy / d * k; e.a.vx += fx; e.a.vy += fy; e.b.vx -= fx; e.b.vy -= fy; });
    N.forEach(n => { if (n.kind === 'c') { n.vx += (n.ax - n.x) * .08; n.vy += (n.ay - n.y) * .08; } const v = Math.hypot(n.vx, n.vy); if (v > 30) { n.vx *= 30 / v; n.vy *= 30 / v; } n.x += n.vx; n.y += n.vy; n.vx *= .6; n.vy *= .6; });
  }
  for (let i = 0; i < 320; i++) tick(1 - i / 360);
  N.forEach(n => { n.hx = n.x; n.hy = n.y; n.ph = rnd() * TAU; });

  /* ---------- view ---------- */
  let W = 0, H = 0, dpr = 1, zoom = 1, ox = 0, oy = 0, touched = false;
  function fit() {
    if (W < 60 || H < 60) return;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    N.forEach(n => { if (n.kind !== 'c') return; x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y); x1 = Math.max(x1, n.x); y1 = Math.max(y1, n.y); });
    const bias = ambient && W > 900 ? .38 : 0; // in the hero, the network sits to the right of the headline
    const usableW = W * (1 - bias);
    zoom = Math.min((usableW - 40) / (x1 - x0 + 260), (H - 90) / (y1 - y0 + 160));
    if (ambient) zoom *= W > 900 ? 1.18 : 1.5;
    zoom = Math.max(.05, zoom);
    ox = W * bias + usableW / 2 - (x0 + x1) / 2 * zoom; oy = (ambient && W > 900 ? H * .44 : H / 2 + 10) - (y0 + y1) / 2 * zoom;
  }
  function resize() { const r = host.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1); W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px'; }
  const ro = new ResizeObserver(() => { resize(); if (!touched) fit(); draw(performance.now()); }); ro.observe(host);
  const toWorld = (sx, sy) => [(sx - ox) / zoom, (sy - oy) / zoom];

  /* ---------- focus ---------- */
  let hover = null, picked = api.picked ? byId[api.picked] : null, lit = null;
  function lineage(id) { const s = new Set([id]); const up = x => byId[x].c.pre.forEach(p => { if (!s.has(p)) { s.add(p); up(p); } }); const down = x => (deps[x] || []).forEach(p => { if (!s.has(p)) { s.add(p); down(p); } }); up(id); down(id); return s; }
  function setFocus() { const f = hover || picked; lit = f ? lineage(f.kind === 'c' ? f.id : f.parent.id) : null; }
  setFocus();

  /* ---------- signature move: the network ignites in course order ---------- */
  const T0 = performance.now(), STEP = ambient ? 70 : 45, IGN = 520;
  const ignite = (n, t) => reduced ? 1 : Math.max(0, Math.min(1, (t - T0 - n.o * STEP) / IGN));
  const easeOut = u => 1 - Math.pow(1 - u, 3);

  /* ---------- impulses ---------- */
  const pulses = [];
  function spawn(t) {
    if (reduced) return;
    E.forEach(e => {
      const src = e.kind === 's' ? pct(e.a.c) : (isDone(e.b.c.id, e.b.j) ? 100 : 0);
      const base = ambient ? .00012 : 0;
      if (!src && !base) return;
      const rate = src ? (e.kind === 's' ? .00022 + src / 100 * .0006 : .0005) : (e.kind === 's' ? base : 0);
      if (rate && Math.random() < rate * 16) pulses.push({ e, t0: t, dur: e.kind === 's' ? 1700 + Math.random() * 900 : 700, rev: e.kind === 'd', hot: !!src });
    });
    if (pulses.length > 240) pulses.splice(0, pulses.length - 240);
  }
  const ctrl = e => { const mx = (e.a.x + e.b.x) / 2, my = (e.a.y + e.b.y) / 2, dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, k = e.kind === 's' ? .18 : .25; return [mx - dy * k, my + dx * k]; };
  const qpt = (e, u) => { const [cx, cy] = ctrl(e), a = e.a, b = e.b, v = 1 - u; return [v * v * a.x + 2 * v * u * cx + u * u * b.x, v * v * a.y + 2 * v * u * cy + u * u * b.y]; };

  /* ---------- draw ---------- */
  let raf = 0, last = 0, alive = true;
  function draw(t) {
    if (W < 2 || H < 2 || zoom <= 0) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.save(); ctx.translate(ox, oy); ctx.scale(zoom, zoom);
    const drift = reduced ? 0 : 1;
    N.forEach(n => { n.x = n.hx + Math.sin(t / 1900 + n.ph) * 2.2 * drift; n.y = n.hy + Math.cos(t / 2300 + n.ph) * 2.2 * drift; n.ig = easeOut(ignite(n, t)); });
    const dim = id => lit && !lit.has(id);
    const lw = 1 / Math.max(zoom, .5);

    ctx.lineCap = 'round';
    E.forEach(e => {
      const ig = Math.min(e.a.ig, e.b.ig); if (!ig) return;
      const off = e.kind === 's' ? (dim(e.a.id) || dim(e.b.id)) : dim(e.a.id);
      const on = e.kind === 's' ? pct(e.a.c) === 100 : isDone(e.b.c.id, e.b.j);
      const hl = lit && !off && e.kind === 's';
      const a = (on ? (off ? .06 : .6) : off ? .04 : hl ? .75 : e.kind === 's' ? (ambient ? .2 : .28) : (ambient ? .22 : .32)) * ig;
      ctx.strokeStyle = rgba(on ? COL.hot : e.kind === 's' ? COL.cold : COL.dendrite, a);
      ctx.lineWidth = (e.kind === 's' ? (hl ? 2.2 : 1.2) : .8) * lw;
      const [cx, cy] = ctrl(e); ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.quadraticCurveTo(cx, cy, e.b.x, e.b.y); ctx.stroke();
    });

    ctx.globalCompositeOperation = 'lighter';
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i], u = (t - p.t0) / p.dur; if (u >= 1) { pulses.splice(i, 1); continue; }
      const [x, y] = qpt(p.e, p.rev ? 1 - u : u), s = (p.e.kind === 's' ? 22 : 12) / Math.max(zoom, .6);
      const off = lit && (dim(p.e.a.id) || dim(p.e.b.kind === 'c' ? p.e.b.id : p.e.a.id));
      ctx.globalAlpha = (off ? .1 : 1) * Math.sin(u * Math.PI) * (p.hot ? 1 : .6); ctx.drawImage(p.hot ? S.hot : S.cold, x - s / 2, y - s / 2, s, s);
    }
    N.forEach(n => {
      if (!n.ig) return;
      const off = dim(n.kind === 'c' ? n.id : n.parent.id);
      if (n.kind === 't') {
        const on = isDone(n.c.id, n.j), s = on ? 26 : 15;
        ctx.globalAlpha = (off ? .08 : on ? .95 : .62) * n.ig; ctx.drawImage(on ? S.hot : S.dendrite, n.x - s / 2, n.y - s / 2, s, s);
      } else {
        const p = pct(n.c) / 100, flare = reduced ? 0 : Math.max(0, 1 - Math.abs(n.ig * 2 - 1.4)) * .6;
        const s = n.r * 6.2 * (1 + flare);
        ctx.globalAlpha = (off ? .1 : .9) * n.ig; ctx.drawImage(S.cold, n.x - s / 2, n.y - s / 2, s, s);
        if (p) { ctx.globalAlpha = (off ? .1 : .3 + p * .7) * n.ig; const hs = s * (.6 + p * .55); ctx.drawImage(S.hot, n.x - hs / 2, n.y - hs / 2, hs, hs); }
      }
    });
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    N.forEach(n => {
      if (n.kind !== 'c' || !n.ig) return;
      const off = dim(n.id), p = pct(n.c) / 100;
      ctx.globalAlpha = (off ? .25 : 1) * n.ig;
      ctx.fillStyle = p === 1 ? rgba(COL.hot, 1) : rgba(COL.core, 1); ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, TAU); ctx.fill();
      ctx.lineWidth = 2 * lw; ctx.strokeStyle = rgba(COL.cold, .9); ctx.stroke();
      if (p && p < 1) { ctx.strokeStyle = rgba(COL.hot, 1); ctx.lineWidth = 3 * lw; ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 3 / zoom, -Math.PI / 2, -Math.PI / 2 + p * TAU); ctx.stroke(); }
      if (ambient) return;
      const sel = picked === n || hover === n;
      if (sel) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5 / zoom; ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 7 / zoom, 0, TAU); ctx.stroke(); }
      if (zoom > .3 || sel || (lit && !off)) {
        const fs = (sel || (lit && !off) ? 13 : 11.5) / zoom;
        ctx.font = `600 ${fs}px Figtree, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        let label = name(n.c); if (zoom < .62 && !sel && label.length > 18) label = label.slice(0, 17) + '…';
        const y = n.y + n.r + 6 / zoom;
        ctx.lineWidth = 3.5 / zoom; ctx.strokeStyle = 'rgba(3,6,16,.9)'; ctx.strokeText(label, n.x, y);
        ctx.fillStyle = off ? 'rgba(200,215,240,.35)' : '#eef2ff'; ctx.fillText(label, n.x, y);
      }
    });
    ctx.globalAlpha = 1; ctx.restore();
  }
  let visible = true;
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; }); io.observe(host);
  function loop(t) { if (!alive) return; if (visible && !document.hidden) { if (t - last > 140) { spawn(t); last = t; } draw(t); } raf = requestAnimationFrame(loop); }
  if (reduced) draw(0); else raf = requestAnimationFrame(loop);
  const redraw = () => { if (reduced) draw(0); };

  const control = {
    refresh: redraw,
    destroy: () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); }
  };
  if (ambient) return control;

  /* ---------- interaction ---------- */
  function hit(sx, sy) {
    const [x, y] = toWorld(sx, sy); let best = null, bd = Infinity;
    N.forEach(n => { const d = Math.hypot(n.x - x, n.y - y), lim = (n.kind === 'c' ? n.r + 6 : 7) / Math.min(1, zoom); if (d < lim && d < bd) { bd = d; best = n; } });
    return best;
  }
  function showTip(n, sx, sy) {
    if (!n) { tip.hidden = true; return; }
    tip.hidden = false;
    tip.innerHTML = n.kind === 'c' ? `<b>${api.esc(name(n.c))}</b><span>${pct(n.c)}%</span>` : `<b>${api.esc(topicName(n.c, n.j))}</b><span>${api.esc(name(n.c))}</span>`;
    const r = tip.getBoundingClientRect(); tip.style.transform = `translate(${Math.min(sx + 14, W - r.width - 8)}px, ${Math.max(8, sy - r.height - 12)}px)`;
  }
  let drag = null, moved = false;
  const pinch = new Map();
  canvas.addEventListener('pointerdown', e => { touched = true; canvas.setPointerCapture(e.pointerId); pinch.set(e.pointerId, [e.offsetX, e.offsetY]); drag = { x: e.offsetX, y: e.offsetY, ox, oy }; moved = false; });
  canvas.addEventListener('pointermove', e => {
    if (pinch.has(e.pointerId)) pinch.set(e.pointerId, [e.offsetX, e.offsetY]);
    if (pinch.size === 2) { const [a, b] = [...pinch.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (drag.d) zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, d / drag.d); drag.d = d; moved = true; return; }
    if (drag && pinch.size === 1) { const dx = e.offsetX - drag.x, dy = e.offsetY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) moved = true; if (moved) { ox = drag.ox + dx; oy = drag.oy + dy; canvas.style.cursor = 'grabbing'; showTip(null); redraw(); return; } }
    const n = hit(e.offsetX, e.offsetY); if (n !== hover) { hover = n; setFocus(); redraw(); } canvas.style.cursor = n ? 'pointer' : 'grab'; showTip(n, e.offsetX, e.offsetY);
  });
  const end = e => { pinch.delete(e.pointerId); if (pinch.size < 2 && drag) drag.d = 0; if (pinch.size === 0) { if (!moved) { const n = hit(e.offsetX, e.offsetY); picked = n ? (n.kind === 'c' ? n : n.parent) : null; setFocus(); redraw(); onPick(picked && picked.id, n && n.kind === 't' ? n.j : null); } drag = null; canvas.style.cursor = 'grab'; } };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', () => { if (!drag) { hover = null; setFocus(); showTip(null); redraw(); } });
  function zoomAt(sx, sy, f) { const nz = Math.min(4, Math.max(.2, zoom * f)); f = nz / zoom; ox = sx - (sx - ox) * f; oy = sy - (sy - oy) * f; zoom = nz; redraw(); }
  canvas.addEventListener('wheel', e => { e.preventDefault(); touched = true; zoomAt(e.offsetX, e.offsetY, Math.exp(-e.deltaY * .0015)); }, { passive: false });
  // keyboard: arrows pan, +/- zoom, 0 shows everything
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', e => { const k = e.key, st = 60; if (k === 'ArrowLeft') ox += st; else if (k === 'ArrowRight') ox -= st; else if (k === 'ArrowUp') oy += st; else if (k === 'ArrowDown') oy -= st; else if (k === '+' || k === '=') return control.zoomIn(); else if (k === '-') return control.zoomOut(); else if (k === '0') return control.reset(); else return; e.preventDefault(); touched = true; redraw(); });

  function flyTo(tz, tx, ty, ms = 520) { // camera moves are on-screen motion: ease-in-out
    if (reduced) { zoom = tz; ox = tx; oy = ty; redraw(); return; }
    const z0 = zoom, x0 = ox, y0 = oy, t0 = performance.now(), ease = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    const step = now => { const u = Math.min(1, (now - t0) / ms), k = ease(u); zoom = z0 + (tz - z0) * k; ox = x0 + (tx - x0) * k; oy = y0 + (ty - y0) * k; if (u < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  Object.assign(control, {
    zoomIn: () => { touched = true; const z = Math.min(4, zoom * 1.35); flyTo(z, W / 2 - (W / 2 - ox) * z / zoom, H / 2 - (H / 2 - oy) * z / zoom, 260); },
    zoomOut: () => { touched = true; const z = Math.max(.2, zoom / 1.35); flyTo(z, W / 2 - (W / 2 - ox) * z / zoom, H / 2 - (H / 2 - oy) * z / zoom, 260); },
    reset: () => { touched = false; const s = [zoom, ox, oy]; fit(); const tgt = [zoom, ox, oy]; [zoom, ox, oy] = s; flyTo(...tgt); },
    focus: id => { const n = byId[id]; if (!n) return; touched = true; picked = n; setFocus(); const z = Math.max(zoom, 1.1); flyTo(z, W / 2 - n.x * z, H / 2 - n.y * z); }
  });
  if (picked) setTimeout(() => { const n = picked, z = Math.max(zoom, 1.1); touched = true; zoom = z; ox = W / 2 - n.x * z; oy = H / 2 - n.y * z; redraw(); }, 0);
  return control;
}
window.Rede = { mount };
})();
