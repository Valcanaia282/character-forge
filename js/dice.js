/* Character Forge — rolador de dados (d4, d6, d8, d10, d12, d20).
 * Sorteio com crypto.getRandomValues (sem viés). Guarda as preferências e o
 * histórico no navegador. Não depende do resto do app além de CF.CONTENT. */
(function () {
  const DICE = [4, 6, 8, 10, 12, 20];
  const KEY = 'cf.dice';
  const MAX_QTY = 20, MAX_HIST = 30;

  // Formas simples para cada dado (viewBox 0 0 100 100)
  const SHAPES = {
    4: '<polygon points="50,8 94,88 6,88"/>',
    6: '<rect x="12" y="12" width="76" height="76" rx="10"/>',
    8: '<polygon points="50,4 94,50 50,96 6,50"/>',
    10: '<polygon points="50,4 94,40 50,96 6,40"/>',
    12: '<polygon points="50,5 93,36 77,90 23,90 7,36"/>',
    20: '<polygon points="50,4 91,27 91,73 50,96 9,73 9,27"/>'
  };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const sign = n => (n >= 0 ? '+' : '−') + Math.abs(n);

  function load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { /* sem armazenamento */ }
    s = s && typeof s === 'object' ? s : {};
    return { qty: clampQty(s.qty), mod: clampMod(s.mod), mode: ['normal', 'adv', 'dis'].includes(s.mode) ? s.mode : 'normal', hist: Array.isArray(s.hist) ? s.hist.slice(0, MAX_HIST) : [] };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* ignora */ } }
  function clampQty(n) { n = Math.round(Number(n)); return Number.isFinite(n) ? Math.min(MAX_QTY, Math.max(1, n)) : 1; }
  function clampMod(n) { n = Math.round(Number(n)); return Number.isFinite(n) ? Math.min(30, Math.max(-30, n)) : 0; }

  /* Número inteiro uniforme entre 1 e sides */
  function rollDie(sides) {
    const buf = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / sides) * sides;
    let x;
    do { crypto.getRandomValues(buf); x = buf[0]; } while (x >= limit);
    return (x % sides) + 1;
  }

  let st = load();
  let last = null;

  /* Faz a rolagem conforme quantidade, modificador e (no d20) vantagem/desvantagem */
  function roll(sides) {
    const qty = st.qty, mod = st.mod;
    const advMode = sides === 20 && qty === 1 && st.mode !== 'normal' ? st.mode : 'normal';
    let rolls, kept, dropped = null;
    if (advMode !== 'normal') {
      const a = rollDie(20), b = rollDie(20);
      kept = advMode === 'adv' ? Math.max(a, b) : Math.min(a, b);
      rolls = [a, b];
      dropped = rolls.indexOf(kept) === 0 ? 1 : 0;
    } else {
      rolls = Array.from({ length: qty }, () => rollDie(sides));
      kept = rolls.reduce((s, n) => s + n, 0);
    }
    const total = kept + mod;
    const natural = sides === 20 && (qty === 1) ? kept : null;
    const r = {
      t: Date.now(), sides, qty, mod, mode: advMode, rolls, dropped, total,
      crit: natural === 20, fumble: natural === 1,
      max: advMode === 'normal' && rolls.every(n => n === sides) && qty > 1,
      label: (advMode === 'normal' ? qty : 1) + 'd' + sides + (mod ? ' ' + sign(mod) : '') + (advMode === 'adv' ? ' (vantagem)' : advMode === 'dis' ? ' (desvantagem)' : '')
    };
    st.hist.unshift(r);
    st.hist = st.hist.slice(0, MAX_HIST);
    last = r;
    save();
    return r;
  }

  function breakdown(r) {
    const parts = r.rolls.map((n, i) => {
      const cls = i === r.dropped ? 'drop' : r.sides === 20 && n === 20 ? 'nat20' : r.sides === 20 && n === 1 ? 'nat1' : '';
      return `<span class="die-n ${cls}">${n}</span>`;
    }).join(r.mode === 'normal' ? '<span class="op">+</span>' : '<span class="op">e</span>');
    return parts + (r.mod ? `<span class="op">${r.mod >= 0 ? '+' : '−'}</span><span class="die-n mod">${Math.abs(r.mod)}</span>` : '');
  }

  function resultHTML(r) {
    if (!r) return `<div class="dice-result empty"><p>Escolha um dado acima para rolar.</p></div>`;
    const flag = r.crit ? '<p class="dice-flag crit">20 natural! Acerto crítico</p>'
      : r.fumble ? '<p class="dice-flag fumble">1 natural… falha crítica</p>'
      : r.max ? '<p class="dice-flag crit">Tudo no máximo!</p>' : '';
    return `<div class="dice-result ${r.crit || r.max ? 'is-crit' : r.fumble ? 'is-fumble' : ''}">
      <p class="dice-label">${esc(r.label)}</p>
      <p class="dice-total" id="diceTotal">${r.total}</p>
      <p class="dice-break">${breakdown(r)}</p>
      ${flag}
    </div>`;
  }

  function histHTML() {
    if (!st.hist.length) return '<p class="muted small">Nenhuma rolagem ainda.</p>';
    return `<ol class="dice-hist">${st.hist.map(r => `<li class="${r.crit ? 'crit' : r.fumble ? 'fumble' : ''}">
      <span class="h-time">${new Date(r.t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
      <span class="h-label">${esc(r.label)}</span>
      <span class="h-rolls">[${r.rolls.map((n, i) => i === r.dropped ? `<s>${n}</s>` : n).join(', ')}]</span>
      <b class="h-total">${r.total}</b></li>`).join('')}</ol>`;
  }

  function render($app) {
    const T = CF.CONTENT && CF.CONTENT.glossary && CF.CONTENT.glossary.vantagem
      ? `<button type="button" class="term" data-term="vantagem">vantagem ou desvantagem</button>` : 'vantagem ou desvantagem';
    const advOn = st.qty === 1;
    $app.innerHTML = `<section class="page narrow dice-page">
      <p class="eyebrow">Mesa</p>
      <h1>Rolar dados</h1>
      <p class="intro">Toque num dado para rolar. Ajuste a quantidade e o bônus antes, se precisar — por exemplo, <b>2</b> dados de <b>d6</b> com <b>+3</b> para o dano de uma espada grande.</p>

      <div class="dice-controls">
        <div class="dice-ctl">
          <span id="qtyLbl">Quantidade</span>
          <div class="stepper" role="group" aria-labelledby="qtyLbl">
            <button class="btn sm" data-dice="qty" data-n="-1" aria-label="Menos um dado">−</button>
            <output id="diceQty" aria-live="polite">${st.qty}</output>
            <button class="btn sm" data-dice="qty" data-n="1" aria-label="Mais um dado">+</button>
          </div>
        </div>
        <div class="dice-ctl">
          <span id="modLbl">Bônus</span>
          <div class="stepper" role="group" aria-labelledby="modLbl">
            <button class="btn sm" data-dice="mod" data-n="-1" aria-label="Diminuir bônus">−</button>
            <output id="diceMod" aria-live="polite">${sign(st.mod)}</output>
            <button class="btn sm" data-dice="mod" data-n="1" aria-label="Aumentar bônus">+</button>
          </div>
        </div>
        <div class="dice-ctl">
          <span id="modeLbl">d20 com ${T}</span>
          <div class="dice-mode" role="radiogroup" aria-labelledby="modeLbl">
            ${[['normal', 'Normal'], ['adv', 'Vantagem'], ['dis', 'Desvantagem']].map(([k, l]) => `<button class="${st.mode === k ? 'on' : ''}" role="radio" aria-checked="${st.mode === k}" data-dice="mode" data-k="${k}" ${!advOn && k !== 'normal' ? 'disabled title="Só vale para 1 dado"' : ''}>${l}</button>`).join('')}
          </div>
        </div>
        <button class="btn sm ghost dice-reset" data-dice="reset">Zerar ajustes</button>
      </div>

      <div class="dice-grid">${DICE.map(s => `<button class="die-btn" data-dice="roll" data-s="${s}" aria-label="Rolar ${st.qty > 1 ? st.qty + ' ' : ''}d${s}">
        <svg viewBox="0 0 100 100" aria-hidden="true">${SHAPES[s]}</svg><span>d${s}</span></button>`).join('')}</div>

      <div id="diceOut" aria-live="polite">${resultHTML(last)}</div>

      <div class="dice-hist-box">
        <div class="dice-hist-head"><h2>Últimas rolagens</h2>${st.hist.length ? '<button class="btn sm ghost" data-dice="clear">Limpar</button>' : ''}</div>
        <div id="diceHist">${histHTML()}</div>
      </div>
    </section>`;
  }

  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showRoll(r) {
    const out = document.getElementById('diceOut');
    out.innerHTML = resultHTML(r);
    document.getElementById('diceHist').innerHTML = histHTML();
    const head = document.querySelector('.dice-hist-head');
    if (head && !head.querySelector('[data-dice="clear"]')) head.insertAdjacentHTML('beforeend', '<button class="btn sm ghost" data-dice="clear">Limpar</button>');
    if (reduceMotion()) return;
    // “Embaralha” o número por um instante antes de mostrar o resultado
    const el = document.getElementById('diceTotal');
    const lo = r.qty + r.mod, hi = r.qty * r.sides + r.mod;
    let n = 0;
    out.firstElementChild.classList.add('rolling');
    const iv = setInterval(() => {
      el.textContent = lo + Math.floor(Math.random() * (hi - lo + 1));
      if (++n >= 8) { clearInterval(iv); el.textContent = r.total; out.firstElementChild.classList.remove('rolling'); }
    }, 45);
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-dice]');
    if (!b || b.disabled || !b.closest('.dice-page')) return;
    const kind = b.dataset.dice;
    if (kind === 'roll') { showRoll(roll(Number(b.dataset.s))); return; }
    if (kind === 'qty') st.qty = clampQty(st.qty + Number(b.dataset.n));
    if (kind === 'mod') st.mod = clampMod(st.mod + Number(b.dataset.n));
    if (kind === 'mode') st.mode = b.dataset.k;
    if (kind === 'reset') { st.qty = 1; st.mod = 0; st.mode = 'normal'; }
    if (kind === 'clear') { st.hist = []; last = null; }
    if (st.qty > 1 && st.mode !== 'normal') st.mode = 'normal';
    save();
    const focus = `[data-dice="${kind}"]${b.dataset.n ? `[data-n="${b.dataset.n}"]` : ''}${b.dataset.k ? `[data-k="${b.dataset.k}"]` : ''}`;
    render(document.getElementById('app'));
    const f = document.querySelector(focus);
    if (f) f.focus();
  });

  window.CF = window.CF || {};
  CF.dice = { render, rollDie };
})();
