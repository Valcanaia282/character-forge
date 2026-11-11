/* Character Forge — interface. Depende de CF.RULES, CF.CONTENT e CF.engine. */
(function () {
  const R = CF.RULES, C = CF.CONTENT, E = CF.engine;
  const $app = document.getElementById('app');

  /* ================================================================ Utilidades */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const sign = E.sign;
  const T = (key, label) => `<button type="button" class="term" data-term="${key}">${esc(label || C.glossary[key].t)}</button>`;
  const stars = n => '<span class="diff" aria-label="Dificuldade ' + n + ' de 3">' + '●'.repeat(n) + '<span class="off">' + '●'.repeat(3 - n) + '</span></span>';
  const diffLabel = n => ['', 'Fácil', 'Médio', 'Desafiador'][n];
  const meters = v => String(v).replace('.', ',') + ' m';
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const lcFirst = s => s ? s.charAt(0).toLowerCase() + s.slice(1) : s;

  function load(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  function store(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; } }

  function encodeShare(obj) { return 'CF1:' + btoa(unescape(encodeURIComponent(JSON.stringify(obj)))); }
  function decodeShare(code) {
    code = (code || '').trim();
    if (code.startsWith('{')) return JSON.parse(code);
    if (!code.startsWith('CF1:')) throw new Error('Código inválido');
    return JSON.parse(decodeURIComponent(escape(atob(code.slice(4)))));
  }
  function download(filename, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); toast('Copiado! Agora é só colar no WhatsApp/Discord.'); }
    catch (e) { prompt('Copie o código abaixo:', text); }
  }
  let toastTimer;
  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ==================================================================== Estado */
  let chars = load('cf.chars', {});
  let currentId = load('cf.current', null);
  let party = load('cf.party', { name: 'Minha campanha', members: [], bonds: [] });
  let quiz = { i: 0, scores: {}, done: false };
  let tut = null;
  let trail = { cls: 'fighter', sub: '' };
  const P = CF.PATHS;

  function migrate(c) {
    const base = E.newCharacter();
    const out = Object.assign({}, base, c);
    out.choices = Object.assign({}, base.choices, c.choices || {});
    out.abilities = Object.assign({}, base.abilities, c.abilities || {});
    out.equipment = Object.assign({}, base.equipment, c.equipment || {});
    out.story = Object.assign({}, base.story, c.story || {});
    out.sheet = Object.assign(E.defaultSheet(), c.sheet || {});
    return out;
  }
  Object.keys(chars).forEach(id => { chars[id] = migrate(chars[id]); });

  function cur() { return chars[currentId]; }
  function saveChars() {
    const ok = store('cf.chars', chars) && store('cf.current', currentId);
    const s = document.getElementById('saveStatus');
    if (s) s.textContent = ok ? 'Salvo automaticamente ✓' : 'Não foi possível salvar neste navegador';
  }
  function touch() { const c = cur(); if (c) c.updatedAt = Date.now(); saveChars(); }
  function newChar(preset) {
    const c = E.newCharacter();
    Object.assign(c, preset || {});
    chars[c.id] = c; currentId = c.id; saveChars();
    return c;
  }
  function saveParty() { store('cf.party', party); }

  function setPath(obj, path, value) {
    const parts = path.split('.');
    let o = obj;
    for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
    o[parts[parts.length - 1]] = value;
  }
  function getPath(obj, path) { return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj); }

  /* ================================================================== Etapas */
  const STEPS = [
    { id: 'conceito', title: 'Conceito', icon: '💡' },
    { id: 'classe', title: 'Classe', icon: '⚔️' },
    { id: 'especie', title: 'Espécie', icon: '🧝' },
    { id: 'antecedente', title: 'Antecedente', icon: '📖' },
    { id: 'atributos', title: 'Atributos', icon: '🎲' },
    { id: 'habilidades', title: 'Perícias e magias', icon: '✨' },
    { id: 'equipamento', title: 'Equipamento', icon: '🎒' },
    { id: 'historia', title: 'História', icon: '🖋️' },
    { id: 'revisao', title: 'Revisão', icon: '✅' },
    { id: 'ficha', title: 'Ficha final', icon: '📜' }
  ];

  /* ================================================================ Roteador */
  function route() { return (location.hash.replace(/^#\/?/, '') || '').split('/'); }
  function go(path) { location.hash = '#/' + path; }
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

  function render() {
    const [r, arg] = route();
    document.querySelectorAll('.nav a').forEach(a => a.setAttribute('aria-current', a.dataset.route === (r || 'inicio') ? 'page' : 'false'));
    switch (r) {
      case 'criar': return renderCreator(true);
      case 'personagens': return renderList();
      case 'ficha': return renderLive(arg);
      case 'quiz': return renderQuiz();
      case 'trilhas': return renderTrails();
      case 'grupo': return renderParty();
      case 'tutorial': return renderTutorial();
      case 'glossario': return renderGlossary();
      default: return renderHome();
    }
  }

  /* ==================================================================== Início */
  function renderHome() {
    const c = cur();
    const list = Object.values(chars);
    $app.innerHTML = `
    <section class="hero">
      <p class="eyebrow">Assistente de criação de personagens • D&amp;D 5e</p>
      <h1>Forje seu primeiro herói</h1>
      <p class="lead">Nunca jogou D&amp;D? Sem problema. O Character Forge pergunta o que você quer jogar, explica cada escolha com palavras simples e faz todas as contas da ficha para você.</p>
      <div class="hero-actions">
        <button class="btn primary big" data-action="new-char">Criar meu personagem</button>
        ${c ? `<button class="btn big" data-action="continue">Continuar “${esc(c.name || 'sem nome')}”</button>` : ''}
        <a class="btn ghost big" href="#/quiz">Não sei o que jogar</a>
      </div>
    </section>
    <section class="home-grid">
      <a class="home-card" href="#/quiz"><span class="hc-icon">🧭</span><h2>Descubra seu aventureiro</h2><p>5 perguntas rápidas e recomendamos as classes que combinam com você.</p></a>
      <a class="home-card" href="#/trilhas"><span class="hc-icon">🗺️</span><h2>Trilhas até o nível 12</h2><p>Veja todos os caminhos (subclasses) de cada classe e o que você ganha a cada nível.</p></a>
      <a class="home-card" href="#/tutorial"><span class="hc-icon">🗡️</span><h2>Tutorial de combate</h2><p>Enfrente um goblin e aprenda turnos, ataques, CA e dano na prática.</p></a>
      <a class="home-card" href="#/grupo"><span class="hc-icon">🏰</span><h2>Montar o grupo</h2><p>Para o mestre: reúna as fichas dos amigos e crie vínculos entre os personagens.</p></a>
      <a class="home-card" href="#/glossario"><span class="hc-icon">📚</span><h2>Glossário</h2><p>CA, PV, vantagem, truque… tudo explicado sem complicação.</p></a>
    </section>
    <section class="how">
      <h2>Como funciona</h2>
      <ol class="how-steps">
        ${STEPS.map(s => `<li><span>${s.icon}</span>${s.title}</li>`).join('')}
      </ol>
      <p class="muted">Seu progresso fica salvo neste navegador${list.length ? ` (${list.length} personagem${list.length > 1 ? 's' : ''} salvo${list.length > 1 ? 's' : ''})` : ''}. No final você imprime ou salva a ficha em PDF e manda para o mestre.</p>
    </section>`;
  }

  /* ================================================================== Criador */
  function renderCreator(full) {
    let c = cur();
    if (!c) c = newChar();
    if (full || !document.getElementById('forge')) {
      $app.innerHTML = `<div class="forge" id="forge">
        <nav class="stepper" id="stepper" aria-label="Etapas da criação"></nav>
        <section class="panel" id="panel" aria-live="polite"></section>
        <aside class="preview" id="preview" aria-label="Pré-visualização da ficha"></aside>
      </div>`;
    }
    renderStepper(c); renderPanel(c); renderPreview(c);
  }

  function renderStepper(c) {
    const issues = E.validate(c);
    const errSteps = new Set(issues.filter(i => i.level === 'error').map(i => i.step));
    const pct = Math.round((c.step / (STEPS.length - 1)) * 100);
    document.getElementById('stepper').innerHTML = `
      <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Progresso"><span style="width:${pct}%"></span></div>
      <ol>${STEPS.map((s, i) => {
        const state = i === c.step ? 'current' : (i < c.step ? (errSteps.has(i) ? 'error' : 'done') : '');
        return `<li><button class="step ${state}" data-action="goto-step" data-id="${i}" ${i === c.step ? 'aria-current="step"' : ''}>
          <span class="step-n">${state === 'done' ? '✓' : state === 'error' ? '!' : i + 1}</span><span class="step-t">${s.title}</span></button></li>`;
      }).join('')}</ol>
      <p class="save-status" id="saveStatus">Salvo automaticamente ✓</p>`;
  }

  function renderPanel(c) {
    const s = STEPS[c.step];
    const fns = [stepConcept, stepClass, stepRace, stepBackground, stepAbilities, stepFeatures, stepEquipment, stepStory, stepReview, stepSheet];
    const prev = c.step > 0 ? `<button class="btn" data-action="prev">← ${STEPS[c.step - 1].title}</button>` : '<span></span>';
    const next = c.step < STEPS.length - 1 ? `<button class="btn primary" data-action="next">${STEPS[c.step + 1].title} →</button>` : '';
    const stepIssues = E.validate(c).filter(i => i.step === c.step && c.step < 8);
    document.getElementById('panel').innerHTML = `
      <header class="panel-head">
        <p class="eyebrow">Etapa ${c.step + 1} de ${STEPS.length}</p>
        <h2 tabindex="-1" id="stepTitle">${s.icon} ${s.title}</h2>
      </header>
      <div class="panel-body">${fns[c.step](c)}</div>
      ${stepIssues.length ? `<div class="issues small">${stepIssues.map(i => `<p class="${i.level}">${i.level === 'error' ? '⚠️' : 'ℹ️'} ${esc(i.msg)}</p>`).join('')}</div>` : ''}
      <footer class="panel-foot">${prev}${next}</footer>`;
  }

  function rerender(focusSel) {
    const c = cur();
    renderStepper(c); renderPanel(c); renderPreview(c);
    if (focusSel) { const el = document.querySelector(focusSel); if (el) el.focus({ preventScroll: true }); }
  }

  /* ----------------------------------------------------------------- Etapa 1 */
  function stepConcept(c) {
    const concept = C.concepts.find(x => x.id === c.concept);
    return `
    <p class="intro">Antes de pensar em regras, pense em <strong>quem</strong> você quer ser. Escolha a fantasia que mais te anima — vamos sugerir classes que combinam.</p>
    <div class="field-row">
      <label class="field"><span>Nome do personagem *</span><input type="text" data-bind="name" value="${esc(c.name)}" placeholder="Ex.: Lyra Ventoleve" maxlength="60" autocomplete="off"></label>
      <label class="field"><span>Seu nome (jogador)</span><input type="text" data-bind="player" value="${esc(c.player)}" placeholder="Ex.: Ana" maxlength="40" autocomplete="off"></label>
    </div>
    <h3>Qual fantasia combina com você?</h3>
    <div class="cards cards-4">
      ${C.concepts.map(k => `<button class="card ${c.concept === k.id ? 'selected' : ''}" data-action="set-concept" data-id="${k.id}" aria-pressed="${c.concept === k.id}">
        <span class="card-icon" aria-hidden="true">${k.icon}</span><strong>${k.name}</strong><span>${k.desc}</span></button>`).join('')}
    </div>
    ${concept ? `<div class="callout"><strong>Classes que combinam com “${concept.name}”:</strong> ${concept.classes.map(id => R.classes[id].name).join(', ')}. Você verá essas sugestões destacadas na próxima etapa.</div>` : ''}
    <p class="muted">Ainda em dúvida? Faça o <a href="#/quiz">quiz “Descubra seu aventureiro”</a>.</p>`;
  }

  /* ----------------------------------------------------------------- Etapa 2 */
  function stepClass(c) {
    const rec = (C.concepts.find(x => x.id === c.concept) || { classes: [] }).classes;
    const ids = Object.keys(R.classes).sort((a, b) => (rec.includes(b) - rec.includes(a)) || (R.classes[a].difficulty - R.classes[b].difficulty));
    const cls = R.classes[c.classId];
    return `
    <p class="intro">A <strong>classe</strong> é a “profissão” do aventureiro: define como você luta, que magias usa e no que é bom. Os pontinhos mostram a ${'dificuldade para iniciantes'}.</p>
    <div class="cards cards-3">
      ${ids.map(id => { const k = R.classes[id]; return `<button class="card ${c.classId === id ? 'selected' : ''}" data-action="set-class" data-id="${id}" aria-pressed="${c.classId === id}">
        ${rec.includes(id) ? '<span class="badge">Combina com seu conceito</span>' : ''}
        <strong>${k.name}</strong><span>${k.tagline}</span>
        <span class="card-meta">${stars(k.difficulty)} ${diffLabel(k.difficulty)} · ${k.role}</span></button>`; }).join('')}
    </div>
    ${cls ? `<article class="detail">
      <h3>${cls.name}</h3>
      <dl class="facts">
        <div><dt>Atributo principal</dt><dd>${cls.primary.map(E.abName).join(' e ')}</dd></div>
        <div><dt>${T('dadodevida', 'Dado de Vida')}</dt><dd>d${cls.hitDie} (PV no 1º nível: ${cls.hitDie} + Constituição)</dd></div>
        <div><dt>${T('resistencia', 'Resistências')}</dt><dd>${cls.saves.map(E.abName).join(', ')}</dd></div>
        <div><dt>Armaduras</dt><dd>${cls.armor.length ? cls.armor.map(a => ({ light: 'leves', medium: 'médias', heavy: 'pesadas', shield: 'escudos' }[a])).join(', ') : 'nenhuma'}${cls.subclass && cls.subclass.bonusArmor ? ' (+ pesadas pelo domínio)' : ''}</dd></div>
        <div><dt>Função no grupo</dt><dd>${cls.role}</dd></div>
      </dl>
      <p><strong>Como funciona:</strong> ${cls.howItWorks}</p>
      <p class="example"><strong>Exemplo de turno:</strong> ${cls.exampleTurn}</p>
      <details><summary>Habilidades de 1º nível</summary><ul class="feat-list">${cls.features.filter(f => !f.sub || f.sub === c.choices.subclass).map(f => `<li><strong>${f.name}.</strong> ${f.desc}</li>`).join('')}</ul></details>
    </article>
    ${pathSection(c.classId, c.choices.subclass, true)}
    ${CF.sheetTab && P.classes[c.classId] && P.classes[c.classId].pickLevel === 1 && c.choices.subclass ? (h => (h ? `<section class="paths"><h3>Escolhas de 1º nível do caminho</h3>${h}</section>` : ''))(CF.sheetTab.picksHTML(CF.ui, c, E.derive(c), { maxLvl: 1, src: 'sub', bare: true })) : ''}` : ''}`;
  }

  /* --------------------------------------------------------------- Caminhos */
  const srcBadge = o => `<span class="src src-${o.src}" title="${esc(P.sources[o.src].name)}">${P.sources[o.src].short} p. ${o.page}</span>`;
  function pathCard(o, on, action) {
    return `<button class="card path ${on ? 'selected' : ''}" data-action="${action}" data-id="${o.id}" aria-pressed="${on}">
      <span class="path-badges">${srcBadge(o)}${o.beginner ? '<span class="badge">bom para iniciantes</span>' : ''}${o.srd || o.auto ? '<span class="badge calc">⚙️ automático na ficha</span>' : ''}${o.bg3 ? '<span class="badge bg3" title="Também existe no Baldur\'s Gate 3: trilha com escolhas por nível">🎮 BG3</span>' : ''}</span>
      <strong>${esc(o.name)}</strong><span>${esc(o.pitch)}</span>
      <span class="path-rumo"><b>Até o nível 12:</b> ${esc(o.rumo)}</span>
      <span class="card-meta">${o.roles.map(r => P.roleNames[r]).join(' · ')}</span></button>`;
  }
  function trackHTML(classId, subId, compact) {
    const tr = P.track(classId, subId);
    return `<ol class="track ${compact ? 'compact' : ''}">${tr.map(r => `<li class="${r.key ? 'key' : ''}"><span class="lv">Nv ${r.lv}</span><ul>${r.items.map(i => `<li class="k-${i.k}">${esc(i.t)}</li>`).join('')}</ul></li>`).join('')}</ol>`;
  }
  function pathSection(classId, subId, inCreator) {
    const pc = P.classes[classId], cls = R.classes[classId];
    if (!pc) return '';
    const sub = pc.options.find(o => o.id === subId);
    const term = pc.term.toLowerCase();
    const intro = pc.pickLevel === 1
      ? `O ${cls.name} escolhe o ${term} <strong>já no 1º nível</strong>${inCreator ? ' — escolha agora:' : '.'}`
      : `O ${cls.name} escolhe o ${term} no <strong>${pc.pickLevel}º nível</strong>.${inCreator ? ' Você já pode marcar o caminho que pretende seguir: ele aparece na ficha como <em>planejado</em>, e o mestre fica sabendo para onde o personagem vai.' : ''}`;
    const sorted = pc.options.slice().sort((a, b) => ((b.srd || b.auto) ? 1 : 0) - ((a.srd || a.auto) ? 1 : 0) || (a.src === b.src ? 0 : a.src === 'ldj' ? -1 : 1));
    return `<section class="paths">
      <h3>🗺️ Caminhos do ${cls.name}: ${pc.term}</h3>
      <p>${intro} As habilidades do caminho chegam nos níveis <strong>${pc.featureLevels.join(', ')}</strong> (campanha até o nível ${P.levelCap}).</p>
      ${pc.note ? `<div class="callout small">${esc(pc.note)}</div>` : ''}
      <div class="cards cards-3">${sorted.map(o => pathCard(o, o.id === subId, inCreator ? 'set-subclass' : 'trail-sub')).join('')}</div>
      <p class="muted small">Resumos próprios para ajudar na escolha. As regras completas estão no livro e na página indicados (LdJ = Livro do Jogador; Xanathar = Guia de Xanathar para Todas as Coisas). Caminhos com ⚙️ têm a trilha automática na ficha (no modelo do Baldur's Gate 3: você faz as escolhas de cada nível e a ficha aplica os efeitos); nos demais, a ficha indica a página do livro.</p>
      <details class="track-wrap" ${sub || !inCreator ? 'open' : ''}><summary>Sua trilha do nível 1 ao ${P.levelCap}${sub ? ' — ' + esc(sub.name) : ''}</summary>${trackHTML(classId, subId)}</details>
    </section>`;
  }

  function renderTrails() {
    const pc = P.classes[trail.cls], cls = R.classes[trail.cls];
    $app.innerHTML = `<section class="page">
      <p class="eyebrow">Trilhas até o nível ${P.levelCap}</p><h1>Para onde cada classe vai</h1>
      <p class="intro">Escolha uma classe para ver os caminhos (subclasses) do Livro do Jogador e do Guia de Xanathar e o que o personagem ganha a cada nível. Clique num caminho para destacá-lo na trilha.</p>
      <div class="chips class-pills" role="tablist">${Object.keys(R.classes).map(id => `<button role="tab" class="chip ${trail.cls === id ? 'on' : ''}" aria-selected="${trail.cls === id}" data-action="trail-class" data-id="${id}">${R.classes[id].name}</button>`).join('')}</div>
      <article class="detail"><h2>${cls.name}</h2><p>${cls.tagline}</p><p class="muted">${stars(cls.difficulty)} ${diffLabel(cls.difficulty)} · ${cls.role} · escolhe o caminho no ${pc.pickLevel}º nível</p></article>
      ${pathSection(trail.cls, trail.sub, false)}
      <div class="sheet-actions"><button class="btn primary" data-action="trail-create">Criar um ${cls.name}${trail.sub ? ' (' + esc(pc.options.find(o => o.id === trail.sub).name) + ')' : ''}</button></div>
    </section>`;
  }

  /* ----------------------------------------------------------------- Etapa 3 */
  function langSelect(arrPath, idx, c, exclude) {
    const val = (getPath(c, arrPath) || [])[idx] || '';
    return `<select data-arr="${arrPath}" data-idx="${idx}" aria-label="Idioma extra ${idx + 1}">
      <option value="">— escolha um idioma —</option>
      ${R.languages.filter(l => l === val || !exclude.includes(l)).map(l => `<option ${l === val ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  }
  function knownLanguages(c) { return E.proficiencies(c).languages; }
  /** Chips de idiomas recomendados; clicar preenche o primeiro campo vazio da lista indicada. */
  function langRecs(c, arrPath, slots) {
    if (!CF.recommend || !slots) return '';
    const recs = CF.recommend.languages(c, knownLanguages(c));
    if (!recs.length) return '';
    return `<div class="rec">💡 <b>Idiomas recomendados:</b> <span class="chips small">${recs.map(r => `<button class="chip" data-action="lang-rec" data-id="${esc(r.lang)}" data-arr="${arrPath}" data-slots="${slots}" title="${esc(r.why)}">${esc(r.lang)} <small>· ${esc(r.why)}</small></button>`).join('')}</span></div>`;
  }
  /** Select de ferramentas com as recomendadas no topo (★). */
  function toolSelect(arrPath, idx, c, list, label, taken) {
    const val = ((getPath(c, arrPath) || [])[idx]) || '';
    const rec = CF.recommend ? CF.recommend.tools(c) : new Map();
    const avail = list.filter(t => t === val || !taken.includes(t));
    const top = avail.filter(t => rec.has(t)), rest = avail.filter(t => !rec.has(t));
    return `<select data-arr="${arrPath}" data-idx="${idx}" aria-label="${esc(label)} ${idx + 1}"><option value="">— ${esc(label.toLowerCase())} —</option>
      ${top.length ? `<optgroup label="Recomendadas para você">${top.map(t => `<option value="${esc(t)}" ${t === val ? 'selected' : ''}>★ ${esc(t)} — ${esc(rec.get(t))}</option>`).join('')}</optgroup>` : ''}
      <optgroup label="Todas">${rest.map(t => `<option value="${esc(t)}" ${t === val ? 'selected' : ''}>${esc(t)}</option>`).join('')}</optgroup></select>`;
  }

  function stepRace(c) {
    const race = R.races[c.raceId];
    const asiTxt = r => [Object.entries(r.asi).map(([k, v]) => `${R.abilities.find(a => a.id === k).short} +${v}`).join(', '), r.asiChoice ? '+1 em dois à escolha' : ''].filter(Boolean).join(', ');
    const srcTag = r => r.src === 'ldj' ? `<span class="src src-ldj" title="Livro do Jogador">LdJ p. ${r.page}</span>` : '<span class="src src-srd" title="Regras abertas (SRD)">SRD</span>';
    let extra = '';
    if (race) {
      const parts = [];
      if (race.asiChoice) {
        parts.push(`<h4>Escolha ${race.asiChoice.count} atributos para +${race.asiChoice.amount}</h4><div class="chips">${R.abilities.filter(a => !race.asiChoice.exclude.includes(a.id)).map(a => {
          const on = c.choices.halfElfAsi.includes(a.id);
          const dis = !on && c.choices.halfElfAsi.length >= race.asiChoice.count;
          return `<button class="chip ${on ? 'on' : ''}" data-action="toggle-list" data-list="halfElfAsi" data-id="${a.id}" data-max="${race.asiChoice.count}" aria-pressed="${on}" ${dis ? 'disabled' : ''}>${a.name}</button>`;
        }).join('')}</div>`);
      }
      if (race.skillChoices) {
        const known = new Set([...(R.backgrounds[c.backgroundId] && !R.backgrounds[c.backgroundId].custom ? E.bgSkillList(c) : c.choices.bgSkills), ...c.choices.classSkills]);
        parts.push(`<h4>Escolha ${race.skillChoices} perícia${race.skillChoices > 1 ? 's' : ''} da espécie</h4><div class="chips">${R.skills.map(s => {
          const on = c.choices.raceSkills.includes(s.id);
          const dis = (!on && c.choices.raceSkills.length >= race.skillChoices) || (!on && known.has(s.id));
          return `<button class="chip ${on ? 'on' : ''}" data-action="toggle-list" data-list="raceSkills" data-id="${s.id}" data-max="${race.skillChoices}" aria-pressed="${on}" ${dis ? 'disabled' : ''} title="${esc(s.desc)}">${s.name}</button>`;
        }).join('')}</div>`);
      }
      if (race.feat) {
        parts.push(`<h4>Talento</h4>${CF.sheetTab ? CF.sheetTab.picksHTML(CF.ui, c, E.derive(c), { maxLvl: 1, keys: ['racefeat'], bare: true }) : ''}
        <p class="muted small">Os efeitos do talento (atributo, perícias, iniciativa, PV…) já entram na ficha. Você pode trocar depois na aba Ficha.</p>`);
      }
      if (race.toolChoice) {
        parts.push(`<label class="field"><span>Ferramenta de anão</span><select data-bind="choices.raceTool" data-rerender="1"><option value="">— escolha —</option>${race.toolChoice.map(t => `<option ${c.choices.raceTool === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`);
      }
      if (race.dragonAncestry) {
        parts.push(`<h4>Ancestralidade dracônica</h4><p class="muted small">Define o elemento do seu sopro e a sua resistência.</p>
        <div class="chips">${R.dragons.map(d => `<button class="chip ${c.choices.dragon === d.id ? 'on' : ''}" data-action="set-choice" data-key="dragon" data-id="${d.id}" aria-pressed="${c.choices.dragon === d.id}">${d.name} · ${d.dmg}</button>`).join('')}</div>`);
      }
      if (race.extraLanguages) {
        const ex = knownLanguages(c);
        parts.push(`<label class="field"><span>Idioma extra</span>${langSelect('choices.raceLangs', 0, c, ex)}</label>${langRecs(c, 'choices.raceLangs', race.extraLanguages)}`);
      }
      extra = `<article class="detail">
        <h3>${race.name} ${srcTag(race)}</h3>
        <dl class="facts">
          <div><dt>Atributos</dt><dd>${asiTxt(race)}</dd></div>
          <div><dt>${T('deslocamento', 'Deslocamento')}</dt><dd>${meters(race.speed)}</dd></div>
          <div><dt>Tamanho</dt><dd>${race.size}</dd></div>
          <div><dt>Idiomas</dt><dd>${race.languages.join(', ')}${race.extraLanguages ? ' + 1 à escolha' : ''}</dd></div>
        </dl>
        <ul class="feat-list">${race.traits.map(t => `<li><strong>${t.name}.</strong> ${t.desc}</li>`).join('')}</ul>
        ${parts.join('')}
      </article>`;
    }
    return `
    <p class="intro">A ${T('especie', 'espécie')} é a origem do seu personagem. Ela soma bônus aos ${T('atributo', 'atributos')} e dá características especiais. Não existe escolha errada: qualquer espécie funciona com qualquer classe!</p>
    <p class="muted small">Algumas espécies têm <strong>variações (sub-raças)</strong>: escolha a que mais combina com o seu personagem.</p>
    <div class="race-groups">
      ${R.raceGroups.map(g => {
        const vars = Object.entries(R.races).filter(([, r]) => r.group === g.id);
        const open = vars.some(([id]) => id === c.raceId);
        return `<section class="race-group ${open ? 'open' : ''}">
          <header><h3>${g.name}</h3><span class="muted small">${g.desc}${vars.length > 1 ? ` · ${vars.length} variações` : ''}</span></header>
          <div class="cards cards-3">${vars.map(([id, r]) => `<button class="card ${c.raceId === id ? 'selected' : ''}" data-action="set-race" data-id="${id}" aria-pressed="${c.raceId === id}">
            <span class="path-badges">${srcTag(r)}</span>
            <strong>${r.name}</strong><span>${r.tagline}</span><span class="card-meta">${asiTxt(r)} · ${meters(r.speed)}</span></button>`).join('')}</div>
        </section>`;
      }).join('')}
    </div>${extra}`;
  }

  /* ----------------------------------------------------------------- Etapa 4 */
  function stepBackground(c) {
    const bg = R.backgrounds[c.backgroundId];
    const cls = R.classes[c.classId];
    const recs = CF.recommend ? CF.recommend.backgrounds(c) : [];
    const top = recs.slice(0, 3).filter(r => r.score > 0);
    const topIds = top.map(r => r.id);
    const srcTag = b => b.src === 'ldj' ? `<span class="src src-ldj">LdJ p. ${b.page}</span>` : b.src === 'srd' ? `<span class="src src-srd">SRD</span>` : '';
    const card = (id, b, why) => `<button class="card ${c.backgroundId === id ? 'selected' : ''}" data-action="set-bg" data-id="${id}" aria-pressed="${c.backgroundId === id}">
        <span class="path-badges">${srcTag(b)}${why ? '<span class="badge">★ recomendado</span>' : ''}</span>
        <strong>${b.name}</strong><span>${b.tagline}</span>
        ${b.skills ? `<span class="card-meta">${b.skills.map(E.skillName).join(', ')}</span>` : ''}
        ${why ? `<span class="why">${esc(why)}</span>` : ''}</button>`;
    let detail = '';
    if (bg) {
      const parts = [];
      const known = knownLanguages(c);
      if (bg.custom) {
        parts.push(`<h4>Ideias de passado (preenche perícias sugeridas)</h4><div class="chips">${R.customBackgroundIdeas.map(i => `<button class="chip ${c.choices.bgIdea === i.name ? 'on' : ''}" data-action="bg-idea" data-id="${esc(i.name)}" title="${esc(i.hint)}">${i.name}</button>`).join('')}</div>`);
        const other = new Set([...(R.races[c.raceId] && R.races[c.raceId].skills || []), ...c.choices.raceSkills]);
        parts.push(`<h4>Escolha 2 perícias (${c.choices.bgSkills.length}/2)</h4><div class="chips">${R.skills.map(s => {
          const on = c.choices.bgSkills.includes(s.id);
          const dis = (!on && c.choices.bgSkills.length >= 2) || (!on && other.has(s.id));
          return `<button class="chip ${on ? 'on' : ''}" data-action="toggle-list" data-list="bgSkills" data-id="${s.id}" data-max="2" aria-pressed="${on}" ${dis ? 'disabled' : ''} title="${esc(s.desc)}">${s.name}</button>`;
        }).join('')}</div>`);
        parts.push(`<h4>2 idiomas ou ferramentas</h4><div class="field-row">${[0, 1].map(i => {
          const v = c.choices.bgToolLang[i] || '';
          return `<select data-arr="choices.bgToolLang" data-idx="${i}" aria-label="Idioma ou ferramenta ${i + 1}"><option value="">— escolha —</option>
            <optgroup label="Idiomas">${R.languages.filter(l => l === v || !known.includes(l)).map(l => `<option ${l === v ? 'selected' : ''}>${l}</option>`).join('')}</optgroup>
            <optgroup label="Ferramentas">${R.toolLists.toolOrLanguage.filter(t => !R.languages.includes(t)).map(t => `<option ${t === v ? 'selected' : ''}>${t}</option>`).join('')}</optgroup></select>`;
        }).join('')}</div>${langRecs(c, 'choices.bgToolLang', 2)}`);
      } else {
        const conflicts = new Set(E.bgSkillConflicts(c));
        const taken = new Set([...E.proficiencies(c).skills.keys()]);
        const swap = c.choices.bgSwap || {};
        parts.push(`<h4>Perícias do antecedente</h4>
          <p class="muted small">Pela regra, se uma perícia do antecedente repetir outra que você já tem (da espécie ou da classe), você escolhe outra no lugar. Trocas por gosto pessoal: combine com o mestre.</p>
          <div class="bg-skills">${bg.skills.map(orig => {
            const cur = swap[orig] && swap[orig] !== orig ? swap[orig] : '';
            const pending = cur === '__pick__';
            const now = pending ? '' : (cur || orig);
            const opts = R.skills.filter(x => x.id === now || x.id === orig || !taken.has(x.id));
            const flag = pending ? `<small class="warn">${E.skillName(orig)} agora vem da classe — escolha a substituta</small>` : conflicts.has(orig) ? `<small class="warn">repete a perícia da espécie — troque</small>` : cur ? `<small class="muted">trocada (era ${E.skillName(orig)})</small>` : '';
            return `<label class="field bg-skill ${pending || conflicts.has(orig) ? 'need' : ''}"><span>${E.skillName(orig)} ${flag}</span>
              <select data-bind="choices.bgSwap.${orig}" data-rerender="1">
                ${pending ? '<option value="__pick__" selected>— escolha a substituta —</option>' : ''}
                ${opts.map(x => `<option value="${x.id}" ${x.id === (now || orig) && !pending ? 'selected' : ''}>${x.id === orig ? 'Manter ' + x.name : x.name}</option>`).join('')}
              </select></label>`;
          }).join('')}</div>`);
        const tools = [...(bg.tools || [])];
        if (tools.length) parts.push(`<p><strong>Ferramentas:</strong> ${tools.join(', ')}</p>`);
        if (bg.toolChoice) {
          const list = R.toolLists[bg.toolChoice.list];
          parts.push(`<h4>Escolha ${bg.toolChoice.count === 1 ? '' : bg.toolChoice.count + ' '}${bg.toolChoice.label.toLowerCase()}</h4><div class="field-row">${Array.from({ length: bg.toolChoice.count }, (_, i) => toolSelect('choices.bgTools', i, c, list, bg.toolChoice.label, (c.choices.bgTools || []).filter((_, k) => k !== i))).join('')}</div>`);
        }
        if (bg.languages) parts.push(`<h4>Escolha ${bg.languages} idioma${bg.languages > 1 ? 's' : ''}</h4><div class="field-row">${Array.from({ length: bg.languages }, (_, i) => langSelect('choices.bgLangs', i, c, known)).join('')}</div>${langRecs(c, 'choices.bgLangs', bg.languages)}`);
      }
      detail = `<article class="detail"><h3>${bg.name} ${srcTag(bg)}</h3><p>${bg.tagline}</p>
        ${parts.join('')}
        <p><strong>Itens:</strong> ${bg.equipment.map(E.itemName).join('; ')} · <strong>Dinheiro:</strong> ${bg.gold || 0} po</p>
        <p><strong>${bg.feature.name}.</strong> ${bg.feature.desc}</p></article>`;
    }
    return `
    <p class="intro">O ${T('antecedente', 'antecedente')} conta o que você fazia antes de virar aventureiro. Ele dá ${T('pericia', 'perícias')}, idiomas, ferramentas e alguns itens.</p>
    ${top.length ? `<h3 class="bg-section-title">★ Recomendados para ${cls ? 'o seu ' + cls.name : 'você'}${R.races[c.raceId] ? ' ' + R.races[c.raceId].name.replace(/ \(.*\)/, '') : ''}</h3>
    <div class="cards cards-3">${top.map(r => card(r.id, R.backgrounds[r.id], r.why.slice(0, 2).join('; '))).join('')}</div>` : ''}
    <h3 class="bg-section-title">Todos os antecedentes</h3>
    <div class="cards cards-3">
      ${Object.entries(R.backgrounds).filter(([id]) => !topIds.includes(id)).map(([id, b]) => card(id, b, '')).join('')}
    </div>
    <p class="muted small">Antecedentes do Livro do Jogador com resumos próprios (detalhes e tabelas de personalidade na página indicada). O personalizado permite montar o passado com 2 perícias e 2 idiomas/ferramentas — confirme com o mestre.</p>
    ${detail}`;
  }

  /* ----------------------------------------------------------------- Etapa 5 */
  function stepAbilities(c) {
    const a = c.abilities, cls = R.classes[c.classId];
    const rb = E.racialBonus(c), fin = E.finalScores(c);
    const used = Object.values(a.standard).filter(v => v != null).map(Number);
    const cost = E.pointBuyCost(a.pointbuy);
    const rows = R.abilities.map(ab => {
      const primary = cls && cls.primary.includes(ab.id);
      let input = '';
      if (a.method === 'standard') {
        const v = a.standard[ab.id];
        input = `<select data-std="${ab.id}" aria-label="Valor de ${ab.name}"><option value="">—</option>${R.standardArray.map(n => `<option value="${n}" ${Number(v) === n ? 'selected' : ''}>${n}${used.includes(n) && Number(v) !== n ? ' (trocar)' : ''}</option>`).join('')}</select>`;
      } else if (a.method === 'pointbuy') {
        const v = a.pointbuy[ab.id];
        const nextCost = (R.pointBuy.cost[v + 1] ?? 99) - R.pointBuy.cost[v];
        input = `<div class="stepper-num"><button class="btn sm" data-action="pb" data-id="${ab.id}" data-delta="-1" aria-label="Diminuir ${ab.name}" ${v <= 8 ? 'disabled' : ''}>−</button><output>${v}</output><button class="btn sm" data-action="pb" data-id="${ab.id}" data-delta="1" aria-label="Aumentar ${ab.name}" ${v >= 15 || cost + nextCost > 27 ? 'disabled' : ''}>+</button></div>`;
      } else {
        input = `<input type="number" min="3" max="18" data-manual="${ab.id}" value="${a.manual[ab.id]}" aria-label="Valor rolado de ${ab.name}">`;
      }
      const f = fin[ab.id];
      return `<tr class="${primary ? 'primary' : ''}">
        <th scope="row"><strong>${ab.name}</strong>${primary ? ' <span class="badge">principal</span>' : ''}<small>${ab.desc}</small></th>
        <td>${input}</td><td class="num">${rb[ab.id] ? '+' + rb[ab.id] : '—'}</td>
        <td class="num big">${f ?? '—'}</td><td class="num mod">${f == null ? '—' : sign(E.mod(f))}</td></tr>`;
    }).join('');
    return `
    <p class="intro">Seus seis ${T('atributo', 'atributos')} dizem no que você é forte ou fraco. O número que importa na mesa é o ${T('modificador', 'modificador')}: ele é somado nas rolagens.</p>
    <div class="tabs" role="tablist">
      ${[['standard', 'Arranjo padrão (recomendado)'], ['pointbuy', 'Compra de pontos'], ['manual', 'Valores rolados na mesa']].map(([m, l]) => `<button role="tab" class="tab ${a.method === m ? 'on' : ''}" aria-selected="${a.method === m}" data-action="set-method" data-id="${m}">${l}</button>`).join('')}
    </div>
    <div class="callout">${a.method === 'standard' ? 'Distribua os valores <strong>15, 14, 13, 12, 10 e 8</strong>, um para cada atributo. Coloque os maiores no atributo principal da sua classe.' :
      a.method === 'pointbuy' ? `Todos começam em 8. Você tem <strong>27 pontos</strong> para gastar (máximo 15 antes dos bônus). Valores altos custam mais. <strong>Restam ${27 - cost} pontos.</strong>` :
      'Use esta opção se o mestre pediu para rolar dados (normalmente 4d6, descartando o menor). Digite os resultados.'}
      ${cls ? `<br><button class="btn sm" data-action="suggest-abilities">✨ Sugerir distribuição para ${cls.name}</button>` : ''}</div>
    <div class="table-wrap"><table class="abilities">
      <thead><tr><th>Atributo</th><th>Valor</th><th>Espécie</th><th>Total</th><th>${T('modificador', 'Mod.')}</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  /* ----------------------------------------------------------------- Etapa 6 */
  function spellCard(sp, list, on, dis, extra) {
    return `<button class="spell ${on ? 'on' : ''}" data-action="toggle-list" data-list="${list}" data-id="${sp.id}" data-max="${extra}" aria-pressed="${on}" ${dis ? 'disabled' : ''}>
      <span class="spell-h"><strong>${sp.name}</strong>${sp.beginner ? '<span class="badge">boa para iniciantes</span>' : ''}<span class="tag tag-${sp.tag}">${sp.tag}</span>${sp.ritual ? '<span class="tag">ritual</span>' : ''}</span>
      <span class="spell-d">${sp.desc}</span></button>`;
  }
  function spellGroup(title, list, pool, chosen, max, note) {
    const sorted = pool.slice().sort((a, b) => (b.beginner ? 1 : 0) - (a.beginner ? 1 : 0) || a.name.localeCompare(b.name));
    return `<h4>${title} <span class="count ${chosen.length === max ? 'ok' : ''}">${chosen.length}/${max}</span></h4>${note ? `<p class="muted small">${note}</p>` : ''}
      <div class="spells">${sorted.map(sp => { const on = chosen.includes(sp.id); return spellCard(sp, list, on, !on && chosen.length >= max, max); }).join('')}</div>`;
  }

  function stepFeatures(c) {
    const cls = R.classes[c.classId];
    if (!cls) return '<p class="callout">Escolha uma classe primeiro.</p>';
    const race = R.races[c.raceId];
    const d = E.derive(c);
    const out = [];

    // Perícias
    const fixed = new Map();
    const bg = R.backgrounds[c.backgroundId];
    const fromBg = new Set(bg && !bg.custom ? E.bgSkillList(c) : c.choices.bgSkills);
    fromBg.forEach(s => fixed.set(s, bg ? bg.name : ''));
    (race && race.skills || []).forEach(s => fixed.set(s, race.name));
    c.choices.raceSkills.forEach(s => fixed.set(s, race ? race.name : ''));
    const list = cls.skillList === 'any' ? R.skills.map(s => s.id) : cls.skillList;
    out.push(`<section><h3>${T('pericia', 'Perícias')} da classe <span class="count ${c.choices.classSkills.length === cls.skillChoices ? 'ok' : ''}">${c.choices.classSkills.length}/${cls.skillChoices}</span></h3>
      <p class="muted">Escolha ${cls.skillChoices}. Em perícias treinadas você soma +${R.proficiencyBonus} (${T('proficiencia', 'proficiência')}). As que você já tem pela espécie aparecem marcadas. Quer uma perícia que veio do <b>antecedente</b>? Clique nela: ela passa para a classe e você escolhe outra no antecedente.</p>
      <div class="chips">${list.map(id => {
        const sk = R.skills.find(s => s.id === id);
        const on = c.choices.classSkills.includes(id);
        const fx = fixed.has(id);
        const bgTake = fx && fromBg.has(id) && bg && !bg.custom; // pode "pegar" do antecedente
        const full = c.choices.classSkills.length >= cls.skillChoices;
        const dis = (fx && !bgTake) || (!on && full);
        const bonus = d.mods[sk.ab] + R.proficiencyBonus;
        return `<button class="chip ${on ? 'on' : ''} ${fx ? 'fixed' : ''} ${bgTake ? 'takeable' : ''}" data-action="${bgTake ? 'take-bg-skill' : 'toggle-list'}" data-list="classSkills" data-id="${id}" data-max="${cls.skillChoices}" aria-pressed="${on || fx}" ${dis ? 'disabled' : ''} title="${bgTake ? 'Usar como perícia da classe e escolher outra no antecedente' : esc(sk.desc)}">
          ${sk.name} <small>${R.abilities.find(a => a.id === sk.ab).short} ${sign(bonus)}</small>${fx ? ` <small>(${bgTake ? 'do ' + esc(fixed.get(id)) + ' — clique para trocar' : 'já tem: ' + esc(fixed.get(id))})</small>` : ''}</button>`;
      }).join('')}</div></section>`);

    // Ferramentas
    if (cls.toolChoices) {
      const tl = R.toolLists[cls.toolChoices.list];
      out.push(`<section><h3>${cls.toolChoices.label}</h3><div class="field-row">${Array.from({ length: cls.toolChoices.count }, (_, i) => {
        const v = c.choices.tools[i] || '';
        return toolSelect('choices.tools', i, c, tl, cls.toolChoices.label, c.choices.tools.filter((_, k) => k !== i));
      }).join('')}</div></section>`);
    }
    // Estilo de luta
    if (cls.fightingStyle) {
      out.push(`<section><h3>Estilo de Luta</h3><p class="muted">Dica: com arco, escolha Arquearia; com espada e escudo, Defesa ou Duelismo; com arma grande, Combate com Armas Grandes.</p>
        <div class="cards cards-3">${R.fightingStyles.map(f => `<button class="card compact ${c.choices.fightingStyle === f.id ? 'selected' : ''}" data-action="set-choice" data-key="fightingStyle" data-id="${f.id}" aria-pressed="${c.choices.fightingStyle === f.id}"><strong>${f.name}</strong><span>${f.desc}</span></button>`).join('')}</div></section>`);
    }
    if (cls.favoredEnemy) {
      out.push(`<section><h3>Inimigo e terreno favoritos</h3><div class="field-row">
        <label class="field"><span>Inimigo favorito</span><select data-bind="choices.favoredEnemy" data-rerender="1"><option value="">— escolha —</option>${R.favoredEnemies.map(x => `<option ${c.choices.favoredEnemy === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
        <label class="field"><span>Terreno favorito</span><select data-bind="choices.terrain" data-rerender="1"><option value="">— escolha —</option>${R.terrains.map(x => `<option ${c.choices.terrain === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
      </div><p class="muted small">Dica: pergunte ao mestre que tipo de inimigo e região a campanha terá.</p></section>`);
    }
    if (cls.expertise) {
      const opts = [...d.profs.skills.keys()].map(id => ({ id, name: E.skillName(id) })).concat([{ id: 'thieves', name: 'Ferramentas de ladrão' }]);
      out.push(`<section><h3>${T('especializacao', 'Especialização')} <span class="count ${c.choices.expertise.length === cls.expertise ? 'ok' : ''}">${c.choices.expertise.length}/${cls.expertise}</span></h3>
        <p class="muted">Escolha 2 entre as perícias que você já domina: o bônus delas dobra.</p>
        <div class="chips">${opts.map(o => { const on = c.choices.expertise.includes(o.id); return `<button class="chip ${on ? 'on' : ''}" data-action="toggle-list" data-list="expertise" data-id="${o.id}" data-max="${cls.expertise}" aria-pressed="${on}" ${!on && c.choices.expertise.length >= cls.expertise ? 'disabled' : ''}>${o.name}</button>`; }).join('')}</div></section>`);
    }
    if (cls.dragonAncestor && E.activeSub(c)) {
      out.push(`<section><h3>Ancestral dracônico</h3><div class="chips">${R.dragons.map(dr => `<button class="chip ${c.choices.sorcDragon === dr.id ? 'on' : ''}" data-action="set-choice" data-key="sorcDragon" data-id="${dr.id}" aria-pressed="${c.choices.sorcDragon === dr.id}">${dr.name} · ${dr.dmg}</button>`).join('')}</div></section>`);
    }

    // Habilidades da classe
    const pth = d.path;
    if (pth && pth.option) out.push(`<div class="callout small">🗺️ ${pth.pickLevel === 1 ? 'Caminho' : 'Caminho planejado'}: <strong>${esc(pth.option.name)}</strong> ${srcBadge(pth.option)}${pth.pickLevel > 1 ? ` — escolhido de fato no ${pth.pickLevel}º nível.` : (pth.option.srd || pth.option.auto ? ' — já calculado na ficha.' : ' — anote as habilidades de 1º nível do livro com o mestre.')}</div>`);
    out.push(`<section><h3>O que seu ${cls.name} sabe fazer</h3><ul class="feat-list">${cls.features.filter(f => !f.sub || f.sub === c.choices.subclass).map(f => `<li><strong>${f.name}.</strong> ${f.desc}</li>`).join('')}</ul></section>`);

    // Magias
    const sc = d.spellcasting;
    if (sc) {
      const abN = E.abName(sc.ability);
      out.push(`<section class="magic"><h3>Magias</h3>
        <div class="callout"><strong>Como sua magia funciona:</strong> você usa <strong>${abN}</strong>.
          ${T('cdmagia', 'CD das suas magias')}: <strong>${sc.dc}</strong> · ${T('ataquemagico', 'Ataque mágico')}: <strong>${sign(sc.attack)}</strong> ·
          ${T('espaco', 'Espaços de 1º nível')}: <strong>${sc.slots[0]}</strong>${sc.pact ? ' (voltam no descanso curto)' : ''}.
          ${T('truque', 'Truques')} podem ser usados à vontade.</div>`);
      const cantrips = E.spellList(c.classId, 0);
      out.push(spellGroup('Truques', 'cantrips', cantrips, c.choices.cantrips, sc.cantrips));
      const lvl1 = E.spellList(c.classId, 1, c.choices.subclass).filter(sp => !sc.always.includes(sp.id));
      if (sc.type === 'known') out.push(spellGroup('Magias de 1º nível conhecidas', 'spells', lvl1, c.choices.spells, sc.known, 'Estas são as magias que você sabe. Cada uso gasta um espaço de magia.'));
      if (sc.type === 'prepared') {
        out.push(spellGroup('Magias preparadas hoje', 'prepared', lvl1, c.choices.prepared, sc.prepared,
          `Você pode trocar estas magias após cada descanso longo. Quantidade = modificador de ${abN} + 1.` + (sc.always.length ? ` Sempre preparadas pelo domínio: <strong>${sc.always.map(id => R.spells[id].name).join(', ')}</strong>.` : '')));
      }
      if (sc.type === 'spellbook') {
        out.push(spellGroup('Grimório (6 magias)', 'spells', lvl1, c.choices.spells, sc.spellbook, 'Seu livro de magias. Depois, marque quais estão preparadas hoje.'));
        const book = lvl1.filter(sp => c.choices.spells.includes(sp.id));
        if (book.length) out.push(spellGroup('Preparadas hoje (do grimório)', 'prepared', book, c.choices.prepared.filter(x => c.choices.spells.includes(x)), sc.prepared, `Quantidade = modificador de Inteligência + 1.`));
      }
      out.push('</section>');
    } else if (c.classId === 'paladin' || c.classId === 'ranger') {
      out.push(`<section><div class="callout">Seu ${cls.name} começa a lançar magias no 2º nível. Por enquanto, foque nas armas!</div></section>`);
    }
    if (race && race.cantrip === 'wizard') {
      const pool = E.spellList('wizard', 0);
      out.push(`<section><h3>Truque do Alto Elfo</h3><p class="muted">Usa Inteligência.</p><div class="spells">${pool.map(sp => { const on = c.choices.elfCantrip === sp.id; return `<button class="spell ${on ? 'on' : ''}" data-action="set-choice" data-key="elfCantrip" data-id="${sp.id}" aria-pressed="${on}"><span class="spell-h"><strong>${sp.name}</strong><span class="tag tag-${sp.tag}">${sp.tag}</span></span><span class="spell-d">${sp.desc}</span></button>`; }).join('')}</div></section>`);
    }
    if (race && race.knownCantrips) out.push(`<p class="muted">Pela espécie você também conhece: <strong>${race.knownCantrips.map(id => R.spells[id].name).join(', ')}</strong>.</p>`);
    return out.join('');
  }

  /* ----------------------------------------------------------------- Etapa 7 */
  function stepEquipment(c) {
    const cls = R.classes[c.classId];
    if (!cls) return '<p class="callout">Escolha uma classe primeiro.</p>';
    const d = E.derive(c);
    const bg = R.backgrounds[c.backgroundId];
    const groups = cls.equipment.map((g, gi) => {
      const sel = E.selectedOption(c, gi);
      return `<fieldset class="eq-group"><legend>${g.label}</legend><div class="eq-options">${g.options.map((o, oi) => {
        const blocked = (o.reqWeapon && !E.weaponProficient(o.reqWeapon, d.profs)) || (o.reqArmor && !d.profs.armor.has(o.reqArmor));
        const on = sel === oi;
        let picks = '';
        if (on) picks = o.items.map((it, k) => {
          if (typeof it === 'string') return '';
          const key = E.pickKey(gi, oi, k);
          const listIds = R.weaponPicks[it.pick];
          const v = c.equipment.picks[key] || listIds[0];
          return `<select data-pick="${key}" aria-label="Escolha a arma">${listIds.map(id => { const w = R.weapons[id]; return `<option value="${id}" ${id === v ? 'selected' : ''}>${w.name} — ${w.dmg} ${w.dt}${w.props.length ? ' (' + w.props.join(', ') + ')' : ''}</option>`; }).join('')}</select>`;
        }).join('');
        return `<div class="eq-option ${on ? 'on' : ''}"><button class="radio" data-action="eq-option" data-gi="${gi}" data-oi="${oi}" aria-pressed="${on}" ${blocked ? 'disabled' : ''}>
          <span class="dot" aria-hidden="true"></span>${o.label}${blocked ? ' <small>(sem proficiência)</small>' : ''}</button>${picks}</div>`;
      }).join('')}</div></fieldset>`;
    }).join('');
    const fixedList = cls.fixedEquipment.length ? `<p><strong>Também recebe:</strong> ${E.itemName && [...new Map(cls.fixedEquipment.map(i => [i, cls.fixedEquipment.filter(x => x === i).length]))].map(([i, n]) => (n > 1 ? n + '× ' : '') + E.itemName(i)).join(', ')}</p>` : '';
    return `
    <p class="intro">Escolha seu equipamento inicial. Ao lado, veja como a ${T('ca', 'CA')} e os ataques mudam na hora.</p>
    ${groups}
    ${fixedList}
    ${bg ? `<p><strong>Do antecedente:</strong> ${bg.equipment.map(E.itemName).join(', ')}</p>` : ''}
    <div class="callout"><strong>${T('ca', 'CA')} ${d.ac}</strong> — ${esc(d.acLabel)}${d.acOptions.length > 1 ? `<br><small>Calculamos todas as opções e usamos a melhor: ${d.acOptions.map(o => esc(o.label) + ' = ' + o.v).join(' · ')}</small>` : ''}</div>
    ${attacksTable(d)}
    <details><summary>O que significam as propriedades das armas?</summary><ul class="feat-list">
      <li><strong>${T('acuidade', 'Acuidade')}:</strong> usa Força ou Destreza, o que for maior.</li>
      <li><strong>Leve:</strong> boa para lutar com duas armas.</li>
      <li><strong>Pesada:</strong> criaturas pequenas têm desvantagem com ela.</li>
      <li><strong>Duas mãos:</strong> precisa das duas mãos para atacar.</li>
      <li><strong>Versátil:</strong> com as duas mãos causa o dano entre parênteses.</li>
      <li><strong>Arremesso / munição:</strong> alcance normal/máximo em metros.</li>
      <li><strong>Alcance:</strong> ataca a 3 m em vez de 1,5 m.</li></ul></details>`;
  }
  function attacksTable(d) {
    if (!d.attacks.length) return '';
    return `<div class="table-wrap"><table class="attacks"><caption>Seus ataques</caption><thead><tr><th>Arma</th><th>Acerto</th><th>Dano</th><th>Notas</th></tr></thead><tbody>
      ${d.attacks.map(a => `<tr><td>${a.name}</td><td class="num">${sign(a.bonus)}</td><td>${a.damage}${a.versatile ? ` <small>(2 mãos: ${a.versatile})</small>` : ''}</td><td><small>${[...a.props, ...a.notes].join(', ')}</small></td></tr>`).join('')}
    </tbody></table></div>`;
  }

  /* ----------------------------------------------------------------- Etapa 8 */
  function stepStory(c) {
    const st = c.story;
    const q = C.story.questions.map(x => `<div class="story-q">
      <label class="field"><span>${x.q}</span><input type="text" data-bind="story.${x.id}" value="${esc(st[x.id])}" maxlength="140"></label>
      <div class="chips small">${x.ideas.map(i => `<button class="chip" data-action="story-idea" data-key="${x.id}" data-id="${esc(i)}">${esc(i)}</button>`).join('')}<button class="chip dice" data-action="story-random" data-key="${x.id}" aria-label="Ideia aleatória">🎲</button></div></div>`).join('');
    const pers = [['traits', 'Traço de personalidade', C.story.traits], ['ideals', 'Ideal', C.story.ideals], ['flaws', 'Defeito', C.story.flaws]].map(([k, l, arr]) => `
      <label class="field"><span>${l} <button class="chip dice" data-action="story-pers" data-key="${k}" aria-label="Sugerir ${l}">🎲 sugerir</button></span><input type="text" data-bind="story.${k}" value="${esc(st[k])}" maxlength="160"></label>`).join('');
    return `
    <p class="intro">Responda algumas perguntas e montamos um rascunho de história que você pode editar à vontade. Clique nas ideias para preencher rápido.</p>
    <div class="field-row">
      <label class="field"><span>Tendência (moral)</span><select data-bind="story.alignment" data-rerender="1"><option value="">— opcional —</option>${R.alignments.map(a => `<option ${st.alignment === a ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
      <label class="field"><span>Idade</span><input type="text" data-bind="story.age" value="${esc(st.age)}" maxlength="20"></label>
    </div>
    <label class="field"><span>Aparência</span><input type="text" data-bind="story.appearance" value="${esc(st.appearance)}" maxlength="200" placeholder="Ex.: cabelo ruivo trançado, cicatriz no queixo, capa verde"></label>
    <h3>Perguntas de origem</h3>${q}
    <h3>Personalidade</h3>${pers}
    <label class="field"><span>Vínculos (pessoas, lugares ou objetos importantes)</span><input type="text" data-bind="story.bonds" value="${esc(st.bonds)}" maxlength="200"></label>
    <div class="story-gen"><button class="btn primary" data-action="gen-story">🖋️ Gerar rascunho da história</button><span class="muted small">Usa suas respostas acima. Você pode editar o texto depois.</span></div>
    <label class="field"><span>História do personagem</span><textarea data-bind="story.backstory" rows="9" maxlength="4000">${esc(st.backstory)}</textarea></label>`;
  }
  function genStory(c) {
    const st = c.story, cls = R.classes[c.classId], race = R.races[c.raceId], bg = R.backgrounds[c.backgroundId];
    const idea = R.customBackgroundIdeas.find(i => i.name === c.choices.bgIdea);
    const p = [];
    p.push(`Meu nome é ${c.name || '…'}${race ? `, sou ${race.name}` : ''}${cls ? ` e sigo o caminho de ${cls.name}` : ''}.`);
    if (bg && !bg.custom) p.push('Antes da aventura, servi em um templo e aprendi os ritos da minha fé.');
    else if (idea) p.push('Antes da aventura: ' + lcFirst(idea.hint));
    if (st.motivation) p.push(`Entrei nesta aventura para ${lcFirst(st.motivation)}.`);
    if (st.trust) p.push(`Se existe alguém em quem confio de olhos fechados: ${lcFirst(st.trust)}.`);
    if (st.fear) p.push(`Meu maior medo? ${st.fear}.`);
    if (st.goal) p.push(`Um dia, quero ${lcFirst(st.goal)}.`);
    if (st.secret) p.push(`E guardo um segredo que ninguém sabe: ${lcFirst(st.secret)}.`);
    return p.join(' ').replace(/\.\./g, '.').replace(/…\./g, '…');
  }

  /* ----------------------------------------------------------------- Etapa 9 */
  function stepReview(c) {
    const issues = E.validate(c);
    const errs = issues.filter(i => i.level === 'error'), warns = issues.filter(i => i.level === 'warn');
    const item = i => `<li class="${i.level}"><span>${i.level === 'error' ? '⚠️' : 'ℹ️'} ${esc(i.msg)}</span><button class="btn sm" data-action="goto-step" data-id="${i.step}">Ir para ${STEPS[i.step].title}</button></li>`;
    return `
    ${errs.length ? `<div class="callout error"><strong>Faltam ${errs.length} ajuste(s) obrigatório(s)</strong> para a ficha ficar válida.</div><ul class="issue-list">${errs.map(item).join('')}</ul>`
      : `<div class="callout success"><strong>🎉 Ficha válida!</strong> Todas as escolhas obrigatórias estão completas e de acordo com as regras (${R.edition}).</div>`}
    ${warns.length ? `<h3>Avisos</h3><ul class="issue-list">${warns.map(item).join('')}</ul>` : ''}
    <h3>Resumo</h3>${summaryHTML(c)}`;
  }
  function summaryHTML(c) {
    const d = E.derive(c), cls = R.classes[c.classId], race = R.races[c.raceId], bg = R.backgrounds[c.backgroundId];
    return `<dl class="facts">
      <div><dt>Personagem</dt><dd>${esc(c.name || '—')}</dd></div>
      <div><dt>Classe / Espécie</dt><dd>${cls ? cls.name : '—'} / ${race ? race.name : '—'}</dd></div>
      <div><dt>Antecedente</dt><dd>${bg ? bg.name : '—'}</dd></div>
      <div><dt>PV / CA</dt><dd>${d.hp ?? '—'} / ${d.ac}</dd></div>
      <div><dt>Perícias</dt><dd>${d.skills.filter(s => s.prof).map(s => s.name + (s.exp ? '★' : '')).join(', ') || '—'}</dd></div>
    </dl>`;
  }

  /* ---------------------------------------------------------------- Etapa 10 */
  function stepSheet(c) {
    const errs = E.validate(c).filter(i => i.level === 'error');
    return `
    ${errs.length ? `<div class="callout error no-print">Esta ficha ainda tem ${errs.length} pendência(s). <button class="btn sm" data-action="goto-step" data-id="8">Ver revisão</button></div>` : ''}
    <div class="sheet-actions no-print">
      <button class="btn primary" data-action="print">🖨️ Imprimir / Salvar PDF</button>
      <a class="btn" href="#/ficha/${c.id}">📝 Abrir na aba Ficha (editar livremente)</a>
      <button class="btn" data-action="copy-code" data-id="${c.id}">📋 Copiar código para o mestre</button>
      <button class="btn" data-action="download-json" data-id="${c.id}">⬇️ Baixar arquivo</button>
      <button class="btn" data-action="party-add" data-id="${c.id}">🏰 Adicionar ao grupo</button>
      <a class="btn" href="#/tutorial">🗡️ Testar no tutorial</a>
    </div>
    <p class="muted small no-print">Para PDF: clique em “Imprimir” e escolha <strong>Salvar como PDF</strong> no destino.</p>
    ${sheetHTML(c)}`;
  }

  /* ===================================================================== Ficha */
  function sheetHTML(c) {
    const d = E.derive(c), cls = R.classes[c.classId], race = R.races[c.raceId], bg = R.backgrounds[c.backgroundId];
    const st = c.story;
    const sh = d.sheet;
    const coins = [['pc', 'PC'], ['pp', 'PP'], ['pe', 'PE'], ['po', 'PO'], ['pl', 'PL']].map(([k, l]) => `${l} ${Number(sh.coins[k]) || 0}`).join(' · ');
    const extraSp = (sh.extraSpells || []).filter(s => (s.name || '').trim());
    const ab = R.abilities.map(a => {
      const sv = d.saves.find(s => s.id === a.id);
      return `<div class="ab"><span class="ab-n">${a.short}</span><span class="ab-m">${sign(d.mods[a.id])}</span><span class="ab-s">${d.rawScores[a.id] ?? '—'}</span>
        <span class="ab-sv">${sv.prof ? '●' : '○'} Resist. ${sign(sv.bonus)}</span></div>`;
    }).join('');
    const sk = d.skills.map(s => `<li class="${s.prof ? 'prof' : ''}"><span>${s.exp ? '◆' : s.prof ? '●' : '○'}</span> ${s.name} <small>(${R.abilities.find(a => a.id === s.ab).short})</small><b>${sign(s.bonus)}</b></li>`).join('');
    const sc = d.spellcasting;
    const spellName = id => (R.spells[id] || { name: id }).name;
    let spells = '';
    if (sc || d.raceCantrips.length || extraSp.length) {
      const rows = [];
      if (sc) {
        rows.push(`<p class="sp-stats">Atributo: <b>${E.abName(sc.ability)}</b> · CD <b>${sc.dc}</b> · Ataque <b>${sign(sc.attack)}</b> · Espaços: <b>${sc.slotsByLevel.map(s => `${s.circle}º ${'☐'.repeat(s.n)}`).join(' · ') || '—'}</b>${sc.pact ? ' (pacto: voltam no descanso curto)' : ''}</p>`);
        rows.push(`<p><b>Truques:</b> ${c.choices.cantrips.map(spellName).join(', ') || '—'}</p>`);
        if (sc.type === 'known') rows.push(`<p><b>Magias conhecidas:</b> ${c.choices.spells.map(spellName).join(', ') || '—'}</p>`);
        if (sc.type === 'prepared') rows.push(`<p><b>Preparadas:</b> ${[...sc.always.map(id => spellName(id) + ' (sempre)'), ...c.choices.prepared.map(spellName)].join(', ') || '—'}</p>`);
        if (sc.type === 'spellbook') { rows.push(`<p><b>Grimório:</b> ${c.choices.spells.map(spellName).join(', ') || '—'}</p>`); rows.push(`<p><b>Preparadas:</b> ${c.choices.prepared.filter(x => c.choices.spells.includes(x)).map(spellName).join(', ') || '—'}</p>`); }
      }
      d.raceCantrips.forEach(rc => rows.push(`<p><b>Truque da espécie:</b> ${spellName(rc.id)} (${E.abName(rc.ability)})</p>`));
      const ids = [...new Set([...(sc ? [...c.choices.cantrips, ...c.choices.spells, ...c.choices.prepared, ...sc.always] : []), ...d.raceCantrips.map(r => r.id)])].filter(id => R.spells[id]);
      rows.push(`<ul class="sp-list">${ids.map(id => `<li><b>${R.spells[id].name}</b> — ${R.spells[id].desc}</li>`).join('')}${extraSp.map(s => `<li><b>${esc(s.name)}</b>${s.circle ? ` (${esc(s.circle)})` : ''}${s.notes ? ' — ' + esc(s.notes) : ''}</li>`).join('')}</ul>`);
      spells = `<section class="sh-box sh-spells"><h4>Magias</h4>${rows.join('')}</section>`;
    }
    if (sh.spellsInit) {
      const list = sh.spells || [];
      const prepr = ['cleric', 'druid', 'wizard', 'paladin'].includes(c.classId);
      const circles = [...new Set(list.map(x => Number(x.circle) || 0))].sort((a, b) => a - b);
      spells = (sc || list.length) ? `<section class="sh-box sh-spells"><h4>Magias</h4>
        ${sc ? `<p class="sp-stats">Atributo: <b>${E.abName(sc.ability)}</b> · CD <b>${sc.dc}</b> · Ataque <b>${sign(sc.attack)}</b> · Espaços: <b>${sc.slotsByLevel.map(x => `${x.circle}º ${'☐'.repeat(x.n)}`).join(' · ') || '—'}</b>${sc.pact ? ' (pacto: voltam no descanso curto)' : ''}</p>` : ''}
        <ul class="sp-list">${circles.map(n => `<li class="sp-circle">${n === 0 ? 'Truques' : n + 'º círculo'}</li>${list.filter(x => (Number(x.circle) || 0) === n).map(x => {
          const srd = x.sid ? R.spells[x.sid] : null;
          const ix = srd ? null : (CF.SPELL_INDEX || []).find(e => e.n.toLowerCase() === (x.name || '').toLowerCase());
          return `<li><b>${prepr && n > 0 ? (x.prep ? '● ' : '○ ') : ''}${esc(x.name)}</b>${srd ? ' — ' + esc(srd.desc) : (CF.SPELL_DESC || {})[x.name] ? ' — ' + esc(CF.SPELL_DESC[x.name].d) : ix ? ` <small>(${ix.s}${ix.p ? ', LdJ p. ' + ix.p : ''})</small>` : ''}${x.notes ? ' — ' + esc(x.notes) : ''}</li>`;
        }).join('')}`).join('')}</ul>${prepr ? '<p class="tiny">● preparada · ○ não preparada</p>' : ''}</section>` : '';
    }
    return `<article class="sheet" id="sheet">
      <header class="sh-head">
        <div class="sh-name"><h3>${esc(c.name || 'Sem nome')}</h3><small>Nome do personagem</small></div>
        <dl class="sh-meta">
          <div><dt>Classe e nível</dt><dd>${cls ? cls.name + ' ' + d.level : '—'}${d.path && d.path.option && d.path.pickLevel <= d.level ? ' (' + esc(d.path.option.name) + ')' : ''}</dd></div>
          ${d.path && d.path.option && d.path.pickLevel > d.level ? `<div><dt>Caminho planejado (nv ${d.path.pickLevel})</dt><dd>${esc(d.path.option.name)}</dd></div>` : ''}
          <div><dt>Espécie</dt><dd>${race ? race.name : '—'}</dd></div>
          <div><dt>Antecedente</dt><dd>${bg ? (bg.custom && c.choices.bgIdea ? c.choices.bgIdea : bg.name) : '—'}</dd></div>
          <div><dt>Jogador</dt><dd>${esc(c.player || '—')}</dd></div>
          <div><dt>Tendência</dt><dd>${esc(st.alignment || '—')}</dd></div>
          <div><dt>XP</dt><dd>${Number(sh.xp) || 0}</dd></div>
        </dl>
      </header>
      <div class="sh-stats">
        <div><b>${d.ac}</b><span>CA</span></div>
        <div><b>${d.hp ?? '—'}</b><span>PV máx.</span></div>
        <div><b>${sh.hpCurrent != null && sh.hpCurrent !== '' ? sh.hpCurrent : '&nbsp;'}</b><span>PV atuais</span></div>
        <div><b>${sign(d.initiative)}</b><span>Iniciativa</span></div>
        <div><b>${meters(d.speed)}</b><span>Deslocamento</span></div>
        <div><b>+${d.prof}</b><span>Proficiência</span></div>
        <div><b>${d.passivePerception}</b><span>Percepção passiva</span></div>
        <div><b>${d.level}${d.hitDie}</b><span>Dados de Vida</span></div>
      </div>
      <div class="sh-cols">
        <div class="sh-col"><section class="sh-box"><h4>Atributos e resistências</h4><div class="abs">${ab}</div></section>
          <section class="sh-box"><h4>Perícias</h4><ul class="sk">${sk}</ul><p class="tiny">● treinada · ◆ especialização</p></section></div>
        <div class="sh-col">
          <section class="sh-box"><h4>Ataques</h4>${d.attacks.length ? `<table class="sh-atk"><thead><tr><th>Arma</th><th>Acerto</th><th>Dano</th></tr></thead><tbody>${d.attacks.map(a => `<tr><td>${a.name}${a.notes.length ? `<small>${a.notes.join('; ')}</small>` : ''}</td><td>${sign(a.bonus)}</td><td>${a.damage}${a.versatile ? `<small>2 mãos: ${a.versatile}</small>` : ''}</td></tr>`).join('')}</tbody></table>` : '<p>—</p>'}</section>
          ${d.resources.length ? `<section class="sh-box"><h4>Recursos</h4><ul class="res">${d.resources.map(r => `<li>${r.name}: ${'☐ '.repeat(Math.max(0, Math.min(r.uses, 10)))}${r.uses > 10 ? r.uses : ''} <small>/ ${r.per}</small></li>`).join('')}</ul></section>` : ''}
          ${spells}
          <section class="sh-box"><h4>Características e habilidades</h4><ul class="feats">${d.features.map(f => `<li><b>${esc(f.name)}</b> <small>(${esc(f.src)})</small>${f.desc ? ' — ' + esc(f.desc) : ''}</li>`).join('')}</ul>${(sh.abilities || []).filter(a => (a.name || '').trim()).length ? `<ul class="feats sh-free">${sh.abilities.filter(a => (a.name || '').trim()).map(a => `<li><b>${esc(a.name)}</b> <small>(${esc(a.src || 'Outro')}${a.level ? ', nv ' + esc(a.level) : ''}${parseInt(a.max, 10) > 0 ? ', ' + parseInt(a.max, 10) + '×/' + esc(a.per) : ''})</small>${a.desc ? ' — ' + esc(a.desc).replace(/\n/g, '<br>') : ''}</li>`).join('')}</ul>` : ''}${(sh.features || '').trim() ? `<p class="sh-free">${esc(sh.features).replace(/\n/g, '<br>')}</p>` : ''}</section>
        </div>
        <div class="sh-col">
          <section class="sh-box"><h4>Proficiências e idiomas</h4>
            <p><b>Armaduras:</b> ${d.armorProfText}</p><p><b>Armas:</b> ${d.weaponProfText || '—'}</p>
            <p><b>Ferramentas:</b> ${d.profs.tools.join(', ') || '—'}</p><p><b>Idiomas:</b> ${d.profs.languages.join(', ')}</p>${(sh.profsExtra || '').trim() ? `<p><b>Outras:</b> ${esc(sh.profsExtra)}</p>` : ''}</section>
          <section class="sh-box"><h4>Equipamento</h4><p class="coins-line">${coins}</p><ul class="eq">${d.itemList.map(i => `<li>${i.n > 1 ? i.n + '× ' : ''}${esc(i.name)}${i.desc && R.gear[i.id] && /Pacote|Kit/.test(i.name) ? `<small>${esc(i.desc)}</small>` : ''}</li>`).join('')}</ul></section>
          <section class="sh-box"><h4>Personalidade</h4>
            <p><b>Traço:</b> ${esc(st.traits || '—')}</p><p><b>Ideal:</b> ${esc(st.ideals || '—')}</p>
            <p><b>Vínculo:</b> ${esc(st.bonds || '—')}</p><p><b>Defeito:</b> ${esc(st.flaws || '—')}</p>
            ${st.age || st.appearance ? `<p><b>Aparência:</b> ${esc([st.age && st.age + ' anos', st.appearance].filter(Boolean).join(', '))}</p>` : ''}</section>
        </div>
      </div>
      ${cls && P.classes[c.classId] ? `<section class="sh-box sh-track"><h4>Trilha até o nível ${P.levelCap}${d.path && d.path.option ? ' — ' + esc(d.path.option.name) + ` (${P.sources[d.path.option.src].short} p. ${d.path.option.page})` : ''}</h4>
        <ul>${P.track(c.classId, c.choices.subclass).filter(r => r.lv > 1).map(r => `<li class="${r.key ? 'key' : ''}"><b>Nv ${r.lv}</b> ${r.items.map(i => esc(i.t)).join(' · ')}</li>`).join('')}</ul></section>` : ''}
      ${st.backstory ? `<section class="sh-box sh-story"><h4>História</h4><p>${esc(st.backstory).replace(/\n/g, '<br>')}</p></section>` : ''}
      ${(sh.notes || '').trim() ? `<section class="sh-box sh-story"><h4>Anotações</h4><p>${esc(sh.notes).replace(/\n/g, '<br>')}</p></section>` : ''}
      <footer class="sh-foot">Character Forge · ${R.edition}. Inclui material do SRD 5.1 da Wizards of the Coast LLC, licenciado sob CC BY 4.0.</footer>
    </article>`;
  }

  /* ================================================================ Pré-visualização */
  function renderPreview(c) {
    const d = E.derive(c), cls = R.classes[c.classId], race = R.races[c.raceId];
    const el = document.getElementById('preview');
    if (!el) return;
    el.innerHTML = `<details open class="pv"><summary>Prévia da ficha</summary>
      <h3>${esc(c.name || 'Sem nome')}</h3>
      <p class="muted">${[race && race.name, cls && cls.name + ' 1', R.backgrounds[c.backgroundId] && R.backgrounds[c.backgroundId].name].filter(Boolean).join(' · ') || 'Comece escolhendo um conceito'}</p>
      ${d.path && d.path.option ? `<p class="small">🗺️ ${d.path.pickLevel > 1 ? 'Rumo a' : ''} <b>${esc(d.path.option.name)}</b>${d.path.pickLevel > 1 ? ` (nv ${d.path.pickLevel})` : ''}</p>` : ''}
      <div class="pv-stats">
        <div><b>${d.hp ?? '—'}</b><span>${T('pv', 'PV')}</span></div>
        <div><b>${d.ac}</b><span>${T('ca', 'CA')}</span></div>
        <div><b>${sign(d.initiative)}</b><span>${T('iniciativa', 'Inic.')}</span></div>
        <div><b>${meters(d.speed)}</b><span>${T('deslocamento', 'Desl.')}</span></div>
      </div>
      <div class="pv-abs">${R.abilities.map(a => `<div><span>${a.short}</span><b>${d.rawScores[a.id] == null ? '—' : sign(d.mods[a.id])}</b><small>${d.rawScores[a.id] ?? ''}</small></div>`).join('')}</div>
      ${d.skills.some(s => s.prof) ? `<p class="small"><b>Perícias:</b> ${d.skills.filter(s => s.prof).map(s => `${s.name} ${sign(s.bonus)}`).join(', ')}</p>` : ''}
      ${d.attacks.length ? `<p class="small"><b>Ataques:</b> ${d.attacks.map(a => `${a.name} ${sign(a.bonus)} (${a.damage})`).join('; ')}</p>` : ''}
      ${d.spellcasting ? `<p class="small"><b>Magia:</b> CD ${d.spellcasting.dc}, ataque ${sign(d.spellcasting.attack)}, ${d.spellcasting.slots[0]} espaço(s)</p>` : ''}
      <p class="tiny muted">Bônus de ${T('proficiencia', 'proficiência')}: +${d.prof}</p>
    </details>`;
  }

  /* ============================================================ Aba Ficha */
  CF.ui = {
    esc, sign, T, $app, toast, sheetHTML, afterRender: null, save: () => touch(),
    chars: () => chars, currentId: () => currentId,
    setCurrent(id) { currentId = id; saveChars(); }
  };
  function renderLive(id) {
    CF.sheetTab.render(CF.ui, id);
    if (CF.ui.afterRender) { const f = CF.ui.afterRender; CF.ui.afterRender = null; f(); }
  }
  function rerenderLive(focusSel) {
    const y = window.scrollY;
    renderLive(currentId);
    window.scrollTo(0, y);
    if (focusSel && !document.activeElement.matches('input,textarea')) { const el = document.querySelector(focusSel); if (el) el.focus({ preventScroll: true }); }
  }

  /* ============================================================ Meus personagens */
  function renderList() {
    const list = Object.values(chars).sort((a, b) => b.updatedAt - a.updatedAt);
    $app.innerHTML = `<section class="page">
      <h1>Meus personagens</h1>
      <div class="sheet-actions"><button class="btn primary" data-action="new-char">+ Novo personagem</button>
        <button class="btn" data-action="import-code">📥 Colar código</button>
        <label class="btn">📂 Abrir arquivo<input type="file" accept=".json,application/json" data-action-file="import-file" hidden></label></div>
      ${list.length ? `<div class="char-list">${list.map(c => {
        const errs = E.validate(c).filter(i => i.level === 'error').length;
        const cls = R.classes[c.classId], race = R.races[c.raceId];
        return `<article class="char-card">
          <h2>${esc(c.name || 'Sem nome')}</h2>
          <p class="muted">${[race && race.name, cls && cls.name].filter(Boolean).join(' · ') || 'Em criação'}${c.player ? ' — ' + esc(c.player) : ''}</p>
          <p class="${errs ? 'warn' : 'ok'}">${errs ? `⏳ ${errs} pendência(s) — etapa ${c.step + 1}/${STEPS.length}` : '✅ Ficha completa'}</p>
          <div class="row-actions">
            <button class="btn sm primary" data-action="open-char" data-id="${c.id}">Continuar</button>
            <a class="btn sm" href="#/ficha/${c.id}">Ver ficha</a>
            <button class="btn sm" data-action="copy-code" data-id="${c.id}">Copiar código</button>
            <button class="btn sm" data-action="duplicate" data-id="${c.id}">Duplicar</button>
            <button class="btn sm danger" data-action="delete-char" data-id="${c.id}">Excluir</button>
          </div></article>`;
      }).join('')}</div>` : '<p class="callout">Nenhum personagem ainda. Que tal criar o primeiro?</p>'}
    </section>`;
  }
  function renderSheetPage(id) {
    const c = chars[id];
    if (!c) { $app.innerHTML = '<section class="page"><p class="callout">Personagem não encontrado.</p></section>'; return; }
    $app.innerHTML = `<section class="page"><div class="sheet-actions no-print">
      <a class="btn" href="#/personagens">← Voltar</a><button class="btn primary" data-action="print">🖨️ Imprimir / Salvar PDF</button>
      <button class="btn" data-action="open-char" data-id="${c.id}">✏️ Editar</button></div>${sheetHTML(c)}</section>`;
  }
  function importCharacter(obj) {
    if (!obj || typeof obj !== 'object') throw new Error('Arquivo inválido');
    const ch = obj.character || obj;
    if (!('classId' in ch) || !('abilities' in ch)) throw new Error('Isto não parece uma ficha do Character Forge');
    const c = migrate(ch);
    if (chars[c.id] && !confirm('Já existe um personagem com este código. Substituir?')) c.id = E.newCharacter().id;
    chars[c.id] = c; saveChars();
    return c;
  }

  /* ======================================================================= Quiz */
  function renderQuiz() {
    if (quiz.done) {
      const ranked = Object.entries(quiz.scores).sort((a, b) => b[1] - a[1]).slice(0, 3);
      $app.innerHTML = `<section class="page narrow">
        <p class="eyebrow">Descubra seu aventureiro</p><h1>Suas classes ideais</h1>
        <p class="intro">Com base nas suas respostas, estas são as classes que mais combinam com você:</p>
        <div class="quiz-results">${ranked.map(([id], i) => { const k = R.classes[id]; return `<article class="detail ${i === 0 ? 'top' : ''}">
          <h2>${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} ${k.name}</h2><p>${k.tagline}</p>
          <p class="muted">${stars(k.difficulty)} ${diffLabel(k.difficulty)} · ${k.role}</p>
          <p class="example"><strong>Exemplo de turno:</strong> ${k.exampleTurn}</p>
          <p class="small"><strong>Caminhos bons para começar:</strong> ${P.classes[id].options.filter(o => o.beginner).map(o => esc(o.name)).join(', ')} <a href="#/trilhas" data-action="trail-class" data-id="${id}">ver todos</a></p>
          <button class="btn primary" data-action="quiz-use" data-id="${id}">Criar um ${k.name}</button></article>`; }).join('')}</div>
        <button class="btn ghost" data-action="quiz-restart">Refazer o quiz</button></section>`;
      return;
    }
    const q = C.quiz[quiz.i];
    $app.innerHTML = `<section class="page narrow">
      <p class="eyebrow">Pergunta ${quiz.i + 1} de ${C.quiz.length}</p>
      <div class="progress"><span style="width:${(quiz.i / C.quiz.length) * 100}%"></span></div>
      <h1>${q.q}</h1>
      <div class="quiz-answers">${q.a.map((a, i) => `<button class="card" data-action="quiz-answer" data-id="${i}"><strong>${a.t}</strong></button>`).join('')}</div>
      ${quiz.i > 0 ? '<button class="btn ghost" data-action="quiz-restart">Recomeçar</button>' : ''}</section>`;
  }

  /* ====================================================================== Grupo */
  function renderParty() {
    const mine = Object.values(chars).filter(c => !party.members.some(m => m.id === c.id));
    const members = party.members;
    const roles = new Set(members.flatMap(m => C.roles[m.classId] || []));
    const missing = ['frente', 'cura', 'dano', 'social'].filter(r => !roles.has(r));
    const opt = members.map((m, i) => `<option value="${i}">${esc(m.name || 'Sem nome')}</option>`).join('');
    $app.innerHTML = `<section class="page">
      <p class="eyebrow">Party Builder</p>
      <h1><input class="title-input" type="text" data-party="name" value="${esc(party.name)}" aria-label="Nome da campanha" maxlength="60"></h1>
      <p class="intro">Mestre: peça para cada jogador clicar em <strong>“Copiar código para o mestre”</strong> na ficha final e colar aqui. Os dados ficam salvos neste navegador.</p>
      <div class="sheet-actions">
        <button class="btn primary" data-action="party-import">📥 Colar código de personagem</button>
        ${mine.length ? `<select id="partyMine" aria-label="Adicionar personagem deste navegador"><option value="">Adicionar personagem deste navegador…</option>${mine.map(c => `<option value="${c.id}">${esc(c.name || 'Sem nome')}</option>`).join('')}</select>` : ''}
        ${members.length ? `<button class="btn" data-action="party-export">📋 Copiar código do grupo</button>` : ''}
      </div>
      ${members.length ? `<div class="party-cov ${missing.length ? '' : 'ok'}">${missing.length ? `<strong>Dica para o grupo:</strong> ninguém cobre ${missing.map(r => C.roleNames[r]).join(', ')}. Não é obrigatório — mas é bom saber!` : '<strong>Grupo equilibrado:</strong> há linha de frente, cura, dano e alguém para conversar.'}</div>
      <div class="party-grid">${members.map((m, i) => { const d = E.derive(m); const cls = R.classes[m.classId], race = R.races[m.raceId]; return `<article class="char-card">
        <h2>${esc(m.name || 'Sem nome')}</h2><p class="muted">${[race && race.name, cls && cls.name].filter(Boolean).join(' · ')}${m.player ? ' — ' + esc(m.player) : ''}</p>
        ${d.path && d.path.option ? `<p class="small">🗺️ ${d.path.pickLevel > 1 ? 'Planeja: ' : ''}<b>${esc(d.path.option.name)}</b>${d.path.pickLevel > 1 ? ` (nv ${d.path.pickLevel})` : ''}</p>` : ''}
        <p>${(C.roles[m.classId] || []).map(r => `<span class="tag">${C.roleNames[r]}</span>`).join(' ')}</p>
        <p class="small">PV <b>${d.hp ?? '—'}</b> · CA <b>${d.ac}</b> · Percepção passiva <b>${d.passivePerception}</b>${d.spellcasting ? ` · CD magia <b>${d.spellcasting.dc}</b>` : ''}</p>
        ${m.story.motivation ? `<p class="small"><b>Motivação:</b> ${esc(m.story.motivation)}</p>` : ''}
        <div class="row-actions"><button class="btn sm" data-action="party-view" data-id="${i}">Ver ficha</button><button class="btn sm danger" data-action="party-remove" data-id="${i}">Remover</button></div></article>`; }).join('')}</div>` : '<p class="callout">Nenhum personagem no grupo ainda.</p>'}
      ${members.length >= 2 ? `<h2>Vínculos entre personagens</h2>
        <p class="muted">Ligações criam motivos para o grupo ficar junto. Ideias: “cresceram na mesma vila”, “um salvou a vida do outro”, “rivais amigáveis”, “um deve dinheiro ao outro”.</p>
        <div class="bond-form"><select id="bondA" aria-label="Primeiro personagem">${opt}</select><select id="bondB" aria-label="Segundo personagem">${opt}</select>
          <input type="text" id="bondText" placeholder="Como eles se conhecem?" maxlength="160"><button class="btn primary" data-action="bond-add">Adicionar vínculo</button>
          <button class="btn" data-action="bond-random">🎲 Sugerir</button></div>
        <ul class="bonds">${party.bonds.map((b, i) => `<li><strong>${esc(b.a)}</strong> ↔ <strong>${esc(b.b)}</strong>: ${esc(b.text)} <button class="btn sm danger" data-action="bond-remove" data-id="${i}" aria-label="Remover vínculo">✕</button></li>`).join('')}</ul>` : ''}
      <div id="partySheet"></div>
    </section>`;
  }
  const BOND_IDEAS = ['cresceram na mesma vila', 'um salvou a vida do outro', 'são rivais amigáveis', 'um deve dinheiro ao outro', 'foram presos na mesma cela', 'servem ao mesmo mentor', 'são primos distantes', 'sobreviveram juntos a um naufrágio', 'dividem um segredo perigoso'];

  /* =================================================================== Tutorial */
  function dice(expr) {
    const m = String(expr).match(/(\d+)d(\d+)\s*([+-]\s*\d+)?/);
    if (!m) return { total: Number(expr) || 0, rolls: [] };
    const rolls = Array.from({ length: +m[1] }, () => 1 + Math.floor(Math.random() * +m[2]));
    const bonus = m[3] ? Number(m[3].replace(/\s/g, '')) : 0;
    return { total: rolls.reduce((a, b) => a + b, 0) + bonus, rolls, bonus };
  }
  const d20 = () => 1 + Math.floor(Math.random() * 20);

  function tutHero() {
    const c = cur();
    if (c && R.classes[c.classId] && E.derive(c).ready) {
      const d = E.derive(c);
      const melee = d.attacks.filter(a => R.weapons[a.id] ? R.weapons[a.id].type === 'melee' : true).sort((a, b) => b.bonus - a.bonus)[0];
      const ranged = d.attacks.filter(a => R.weapons[a.id] && (R.weapons[a.id].type === 'ranged' || R.weapons[a.id].props.some(p => p.startsWith('arremesso')))).sort((a, b) => b.bonus - a.bonus)[0];
      const dmgCantrip = (c.choices.cantrips || []).map(id => ({ id, ...R.spells[id] })).find(s => ['firebolt', 'eldritchblast', 'sacredflame', 'rayoffrost', 'viciousmockery', 'produceflame', 'chilltouch', 'acidsplash'].includes(s.id));
      const parse = a => { const m = a.damage.match(/(\d+d\d+)\s*([+−]\s*\d+)?/); return m ? m[1] + (m[2] ? m[2].replace('−', '-').replace(/\s/g, '') : '') : '1d4'; };
      return {
        name: c.name || 'Seu herói', ac: d.ac, hp: d.hp, maxHp: d.hp, init: d.initiative, real: true,
        melee: melee ? { name: melee.name, bonus: melee.bonus, dmg: parse(melee) } : { name: 'Soco', bonus: d.mods.str + 2, dmg: '1d1' + (d.mods.str > 0 ? '+' + d.mods.str : '') },
        ranged: ranged ? { name: ranged.name, bonus: ranged.bonus, dmg: parse(ranged) } : null,
        cantrip: dmgCantrip && d.spellcasting ? { name: dmgCantrip.name, id: dmgCantrip.id, bonus: d.spellcasting.attack, dc: d.spellcasting.dc, dmg: { firebolt: '1d10', eldritchblast: '1d10', sacredflame: '1d8', rayoffrost: '1d8', viciousmockery: '1d4', produceflame: '1d8', chilltouch: '1d8', acidsplash: '1d6' }[dmgCantrip.id] } : null,
        talk: Math.max(d.skills.find(s => s.id === 'intimidation').bonus, d.skills.find(s => s.id === 'persuasion').bonus),
        cls: c.classId
      };
    }
    return { name: 'Guerreiro de exemplo', ac: 16, hp: 12, maxHp: 12, init: 1, real: false, melee: { name: 'Espada longa', bonus: 5, dmg: '1d8+3' }, ranged: { name: 'Besta leve', bonus: 3, dmg: '1d8+1' }, cantrip: null, talk: 1, cls: 'fighter' };
  }
  function tutStart() {
    const hero = tutHero();
    const hi = d20() + hero.init, gi = d20() + 2;
    tut = { hero, gob: { hp: C.goblin.hp }, round: 1, distance: 9, log: [], over: false };
    tut.log.push({ t: `Um goblin salta de trás de uma pedra, a <b>9 m</b> de você, com cimitarra e arco curto! Todos rolam ${T('iniciativa')}: você tirou <b>${hi}</b> (d20 ${sign(hero.init)}), o goblin tirou <b>${gi}</b> (d20 +2).`, rule: 'A iniciativa define a ordem dos turnos. Quem tirar mais age primeiro. Cada turno você pode se mover (seu deslocamento) e fazer uma ação.' });
    if (gi > hi) goblinTurn();
  }
  function goblinTurn() {
    const g = C.goblin, h = tut.hero;
    if (tut.gob.hp <= 0 || tut.over) return;
    const r = d20(), total = r + g.atk;
    const weapon = tut.distance > 1.5 ? 'o arco curto' : 'a cimitarra';
    const disadv = tut.dodging;
    let r2 = null, used = r;
    if (disadv) { r2 = d20(); used = Math.min(r, r2); }
    const tot = used + g.atk;
    let txt = `<b>Turno do goblin:</b> ataca com ${weapon}. Rolou ${disadv ? `${r} e ${r2} (desvantagem, usa o menor: ${used})` : used} + ${g.atk} = <b>${tot}</b> contra sua CA <b>${h.ac}</b>. `;
    let rule = `Para acertar, a rolagem de ataque precisa igualar ou superar a ${'CA'} do alvo. Sua CA vem da armadura, escudo e Destreza.`;
    if (used === 20 || (used !== 1 && tot >= h.ac)) {
      const dm = dice('1d6+2');
      const dmg = used === 20 ? dm.total + dice('1d6').total : dm.total;
      h.hp -= dmg;
      txt += used === 20 ? `<b>Acerto crítico!</b> Você sofre <b>${dmg}</b> de dano.` : `Acertou! Você sofre <b>${dmg}</b> de dano (1d6+2).`;
      if (used === 20) rule += ' Um 20 natural é crítico: rola os dados de dano duas vezes.';
    } else txt += 'Errou! Sua defesa segurou o golpe.';
    if (disadv) rule += ' Você usou a ação Esquivar, então o goblin teve desvantagem.';
    tut.dodging = false;
    tut.log.push({ t: txt, rule });
    if (h.hp <= 0) {
      h.hp = 0; tut.over = true;
      tut.log.push({ t: '<b>Você caiu a 0 PV!</b>', rule: 'Com 0 PV você fica inconsciente e faz testes contra a morte (d20: 10+ é sucesso) no início dos seus turnos. 3 sucessos: estabiliza; 3 falhas: morre. Um aliado com cura (ou Medicina) pode te levantar. Não desanime: no jogo real, você não está sozinho!' });
    }
  }
  function tutAct(kind) {
    if (!tut || tut.over) return;
    const h = tut.hero, g = C.goblin;
    const attack = (atk, label, extraRule) => {
      const r = d20(), tot = r + atk.bonus;
      let t = `Você ataca com <b>${atk.name}</b>: rolou ${r} ${sign(atk.bonus)} = <b>${tot}</b> contra a CA <b>${g.ac}</b> do goblin. `;
      let rule = `Ataque = d20 + modificador do atributo + proficiência. ${extraRule || ''}`;
      if (r === 20 || (r !== 1 && tot >= g.ac)) {
        const dm = dice(atk.dmg); let dmg = Math.max(1, dm.total);
        if (r === 20) { dmg += dice(atk.dmg.replace(/[+-]\d+$/, '')).total; t += '<b>Crítico!</b> '; }
        tut.gob.hp -= dmg; t += `Acertou! ${dmg} de dano (${atk.dmg}). `;
        t += tut.gob.hp > 0 ? 'O goblin está ferido.' : 'O goblin cai derrotado!';
      } else t += r === 1 ? 'Um 1 natural: erro automático.' : 'Errou!';
      tut.log.push({ t: label + t, rule });
    };
    if (kind === 'melee') {
      const moved = tut.distance > 1.5;
      tut.distance = 1.5;
      attack(h.melee, moved ? 'Você usa seu <b>movimento</b> para correr os 9 m até o goblin. ' : '', moved ? 'Mover-se não gasta sua ação: dá para andar e atacar no mesmo turno.' : '');
    } else if (kind === 'ranged') {
      attack(h.ranged, '', tut.distance <= 1.5 ? 'Atacar à distância com um inimigo do lado dá desvantagem — por simplicidade ignoramos aqui, mas lembre disso na mesa!' : 'Atacar de longe mantém você seguro dos golpes corpo a corpo.');
    } else if (kind === 'cantrip') {
      const cp = h.cantrip;
      if (['sacredflame', 'viciousmockery', 'acidsplash'].includes(cp.id)) {
        const r = d20(), save = r + (cp.id === 'viciousmockery' ? -1 : 2);
        let t = `Você lança <b>${cp.name}</b>. O goblin faz um ${T('resistencia', 'teste de resistência')}: ${r} ${cp.id === 'viciousmockery' ? '−1' : '+2'} = <b>${save}</b> contra sua CD <b>${cp.dc}</b>. `;
        if (save < cp.dc) { const dmg = dice(cp.dmg).total; tut.gob.hp -= dmg; t += `Falhou! ${dmg} de dano.` + (tut.gob.hp <= 0 ? ' O goblin cai!' : ''); } else t += 'Ele resistiu! Truques assim não causam dano quando o alvo passa.';
        tut.log.push({ t, rule: 'Algumas magias não rolam ataque: o alvo é que rola para resistir contra a sua CD de magia (8 + proficiência + atributo).' });
      } else attack({ name: cp.name, bonus: cp.bonus, dmg: cp.dmg }, '', 'Para magias, o ataque usa seu atributo de conjuração. Truques não gastam espaços de magia!');
    } else if (kind === 'talk') {
      const r = d20(), tot = r + h.talk;
      const ok = tot >= 13;
      tut.log.push({ t: `Você grita para o goblin largar a arma. Teste de Carisma (Intimidação/Persuasão): ${r} ${sign(h.talk)} = <b>${tot}</b> contra CD 13 (definida pelo mestre). ` + (ok ? '<b>Funciona!</b> O goblin larga a cimitarra e foge pela mata.' : 'O goblin ri e continua lutando.'), rule: 'Nem todo combate precisa terminar com espadas. O mestre define uma CD (dificuldade) e você rola d20 + perícia. Tentar conversar é sempre válido!' });
      if (ok) { tut.over = true; tut.win = 'talk'; return; }
    } else if (kind === 'dodge') {
      tut.dodging = true;
      tut.log.push({ t: 'Você usa a ação <b>Esquivar</b> e foca em se defender.', rule: 'Esquivar: até seu próximo turno, ataques contra você têm desvantagem (o inimigo rola 2d20 e usa o menor). Bom quando você está ferido e esperando ajuda.' });
    }
    if (tut.gob.hp <= 0) { tut.over = true; tut.win = 'fight'; return; }
    goblinTurn();
    tut.round++;
    if (!tut.over && tut.round > 4) {
      tut.over = true; tut.win = 'flee';
      tut.log.push({ t: 'O goblin, assustado, usa <b>Fuga Ágil</b> (desengajar como ação bônus) e some na floresta.', rule: 'Ao sair do alcance de um inimigo, ele pode fazer um ataque de oportunidade (reação). A ação Desengajar evita isso.' });
    }
  }
  function renderTutorial() {
    if (!tut) tutStart();
    const h = tut.hero;
    const end = tut.over ? `<div class="callout ${tut.win ? 'success' : 'error'}"><strong>${tut.win === 'fight' ? '🏆 Vitória!' : tut.win === 'talk' ? '🗣️ Vitória sem lutar!' : tut.win === 'flee' ? '💨 O goblin fugiu!' : '💀 Fim do tutorial'}</strong>
        <p>O que você praticou: iniciativa, movimento + ação, rolagem de ataque contra CA, dano e (talvez) resistências e perícias sociais. Na mesa real, o mestre narra e decide os detalhes — e não existe uma única resposta certa.</p>
        <button class="btn primary" data-action="tut-restart">Jogar de novo</button></div>` : '';
    $app.innerHTML = `<section class="page narrow">
      <p class="eyebrow">Tutorial de combate</p><h1>Emboscada goblin</h1>
      <p class="muted">${h.real ? `Usando a ficha de <b>${esc(h.name)}</b>.` : 'Usando um personagem de exemplo. Crie seu personagem para jogar com ele!'} Os dados são rolados de verdade.</p>
      <div class="tut-hud">
        <div><b>${esc(h.name)}</b><span>PV ${h.hp}/${h.maxHp} · CA ${h.ac}</span><div class="bar"><span style="width:${Math.max(0, h.hp / h.maxHp * 100)}%"></span></div></div>
        <div><b>Goblin</b><span>CA ${C.goblin.ac} · ${tut.gob.hp > 0 ? (tut.gob.hp >= C.goblin.hp ? 'ileso' : 'ferido') : 'derrotado'}</span><div class="bar enemy"><span style="width:${Math.max(0, tut.gob.hp / C.goblin.hp * 100)}%"></span></div></div>
        <div><b>Distância</b><span>${meters(tut.distance)}</span></div>
      </div>
      <ol class="tut-log">${tut.log.map(l => `<li><p>${l.t}</p>${l.rule ? `<p class="rule">📘 <b>Regra:</b> ${l.rule}</p>` : ''}</li>`).join('')}</ol>
      ${tut.over ? end : `<h2>Rodada ${tut.round}: o que você faz?</h2>
      <div class="tut-choices">
        <button class="card" data-action="tut" data-id="melee"><strong>${tut.distance > 1.5 ? 'Correr e atacar' : 'Atacar'} com ${esc(h.melee.name)}</strong><span>Acerto ${sign(h.melee.bonus)}, dano ${h.melee.dmg}</span></button>
        ${h.ranged ? `<button class="card" data-action="tut" data-id="ranged"><strong>Atacar à distância com ${esc(h.ranged.name)}</strong><span>Acerto ${sign(h.ranged.bonus)}, dano ${h.ranged.dmg}</span></button>` : ''}
        ${h.cantrip ? `<button class="card" data-action="tut" data-id="cantrip"><strong>Lançar ${esc(h.cantrip.name)}</strong><span>Truque, dano ${h.cantrip.dmg}</span></button>` : ''}
        <button class="card" data-action="tut" data-id="talk"><strong>Intimidar ou convencer</strong><span>Teste de Carisma ${sign(h.talk)}</span></button>
        <button class="card" data-action="tut" data-id="dodge"><strong>Esquivar</strong><span>Defender-se até o próximo turno</span></button>
      </div>`}</section>`;
    const last = $app.querySelector('.tut-log li:last-child');
    if (last && tut.log.length > 1) last.scrollIntoView({ block: 'nearest' });
  }

  /* ================================================================== Glossário */
  function renderGlossary() {
    const items = Object.values(C.glossary).sort((a, b) => a.t.localeCompare(b.t));
    $app.innerHTML = `<section class="page narrow"><h1>Glossário</h1>
      <p class="intro">Termos que aparecem na ficha, explicados sem complicação. Dica: no criador, clique em qualquer termo sublinhado para ver a explicação.</p>
      <label class="field"><span>Buscar</span><input type="search" id="glossSearch" placeholder="Ex.: vantagem"></label>
      <dl class="gloss">${items.map(g => `<div data-g="${esc((g.t + ' ' + g.d).toLowerCase())}"><dt>${g.t}</dt><dd>${g.d}</dd></div>`).join('')}</dl>
      <p class="muted small">Edição de regras: ${R.edition}.</p></section>`;
  }

  /* ================================================================== Popover */
  const pop = document.getElementById('popover');
  function showTerm(btn) {
    const g = C.glossary[btn.dataset.term]; if (!g) return;
    pop.innerHTML = `<strong>${g.t}</strong><p>${g.d}</p>`;
    pop.hidden = false;
    const r = btn.getBoundingClientRect();
    const w = Math.min(320, window.innerWidth - 24);
    pop.style.width = w + 'px';
    let left = Math.max(12, Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - w - 12));
    pop.style.left = left + 'px';
    pop.style.top = (r.bottom + window.scrollY + 8) + 'px';
    btn.setAttribute('aria-describedby', 'popover');
  }
  function hideTerm() { pop.hidden = true; }

  /* =================================================================== Eventos */
  function resetClassChoices(c) {
    Object.assign(c.choices, { classSkills: [], tools: [], fightingStyle: '', favoredEnemy: '', terrain: '', expertise: [], sorcDragon: '', cantrips: [], spells: [], prepared: [], subclass: '' });
    c.equipment = { groups: {}, picks: {} };
  }

  document.addEventListener('click', e => {
    const term = e.target.closest('.term');
    if (term) {
      e.preventDefault();
      if (!pop.hidden && pop.dataset.for === term.dataset.term) hideTerm();
      else { showTerm(term); pop.dataset.for = term.dataset.term; }
      return;
    }
    if (!e.target.closest('#popover')) hideTerm();
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const act = el.dataset.action, id = el.dataset.id;
    const c = cur();
    const focusKey = `[data-action="${act}"]${id != null ? `[data-id="${CSS.escape(id)}"]` : ''}${el.dataset.list ? `[data-list="${el.dataset.list}"]` : ''}${el.dataset.gi != null ? `[data-gi="${el.dataset.gi}"][data-oi="${el.dataset.oi}"]` : ''}${el.dataset.n != null ? `[data-n="${el.dataset.n}"]` : ''}`;
    if (route()[0] === 'ficha' && c) {
      const r = CF.sheetTab.action(CF.ui, act, el, c);
      if (r === true) { touch(); rerenderLive(focusKey); return; }
      if (r === false) return;
    }
    const done = () => { touch(); rerender(focusKey); };
    if ((act === 'pk-toggle' || act === 'pk-mode') && c && CF.sheetTab) {
      const fk = focusKey + (el.dataset.fo ? `[data-fo="${el.dataset.fo}"]` : '');
      if (CF.sheetTab.pickAction(CF.ui, c, el)) { touch(); if (route()[0] === 'ficha') rerenderLive(fk); else rerender(fk); }
      return;
    }
    const showDetail = () => { const d = document.querySelector('.panel .detail'); if (d) d.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };

    switch (act) {
      case 'new-char': newChar(); go('criar'); return;
      case 'continue': go('criar'); return;
      case 'open-char': currentId = id; saveChars(); go('criar'); if (route()[0] === 'criar') render(); return;
      case 'goto-step': c.step = Number(id); touch(); rerender('#stepTitle'); window.scrollTo({ top: 0, behavior: 'smooth' }); return;
      case 'next': c.step = Math.min(STEPS.length - 1, c.step + 1); touch(); rerender('#stepTitle'); window.scrollTo({ top: 0, behavior: 'smooth' }); return;
      case 'prev': c.step = Math.max(0, c.step - 1); touch(); rerender('#stepTitle'); window.scrollTo({ top: 0, behavior: 'smooth' }); return;
      case 'set-concept': c.concept = id; return done();
      case 'lang-rec': {
        const arr = getPath(c, el.dataset.arr) || [];
        const slots = Number(el.dataset.slots) || 1;
        let i = Array.from({ length: slots }, (_, k) => k).find(k => !arr[k]);
        if (i == null) i = slots - 1;
        arr[i] = id; setPath(c, el.dataset.arr, arr);
        toast(`${id} adicionado aos idiomas.`);
        return done();
      }
      case 'set-subclass': {
        const cls = R.classes[c.classId];
        c.choices.subclass = c.choices.subclass === id ? '' : id;
        if (cls.subclass && c.choices.subclass !== cls.subclass.id) {
          // efeitos do caminho do SRD deixam de valer
          if (c.classId === 'sorcerer') c.choices.sorcDragon = '';
          const allowed = new Set(E.spellList(c.classId, 1, c.choices.subclass).map(s => s.id));
          c.choices.spells = c.choices.spells.filter(x => allowed.has(x));
        }
        return done();
      }
      case 'trail-class': e.preventDefault(); trail = { cls: id, sub: '' }; if (route()[0] !== 'trilhas') go('trilhas'); else renderTrails(); return;
      case 'trail-sub': trail.sub = trail.sub === id ? '' : id; renderTrails(); { const el2 = document.querySelector(`[data-action="trail-sub"][data-id="${id}"]`); if (el2) el2.focus({ preventScroll: true }); } return;
      case 'trail-create': { const ch = newChar({ classId: trail.cls }); ch.choices.subclass = trail.sub; ch.concept = (C.concepts.find(k => k.classes[0] === trail.cls) || C.concepts.find(k => k.classes.includes(trail.cls)) || {}).id || ''; saveChars(); go('criar'); toast('Classe e caminho já selecionados. Dê um nome ao personagem!'); return; }
      case 'set-class':
        if (c.classId !== id) { c.classId = id; resetClassChoices(c); }
        done(); return showDetail();
      case 'set-race':
        if (c.raceId !== id) { c.raceId = id; Object.assign(c.choices, { raceSkills: [], halfElfAsi: [], raceTool: '', dragon: '', elfCantrip: '', raceLangs: [], feat: '' }); }
        done(); return showDetail();
      case 'set-bg':
        if (c.backgroundId !== id) { c.backgroundId = id; Object.assign(c.choices, { bgSkills: [], bgLangs: [], bgToolLang: [], bgIdea: '', bgTools: [], bgSwap: {} }); }
        done(); return showDetail();
      case 'bg-idea': {
        const idea = R.customBackgroundIdeas.find(i => i.name === id);
        c.choices.bgIdea = id;
        const taken = new Set([...(R.races[c.raceId] && R.races[c.raceId].skills || []), ...c.choices.raceSkills]);
        c.choices.bgSkills = idea.skills.filter(s => !taken.has(s));
        c.choices.classSkills = c.choices.classSkills.filter(s => !c.choices.bgSkills.includes(s));
        return done();
      }
      case 'set-choice': c.choices[el.dataset.key] = c.choices[el.dataset.key] === id ? '' : id; return done();
      case 'take-bg-skill': {
        const cls = R.classes[c.classId], bg = R.backgrounds[c.backgroundId];
        if (c.choices.classSkills.length >= cls.skillChoices) { toast(`Você já escolheu ${cls.skillChoices} perícias da classe. Desmarque uma primeiro.`); return; }
        const swap = c.choices.bgSwap || (c.choices.bgSwap = {});
        const orig = bg.skills.find(o => (swap[o] || o) === id);
        if (orig == null) return;
        swap[orig] = '__pick__';
        c.choices.classSkills.push(id);
        toast(`${E.skillName(id)} agora é perícia da classe. Escolha outra perícia no antecedente.`);
        return done();
      }
      case 'toggle-list': {
        const key = el.dataset.list, max = Number(el.dataset.max);
        const arr = c.choices[key];
        const i = arr.indexOf(id);
        if (i >= 0) arr.splice(i, 1); else if (arr.length < max) arr.push(id);
        if (key === 'classSkills' && i >= 0) {
          const swap = c.choices.bgSwap || {}, bg = R.backgrounds[c.backgroundId];
          if (bg && bg.skills && bg.skills.includes(id) && swap[id] === '__pick__') delete swap[id];
        }
        if (key === 'spells') c.choices.prepared = c.choices.prepared.filter(x => c.choices.spells.includes(x) || c.classId !== 'wizard');
        if (key === 'classSkills' || key === 'raceSkills' || key === 'bgSkills') c.choices.expertise = c.choices.expertise.filter(x => x === 'thieves' || E.proficiencies(c).skills.has(x));
        return done();
      }
      case 'set-method': c.abilities.method = id; return done();
      case 'pb': {
        const v = c.abilities.pointbuy[id] + Number(el.dataset.delta);
        if (v >= 8 && v <= 15) { c.abilities.pointbuy[id] = v; if (E.pointBuyCost(c.abilities.pointbuy) > 27) c.abilities.pointbuy[id] -= Number(el.dataset.delta); }
        return done();
      }
      case 'suggest-abilities':
        if (c.abilities.method === 'manual') c.abilities.method = 'standard';
        if (c.abilities.method === 'standard') c.abilities.standard = E.suggestStandard(c.classId);
        else c.abilities.pointbuy = E.suggestPointBuy(c.classId);
        toast('Distribuição sugerida! Você pode ajustar à vontade.');
        return done();
      case 'eq-option': c.equipment.groups[el.dataset.gi] = Number(el.dataset.oi); return done();
      case 'story-idea': c.story[el.dataset.key] = id; return done();
      case 'story-random': c.story[el.dataset.key] = pick(C.story.questions.find(q => q.id === el.dataset.key).ideas); return done();
      case 'story-pers': c.story[el.dataset.key] = pick(C.story[el.dataset.key]); return done();
      case 'gen-story':
        if (c.story.backstory.trim() && !confirm('Substituir o texto atual da história pelo rascunho gerado?')) return;
        c.story.backstory = genStory(c); toast('Rascunho criado! Edite como quiser.'); return done();
      case 'print': window.print(); return;
      case 'copy-code': copyText(encodeShare(chars[id])); return;
      case 'download-json': { const ch = chars[id]; download((ch.name || 'personagem').replace(/[^\w\-]+/g, '_') + '.json', JSON.stringify({ app: 'character-forge', version: 1, character: ch }, null, 2)); return; }
      case 'duplicate': { const copy = migrate(JSON.parse(JSON.stringify(chars[id]))); copy.id = E.newCharacter().id; copy.name = (copy.name || 'Sem nome') + ' (cópia)'; copy.updatedAt = Date.now(); chars[copy.id] = copy; saveChars(); renderList(); return; }
      case 'delete-char':
        if (!confirm(`Excluir “${chars[id].name || 'Sem nome'}”? Esta ação não pode ser desfeita.`)) return;
        delete chars[id]; if (currentId === id) currentId = null; saveChars(); renderList(); return;
      case 'import-code': {
        const code = prompt('Cole o código do personagem (começa com CF1:)');
        if (!code) return;
        try { const ch = importCharacter(decodeShare(code)); toast('“' + (ch.name || 'Personagem') + '” importado!'); renderList(); } catch (err) { alert('Não foi possível importar: ' + err.message); }
        return;
      }
      case 'quiz-answer': {
        const a = C.quiz[quiz.i].a[Number(id)];
        Object.entries(a.w).forEach(([k, v]) => { quiz.scores[k] = (quiz.scores[k] || 0) + v; });
        quiz.i++; if (quiz.i >= C.quiz.length) quiz.done = true;
        renderQuiz(); return;
      }
      case 'quiz-restart': quiz = { i: 0, scores: {}, done: false }; renderQuiz(); return;
      case 'quiz-use': { const conceptFor = (C.concepts.find(k => k.classes[0] === id) || C.concepts.find(k => k.classes.includes(id)) || {}).id || ''; newChar({ classId: id, concept: conceptFor, step: 0 }); go('criar'); toast('Classe ' + R.classes[id].name + ' já selecionada. Dê um nome ao personagem!'); return; }
      case 'party-add': {
        const ch = chars[id];
        const i = party.members.findIndex(m => m.id === ch.id);
        if (i >= 0) party.members[i] = JSON.parse(JSON.stringify(ch)); else party.members.push(JSON.parse(JSON.stringify(ch)));
        saveParty(); toast('Adicionado ao grupo “' + party.name + '”.'); return;
      }
      case 'party-import': {
        const code = prompt('Cole o código do personagem ou do grupo:');
        if (!code) return;
        try {
          const obj = decodeShare(code);
          if (obj.members) { obj.members.forEach(m => { const mm = migrate(m); const i = party.members.findIndex(x => x.id === mm.id); if (i >= 0) party.members[i] = mm; else party.members.push(mm); }); party.bonds = party.bonds.concat(obj.bonds || []); if (obj.name) party.name = obj.name; }
          else { const ch = migrate(obj.character || obj); if (!('classId' in ch)) throw new Error('código inválido'); const i = party.members.findIndex(x => x.id === ch.id); if (i >= 0) party.members[i] = ch; else party.members.push(ch); }
          saveParty(); renderParty(); toast('Importado!');
        } catch (err) { alert('Não foi possível importar: ' + err.message); }
        return;
      }
      case 'party-export': copyText(encodeShare(party)); return;
      case 'party-remove': if (confirm('Remover do grupo?')) { party.members.splice(Number(id), 1); saveParty(); renderParty(); } return;
      case 'party-view': { const m = party.members[Number(id)]; document.getElementById('partySheet').innerHTML = `<div class="sheet-actions no-print"><button class="btn primary" data-action="print">🖨️ Imprimir esta ficha</button></div>${sheetHTML(m)}`; document.getElementById('partySheet').scrollIntoView({ behavior: 'smooth' }); return; }
      case 'bond-add': case 'bond-random': {
        const a = party.members[Number(document.getElementById('bondA').value)], b = party.members[Number(document.getElementById('bondB').value)];
        if (act === 'bond-random') { document.getElementById('bondText').value = pick(BOND_IDEAS); return; }
        const text = document.getElementById('bondText').value.trim();
        if (!a || !b || a === b) { alert('Escolha dois personagens diferentes.'); return; }
        if (!text) { alert('Descreva o vínculo (ou clique em “Sugerir”).'); return; }
        party.bonds.push({ a: a.name || 'Sem nome', b: b.name || 'Sem nome', text }); saveParty(); renderParty(); return;
      }
      case 'bond-remove': party.bonds.splice(Number(id), 1); saveParty(); renderParty(); return;
      case 'tut': tutAct(id); renderTutorial(); return;
      case 'tut-restart': tut = null; renderTutorial(); return;
    }
  });

  document.addEventListener('input', e => {
    const el = e.target;
    const c = cur();
    if (el.dataset.bind && c && !el.dataset.rerender) {
      setPath(c, el.dataset.bind, el.value); touch(); renderPreview(c);
      if (el.dataset.bind === 'name') { const st = document.getElementById('stepper'); if (st) renderStepper(c); }
    }
    if (el.dataset.manual && c) { c.abilities.manual[el.dataset.manual] = Number(el.value); touch(); renderPreview(c); renderStepper(c); }
    if (el.dataset.party) { party[el.dataset.party] = el.value; saveParty(); }
    if (el.dataset.st && c) { setPath(c, el.dataset.st, el.value); touch(); }
    if (el.id === 'glossSearch') { const q = el.value.toLowerCase().trim(); document.querySelectorAll('.gloss > div').forEach(d => { d.hidden = q && !d.dataset.g.includes(q); }); }
  });
  document.addEventListener('change', e => {
    const el = e.target;
    const c = cur();
    if (el.dataset.pk && c && CF.sheetTab) {
      if (CF.sheetTab.pickChange(CF.ui, c, el)) {
        touch();
        const fk = `[data-pk="${el.dataset.pk}"][data-f="${el.dataset.f}"]`;
        if (route()[0] === 'ficha') rerenderLive(fk); else rerender(fk);
      }
      return;
    }
    if (route()[0] === 'ficha' && c) {
      if (el.id === 'sheetSwitch' && el.value) { go('ficha/' + el.value); return; }
      if (el.dataset.sv) {
        let v = el.value === '' ? null : Number(el.value);
        if (el.dataset.sv === 'sheet.level') v = Math.min(CF.PATHS.levelCap, Math.max(1, v || 1));
        if (v != null && v < 0 && el.dataset.sv !== 'sheet.hpCurrent') v = 0;
        setPath(c, el.dataset.sv, v); touch(); rerenderLive(`[data-sv="${el.dataset.sv}"]`); return;
      }
      if (el.dataset.ov) {
        const k = el.dataset.ov, v = el.value;
        if (v === '' || Number(v) === Number(el.dataset.auto)) delete c.sheet.ov[k]; else c.sheet.ov[k] = Number(v);
        touch(); rerenderLive(`[data-ov="${k}"]`); return;
      }
      if (el.dataset.sel) { setPath(c, el.dataset.sel, el.value); touch(); rerenderLive(`[data-sel="${el.dataset.sel}"]`); return; }
      if (el.dataset.rr) { rerenderLive(); return; }
    }
    if (el.dataset.manual && c) { rerender(); return; }
    if (el.dataset.bind && el.dataset.rerender && c) { setPath(c, el.dataset.bind, el.value); touch(); rerender(`[data-bind="${el.dataset.bind}"]`); return; }
    if (el.dataset.arr && c) {
      const arr = getPath(c, el.dataset.arr);
      arr[Number(el.dataset.idx)] = el.value; touch(); rerender(`[data-arr="${el.dataset.arr}"][data-idx="${el.dataset.idx}"]`); return;
    }
    if (el.dataset.pick && c) { c.equipment.picks[el.dataset.pick] = el.value; touch(); rerender(`[data-pick="${el.dataset.pick}"]`); return; }
    if (el.dataset.std && c) {
      const st = c.abilities.standard, k = el.dataset.std, v = el.value === '' ? null : Number(el.value);
      const other = Object.keys(st).find(x => x !== k && Number(st[x]) === v && v != null);
      if (other) st[other] = st[k]; // troca os valores
      st[k] = v; touch(); rerender(`[data-std="${k}"]`); return;
    }
    if (el.id === 'partyMine' && el.value) { const ch = chars[el.value]; party.members.push(JSON.parse(JSON.stringify(ch))); saveParty(); renderParty(); return; }
    if (el.dataset.actionFile === 'import-file' && el.files[0]) {
      const r = new FileReader();
      r.onload = () => { try { const ch = importCharacter(JSON.parse(r.result)); toast('“' + (ch.name || 'Personagem') + '” importado!'); renderList(); } catch (err) { alert('Não foi possível importar: ' + err.message); } };
      r.readAsText(el.files[0]);
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hideTerm(); });
  window.addEventListener('scroll', () => { if (!pop.hidden) hideTerm(); }, { passive: true });

  render();
})();
