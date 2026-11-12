/* Character Forge — Mesa ao vivo (Firebase).
 * O mestre cria uma mesa e manda o link de convite; cada jogador conecta o seu
 * personagem e, a partir daí, toda alteração salva na ficha é enviada para a mesa.
 * A aba Grupo do mestre escuta a mesa e se atualiza sozinha.
 * O SDK do Firebase só é carregado quando a mesa é usada. */
(function () {
  const CONFIG = {
    apiKey: 'AIzaSyDkgZDVvf6077KOF4eixCoSZ1Grxlw6YH4',
    authDomain: 'character-forge-935b0.firebaseapp.com',
    projectId: 'character-forge-935b0',
    storageBucket: 'character-forge-935b0.firebasestorage.app',
    messagingSenderId: '915985955745',
    appId: '1:915985955745:web:acbe62a6ce10a6789e69e0'
  };
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const FILES = ['firebase-app-compat.js', 'firebase-auth-compat.js', 'firebase-firestore-compat.js'];

  let ready = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.async = false;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Não foi possível carregar ' + src));
      document.head.appendChild(s);
    });
  }

  /* Carrega o SDK, inicializa e faz login anônimo (uma vez por navegador). */
  function ensure() {
    if (ready) return ready;
    ready = (async () => {
      if (!window.firebase || !firebase.firestore) {
        for (const f of FILES) await loadScript(SDK + f);
      }
      const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(CONFIG);
      const auth = app.auth();
      const user = auth.currentUser || await new Promise((resolve, reject) => {
        const off = auth.onAuthStateChanged(u => {
          if (u) { off(); resolve(u); }
          else auth.signInAnonymously().catch(e => { off(); reject(e); });
        });
      });
      return { db: app.firestore(), uid: user.uid };
    })();
    ready.catch(() => { ready = null; });
    return ready;
  }

  const newId = () => {
    const a = 'abcdefghijkmnpqrstuvwxyz23456789';
    const r = crypto.getRandomValues(new Uint8Array(12));
    return Array.from(r, b => a[b % a.length]).join('');
  };
  const clean = s => String(s || '').trim();

  /* Mesa (mestre) */
  async function createMesa(name) {
    const { db, uid } = await ensure();
    const id = newId();
    await db.collection('mesas').doc(id).set({ name: clean(name).slice(0, 80) || 'Minha campanha', owner: uid, createdAt: Date.now() });
    return id;
  }
  async function getMesa(id) {
    const { db, uid } = await ensure();
    const snap = await db.collection('mesas').doc(id).get();
    if (!snap.exists) return null;
    const d = snap.data();
    return { id, name: d.name, mine: d.owner === uid };
  }
  async function renameMesa(id, name) {
    const { db, uid } = await ensure();
    const ref = db.collection('mesas').doc(id);
    const snap = await ref.get();
    if (!snap.exists || snap.data().owner !== uid) return false;
    await ref.set({ name: clean(name).slice(0, 80) || 'Minha campanha', owner: uid, createdAt: snap.data().createdAt });
    return true;
  }

  /* Escuta as fichas da mesa; cb recebe a lista atual a cada mudança. */
  function watch(mesaId, cb, onError) {
    let off = null, stopped = false;
    ensure().then(({ db }) => {
      if (stopped) return;
      off = db.collection('mesas').doc(mesaId).collection('fichas').onSnapshot(qs => {
        const list = [];
        qs.forEach(doc => {
          const d = doc.data();
          let data = null;
          try { data = JSON.parse(d.data); } catch (e) { /* ignora ficha corrompida */ }
          if (data) list.push({ ficha: doc.id, name: d.name, updatedAt: d.updatedAt, data, pending: doc.metadata.hasPendingWrites });
        });
        cb(list);
      }, err => { if (onError) onError(err); });
    }).catch(err => { if (onError) onError(err); });
    return () => { stopped = true; if (off) off(); };
  }

  async function removeFicha(mesaId, fichaId) {
    const { db } = await ensure();
    await db.collection('mesas').doc(mesaId).collection('fichas').doc(fichaId).delete();
  }

  /* Ficha (jogador) */
  function payload(c) {
    const copy = JSON.parse(JSON.stringify(c));
    delete copy.live;
    return copy;
  }
  async function publish(mesaId, c) {
    const { db, uid } = await ensure();
    const fichaId = uid + '_' + c.id;
    await db.collection('mesas').doc(mesaId).collection('fichas').doc(fichaId).set({
      owner: uid,
      name: clean(c.name).slice(0, 120) || 'Sem nome',
      data: JSON.stringify(payload(c)),
      updatedAt: Date.now()
    });
    return fichaId;
  }

  /* Envio automático com atraso curto: junta várias edições seguidas num envio só. */
  const timers = {}, last = {};
  let statusCb = null;
  function onStatus(fn) { statusCb = fn; }
  function emit(c, state, err) { if (statusCb) statusCb(c, state, err); }

  function schedule(c, delay) {
    if (!c || !Array.isArray(c.live) || !c.live.length) return;
    clearTimeout(timers[c.id]);
    timers[c.id] = setTimeout(() => flush(c), delay == null ? 1200 : delay);
  }
  async function flush(c) {
    const json = JSON.stringify(payload(c));
    const links = (c.live || []).filter(l => last[c.id + '|' + l.mesa] !== json);
    if (!links.length) return;
    emit(c, 'sending');
    try {
      for (const l of links) {
        l.ficha = await publish(l.mesa, c);
        l.sentAt = Date.now();
        last[c.id + '|' + l.mesa] = json;
      }
      emit(c, 'sent');
    } catch (e) {
      emit(c, 'error', e);
    }
  }
  window.addEventListener('online', () => { Object.keys(timers).forEach(k => clearTimeout(timers[k])); if (CF.live.retry) CF.live.retry(); });

  function inviteLink(mesaId) {
    return location.origin + location.pathname.replace(/index\.html$/, '') + '#/mesa/' + mesaId;
  }
  function parseInvite(text) {
    const m = String(text || '').match(/mesa\/([a-z0-9]{8,32})/i) || String(text || '').trim().match(/^([a-z0-9]{8,32})$/i);
    return m ? m[1] : null;
  }

  window.CF = window.CF || {};
  CF.live = { ensure, createMesa, getMesa, renameMesa, watch, removeFicha, publish, schedule, flush, onStatus, inviteLink, parseInvite, retry: null };
})();
