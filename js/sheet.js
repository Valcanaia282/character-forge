/* Character Forge — aba Ficha: ficha viva, editável livremente depois da criação.
 * Depende de CF.RULES, CF.PATHS, CF.engine e da API exposta por app.js em CF.ui. */
(function () {
  const R = CF.RULES, P = CF.PATHS, E = CF.engine;
  const CONDITIONS = ['Agarrado', 'Amedrontado', 'Atordoado', 'Caído', 'Cego', 'Enfeitiçado', 'Envenenado', 'Exaustão', 'Impedido', 'Incapacitado', 'Inconsciente', 'Invisível', 'Paralisado', 'Petrificado', 'Surdo'];
  const COINS = [['pc', 'PC', 'cobre'], ['pp', 'PP', 'prata'], ['pe', 'PE', 'electro'], ['po', 'PO', 'ouro'], ['pl', 'PL', 'platina']];

  function ensureSheet(c) {
    c.sheet = Object.assign(E.defaultSheet(), c.sheet || {});
    const sh = c.sheet;
    ['death', 'coins'].forEach(k => { sh[k] = Object.assign(E.defaultSheet()[k], sh[k] || {}); });
    if (!sh.coinsInit && c.backgroundId) {
      sh.coins.po = (R.backgrounds[c.backgroundId] || {}).gold || 0;
      sh.coinsInit = true;
    }
    if ((sh.features || '').trim()) {
      sh.abilities.push({ name: 'Anotações de habilidades', level: '', src: 'Outro', max: '', per: 'descanso longo', desc: sh.features });
      sh.features = '';
    }
    return sh;
  }

  const PREPARERS = ['cleric', 'druid', 'wizard', 'paladin'];
  const AB_SOURCES = ['Classe', 'Caminho', 'Espécie', 'Antecedente', 'Talento', 'Item mágico', 'Outro'];
  const PERS = ['descanso curto', 'descanso longo', 'dia'];
  const srdByName = name => { const n = (name || '').trim().toLowerCase(); const hit = Object.entries(R.spells).find(([, v]) => v.name.toLowerCase() === n); return hit ? { id: hit[0], ...hit[1] } : null; };
  const circleName = n => (Number(n) === 0 ? 'Truques' : `${n}º círculo`);
  const fold = t => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const IDX = () => CF.SPELL_INDEX || [];
  const DESC = name => (CF.SPELL_DESC || {})[(name || '').trim()] || null;
  const idxByName = name => IDX().find(e => e.n.toLowerCase() === (name || '').trim().toLowerCase());
  const SCHOOL_TAG = { abjuração: 'suporte', adivinhação: 'utilidade', conjuração: 'utilidade', encantamento: 'controle', evocação: 'dano', ilusão: 'controle', necromancia: 'dano', transmutação: 'utilidade' };

  /* Filtro do seletor de magias (mantido entre redesenhos da ficha). */
  let spFilter = { charId: null, circle: null, q: '', all: false };
  function filterFor(c, acc) {
    if (spFilter.charId !== c.id) spFilter = { charId: c.id, circle: null, q: '', all: false };
    const ok = v => v === 'all' || (Number(v) === 0 ? acc.cantrips : Number(v) >= 1 && Number(v) <= acc.max);
    if (spFilter.circle == null || !ok(spFilter.circle)) spFilter.circle = acc.max > 0 ? String(acc.max) : acc.cantrips ? '0' : 'all';
    if (!acc.secrets) spFilter.all = false;
    return spFilter;
  }
  /** Primeiro nível em que a classe libera um círculo. */
  function unlockLevel(c, circle) {
    for (let lv = 1; lv <= 20; lv++) if (E.spellAccess(c, lv).max >= circle) return lv;
    return null;
  }
  function spellPool(c, acc, f) {
    const have = new Set(c.sheet.spells.map(x => x.name.toLowerCase()));
    const lists = f.all && acc.secrets ? null : acc.lists;
    const q = fold(f.q);
    return IDX().filter(e =>
      (!lists || e.c.some(k => lists.includes(k)) || acc.extra.includes(e.n)) &&
      (e.l === 0 ? acc.cantrips : e.l <= acc.max) &&
      (f.circle === 'all' || e.l === Number(f.circle)) &&
      (!q || fold(e.n).includes(q))
    ).map(e => Object.assign({ have: have.has(e.n.toLowerCase()) }, e));
  }
  function pickListHTML(ui, c, acc, f) {
    const { esc } = ui;
    const pool = spellPool(c, acc, f);
    if (!pool.length) return '<p class="muted small">Nenhuma magia encontrada com esses filtros.</p>';
    return `<p class="tiny muted">${pool.length} magia${pool.length > 1 ? 's' : ''}${f.all ? ' de todas as classes' : ''}</p>
      <ul class="sp-pick-list">${pool.map(e => {
        const srd = e.id ? R.spells[e.id] : null;
        const others = f.all ? e.c.filter(k => !acc.lists.includes(k)) : [];
        return `<li class="${e.have ? 'have' : ''}">
          <div class="sp-pick-info"><b>${esc(e.n)}</b>
            <small>${e.l === 0 ? 'truque' : e.l + 'º círculo'} · ${e.s}${e.r ? ' · ritual' : ''}${e.p ? ' · LdJ p. ' + e.p : ''}${others.length ? ' · lista: ' + others.map(k => R.classes[k].name).join(', ') : ''}</small>
            ${srd ? `<span class="sp-mini">${esc(srd.desc)}</span>` : DESC(e.n) ? `<span class="sp-mini">${esc(DESC(e.n).d)}</span>` : '<span class="sp-mini muted">Descrição no Livro do Jogador.</span>'}</div>
          ${e.have ? '<span class="have-tag">✓ no quadro</span>' : `<button class="btn sm" data-action="sp-add-idx" data-id="${esc(e.n)}">+ Adicionar</button>`}
        </li>`;
      }).join('')}</ul>`;
  }
  // Filtros atualizam só a lista (sem redesenhar a ficha inteira)
  function refreshPick() {
    const ui = CF.ui; if (!ui) return;
    const c = ui.chars()[ui.currentId()]; const box = document.getElementById('spPick');
    if (!c || !box) return;
    const acc = E.spellAccess(c, E.derive(c).level);
    box.innerHTML = pickListHTML(ui, c, acc, filterFor(c, acc));
  }
  document.addEventListener('input', e => { if (e.target.id === 'spSearch') { spFilter.q = e.target.value; refreshPick(); } });
  document.addEventListener('change', e => {
    if (e.target.id === 'spCircle') { spFilter.circle = e.target.value; refreshPick(); }
    if (e.target.id === 'spAll') { spFilter.all = e.target.checked; refreshPick(); }
  });

  /** Monta (ou completa) o quadro de magias a partir das escolhas feitas no assistente. */
  function seedSpells(c, d, existing) {
    const list = existing ? existing.slice() : [];
    const add = (sid, name, circle, prep, notes) => {
      if (list.some(x => (sid && x.sid === sid) || x.name.toLowerCase() === name.toLowerCase())) return;
      list.push({ sid: sid || '', name, circle: Number(circle) || 0, prep: !!prep, notes: notes || '' });
    };
    const sp = id => R.spells[id];
    const sc = d.spellcasting;
    c.choices.cantrips.forEach(id => sp(id) && add(id, sp(id).name, 0, true));
    d.raceCantrips.forEach(r => sp(r.id) && add(r.id, sp(r.id).name, 0, true, 'Truque da espécie (usa ' + E.abName(r.ability) + ')'));
    if (sc) {
      (sc.always || []).forEach(id => sp(id) && add(id, sp(id).name, sp(id).lvl, true, 'Sempre preparada pelo caminho'));
      if (sc.type === 'known') c.choices.spells.forEach(id => sp(id) && add(id, sp(id).name, sp(id).lvl, true));
      if (sc.type === 'spellbook') c.choices.spells.forEach(id => sp(id) && add(id, sp(id).name, sp(id).lvl, c.choices.prepared.includes(id), 'No grimório'));
      if (sc.type === 'prepared') c.choices.prepared.forEach(id => sp(id) && add(id, sp(id).name, sp(id).lvl, true));
    }
    E.spellAccess(c, d.level).always.forEach(name => {
      const srd = srdByName(name); const ix = idxByName(name);
      if (srd || ix) add(srd ? srd.id : '', srd ? srd.name : ix.n, srd ? srd.lvl : ix.l, true, 'Sempre preparada pelo caminho');
    });
    (c.sheet.extraSpells || []).forEach(x => {
      if (!(x.name || '').trim()) return;
      const srd = srdByName(x.name);
      add(srd ? srd.id : '', x.name.trim(), parseInt(x.circle, 10) || (srd ? srd.lvl : 1), true, x.notes);
    });
    return list;
  }

  function spellPanel(ui, c, d) {
    const { esc, sign } = ui;
    const sh = c.sheet, sc = d.spellcasting;
    const preparer = PREPARERS.includes(c.classId);
    const abMod = sc ? d.mods[sc.ability] : 0;
    const prepLimit = !sc ? 0 : c.classId === 'paladin' ? Math.max(1, abMod + Math.floor(d.level / 2)) : Math.max(1, abMod + d.level);
    const prepCount = sh.spells.filter(x => x.circle > 0 && x.prep).length;
    const have = new Set(sh.spells.map(x => x.sid).filter(Boolean));
    const pool = [0, 1].flatMap(l => E.spellList(c.classId, l, c.choices.subclass)).filter(x => !have.has(x.id));
    const circles = [...new Set(sh.spells.map(x => Number(x.circle) || 0))].sort((a, b) => a - b);
    const boxes = (n, used, action, idAttr) => Array.from({ length: n }, (_, i) =>
      `<button class="box ${i < used ? 'used' : ''}" data-action="${action}" ${idAttr} data-n="${i}" aria-pressed="${i < used}" aria-label="Uso ${i + 1}"></button>`).join('');
    const ovBox = (key, label, value, computed) => {
      const edited = d.ov[key] != null && d.ov[key] !== '';
      return `<div class="lstat ${edited ? 'edited' : ''}"><input type="number" data-ov="${key}" data-auto="${computed}" value="${value}" aria-label="${esc(label)}"><span>${esc(label)}</span>${edited ? `<button class="mini" data-action="ov-reset" data-id="${key}">auto: ${computed} ↺</button>` : ''}</div>`;
    };
    return `<section class="lcard lc-magic"><h3>✨ Quadro de magias</h3>
      ${sc ? `<div class="sp-top-grid">
        <div class="lstats small-stats">
          ${ovBox('spellDc', 'CD de magia', sc.dc, sc.dcComputed)}
          ${ovBox('spellAtk', 'Ataque mágico', sc.attack, sc.attackComputed)}
          <div class="lstat static"><b>${R.abilities.find(a => a.id === sc.ability).short}</b><span>Atributo</span></div>
        </div>
        <div class="slots"><h4>Espaços de magia</h4>${sc.slotsByLevel.length ? sc.slotsByLevel.map(x => `<div class="slot-row"><span>${x.circle}º círculo${x.pact ? ' (pacto)' : ''}</span>${boxes(x.n, Math.min(x.n, sh.slotsUsed[x.circle] || 0), 'slot', `data-id="${x.circle}"`)}</div>`).join('') : '<p class="muted small">Sem espaços de magia neste nível.</p>'}</div>
      </div>` : '<p class="muted small">Sua classe não conjura magias por padrão. Se você ganhar magias por espécie, talento ou item, adicione aqui.</p>'}
      ${preparer && sc ? `<p class="small prep-info ${prepCount > prepLimit ? 'over' : ''}">Preparadas hoje: <b>${prepCount}</b> de <b>${prepLimit}</b> sugeridas (${c.classId === 'paladin' ? 'Carisma + metade do nível' : E.abName(sc.ability) + ' + nível'}). Troque após um descanso longo.</p>` : ''}

      ${circles.length ? circles.map(n => `<div class="sp-group"><h4>${circleName(n)} <span class="count">${sh.spells.filter(x => (Number(x.circle) || 0) === n).length}</span></h4><div class="sp-cards">
        ${sh.spells.map((x, i) => ({ x, i })).filter(o => (Number(o.x.circle) || 0) === n).map(({ x, i }) => {
          const srd = x.sid ? R.spells[x.sid] : srdByName(x.name);
          const ix = srd ? null : idxByName(x.name);
          const canPrep = preparer && n > 0;
          return `<div class="sp-card ${canPrep && x.prep ? 'prep' : ''} ${canPrep && !x.prep ? 'unprep' : ''}">
            <div class="sp-head">
              <input type="text" class="sp-name" data-st="sheet.spells.${i}.name" value="${esc(x.name)}" aria-label="Nome da magia">
              <button class="mini danger" data-action="sp-del" data-id="${i}" aria-label="Remover ${esc(x.name)}">✕</button>
            </div>
            <div class="sp-tags">${srd ? `<span class="tag tag-${srd.tag}">${srd.tag}</span>${srd.ritual ? '<span class="tag">ritual</span>' : ''}` : ix ? `<span class="tag tag-${(DESC(x.name) || {}).t || SCHOOL_TAG[ix.s] || 'utilidade'}">${(DESC(x.name) || {}).t || ix.s}</span><span class="tag">${ix.s}</span>${ix.r ? '<span class="tag">ritual</span>' : ''}` : '<span class="tag">anotada</span>'}
              ${canPrep ? `<button class="prep-btn ${x.prep ? 'on' : ''}" data-action="sp-prep" data-id="${i}" aria-pressed="${!!x.prep}">${x.prep ? '✓ Preparada' : 'Preparar'}</button>` : ''}</div>
            ${srd ? `<p class="sp-desc">${esc(srd.desc)}</p>` : DESC(x.name) ? `<p class="sp-desc">${esc(DESC(x.name).d)}${ix && ix.p ? ` <small class="muted">(LdJ p. ${ix.p})</small>` : ''}</p>` : ix && ix.p ? `<p class="sp-desc muted">📖 Magia exclusiva do Livro do Jogador: veja a p. ${ix.p}.</p>` : ''}
            <input type="text" class="sp-notes" data-st="sheet.spells.${i}.notes" value="${esc(x.notes)}" placeholder="${srd ? 'Anotações' : 'Resumo: tempo, alcance, efeito, dano…'}" aria-label="Anotações da magia">
          </div>`;
        }).join('')}
      </div></div>`).join('') : '<p class="callout small">Nenhuma magia no quadro ainda.</p>'}

      ${(() => {
        const acc = E.spellAccess(c, d.level);
        const f = filterFor(c, acc);
        const has = (acc.lists.length && (acc.max > 0 || acc.cantrips)) || acc.secrets;
        const maxPossible = Math.max(...[1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => unlockLevel(c, n) != null), 0);
        const circleOpts = has ? [
          acc.cantrips ? `<option value="0" ${f.circle === '0' ? 'selected' : ''}>Truques</option>` : '',
          ...Array.from({ length: maxPossible }, (_, i) => i + 1).map(n => {
            if (n <= acc.max) return `<option value="${n}" ${f.circle === String(n) ? 'selected' : ''}>${n}º círculo</option>`;
            const lv = unlockLevel(c, n);
            return `<option value="${n}" disabled>${n}º círculo — ${lv && lv <= P.levelCap ? 'a partir do nível ' + lv : 'acima do nível ' + P.levelCap}</option>`;
          }),
          `<option value="all" ${f.circle === 'all' ? 'selected' : ''}>Todos os liberados</option>`
        ].join('') : '';
        const listNames = acc.lists.map(k => R.classes[k].name).join(' + ');
        return `<div class="sp-add">
          <h4>Adicionar magia</h4>
          ${has ? `<p class="small sp-access">Lista do <b>${listNames}</b>${acc.source ? ' (pelo caminho)' : ''} · nível ${d.level} · pode aprender ${acc.cantrips ? 'truques e ' : ''}magias até o <b>${acc.max}º círculo</b>.</p>
          <div class="sp-filter">
            <label>Círculo <select id="spCircle">${circleOpts}</select></label>
            <label class="grow">Buscar <input type="search" id="spSearch" value="${esc(f.q)}" placeholder="Nome da magia"></label>
            ${acc.secrets ? `<label class="chk"><input type="checkbox" id="spAll" ${f.all ? 'checked' : ''}> Segredos Mágicos: incluir todas as classes</label>` : ''}
          </div>
          <div id="spPick">${pickListHTML(ui, c, acc, f)}</div>` : `<p class="muted small">${R.classes[c.classId] ? 'O ' + R.classes[c.classId].name : 'Sua classe'} não tem lista de magias${c.classId === 'paladin' || c.classId === 'ranger' ? ' no 1º nível (as magias chegam no nível 2)' : c.classId === 'fighter' || c.classId === 'rogue' ? ' (só com o caminho Cavaleiro Arcano ou Trapaceiro Arcano, a partir do nível 3)' : ''}.</p>`}
          <details class="sp-free"><summary>Magia fora da lista (espécie, talento, item mágico) — confirme com o mestre</summary>
            <div class="row">
              <input type="text" id="spAddName" list="spellNames" placeholder="Nome da magia" aria-label="Nome da magia fora da lista">
              <select id="spAddCircle" aria-label="Círculo">${Array.from({ length: 10 }, (_, n) => `<option value="${n}" ${n === 1 ? 'selected' : ''}>${n === 0 ? 'Truque' : n + 'º círculo'}</option>`).join('')}</select>
              <button class="btn sm" data-action="sp-add-free">+ Adicionar</button>
            </div>
            <datalist id="spellNames">${IDX().map(x => `<option value="${esc(x.n)}">`).join('')}</datalist>
          </details>
          <button class="btn sm ghost" data-action="sp-reseed" title="Adiciona as magias escolhidas no assistente que ainda não estão no quadro">↻ Trazer escolhas do assistente</button>
        </div>`;
      })()}
    </section>`;
  }

  function abilityPanel(ui, c, d) {
    const { esc } = ui;
    const sh = c.sheet;
    const pc = P.classes[c.classId];
    const sub = pc && pc.options.find(o => o.id === c.choices.subclass);
    const boxes = (n, used, i) => Array.from({ length: n }, (_, k) =>
      `<button class="box ${k < used ? 'used' : ''}" data-action="ab-use" data-id="${i}" data-n="${k}" aria-pressed="${k < used}" aria-label="Uso ${k + 1}"></button>`).join('');
    // Sugestões da trilha até o nível atual
    const names = new Set(sh.abilities.map(a => (a.name || '').toLowerCase()));
    const sugg = [];
    if (false) P.track(c.classId, c.choices.subclass).filter(r => r.lv >= 2 && r.lv <= d.level).forEach(r => r.items.forEach(it => {
      if (!['class', 'sub', 'pick'].includes(it.k)) return;
      let name = it.t, src = 'Classe';
      if (it.k === 'pick') { name = sub ? sub.name : `${pc.term} (escolha no livro)`; src = 'Caminho'; }
      if (it.k === 'sub') { name = sub ? `${sub.name} (nível ${r.lv})` : `Habilidade do caminho (nível ${r.lv})`; src = 'Caminho'; }
      if (!names.has(name.toLowerCase())) sugg.push({ lv: r.lv, name, src });
    }));
    const autoCards = d.features.slice().sort((a, b) => (b.lvl || 0) - (a.lvl || 0)).map(f => `<div class="ab-card auto ${f.book ? 'book' : ''} ${f.todo ? 'todo' : ''} ${f.pick ? 'picked' : ''} ${f.lvl === d.level ? 'new' : ''}"><div class="ab-h"><b>${esc(f.name)}</b><span class="src-chip">${esc(f.src)}</span></div>${f.desc ? `<p>${esc(f.desc)}</p>` : ''}</div>`).join('');
    const mine = sh.abilities.map((a, i) => {
      const max = Math.max(0, Math.min(20, parseInt(a.max, 10) || 0));
      return `<div class="ab-card mine">
        <div class="ab-h">
          <input type="text" class="ab-name" data-st="sheet.abilities.${i}.name" value="${esc(a.name)}" placeholder="Nome da habilidade" aria-label="Nome da habilidade">
          <button class="mini danger" data-action="row-del" data-list="abilities" data-id="${i}" aria-label="Remover habilidade">✕</button>
        </div>
        <div class="ab-meta">
          <label>Nível <input type="number" min="1" max="20" class="w-xs" data-st="sheet.abilities.${i}.level" value="${esc(a.level)}"></label>
          <label>Origem <select data-sel="sheet.abilities.${i}.src">${AB_SOURCES.map(x => `<option ${a.src === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
          <label>Usos <input type="number" min="0" max="20" class="w-xs" data-st="sheet.abilities.${i}.max" data-rr="1" value="${esc(a.max)}" placeholder="—"></label>
          ${max ? `<label>por <select data-sel="sheet.abilities.${i}.per">${PERS.map(x => `<option ${a.per === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>` : ''}
        </div>
        ${max ? `<div class="ab-uses">${boxes(max, Math.min(max, Number(sh.abUsed[i]) || 0), i)}</div>` : ''}
        <textarea rows="3" data-st="sheet.abilities.${i}.desc" placeholder="Com suas palavras: o que faz, quando usar, alcance, dano…" aria-label="Descrição">${esc(a.desc)}</textarea>
      </div>`;
    }).join('');
    return `<section class="lcard lc-feats"><h3>📜 Habilidades de classe e características</h3>
      <div class="ab-tabs">
        <h4>Suas habilidades <span class="count">${sh.abilities.length}</span></h4>
        ${sugg.length ? `<div class="ab-sugg"><span class="small muted">Ganhou até o nível ${d.level} — clique para criar o cartão:</span><div class="chips small">${sugg.map(x => `<button class="chip" data-action="ab-suggest" data-id="${esc(x.name)}" data-src="${x.src}" data-lv="${x.lv}">+ Nv ${x.lv}: ${esc(x.name)}</button>`).join('')}</div></div>` : ''}
        <div class="ab-grid">${mine || '<p class="muted small">Nenhuma habilidade adicionada. Use as sugestões acima ou “+ Nova habilidade”.</p>'}</div>
        <button class="btn sm" data-action="row-add" data-list="abilities">+ Nova habilidade</button>
        <h4>Calculadas automaticamente até o nível ${d.level} (classe, caminho, espécie e antecedente) <span class="count">${d.features.length}</span></h4>
        <div class="ab-grid">${autoCards}</div>
      </div>
    </section>`;
  }

  /* ------------------------------------------------ Evolução: escolhas por nível (modelo BG3) */
  const PG = () => CF.PROG;
  const picksObj = c => { c.sheet = c.sheet || E.defaultSheet(); c.sheet.picks = c.sheet.picks || {}; return c.sheet.picks; };
  const asArr = v => (Array.isArray(v) ? v.filter(x => x != null && x !== '') : []);
  const txt = (it, ctx) => (typeof it.desc === 'function' ? it.desc(ctx) : it.desc || '');

  /** Itens já escolhidos em outras escolhas do mesmo tipo (para não repetir). */
  function takenElsewhere(c, def, L) {
    const pk = picksObj(c);
    const out = new Set();
    PG().defs(c, 12).forEach(d => { if (d.key !== def.key && d.type === def.type && (d.pool || '') === (def.pool || '')) asArr(pk[d.key]).forEach(x => out.add(x)); });
    if (def.pool === 'style' && R.classes[c.classId] && R.classes[c.classId].fightingStyle && c.choices.fightingStyle) out.add(c.choices.fightingStyle);
    return out;
  }
  /** Opções disponíveis de uma escolha, com motivo quando bloqueada. */
  function optionsFor(c, def, d) {
    const L = d.level;
    if (def.type === 'pool') {
      const pact = asArr(picksObj(c).pact3)[0];
      return PG().poolItems(def.pool).filter(it => !def.allow || def.allow.includes(it.id)).map(it => {
        let why = '';
        if (it.min && L < it.min) why = `nível ${it.min}`;
        else if (it.pact && pact !== it.pact) why = { blade: 'Pacto da Lâmina', chain: 'Pacto da Corrente', tome: 'Pacto do Tomo' }[it.pact];
        return { id: it.id, name: it.name, desc: it.desc ? txt(it, ctxFor(c, d)) : it.st ? `CA ${it.st.ac}, PV ${it.st.hp}, ${it.st.spd}; ${it.st.dmg}` : (it.spells ? 'Magias: ' + Object.values(it.spells).map(x => x.join(', ')).join('; ') : ''), why, note: it.eb ? 'requer o truque Rajada Mística' : '' };
      });
    }
    if (def.type === 'skill') {
      const ids = def.from || R.skills.map(s => s.id);
      return ids.map(id => {
        const s = d.skills.find(x => x.id === id);
        let why = '';
        if (def.mode === 'exp' && !(s && s.prof)) why = 'precisa ser treinada';
        return { id, name: E.skillName(id), desc: (R.skills.find(x => x.id === id) || {}).desc || '', why, has: s && s.prof };
      });
    }
    if (def.type === 'cantrip') return (CF.SPELL_INDEX || []).filter(e => e.l === 0 && e.c.includes(def.cls)).map(e => ({ id: e.n, name: e.n, desc: (CF.SPELL_DESC && CF.SPELL_DESC[e.n] ? CF.SPELL_DESC[e.n].d : e.id && R.spells[e.id] ? R.spells[e.id].desc : '') }));
    return [];
  }
  function ctxFor(c, d) { return { L: d.level, m: d.mods, PB: d.prof, s: d.scores, dc: ab => 8 + d.prof + d.mods[ab], pk: () => [], pkItem: () => null }; }

  function chipsHTML(ui, c, def, d, list, selected, limit, extraAttrs) {
    const { esc } = ui;
    const taken = takenElsewhere(c, def, d.level);
    const full = selected.length >= limit;
    return `<div class="chips small pk-chips">${list.map(o => {
      const on = selected.includes(o.id);
      const block = !on && (o.why || taken.has(o.id) || (def.type === 'skill' && def.mode !== 'exp' && o.has && !on));
      const reason = o.why || (taken.has(o.id) ? 'já escolhida' : def.type === 'skill' && def.mode !== 'exp' && o.has ? 'já treinada' : '');
      return `<button class="chip ${on ? 'on' : ''}" data-action="pk-toggle" data-list="${def.key}" data-id="${esc(o.id)}" data-n="${limit}" ${extraAttrs || ''} aria-pressed="${on}" ${block ? 'disabled' : ''} title="${esc((o.desc || '') + (o.note ? ' (' + o.note + ')' : ''))}">${esc(o.name)}${reason ? ` <small>· ${esc(reason)}</small>` : ''}</button>`;
    }).join('')}</div>`;
  }

  function featControls(ui, c, def, d, v) {
    const { esc } = ui;
    const P2 = PG();
    const feat = P2.featById(v.feat);
    const known = d.profs.languages;
    const groups = [['Talentos que também existem no BG3', P2.FEATS.filter(f => f.bg3)], ['Outros talentos do Livro do Jogador', P2.FEATS.filter(f => !f.bg3)]];
    const used = new Set(P2.chosenFeats(c, 12).filter(x => x.def.key !== def.key).map(x => x.feat.id));
    let html = `<select data-pk="${def.key}" data-f="feat" aria-label="Talento"><option value="">— escolha um talento —</option>
      ${groups.map(([g, list]) => `<optgroup label="${g}">${list.map(f => `<option value="${f.id}" ${v.feat === f.id ? 'selected' : ''} ${used.has(f.id) ? 'disabled' : ''}>${esc(f.name)}${f.req ? ' (pré-requisito: ' + esc(f.req) + ')' : ''}${used.has(f.id) ? ' — já escolhido' : ''}</option>`).join('')}</optgroup>`).join('')}</select>`;
    if (!feat) return html;
    const fo = v.fo || {};
    html += `<p class="small pk-desc">${esc(feat.desc)} <span class="muted">(LdJ p. ${feat.page}${feat.req ? ' · pré-requisito: ' + esc(feat.req) : ''})</span></p>`;
    if (feat.ab) html += `<label class="field inline"><span>+1 em</span><select data-pk="${def.key}" data-f="fo.ab"><option value="">— atributo —</option>${feat.ab.map(k => `<option value="${k}" ${fo.ab === k ? 'selected' : ''}>${E.abName(k)} (${d.scores[k]})</option>`).join('')}</select></label>`;
    (feat.opts || []).forEach(o => {
      const sel = asArr(fo[o.k]);
      html += `<div class="pk-sub"><span class="small"><b>${esc(o.label)}</b> (${sel.length}/${o.n})</span>`;
      if (o.type === 'pool') {
        const list = PG().poolItems(o.pool).map(it => ({ id: it.id, name: it.name, desc: it.desc ? txt(it, ctxFor(c, d)) : '' }));
        html += `<div class="chips small pk-chips">${list.map(it => { const on = sel.includes(it.id); return `<button class="chip ${on ? 'on' : ''}" data-action="pk-toggle" data-list="${def.key}" data-fo="${o.k}" data-id="${esc(it.id)}" data-n="${o.n}" aria-pressed="${on}" title="${esc(it.desc)}">${esc(it.name)}</button>`; }).join('')}</div>`;
      } else if (o.type === 'skill') {
        html += `<div class="chips small pk-chips">${R.skills.map(s => { const on = sel.includes(s.id); const has = !on && d.skills.find(x => x.id === s.id).prof; return `<button class="chip ${on ? 'on' : ''}" data-action="pk-toggle" data-list="${def.key}" data-fo="${o.k}" data-id="${s.id}" data-n="${o.n}" aria-pressed="${on}" ${has ? 'disabled' : ''}>${s.name}${has ? ' <small>· já treinada</small>' : ''}</button>`; }).join('')}</div>`;
      } else if (o.type === 'lang') {
        html += `<div class="field-row">${Array.from({ length: o.n }, (_, i) => `<select data-pk="${def.key}" data-f="fo.${o.k}.${i}" aria-label="Idioma ${i + 1}"><option value="">— idioma —</option>${R.languages.filter(l => l === sel[i] || !known.includes(l)).map(l => `<option ${l === sel[i] ? 'selected' : ''}>${l}</option>`).join('')}</select>`).join('')}</div>`;
      }
      html += '</div>';
    });
    return html;
  }

  function pickBlock(ui, c, d, def) {
    const { esc } = ui;
    const pk = picksObj(c);
    const v = pk[def.key];
    const done = PG().isComplete(c, def);
    let body = '';
    if (def.type === 'pool' || def.type === 'skill' || def.type === 'cantrip') {
      const sel = asArr(v);
      const list = optionsFor(c, def, d);
      body = `<p class="tiny muted">Escolha ${def.n} (${sel.length}/${def.n})${def.mode === 'exp' ? ' — dobra a proficiência em perícias treinadas' : def.mode === 'profexp' ? ' — ganha proficiência e especialização' : ''}.</p>` + chipsHTML(ui, c, def, d, list, sel, def.n);
      const chosen = list.filter(o => sel.includes(o.id) && o.desc);
      if (chosen.length && def.type === 'pool') body += `<ul class="pk-chosen">${chosen.map(o => `<li><b>${esc(o.name)}:</b> ${esc(o.desc)}</li>`).join('')}</ul>`;
    } else if (def.type === 'lang' || def.type === 'tool') {
      const sel = Array.isArray(v) ? v : [];
      const known = d.profs.languages;
      const list = def.type === 'lang' ? R.languages : (R.toolLists[def.list] || []);
      body = `<div class="field-row">${Array.from({ length: def.n }, (_, i) => `<select data-pk="${def.key}" data-f="i.${i}" aria-label="${esc(def.label)} ${i + 1}"><option value="">— escolha —</option>${list.filter(x => x === sel[i] || !(def.type === 'lang' ? known.includes(x) : d.profs.tools.includes(x))).map(x => `<option ${x === sel[i] ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>`).join('')}</div>`;
    } else if (def.type === 'asi' || def.type === 'feat') {
      const val = v || {};
      const mode = def.type === 'feat' ? 'feat' : (val.mode || 'asi');
      if (def.type === 'asi') body += `<div class="seg" role="group"><button class="chip ${mode === 'asi' ? 'on' : ''}" data-action="pk-mode" data-list="${def.key}" data-id="asi" aria-pressed="${mode === 'asi'}">+2 em atributos</button><button class="chip ${mode === 'feat' ? 'on' : ''}" data-action="pk-mode" data-list="${def.key}" data-id="feat" aria-pressed="${mode === 'feat'}">Talento</button></div>`;
      if (mode === 'asi') {
        const a = Array.isArray(val.a) ? val.a : [];
        body += `<div class="field-row">${[0, 1].map(i => `<select data-pk="${def.key}" data-f="a.${i}" aria-label="Atributo ${i + 1}"><option value="">— +1 em —</option>${E.AB.map(k => `<option value="${k}" ${a[i] === k ? 'selected' : ''}>${E.abName(k)} (${d.computedScores[k] ?? '—'})</option>`).join('')}</select>`).join('')}</div>
          <p class="tiny muted">Escolha o mesmo atributo duas vezes para +2. Máximo 20.</p>`;
      } else body += featControls(ui, c, def, d, val);
    }
    return `<div class="pk ${done ? 'done' : 'todo'}" id="pk-${def.key}">
      <div class="pk-h"><span class="lv">Nv ${def.lvl}</span><b>${esc(def.label)}</b><span class="pk-st">${done ? '✓ feito' : '● pendente'}</span></div>${body}</div>`;
  }

  /** HTML do quadro de escolhas. opts: { maxLvl, src, keys, title } */
  function picksHTML(ui, c, d, opts) {
    if (!PG() || !R.classes[c.classId]) return '';
    opts = opts || {};
    const L = opts.maxLvl || d.level;
    let list = PG().defs(c, L);
    if (opts.src) list = list.filter(x => x.src === opts.src);
    if (opts.keys) list = list.filter(x => opts.keys.includes(x.key));
    if (!list.length) return '';
    const pend = list.filter(x => !PG().isComplete(c, x)).length;
    const blocks = list.map(def => pickBlock(ui, c, d, def)).join('');
    if (opts.bare) return `<div class="pk-list">${blocks}</div>`;
    // Prévia do próximo nível
    const next = d.level < P.levelCap ? PG().defs(c, d.level + 1).filter(x => x.lvl === d.level + 1) : [];
    return `<section class="lcard lc-picks" id="picksPanel"><h3>🧬 Evolução: escolhas por nível ${pend ? `<span class="count warn">${pend} pendente${pend > 1 ? 's' : ''}</span>` : '<span class="count">tudo escolhido ✓</span>'}</h3>
      <p class="small muted">Como no Baldur's Gate 3: a cada nível, escolha talentos, estilos, manobras, metamagias e afins. A ficha aplica os efeitos sozinha (atributos, CA, perícias, recursos e habilidades).</p>
      <div class="pk-list">${blocks}</div>
      ${next.length ? `<p class="tiny muted">No nível ${d.level + 1}: ${next.map(x => ui.esc(x.label)).join(' · ')}.</p>` : ''}
    </section>`;
  }

  /** Clique em chips e botões de modo. Devolve true se mudou algo. */
  function pickAction(ui, c, el) {
    const pk = picksObj(c);
    const key = el.dataset.list, id = el.dataset.id;
    if (el.dataset.action === 'pk-mode') {
      const v = pk[key] && typeof pk[key] === 'object' && !Array.isArray(pk[key]) ? pk[key] : {};
      v.mode = id; pk[key] = v; return true;
    }
    const n = Number(el.dataset.n) || 1;
    let holder, field;
    if (el.dataset.fo) { const v = pk[key] = pk[key] || {}; v.fo = v.fo || {}; holder = v.fo; field = el.dataset.fo; } else { holder = pk; field = key; }
    const cur = asArr(holder[field]);
    const i = cur.indexOf(id);
    if (i >= 0) cur.splice(i, 1);
    else if (n === 1) cur.splice(0, cur.length, id);
    else if (cur.length < n) cur.push(id);
    else { ui.toast(`Você já escolheu ${n}. Desmarque uma opção primeiro.`); return false; }
    holder[field] = cur;
    return true;
  }
  /** Mudança em selects do quadro de escolhas. */
  function pickChange(ui, c, el) {
    const pk = picksObj(c);
    const key = el.dataset.pk, f = el.dataset.f, val = el.value;
    if (f.startsWith('i.')) { const a = Array.isArray(pk[key]) ? pk[key] : []; a[Number(f.slice(2))] = val; pk[key] = a; return true; }
    const v = pk[key] && typeof pk[key] === 'object' && !Array.isArray(pk[key]) ? pk[key] : {};
    pk[key] = v;
    if (f === 'feat') { v.feat = val; v.fo = {}; if (key !== 'racefeat') v.mode = 'feat'; return true; }
    if (f.startsWith('a.')) { v.a = Array.isArray(v.a) ? v.a : []; v.a[Number(f.slice(2))] = val; return true; }
    if (f.startsWith('fo.')) {
      v.fo = v.fo || {};
      const parts = f.split('.');
      if (parts.length === 2) v.fo[parts[1]] = val;
      else { const a = Array.isArray(v.fo[parts[1]]) ? v.fo[parts[1]] : []; a[Number(parts[2])] = val; v.fo[parts[1]] = a; }
      return true;
    }
    return false;
  }

  /** Coloca no quadro as magias concedidas pelo caminho/escolhas que ainda não estão lá (uma vez cada). */
  function syncAlways(c, d) {
    const sh = c.sheet;
    sh.autoSpells = sh.autoSpells || [];
    let added = 0;
    E.spellAccess(c, d.level).always.forEach(name => {
      if (sh.autoSpells.includes(name)) return;
      sh.autoSpells.push(name);
      if (sh.spells.some(x => x.name.toLowerCase() === name.toLowerCase())) return;
      const srd = srdByName(name), ix = idxByName(name);
      if (!srd && !ix) return;
      sh.spells.push({ sid: srd ? srd.id : '', name: srd ? srd.name : ix.n, circle: srd ? srd.lvl : ix.l, prep: true, notes: 'Do caminho/escolha (sempre preparada)' });
      added++;
    });
    return added;
  }

  function render(ui, id) {
    const { esc, sign, T, $app } = ui;
    const chars = ui.chars();
    const c = chars[id] || chars[ui.currentId()];
    if (!c) {
      $app.innerHTML = `<section class="page narrow"><h1>Ficha</h1><p class="callout">Você ainda não tem personagens. Crie o primeiro e depois volte aqui para jogar e editar a ficha livremente.</p>
        <button class="btn primary" data-action="new-char">Criar meu personagem</button></section>`;
      return;
    }
    if (ui.currentId() !== c.id) ui.setCurrent(c.id);
    const sh = ensureSheet(c);
    const d = E.derive(c);
    const cls = R.classes[c.classId], race = R.races[c.raceId], bg = R.backgrounds[c.backgroundId];
    const pc = P.classes[c.classId];
    const hpCur = sh.hpCurrent == null ? d.hp : sh.hpCurrent;
    const others = Object.values(chars).filter(x => x.id !== c.id);
    const errs = E.validate(c).filter(i => i.level === 'error').length;

    const ovBox = (key, label, value, computed, term, extra) => {
      const edited = d.ov[key] != null && d.ov[key] !== '';
      return `<div class="lstat ${edited ? 'edited' : ''}">
        <input type="number" data-ov="${key}" data-auto="${computed}" value="${value}" aria-label="${esc(label)}">
        <span>${term ? T(term, label) : esc(label)}</span>
        ${edited ? `<button class="mini" data-action="ov-reset" data-id="${key}" title="Voltar ao valor automático">auto: ${computed} ↺</button>` : (extra || '')}
      </div>`;
    };
    const boxes = (n, used, action, idAttr) => Array.from({ length: n }, (_, i) =>
      `<button class="box ${i < used ? 'used' : ''}" data-action="${action}" ${idAttr} data-n="${i}" aria-pressed="${i < used}" aria-label="Uso ${i + 1}"></button>`).join('');

    // Cabeçalho
    const subOpts = pc ? pc.options.map(o => `<option value="${o.id}" ${c.choices.subclass === o.id ? 'selected' : ''}>${esc(o.name)} (${P.sources[o.src].short} p. ${o.page})</option>`).join('') : '';
    const pathLabel = pc ? (d.level >= pc.pickLevel ? pc.term : pc.term + ' (planejado, nv ' + pc.pickLevel + ')') : '';
    const newHere = pc ? P.track(c.classId, c.choices.subclass)[d.level - 1] : null;

    // Atributos
    const abil = R.abilities.map(a => {
      const sv = d.saves.find(x => x.id === a.id);
      const edited = d.ov['ab.' + a.id] != null && d.ov['ab.' + a.id] !== '';
      return `<div class="lab ${edited ? 'edited' : ''}">
        <span class="lab-n">${a.short}</span>
        <input type="number" min="1" max="30" data-ov="ab.${a.id}" data-auto="${d.computedScores[a.id] ?? ''}" value="${d.rawScores[a.id] ?? ''}" aria-label="${a.name}">
        <b class="lab-m">${sign(d.mods[a.id])}</b>
        <button class="save ${sv.prof ? 'on' : ''}" data-action="save-prof" data-id="${a.id}" aria-pressed="${sv.prof}" title="Proficiência em resistência de ${a.name}">${sv.prof ? '●' : '○'} Resist. ${sign(sv.bonus)}</button>
        ${edited ? `<button class="mini" data-action="ov-reset" data-id="ab.${a.id}">auto: ${d.computedScores[a.id]} ↺</button>` : ''}
      </div>`;
    }).join('');

    const skills = d.skills.map(s => `<li><button class="skl ${s.exp ? 'exp' : s.prof ? 'prof' : ''}" data-action="skill-cycle" data-id="${s.id}" title="Clique para alternar: sem treino → treinada → especialização">${s.exp ? '◆' : s.prof ? '●' : '○'}</button>
      <span>${s.name} <small>${R.abilities.find(a => a.id === s.ab).short}</small></span><b>${sign(s.bonus)}</b></li>`).join('');

    // Quadros de magias e de habilidades
    if (!sh.spellsInit) { sh.spells = seedSpells(c, d); sh.extraSpells = []; sh.spellsInit = true; if (ui.save) ui.save(); }
    if (syncAlways(c, d) && ui.save) ui.save();
    const magic = spellPanel(ui, c, d);
    const abilitiesHTML = abilityPanel(ui, c, d);
    const picksPanel = picksHTML(ui, c, d);
    const pend = d.pendingPicks.length;

    const html = `<section class="page live-page">
      <div class="sheet-actions no-print">
        ${others.length ? `<select id="sheetSwitch" aria-label="Trocar de personagem"><option value="">Trocar de personagem…</option>${others.map(o => `<option value="${o.id}">${esc(o.name || 'Sem nome')}</option>`).join('')}</select>` : ''}
        <button class="btn primary" data-action="print-live">🖨️ Imprimir / PDF</button>
        <button class="btn" data-action="copy-code" data-id="${c.id}">📋 Copiar código</button>
        <button class="btn" data-action="party-add" data-id="${c.id}">🏰 Atualizar no grupo</button>
        <button class="btn" data-action="open-char" data-id="${c.id}">🧭 Refazer escolhas no assistente</button>
        <span class="muted small" id="saveStatus">Salvo automaticamente ✓</span>
      </div>
      ${ui.liveBar ? ui.liveBar(c) : ''}
      ${errs ? `<div class="callout error small">A criação ainda tem ${errs} pendência(s). Você pode jogar assim mesmo, ou <button class="btn sm" data-action="open-char" data-id="${c.id}">resolver no assistente</button>.</div>` : ''}
      <p class="muted small no-print">Tudo aqui é editável. Números com borda dourada foram <b>ajustados à mão</b>; clique em “auto ↺” para voltar ao cálculo automático.</p>

      <article class="live">
        <header class="lcard lhead">
          <div class="lname"><input type="text" class="name-input" data-st="name" value="${esc(c.name)}" placeholder="Nome do personagem" aria-label="Nome do personagem"></div>
          <div class="lmeta">
            <label><span>Classe</span><b>${cls ? cls.name : '—'}</b></label>
            <label><span>Nível</span><input type="number" min="1" max="${P.levelCap}" data-sv="sheet.level" value="${d.level}"></label>
            ${pc ? `<label class="wide"><span>${esc(pathLabel)}</span><select data-sel="choices.subclass"><option value="">— nenhum —</option>${subOpts}</select></label>` : ''}
            <label><span>Espécie</span><b>${race ? race.name : '—'}</b></label>
            <label><span>Antecedente</span><b>${bg ? (bg.custom && c.choices.bgIdea ? esc(c.choices.bgIdea) : bg.name) : '—'}</b></label>
            <label><span>Jogador</span><input type="text" data-st="player" value="${esc(c.player)}"></label>
            <label><span>Tendência</span><select data-sel="story.alignment"><option value="">—</option>${R.alignments.map(a => `<option ${c.story.alignment === a ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
            <label><span>XP</span><input type="number" min="0" data-sv="sheet.xp" value="${sh.xp}"></label>
          </div>
          ${newHere && d.level > 1 ? `<div class="callout small lnew">🎉 <b>Novidades do nível ${d.level}:</b> ${newHere.items.map(i => esc(i.t)).join(' · ')}. <span class="muted">As habilidades novas já aparecem em “Habilidades e características”.</span></div>` : ''}
          ${pend ? `<div class="callout small lnew warn no-print">🧬 Você tem <b>${pend} escolha${pend > 1 ? 's' : ''} de evolução</b> pendente${pend > 1 ? 's' : ''} (${d.pendingPicks.map(x => 'nv ' + x.lvl + ': ' + esc(x.label)).join(' · ')}). <button class="btn sm" data-action="goto-picks">Fazer agora ↓</button></div>` : ''}
        </header>

        <section class="lcard lc-combat">
          <h3>⚔️ Combate</h3>
          <div class="lstats">
            ${ovBox('ac', 'CA', d.ac, d.acComputed, 'ca')}
            ${ovBox('init', 'Iniciativa', d.initiative, d.initComputed, 'iniciativa')}
            ${ovBox('speed', 'Desloc. (m)', d.speed, d.speedComputed, 'deslocamento')}
            ${ovBox('prof', 'Proficiência', d.prof, d.profComputed, 'proficiencia')}
            ${ovBox('passive', 'Percepção passiva', d.passivePerception, d.passiveComputed, 'percepcaopassiva')}
          </div>
          <div class="hp">
            <div class="hp-main">
              <label><span>PV atuais</span><input type="number" class="big-num" data-sv="sheet.hpCurrent" value="${hpCur ?? ''}"></label>
              <span class="hp-of">/</span>
              ${ovBox('hpMax', 'PV máx.', d.hp ?? '', d.hpSuggested ?? '', 'pv')}
              <label><span>PV temporários</span><input type="number" min="0" data-sv="sheet.hpTemp" value="${sh.hpTemp}"></label>
            </div>
            <div class="hp-quick"><input type="number" min="0" id="hpAmt" placeholder="Qtd." aria-label="Quantidade de dano ou cura">
              <button class="btn sm danger" data-action="hp-dmg">− Dano</button><button class="btn sm" data-action="hp-heal">+ Cura</button></div>
            <div class="bar"><span style="width:${d.hp ? Math.max(0, Math.min(100, hpCur / d.hp * 100)) : 0}%"></span></div>
          </div>
          <div class="lrow">
            <div><span class="lbl">${T('dadodevida', 'Dados de Vida')}</span> ${d.level}${d.hitDie} · gastos <input type="number" class="w-xs" min="0" max="${d.level}" data-sv="sheet.hdUsed" value="${sh.hdUsed}"></div>
            <div><span class="lbl">Testes contra morte</span> ✔ ${boxes(3, sh.death.s, 'death', 'data-id="s"')} ✖ ${boxes(3, sh.death.f, 'death', 'data-id="f"')}</div>
            <div><button class="chip ${sh.inspiration ? 'on' : ''}" data-action="toggle-insp" aria-pressed="${sh.inspiration}">⭐ Inspiração</button></div>
          </div>
          <div class="chips small" aria-label="Condições">${CONDITIONS.map(k => `<button class="chip ${sh.conditions.includes(k) ? 'on' : ''}" data-action="cond" data-id="${k}" aria-pressed="${sh.conditions.includes(k)}">${k}</button>`).join('')}</div>
          <div class="rest"><button class="btn sm" data-action="rest-short">☕ Descanso curto</button><button class="btn sm" data-action="rest-long">🌙 Descanso longo</button></div>
        </section>

        <section class="lcard lc-abil"><h3>🎲 Atributos e resistências</h3><div class="labs">${abil}</div></section>

        <section class="lcard lc-skills"><h3>🎯 Perícias</h3><ul class="lskills">${skills}</ul><p class="tiny muted">○ sem treino · ● treinada · ◆ especialização (clique para alternar)</p></section>

        <section class="lcard lc-attacks"><h3>🗡️ Ataques <span class="count">${d.attacksPerAction} por ação Atacar</span></h3>
          <table class="lt"><thead><tr><th>Arma</th><th>Acerto</th><th>Dano</th></tr></thead><tbody>
          ${d.attacks.filter(a => !a.custom).map(a => `<tr><td>${a.name}${a.notes.length ? `<small>${a.notes.join('; ')}</small>` : ''}</td><td>${sign(a.bonus)}</td><td>${a.damage}${a.versatile ? `<small>2 mãos: ${a.versatile}</small>` : ''}</td></tr>`).join('')}
          </tbody></table>
          <h4>Ataques personalizados</h4>
          <div class="rows">${sh.customAttacks.map((a, i) => `<div class="row">
            <input type="text" data-st="sheet.customAttacks.${i}.name" value="${esc(a.name)}" placeholder="Nome (ex.: Espada +1)" aria-label="Nome do ataque">
            <input type="text" class="w-sm" data-st="sheet.customAttacks.${i}.bonus" value="${esc(a.bonus)}" placeholder="+5" aria-label="Bônus de acerto">
            <input type="text" data-st="sheet.customAttacks.${i}.damage" value="${esc(a.damage)}" placeholder="1d8+3 cortante" aria-label="Dano">
            <input type="text" data-st="sheet.customAttacks.${i}.notes" value="${esc(a.notes)}" placeholder="Notas" aria-label="Notas">
            <button class="mini danger" data-action="row-del" data-list="customAttacks" data-id="${i}" aria-label="Remover ataque">✕</button></div>`).join('')}</div>
          <button class="btn sm" data-action="row-add" data-list="customAttacks">+ Ataque</button>
        </section>

        ${picksPanel}

        ${magic}

        ${abilitiesHTML}

        <section class="lcard lc-res"><h3>🔋 Recursos</h3>
          ${d.resources.length ? d.resources.map(r => {
            const used = Math.min(r.uses, Number(sh.resUsed[r.key]) || 0);
            return `<div class="res-row"><span>${esc(r.name)} <small>/ ${r.per}</small></span>${r.uses <= 12 ? boxes(r.uses, used, 'res', `data-id="${r.key}"`) : `<span>gastos <input type="number" class="w-xs" min="0" max="${r.uses}" data-sv="sheet.resUsed.${r.key}" value="${used}"> de ${r.uses}</span>`}</div>`;
          }).join('') : '<p class="muted small">Nenhum recurso com usos contados.</p>'}
          <h4>Recursos personalizados</h4>
          <div class="rows">${sh.customRes.map((r, i) => `<div class="row">
            <input type="text" data-st="sheet.customRes.${i}.name" value="${esc(r.name)}" placeholder="Nome (ex.: Talento Sortudo)" aria-label="Nome do recurso" data-rr="1">
            <input type="number" class="w-sm" min="0" data-st="sheet.customRes.${i}.max" value="${esc(r.max)}" placeholder="Usos" aria-label="Usos" data-rr="1">
            <select data-sel="sheet.customRes.${i}.per" aria-label="Recupera em">${['descanso curto', 'descanso longo', 'dia'].map(p => `<option ${r.per === p ? 'selected' : ''}>${p}</option>`).join('')}</select>
            <button class="mini danger" data-action="row-del" data-list="customRes" data-id="${i}" aria-label="Remover recurso">✕</button></div>`).join('')}</div>
          <button class="btn sm" data-action="row-add" data-list="customRes">+ Recurso</button>
        </section>

        <section class="lcard lc-eq"><h3>🎒 Equipamento e dinheiro</h3>
          <div class="coins">${COINS.map(([k, s, n]) => `<label title="Peças de ${n}"><span>${s}</span><input type="number" min="0" data-sv="sheet.coins.${k}" value="${sh.coins[k]}"></label>`).join('')}</div>
          <ul class="leq">${d.itemList.filter(i => !i.custom).map(i => `<li>${i.n > 1 ? i.n + '× ' : ''}${esc(i.name)} <button class="mini" data-action="rm-item" data-id="${i.id}" aria-label="Remover ${esc(i.name)}">✕</button></li>`).join('')}</ul>
          ${sh.removedItems.length ? `<button class="btn sm ghost" data-action="restore-items">Restaurar itens iniciais removidos (${sh.removedItems.length})</button>` : ''}
          <h4>Itens adicionados</h4>
          <div class="rows">${sh.customItems.map((it, i) => `<div class="row">
            <input type="text" data-st="sheet.customItems.${i}.name" value="${esc(it.name)}" placeholder="Item" aria-label="Item">
            <input type="number" class="w-xs" min="1" data-st="sheet.customItems.${i}.qty" value="${esc(it.qty)}" aria-label="Quantidade">
            <input type="text" data-st="sheet.customItems.${i}.notes" value="${esc(it.notes)}" placeholder="Notas" aria-label="Notas">
            <button class="mini danger" data-action="row-del" data-list="customItems" data-id="${i}" aria-label="Remover item">✕</button></div>`).join('')}</div>
          <button class="btn sm" data-action="row-add" data-list="customItems">+ Item</button>
        </section>

        <section class="lcard lc-profs"><h3>🛠️ Proficiências e idiomas</h3>
          <p><b>Armaduras:</b> ${d.armorProfText}</p><p><b>Armas:</b> ${d.weaponProfText || '—'}</p>
          <p><b>Ferramentas:</b> ${d.profs.tools.join(', ') || '—'}</p><p><b>Idiomas:</b> ${d.profs.languages.join(', ')}</p>
          <label class="field"><span>Outras proficiências e idiomas</span><textarea rows="2" data-st="sheet.profsExtra">${esc(sh.profsExtra)}</textarea></label>
        </section>

        <section class="lcard lc-pers"><h3>🎭 Personalidade</h3>
          ${[['traits', 'Traço'], ['ideals', 'Ideal'], ['bonds', 'Vínculo'], ['flaws', 'Defeito'], ['appearance', 'Aparência']].map(([k, l]) => `<label class="field"><span>${l}</span><input type="text" data-st="story.${k}" value="${esc(c.story[k])}"></label>`).join('')}
        </section>

        <section class="lcard lc-story"><h3>🖋️ História</h3><textarea rows="8" data-st="story.backstory" aria-label="História">${esc(c.story.backstory)}</textarea></section>
        <section class="lcard lc-notes"><h3>📒 Anotações da campanha</h3><textarea rows="8" data-st="sheet.notes" placeholder="NPCs, pistas, missões, itens a comprar…" aria-label="Anotações">${esc(sh.notes)}</textarea></section>
      </article>
      <div class="print-only" id="printSheet"></div>
    </section>`;
    $app.innerHTML = html;
  }

  /* ----------------------------------------------------------- Ações da ficha */
  function action(ui, act, el, c) {
    const sh = ensureSheet(c);
    const d = E.derive(c);
    const id = el.dataset.id;
    const toggleBoxes = (cur, n) => (n < cur ? n : n + 1);
    switch (act) {
      case 'ov-reset': delete sh.ov[id]; return true;
      case 'save-prof': sh.saveProf[id] = !d.saves.find(x => x.id === id).prof; return true;
      case 'skill-cycle': {
        const s = d.skills.find(x => x.id === id);
        if (!s.prof) { sh.skillProf[id] = true; sh.skillExp[id] = false; }
        else if (!s.exp) { sh.skillProf[id] = true; sh.skillExp[id] = true; }
        else { sh.skillProf[id] = false; sh.skillExp[id] = false; }
        return true;
      }
      case 'hp-dmg': case 'hp-heal': {
        const amt = Math.max(0, Number(document.getElementById('hpAmt').value) || 0);
        if (!amt) { ui.toast('Digite a quantidade de dano ou cura.'); return false; }
        let cur = sh.hpCurrent == null ? d.hp : Number(sh.hpCurrent);
        if (act === 'hp-dmg') {
          const fromTemp = Math.min(Number(sh.hpTemp) || 0, amt);
          sh.hpTemp = (Number(sh.hpTemp) || 0) - fromTemp;
          cur = Math.max(0, cur - (amt - fromTemp));
          if (cur === 0) ui.toast('0 PV: inconsciente! Role testes contra a morte no início dos seus turnos.');
        } else {
          if (cur === 0) sh.death = { s: 0, f: 0 };
          cur = Math.min(d.hp, cur + amt);
        }
        sh.hpCurrent = cur; return true;
      }
      case 'death': { const k = id, n = Number(el.dataset.n); sh.death[k] = toggleBoxes(sh.death[k], n); return true; }
      case 'toggle-insp': sh.inspiration = !sh.inspiration; return true;
      case 'cond': { const i = sh.conditions.indexOf(id); if (i >= 0) sh.conditions.splice(i, 1); else sh.conditions.push(id); return true; }
      case 'slot': { const n = Number(el.dataset.n); sh.slotsUsed[id] = toggleBoxes(Number(sh.slotsUsed[id]) || 0, n); return true; }
      case 'res': { const n = Number(el.dataset.n); sh.resUsed[id] = toggleBoxes(Number(sh.resUsed[id]) || 0, n); return true; }
      case 'rest-short':
        d.resources.filter(r => r.per === 'descanso curto').forEach(r => { sh.resUsed[r.key] = 0; });
        sh.abilities.forEach((a, i) => { if (a.per === 'descanso curto') sh.abUsed[i] = 0; });
        if (c.classId === 'warlock') sh.slotsUsed = {};
        ui.toast('Descanso curto: recursos de descanso curto recuperados. Gaste Dados de Vida para curar, se quiser.');
        return true;
      case 'rest-long':
        sh.hpCurrent = d.hp; sh.hpTemp = 0; sh.slotsUsed = {}; sh.resUsed = {}; sh.abUsed = {}; sh.death = { s: 0, f: 0 };
        sh.hdUsed = Math.max(0, (Number(sh.hdUsed) || 0) - Math.max(1, Math.floor(d.level / 2)));
        ui.toast('Descanso longo: PV, espaços de magia e recursos recuperados.');
        return true;
      case 'row-add': {
        const blank = { customAttacks: { name: '', bonus: '', damage: '', notes: '' }, customItems: { name: '', qty: 1, notes: '' }, extraSpells: { name: '', circle: '', notes: '' }, customRes: { name: '', max: 1, per: 'descanso longo' }, abilities: { name: '', level: d.level, src: 'Classe', max: '', per: 'descanso longo', desc: '' } }[el.dataset.list];
        sh[el.dataset.list].push(blank);
        ui.afterRender = () => { const rows = document.querySelectorAll(`[data-st^="sheet.${el.dataset.list}."]`); const last = [...rows].reverse().find(r => r.dataset.st.endsWith('.name')); if (last) last.focus(); };
        return true;
      }
      case 'row-del': sh[el.dataset.list].splice(Number(id), 1); if (el.dataset.list === 'abilities') sh.abUsed = {}; return true;
      case 'ab-use': { const n = Number(el.dataset.n); sh.abUsed[id] = toggleBoxes(Number(sh.abUsed[id]) || 0, n); return true; }
      case 'ab-suggest':
        sh.abilities.push({ name: id, level: el.dataset.lv, src: el.dataset.src, max: '', per: 'descanso longo', desc: '' });
        ui.afterRender = () => { const t = document.querySelector(`[data-st="sheet.abilities.${sh.abilities.length - 1}.desc"]`); if (t) t.focus(); };
        return true;
      case 'sp-prep': sh.spells[id].prep = !sh.spells[id].prep; return true;
      case 'sp-del': sh.spells.splice(Number(id), 1); return true;
      case 'sp-add-idx': {
        const e = idxByName(id);
        if (!e) return false;
        const acc = E.spellAccess(c, d.level);
        const allowed = (e.l === 0 ? acc.cantrips : e.l <= acc.max) && (acc.secrets || e.c.some(k => acc.lists.includes(k)) || acc.extra.includes(e.n));
        if (!allowed) { ui.toast('Essa magia não está liberada para sua classe neste nível.'); return false; }
        sh.spells.push({ sid: e.id || '', name: e.n, circle: e.l, prep: !PREPARERS.includes(c.classId), notes: '' });
        ui.toast(`${e.n} adicionada ao quadro.`);
        return true;
      }
      case 'sp-add-free': {
        const name = document.getElementById('spAddName').value.trim();
        if (!name) { ui.toast('Digite o nome da magia.'); return false; }
        const srd = srdByName(name); const ix = idxByName(name);
        sh.spells.push({ sid: srd ? srd.id : '', name: srd ? srd.name : ix ? ix.n : name, circle: srd ? srd.lvl : ix ? ix.l : Number(document.getElementById('spAddCircle').value), prep: !PREPARERS.includes(c.classId), notes: 'Fora da lista da classe' });
        if (!srd) ui.afterRender = () => { const t = document.querySelector(`[data-st="sheet.spells.${sh.spells.length - 1}.notes"]`); if (t) t.focus(); };
        return true;
      }
      case 'sp-reseed': { const before = sh.spells.length; sh.spells = seedSpells(c, d, sh.spells); ui.toast(sh.spells.length > before ? `${sh.spells.length - before} magia(s) trazida(s) do assistente.` : 'O quadro já tem todas as magias do assistente.'); return true; }
      case 'rm-item': sh.removedItems.push(id); return true;
      case 'restore-items': sh.removedItems = []; return true;
      case 'print-live': document.getElementById('printSheet').innerHTML = ui.sheetHTML(c); window.print(); return false;
      case 'goto-picks': { const p = document.querySelector('.pk.todo') || document.getElementById('picksPanel'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'center' }); return false; }
    }
    return null; // não é uma ação da ficha
  }

  CF.sheetTab = { render, action, ensureSheet, seedSpells, picksHTML, pickAction, pickChange, syncAlways };
})();
