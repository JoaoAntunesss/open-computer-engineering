/* Exercícios com correção automática.
   Uma lição declara um exercício num bloco ```exercicio (ver README). Aqui: o editor, os botões, a correção
   (num Web Worker, js/py-worker.js, com limite de tempo para ciclos infinitos), o progresso (localStorage
   'eia.ex', sincronizado com a conta Google por js/sync.js) e o aviso para criar conta. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pt = () => (document.documentElement.lang || 'pt').startsWith('pt');
const TX = {
  pt: { k: 'Exercício · corrigido automaticamente', test: 'Testar', hint: 'Dica', reset: 'Repor', sol: 'Ver solução', solLocked: n => `A solução fica disponível depois de ${n} tentativas`, solved: 'Resolvido',
    loading: 'A preparar o Python (só da primeira vez, demora uns segundos)…', running: 'A testar…', allOk: n => `Todos os ${n} testes passaram. Muito bem!`, some: (a, n) => `${a} de ${n} testes passaram.`,
    got: 'obtido', exp: 'esperado', line: 'linha', timeout: 'O teu código demorou mais de 6 segundos. Pode ter um ciclo que nunca termina, ou ser lento demais para listas grandes.',
    forbidden: n => `Neste exercício não podes usar: ${n}. A ideia é escreveres tu essa parte.`, out: 'O que o teu código escreveu (print):', noPy: 'Não foi possível carregar o Python. Verifica a ligação à internet.',
    resetQ: 'Voltar ao código inicial? Perdes o que escreveste neste exercício.', tries: n => `${n} tentativa${n === 1 ? '' : 's'}`, keys: 'Ctrl+Enter para testar',
    saveNote: 'Entra com a conta Google para não perderes o teu percurso.', signIn: 'Entrar com Google', later: 'Agora não',
    nudge: n => `Já resolveste ${n} exercício${n === 1 ? '' : 's'}. Para não perderes o teu percurso, entra com a tua conta Google: o código e o progresso ficam guardados e aparecem em qualquer aparelho.` },
  en: { k: 'Exercise · automatically checked', test: 'Run tests', hint: 'Hint', reset: 'Reset', sol: 'Show solution', solLocked: n => `The solution unlocks after ${n} attempts`, solved: 'Solved',
    loading: 'Getting Python ready (first time only, takes a few seconds)…', running: 'Testing…', allOk: n => `All ${n} tests passed. Well done!`, some: (a, n) => `${a} of ${n} tests passed.`,
    got: 'got', exp: 'expected', line: 'line', timeout: 'Your code took more than 6 seconds. It may have a loop that never ends, or be too slow for large lists.',
    forbidden: n => `In this exercise you can't use: ${n}. The point is to write that part yourself.`, out: 'What your code printed:', noPy: 'Could not load Python. Check your internet connection.',
    resetQ: 'Go back to the starting code? You lose what you wrote in this exercise.', tries: n => `${n} attempt${n === 1 ? '' : 's'}`, keys: 'Ctrl+Enter to test',
    saveNote: 'Sign in with Google so you don\'t lose your progress.', signIn: 'Sign in with Google', later: 'Not now',
    nudge: n => `You have solved ${n} exercise${n === 1 ? '' : 's'}. So you don't lose your progress, sign in with Google: your code and progress are saved and show up on any device.` }
};
const tx = k => TX[pt() ? 'pt' : 'en'][k];
// erros do Python explicados em português simples
const ERR = {
  SyntaxError: ['Erro de sintaxe', 'Python não percebe esta linha: falta um ":" , um parêntese, ou há um erro de escrita.'],
  IndentationError: ['Erro de indentação', 'Os espaços no início da linha não estão certos. Dentro de def, if, for e while, as linhas levam 4 espaços.'],
  NameError: ['Nome desconhecido', 'Usaste um nome (variável ou função) que ainda não existe. Confirma se está bem escrito.'],
  TypeError: ['Tipo errado', 'Uma operação recebeu um valor do tipo errado (por exemplo, somar texto com número) ou a função foi chamada com argumentos a mais ou a menos.'],
  IndexError: ['Índice fora da lista', 'Tentaste aceder a uma posição que não existe. Lembra-te que as posições começam em 0.'],
  KeyError: ['Chave inexistente', 'Procuraste no dicionário uma chave que não está lá.'],
  ZeroDivisionError: ['Divisão por zero', 'O código dividiu um número por zero.'],
  RecursionError: ['Recursão sem fim', 'A função chama-se a si própria vezes demais. Falta o caso base, ou ele nunca é atingido.'],
  ValueError: ['Valor inválido', 'Uma função recebeu um valor que não consegue usar (por exemplo, int("abc")).'],
  AttributeError: ['Método ou atributo inexistente', 'Esse tipo de valor não tem esse método. Confirma o nome e o tipo da variável.']
};
const KEY = 'eia.ex';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
let S = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } document.dispatchEvent(new CustomEvent('eia:saved', { detail: KEY })); };
document.addEventListener('eia:remote', () => { S = load(); $$('.ex[data-id]').forEach(paintState); });
const signed = () => document.documentElement.dataset.signed === '1';

/* ---------- o processo que corre o Python ---------- */
let W = null, wReady = null, seq = 0; const pending = new Map();
function worker() {
  if (W) return wReady;
  W = new Worker('js/py-worker.js');
  wReady = new Promise((ok, ko) => {
    W.onmessage = e => {
      const d = e.data;
      if ('ready' in d) { d.ready ? ok() : ko(new Error(d.fail)); return; }
      const p = pending.get(d.id); if (p) { pending.delete(d.id); clearTimeout(p.timer); p.ok(d.res); }
    };
    W.onerror = e => ko(e);
  });
  wReady.catch(() => { W && W.terminate(); W = null; });
  return wReady;
}
function kill() { if (W) W.terminate(); W = null; wReady = null; }
async function check(ex, code) {
  await worker();
  return new Promise(ok => {
    const id = ++seq, timer = setTimeout(() => { pending.delete(id); kill(); ok({ ok: false, timeout: true, testes: [] }); }, 6000);
    pending.set(id, { ok, timer });
    W.postMessage({ id, code, tests: ex.testes, forbid: ex.proibido });
  });
}

