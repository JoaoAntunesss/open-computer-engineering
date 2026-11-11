/* Conta Google opcional: guarda o progresso e o plano de estudo na cloud (Firestore) e sincroniza entre aparelhos.
   Sem sessão iniciada nada muda: tudo continua no localStorage. */
const cfg = window.EIA_FIREBASE;
const btn = document.getElementById('authBtn');
const KEYS = ['eia.progress', 'eia.plan'];
const pt = () => (document.documentElement.lang || 'pt').startsWith('pt');
const get = k => { try { const v = localStorage.getItem(k); return v == null ? null : JSON.parse(v); } catch (e) { return null; } };
const put = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };

if (cfg && btn && location.protocol !== 'file:') start().catch(e => console.warn('[sync]', e));

async function start() {
  const V = 'https://www.gstatic.com/firebasejs/11.0.2/';
  const [{ initializeApp }, A, F] = await Promise.all([import(V + 'firebase-app.js'), import(V + 'firebase-auth.js'), import(V + 'firebase-firestore.js')]);
  const app = initializeApp(cfg), auth = A.getAuth(app), db = F.getFirestore(app);
  let user = null, ref = null, unsub = null, timer = 0, applying = false, lastSent = '';

  const label = () => {
    btn.hidden = false;
    if (user) {
      btn.title = (pt() ? 'Sessão iniciada como ' : 'Signed in as ') + (user.email || '') + (pt() ? '. Carrega para sair.' : '. Click to sign out.');
      btn.innerHTML = user.photoURL ? `<img src="${user.photoURL}" alt="" referrerpolicy="no-referrer">` : (pt() ? 'Sair' : 'Sign out');
      btn.setAttribute('aria-label', pt() ? 'Sair da conta Google' : 'Sign out of Google');
    } else {
      btn.textContent = pt() ? 'Entrar' : 'Sign in'; btn.removeAttribute('data-sync');
      btn.title = pt() ? 'Entra com a conta Google para guardares o progresso em todos os aparelhos' : 'Sign in with Google to keep your progress on every device';
      btn.setAttribute('aria-label', btn.title);
    }
  };
  new MutationObserver(label).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  btn.onclick = async () => {
    if (user) { if (confirm(pt() ? 'Sair da conta? O progresso fica guardado na conta e neste browser.' : 'Sign out? Your progress stays in your account and in this browser.')) await A.signOut(auth); return; }
    const prov = new A.GoogleAuthProvider();
    try { await A.signInWithPopup(auth, prov); }
    catch (e) { if (/popup-blocked|operation-not-supported/.test(e.code || '')) await A.signInWithRedirect(auth, prov); else if (!/popup-closed|cancelled-popup/.test(e.code || '')) alert((pt() ? 'Não foi possível entrar: ' : 'Could not sign in: ') + (e.code || e.message)); }
  };

  // Ao entrar: junta o que está neste browser com o que está na conta (nada se perde). Depois, a conta manda.
  const mergeProgress = (a, b) => {
    const out = {}; for (const id of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
      const x = (a || {})[id] || {}, y = (b || {})[id] || {};
      out[id] = { t: [...new Set([...(x.t || []), ...(y.t || [])])], k: [...new Set([...(x.k || []), ...(y.k || [])])] };
    } return out;
  };
  const snapshot = () => ({ progress: get('eia.progress') || {}, plan: get('eia.plan'), planTs: get('eia.planTs') || 0 });
  const send = () => {
    if (!ref) return; const d = snapshot(), j = JSON.stringify(d); if (j === lastSent) return; lastSent = j;
    F.setDoc(ref, { ...d, plan: d.plan == null ? null : JSON.stringify(d.plan), updated: F.serverTimestamp() })
      .then(() => btn.removeAttribute('data-sync')).catch(e => { btn.dataset.sync = 'err'; lastSent = ''; console.warn('[sync]', e); });
  };
  const apply = d => {
    applying = true;
    put('eia.progress', d.progress || {});
    put('eia.plan', d.plan ? JSON.parse(d.plan) : null); put('eia.planTs', d.planTs || 0);
    applying = false; lastSent = JSON.stringify(snapshot());
    document.dispatchEvent(new Event('eia:remote'));
  };

  document.addEventListener('eia:saved', e => {
    if (applying || !KEYS.includes(e.detail)) return;
    if (e.detail === 'eia.plan') put('eia.planTs', Date.now());
    clearTimeout(timer); timer = setTimeout(send, 800);
  });
  addEventListener('pagehide', () => { if (timer) { clearTimeout(timer); send(); } });

  A.onAuthStateChanged(auth, async u => {
    user = u; if (unsub) { unsub(); unsub = null; } ref = null; label();
    if (!u) return;
    ref = F.doc(db, 'eia_users', u.uid);
    try {
      const s = await F.getDoc(ref), r = s.exists() ? s.data() : {}, l = snapshot();
      const remotePlanTs = r.planTs || 0;
      const plan = l.plan && (!r.plan || l.planTs >= remotePlanTs) ? JSON.stringify(l.plan) : (r.plan || null);
      apply({ progress: mergeProgress(l.progress, r.progress), plan, planTs: Math.max(l.planTs, remotePlanTs) });
      lastSent = ''; send();
      unsub = F.onSnapshot(ref, s2 => { if (s2.metadata.hasPendingWrites || !s2.exists()) return; const d = s2.data(); const j = JSON.stringify({ progress: d.progress || {}, plan: d.plan ? JSON.parse(d.plan) : null, planTs: d.planTs || 0 }); if (j !== lastSent) apply(d); });
    } catch (e) { btn.dataset.sync = 'err'; console.warn('[sync]', e); }
  });
}
