/* A placa de circuito do curso, em SVG.
   Cadeira = chip; tópico = componente pequeno no chip; pré-requisito = pista de cobre entre chips.
   O que dominas acende cor de fogo. É desenhada uma vez pelo browser (sem motor de jogo, sem redesenhar a cada
   imagem), por isso fica fluida em qualquer computador ou telemóvel. A versão 3D continua disponível no botão «3D». */
(() => {
'use strict';
const NS = 'http://www.w3.org/2000/svg';
const COLW = 250, ROWH = 150, CW = 178, CH = 104, PAD = 70;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = u => 1 - Math.pow(1 - u, 3);

function mount(host, api) {
  const { courses, sems, deps, pct, isDone, name, topicName } = api;
  const esc = api.esc || (s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
  const ambient = !!api.ambient, reduced = !!api.reduced, onPick = api.onPick || (() => {}), en = api.lang === 'en';

  /* ---------- layout: uma coluna por semestre, cadeiras empilhadas ---------- */
  const semIx = Object.fromEntries(sems.map((s, i) => [s.id, i])), count = {}, row = {};
  courses.forEach(c => { row[c.id] = count[c.sem] = (count[c.sem] || 0) + 1; });
  const maxRows = Math.max(...Object.values(count));
  const chips = courses.map((c, i) => {
    const col = semIx[c.sem], n = count[c.sem];
    const x = PAD + col * COLW, y = PAD + 40 + (row[c.id] - 1) * ROWH + (maxRows - n) * ROWH / 2 + (col % 2 ? ROWH * .22 : 0);
    return { id: c.id, c, i, x, y };
  });
  const byId = Object.fromEntries(chips.map(ch => [ch.id, ch]));
  const W = PAD * 2 + (sems.length - 1) * COLW + CW, H = PAD * 2 + 40 + maxRows * ROWH + ROWH * .22;

  /* ---------- SVG ---------- */
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'placa-svg' + (ambient ? ' ambient' : '') + (reduced ? ' still' : ''));
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  if (ambient) svg.setAttribute('aria-hidden', 'true'); else { svg.setAttribute('role', 'group'); svg.setAttribute('aria-label', api.label || ''); }
  host.appendChild(svg);
  const tip = document.createElement('div'); tip.className = 'rede-tip'; tip.hidden = true; if (!ambient) host.appendChild(tip);

  let sel = api.picked || null;

  function trace(a, b) {   // pista: sai pela direita do pré-requisito e entra pela esquerda da cadeira
    const x1 = a.x + CW, y1 = a.y + CH / 2 + ((b.i % 3) - 1) * 12, x2 = b.x, y2 = b.y + CH / 2 + ((a.i % 3) - 1) * 12;
    if (x2 > x1 + 10) { const mx = x1 + (x2 - x1) * (.35 + (a.i % 4) * .1); return `M${x1} ${y1}H${mx}V${y2}H${x2}`; }
    const yb = Math.max(a.y, b.y) + CH + 18 + (a.i % 3) * 6;   // mesma coluna: passa por baixo
    return `M${x1} ${y1}h14V${yb}H${x2 - 14}V${y2}h14`;
  }

  function draw() {
    const parts = [];
    parts.push(`<defs><pattern id="pgrid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" class="pg"/></pattern></defs>`);
    parts.push(`<rect class="pboard" x="0" y="0" width="${W}" height="${H}" rx="28"/><rect x="0" y="0" width="${W}" height="${H}" rx="28" fill="url(#pgrid)"/>`);
    // títulos dos semestres
    if (!ambient) sems.forEach((s, i) => { if (count[s.id]) parts.push(`<text class="psem" x="${PAD + i * COLW}" y="${PAD - 6}">${esc(s[en ? 'en' : 'pt'])}</text>`); });
    // pistas
    const rel = sel ? new Set([sel, ...(deps[sel] || []), ...(byId[sel] ? byId[sel].c.pre : [])]) : null;
    chips.forEach(b => b.c.pre.forEach(pid => {
      const a = byId[pid]; if (!a) return;
      const hot = pct(a.c) >= 100 ? ' hot' : pct(a.c) > 0 ? ' warm' : '';
      const on = rel && (pid === sel || b.id === sel) ? ' on' : rel ? ' dim' : '';
      const d = trace(a, b);
      parts.push(`<path class="ptr${hot}${on}" d="${d}"/>`);
      if (hot && !reduced) parts.push(`<path class="ppulse" d="${d}" style="animation-delay:${-(a.i * 0.37 % 3).toFixed(2)}s"/>`);
    }));
    // chips
    chips.forEach(ch => {
      const c = ch.c, p = pct(c), hot = p >= 100 ? ' hot' : p > 0 ? ' warm' : '', on = sel === ch.id ? ' sel' : rel && !rel.has(ch.id) ? ' dim' : '';
      const nm = name(c), words = nm.split(' '), lines = []; let line = '';
      words.forEach(w => { if ((line + ' ' + w).trim().length > 18 && line) { lines.push(line); line = w; } else line = (line + ' ' + w).trim(); }); if (line) lines.push(line);
      if (lines.length > 3) { lines.length = 3; lines[2] = lines[2].replace(/.{0,2}$/, '…'); }
      let pins = ''; for (let k = 0; k < 7; k++) { const px = ch.x + 18 + k * ((CW - 36) / 6); pins += `M${px} ${ch.y - 7}v7M${px} ${ch.y + CH}v7`; }
      const T = c.topics.length, dw = Math.min(12, (CW - 32) / Math.max(1, T) - 3);
      let dots = ''; for (let j = 0; j < T; j++) dots += `<rect class="pdot${isDone(c.id, j) ? ' done' : ''}" data-j="${j}" x="${(ch.x + 16 + j * (dw + 3)).toFixed(1)}" y="${ch.y + CH - 20}" width="${dw.toFixed(1)}" height="8" rx="2"/>`;
      parts.push(`<g class="pchip${hot}${on}" data-id="${c.id}"${ambient ? '' : ` tabindex="0" role="button" aria-label="${esc(nm)}, ${p}%"`}>
        <path class="ppins" d="${pins}"/>
        <rect class="pbody" x="${ch.x}" y="${ch.y}" width="${CW}" height="${CH}" rx="10"/>
        ${lines.map((l, k) => `<text class="pname" x="${ch.x + 16}" y="${ch.y + 24 + k * 17}">${esc(l)}</text>`).join('')}
        <text class="ppct" x="${ch.x + CW - 14}" y="${ch.y + CH - 28}" text-anchor="end">${p}%</text>
        ${dots}
      </g>`);
    });
    svg.innerHTML = parts.join('');
  }

  /* ---------- câmara: só muda o viewBox (o browser redesenha o SVG, sem trabalho por imagem) ---------- */
  let vb = { x: 0, y: 0, w: W, h: H }, anim = 0;
  const aspect = () => { const r = host.getBoundingClientRect(); return (r.width || 1) / (r.height || 1); };
  function fitBox() {
    const a = aspect(); let w = W, h = H;
    if (ambient) { h = H * .9; w = h * a; if (w > W) { w = W; h = w / a; } return { x: (W - w) / 2 + W * .08, y: (H - h) / 2, w, h }; }
    if (w / h > a) h = w / a; else w = h * a; return { x: (W - w) / 2, y: (H - h) / 2, w, h };
  }
  // no telemóvel (ecrã alto) começa nos primeiros semestres em tamanho legível, em vez da placa inteira minúscula
  const startBox = () => { const a = aspect(); if (ambient || a >= 1) return fitBox(); const h = H, w = h * a; return { x: 0, y: 0, w, h }; };
  const apply = () => svg.setAttribute('viewBox', `${vb.x.toFixed(1)} ${vb.y.toFixed(1)} ${vb.w.toFixed(1)} ${vb.h.toFixed(1)}`);
  function flyTo(to, ms = 450) {
    cancelAnimationFrame(anim); const from = { ...vb }, t0 = performance.now();
    if (reduced || ms <= 0) { vb = to; apply(); return; }
    const step = now => { const u = ease(Math.min(1, (now - t0) / ms)); vb = { x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u, w: from.w + (to.w - from.w) * u, h: from.h + (to.h - from.h) * u }; apply(); if (u < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  }
  function zoomAt(f, cx, cy, ms) {
    const fit = fitBox(), w = clamp(vb.w * f, fit.w * .18, fit.w * 1.2), h = w * vb.h / vb.w;
    if (cx == null) { cx = vb.x + vb.w / 2; cy = vb.y + vb.h / 2; }
    const kx = (cx - vb.x) / vb.w, ky = (cy - vb.y) / vb.h;
    flyTo({ x: cx - kx * w, y: cy - ky * h, w, h }, ms);
  }
  function focus(id) {
    sel = id || null; draw();
    const ch = id && byId[id]; if (!ch || ambient) return;
    const fit = fitBox(), w = Math.min(vb.w, fit.w * .45), h = w * vb.h / vb.w;
    flyTo({ x: ch.x + CW / 2 - w / 2, y: ch.y + CH / 2 - h / 2, w, h });
    const g = svg.querySelector(`.pchip[data-id="${id}"]`); if (g && document.activeElement !== g && host.contains(document.activeElement)) g.focus({ preventScroll: true });
  }
  const toSvg = (cx, cy) => { const r = svg.getBoundingClientRect(), s = Math.max(vb.w / r.width, vb.h / r.height); return { x: vb.x + vb.w / 2 + (cx - r.left - r.width / 2) * s, y: vb.y + vb.h / 2 + (cy - r.top - r.height / 2) * s, s }; };

  /* ---------- interação ---------- */
  const ptrs = new Map(); let drag = null, moved = false, pinch = null;
  function showTip(e, html) { tip.innerHTML = html; tip.hidden = false; const r = host.getBoundingClientRect(); tip.style.transform = `translate(${clamp(e.clientX - r.left + 14, 0, r.width - 270)}px, ${clamp(e.clientY - r.top + 14, 0, r.height - 70)}px)`; }
  function onOver(e) {
    if (drag && moved) return;
    const dot = e.target.closest('.pdot'), g = e.target.closest('.pchip'); if (!g) { tip.hidden = true; return; }
    const c = byId[g.dataset.id].c;
    if (dot) showTip(e, `<b>${esc(topicName(c, +dot.dataset.j))}</b><span>${esc(name(c))}</span>`);
    else showTip(e, `<b>${esc(name(c))}</b><span>${pct(c)}% · ${c.topics.length} ${en ? 'topics' : 'tópicos'}</span>`);
  }
  function onDown(e) {
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) { drag = { x: e.clientX, y: e.clientY, vb: { ...vb } }; moved = false; }
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), vb: { ...vb }, c: toSvg((a.x + b.x) / 2, (a.y + b.y) / 2) }; drag = null; moved = true; }
  }
  let mvRaf = 0, lastMove = null;
  function onMove(e) {
    if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    lastMove = e; if (mvRaf) return;
    mvRaf = requestAnimationFrame(() => {   // no máximo uma atualização por imagem, mesmo com ratos de 1000 Hz
      mvRaf = 0; const ev = lastMove;
      if (pinch && ptrs.size >= 2) {
        const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y), f = pinch.d / Math.max(1, d), fit = fitBox();
        const w = clamp(pinch.vb.w * f, fit.w * .18, fit.w * 1.2), h = w * pinch.vb.h / pinch.vb.w, kx = (pinch.c.x - pinch.vb.x) / pinch.vb.w, ky = (pinch.c.y - pinch.vb.y) / pinch.vb.h;
        vb = { x: pinch.c.x - kx * w, y: pinch.c.y - ky * h, w, h }; apply(); return;
      }
      if (drag) {
        const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
        if (!moved && Math.hypot(dx, dy) > 6) { moved = true; tip.hidden = true; svg.classList.add('grabbing'); try { svg.setPointerCapture(ev.pointerId); } catch (x) { } }
        if (moved) { const r = svg.getBoundingClientRect(), s = Math.max(drag.vb.w / r.width, drag.vb.h / r.height); cancelAnimationFrame(anim); vb = { ...drag.vb, x: drag.vb.x - dx * s, y: drag.vb.y - dy * s }; apply(); }
        return;
      }
      onOver(ev);
    });
  }
  function onUp(e) {
    ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null;
    svg.classList.remove('grabbing');
    if (drag && !moved && ptrs.size === 0) {
      const g = e.target.closest && e.target.closest('.pchip'), dot = e.target.closest && e.target.closest('.pdot');
      if (g) { const id = g.dataset.id; focus(id); onPick(id, dot ? +dot.dataset.j : undefined); }
      else { focus(null); onPick(null); }
    }
    if (ptrs.size === 0) drag = null;
  }
  function onWheel(e) { e.preventDefault(); const p = toSvg(e.clientX, e.clientY); zoomAt(Math.pow(1.0018, e.deltaY), p.x, p.y, 0); }
  function onKey(e) {
    const g = e.target.closest && e.target.closest('.pchip');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); focus(g.dataset.id); onPick(g.dataset.id); return; }
    const ids = chips.map(c => c.id), i = Math.max(0, ids.indexOf(sel));
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); const id = ids[(sel ? i + 1 : 0) % ids.length]; focus(id); onPick(id); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); const id = ids[(i - 1 + ids.length) % ids.length]; focus(id); onPick(id); }
    if (e.key === '+' || e.key === '=') zoomAt(.75); if (e.key === '-') zoomAt(1.33); if (e.key === 'Escape') { focus(null); onPick(null); flyTo(fitBox()); }
  }
  if (!ambient) {
    svg.addEventListener('pointerdown', onDown); svg.addEventListener('pointermove', onMove); svg.addEventListener('pointerup', onUp); svg.addEventListener('pointercancel', onUp);
    svg.addEventListener('pointerleave', () => { if (!drag) tip.hidden = true; });
    svg.addEventListener('wheel', onWheel, { passive: false }); svg.addEventListener('keydown', onKey);
  }

  let lastAspect = 0;
  const ro = new ResizeObserver(() => { const a = aspect(); if (Math.abs(a - lastAspect) < .01) return; const first = !lastAspect; lastAspect = a; if (first || ambient || !sel) { vb = startBox(); apply(); } else { const cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2, h = vb.w / a; vb = { x: vb.x, y: cy - h / 2, w: vb.w, h }; apply(); void cx; } });
  ro.observe(host);
  draw(); vb = startBox(); apply(); lastAspect = aspect();
  if (sel && !ambient) setTimeout(() => focus(sel), 50);

  return {
    focus, refresh: draw,
    zoomIn: () => zoomAt(.7), zoomOut: () => zoomAt(1.4),
    reset: () => { focus(null); onPick(null); flyTo(fitBox()); },
    setScroll: () => {},
    destroy: () => { cancelAnimationFrame(anim); cancelAnimationFrame(mvRaf); ro.disconnect(); svg.remove(); tip.remove(); }
  };
}

window.PlacaSVG = { mount, svg: true };
})();