/* ---------- interface ---------- */
const inline = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const MIN_TRIES = 3;
function html(ex) {
  return `<header class="ex-h"><p class="ex-k">${tx('k')}</p><h3>${inline(ex.titulo)}</h3><span class="ex-st" hidden>${tx('solved')}</span></header>
  <p class="ex-q">${inline(ex.enunciado)}</p>
  <div class="ex-ed"><textarea class="ex-code" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="${esc(ex.titulo)}"></textarea></div>
  <div class="ex-acts"><button type="button" class="run-btn ex-test">${tx('test')}</button>${ex.dica ? `<button type="button" class="run-reset ex-hint-b">${tx('hint')}</button>` : ''}<button type="button" class="run-reset ex-reset">${tx('reset')}</button>${ex.solucao ? `<button type="button" class="run-reset ex-sol-b">${tx('sol')}</button>` : ''}<span class="ex-n"></span><span class="ex-keys">${tx('keys')}</span></div>
  ${ex.dica ? `<p class="ex-hint" hidden>${inline(ex.dica)}</p>` : ''}
  <div class="ex-res" aria-live="polite"></div>
  ${ex.solucao ? `<div class="ex-sol" hidden><pre class="code"><code>${esc(ex.solucao)}</code></pre></div>` : ''}
  <p class="ex-save" hidden>${tx('saveNote')} <button type="button" class="ex-in">${tx('signIn')}</button></p>`;
}
function paintState(box) {
  const ex = box._ex, st = S[ex.id] || {}, solB = $('.ex-sol-b', box);
  $('.ex-st', box).hidden = !st.ok; box.classList.toggle('ok', !!st.ok);
  $('.ex-n', box).textContent = st.n ? tx('tries')(st.n) : '';
  if (solB) { const open = st.ok || (st.n || 0) >= MIN_TRIES; solB.disabled = !open; solB.title = open ? '' : tx('solLocked')(MIN_TRIES); }
  $('.ex-save', box).hidden = signed() || !st.n;
  const ta = $('.ex-code', box); if (document.activeElement !== ta && st.code != null && ta.value !== st.code) ta.value = st.code;
}
function result(box, r) {
  const out = $('.ex-res', box);
  if (r.timeout) { out.innerHTML = `<p class="ex-msg bad">${tx('timeout')}</p>`; return; }
  if (r.erro && r.erro.tipo === 'Proibido') { out.innerHTML = `<p class="ex-msg bad">${tx('forbidden')(r.erro.nomes.map(n => `<code>${esc(n)}</code>`).join(', '))}</p>`; return; }
  const errHtml = e => { const x = ERR[e.tipo]; return `<p class="ex-msg bad"><strong>${esc(pt() && x ? x[0] : e.tipo)}</strong>${e.linha ? ` (${tx('line')} ${e.linha})` : ''}: ${esc(e.msg)}${pt() && x ? `<br><small>${esc(x[1])}</small>` : ''}</p>`; };
  let h = '';
  if (r.erro) h += errHtml(r.erro);
  if (r.testes && r.testes.length) {
    const okN = r.testes.filter(x => x.ok).length;
    h += `<p class="ex-msg ${r.ok ? 'good' : 'bad'}">${r.ok ? tx('allOk')(r.testes.length) : tx('some')(okN, r.testes.length)}</p><ul class="ex-tests">${r.testes.map(x => `<li class="${x.ok ? 'ok' : 'no'}"><code>${esc(x.chamada || x.expr)}</code>${x.ok ? '' : x.erro ? ` → <span>${esc((ERR[x.erro.tipo] && pt() ? ERR[x.erro.tipo][0] : x.erro.tipo) + (x.erro.linha ? ` (${tx('line')} ${x.erro.linha})` : '') + ': ' + x.erro.msg)}</span>` : x.esperado != null ? ` → ${tx('got')} <code>${esc(x.obtido)}</code>, ${tx('exp')} <code>${esc(x.esperado)}</code>` : ''}</li>`).join('')}</ul>`;
  }
  if (r.stdout) h += `<p class="ex-out-k">${tx('out')}</p><pre class="run-out">${esc(r.stdout)}</pre>`;
  out.innerHTML = h;
}
async function run(box) {
  const ex = box._ex, btn = $('.ex-test', box), code = $('.ex-code', box).value, out = $('.ex-res', box);
  btn.disabled = true; out.innerHTML = `<p class="ex-msg">${W ? tx('running') : tx('loading')}</p>`;
  let r; try { r = await check(ex, code); } catch (e) { r = null; out.innerHTML = `<p class="ex-msg bad">${tx('noPy')}</p>`; }
  btn.disabled = false; if (!r) return;
  const st = S[ex.id] || (S[ex.id] = {}); const was = !!st.ok;
  st.n = (st.n || 0) + 1; st.code = code; st.at = Date.now(); if (r.ok) st.ok = true; save();
  result(box, r); paintState(box);
  if (r.ok && !was) { box.classList.add('just'); setTimeout(() => box.classList.remove('just'), 1200); nudge(); }
}
// o aviso para criar conta: depois do 1.º exercício resolvido e de 3 em 3, se ainda não entrou
function nudge() {
  if (signed() || $('#exNudge')) return; const n = Object.values(S).filter(x => x.ok).length;
  if (!(n === 1 || n % 3 === 0)) return;
  try { if (sessionStorage.getItem('eia.nudge') === String(n)) return; sessionStorage.setItem('eia.nudge', String(n)); } catch (e) { }
  const d = document.createElement('div'); d.id = 'exNudge'; d.className = 'ex-nudge'; d.setAttribute('role', 'status');
  d.innerHTML = `<p>${esc(tx('nudge')(n))}</p><div><button type="button" class="btn-fire" id="exNIn">${tx('signIn')}</button><button type="button" class="run-reset" id="exNNo">${tx('later')}</button></div>`;
  document.body.appendChild(d);
  $('#exNIn').onclick = () => { d.remove(); const b = $('#authBtn'); if (b) b.click(); };
  $('#exNNo').onclick = () => d.remove();
}
function bind(root) {
  $$('.ex[data-ex]', root).forEach(box => {
    let ex; try { ex = JSON.parse(box.dataset.ex); } catch (e) { return; }
    box._ex = ex; box.dataset.id = ex.id; box.removeAttribute('data-ex'); box.innerHTML = html(ex);
    const ta = $('.ex-code', box), st = S[ex.id] || {}; ta.value = st.code != null ? st.code : ex.inicio;
    const fit = () => { ta.style.height = 'auto'; ta.style.height = Math.max(120, ta.scrollHeight + 4) + 'px'; }; fit();
    let tmr = 0; ta.addEventListener('input', () => { fit(); clearTimeout(tmr); tmr = setTimeout(() => { const s = S[ex.id] || (S[ex.id] = {}); s.code = ta.value; s.at = Date.now(); save(); }, 1500); });
    ta.addEventListener('keydown', e => {
      if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); const a = ta.selectionStart; ta.setRangeText('    ', a, ta.selectionEnd, 'end'); fit(); }
      else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(box); }
      else if (e.key === 'Enter') { // mantém a indentação, e acrescenta 4 espaços depois de ":"
        const a = ta.selectionStart, line = ta.value.slice(ta.value.lastIndexOf('\n', a - 1) + 1, a), ind = (/^\s*/.exec(line) || [''])[0] + (/:\s*$/.test(line) ? '    ' : '');
        e.preventDefault(); ta.setRangeText('\n' + ind, a, ta.selectionEnd, 'end'); fit();
      }
    });
    $('.ex-test', box).onclick = () => run(box);
    $('.ex-reset', box).onclick = () => { if (ta.value !== ex.inicio && !confirm(tx('resetQ'))) return; ta.value = ex.inicio; fit(); const s = S[ex.id]; if (s) { s.code = ex.inicio; save(); } $('.ex-res', box).innerHTML = ''; };
    const hb = $('.ex-hint-b', box); if (hb) hb.onclick = () => { const h = $('.ex-hint', box); h.hidden = !h.hidden; };
    const sb = $('.ex-sol-b', box); if (sb) sb.onclick = () => { const s = $('.ex-sol', box); s.hidden = !s.hidden; };
    $('.ex-in', box).onclick = () => { const b = $('#authBtn'); if (b) b.click(); };
    paintState(box);
    // prepara o Python em segundo plano quando o exercício aparece, para o primeiro "Testar" ser rápido
    if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); worker().catch(() => { }); } }); io.observe(box); }
  });
}
new MutationObserver(() => $$('.ex[data-id]').forEach(paintState)).observe(document.documentElement, { attributes: true, attributeFilter: ['data-signed'] });
window.EX = { bind, solved: () => Object.values(S).filter(x => x.ok).length };
})();
