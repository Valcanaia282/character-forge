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
      sh.coins.po = c.backgroundId === 'acolyte' ? 15 : c.backgroundId === 'custom' ? 10 : 0;
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
          const canPrep = preparer && n > 0;
          return `<div class="sp-card ${canPrep && x.prep ? 'prep' : ''} ${canPrep && !x.prep ? 'unprep' : ''}">
            <div class="sp-head">
              <input type="text" class="sp-name" data-st="sheet.spells.${i}.name" value="${esc(x.name)}" aria-label="Nome da magia">
              <button class="mini danger" data-action="sp-del" data-id="${i}" aria-label="Remover ${esc(x.name)}">✕</button>
            </div>
            <div class="sp-tags">${srd ? `<span class="tag tag-${srd.tag}">${srd.tag}</span>${srd.ritual ? '<span class="tag">ritual</span>' : ''}` : '<span class="tag">anotada</span>'}
              ${canPrep ? `<button class="prep-btn ${x.prep ? 'on' : ''}" data-action="sp-prep" data-id="${i}" aria-pressed="${!!x.prep}">${x.prep ? '✓ Preparada' : 'Preparar'}</button>` : ''}</div>
            ${srd ? `<p class="sp-desc">${esc(srd.desc)}</p>` : ''}
            <input type="text" class="sp-notes" data-st="sheet.spells.${i}.notes" value="${esc(x.notes)}" placeholder="${srd ? 'Anotações' : 'Resumo: tempo, alcance, efeito, dano…'}" aria-label="Anotações da magia">
          </div>`;
        }).join('')}
      </div></div>`).join('') : '<p class="callout small">Nenhuma magia no quadro ainda.</p>'}

      <div class="sp-add">
        <h4>Adicionar magia</h4>
        <div class="row">
          ${pool.length ? `<select id="spAddSel" aria-label="Magias da lista da classe"><option value="">Da lista da classe…</option>${[0, 1].map(l => `<optgroup label="${circleName(l)}">${pool.filter(x => x.lvl === l).map(x => `<option value="${x.id}">${esc(x.name)} — ${x.tag}</option>`).join('')}</optgroup>`).join('')}</select>
          <button class="btn sm" data-action="sp-add-list">+ Adicionar</button>` : ''}
        </div>
        <div class="row">
          <input type="text" id="spAddName" list="spellNames" placeholder="Outra magia (ex.: de 2º círculo, de talento…)" aria-label="Nome de outra magia">
          <select id="spAddCircle" aria-label="Círculo">${Array.from({ length: 10 }, (_, n) => `<option value="${n}" ${n === 1 ? 'selected' : ''}>${n === 0 ? 'Truque' : n + 'º círculo'}</option>`).join('')}</select>
          <button class="btn sm" data-action="sp-add-free">+ Adicionar</button>
        </div>
        <datalist id="spellNames">${Object.values(R.spells).map(x => `<option value="${esc(x.name)}">`).join('')}</datalist>
        <button class="btn sm ghost" data-action="sp-reseed" title="Adiciona as magias escolhidas no assistente que ainda não estão no quadro">↻ Trazer escolhas do assistente</button>
      </div>
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
    if (pc) P.track(c.classId, c.choices.subclass).filter(r => r.lv >= 2 && r.lv <= d.level).forEach(r => r.items.forEach(it => {
      if (!['class', 'sub', 'pick'].includes(it.k)) return;
      let name = it.t, src = 'Classe';
      if (it.k === 'pick') { name = sub ? sub.name : `${pc.term} (escolha no livro)`; src = 'Caminho'; }
      if (it.k === 'sub') { name = sub ? `${sub.name} (nível ${r.lv})` : `Habilidade do caminho (nível ${r.lv})`; src = 'Caminho'; }
      if (!names.has(name.toLowerCase())) sugg.push({ lv: r.lv, name, src });
    }));
    const autoCards = d.features.map(f => `<div class="ab-card auto"><div class="ab-h"><b>${esc(f.name)}</b><span class="src-chip">${esc(f.src)}</span></div>${f.desc ? `<p>${esc(f.desc)}</p>` : ''}</div>`).join('');
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
        <h4>Do assistente (classe, caminho, espécie e antecedente) <span class="count">${d.features.length}</span></h4>
        <div class="ab-grid">${autoCards}</div>
      </div>
    </section>`;
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
    const magic = spellPanel(ui, c, d);
    const abilitiesHTML = abilityPanel(ui, c, d);

    const html = `<section class="page live-page">
      <div class="sheet-actions no-print">
        ${others.length ? `<select id="sheetSwitch" aria-label="Trocar de personagem"><option value="">Trocar de personagem…</option>${others.map(o => `<option value="${o.id}">${esc(o.name || 'Sem nome')}</option>`).join('')}</select>` : ''}
        <button class="btn primary" data-action="print-live">🖨️ Imprimir / PDF</button>
        <button class="btn" data-action="copy-code" data-id="${c.id}">📋 Copiar código</button>
        <button class="btn" data-action="party-add" data-id="${c.id}">🏰 Atualizar no grupo</button>
        <button class="btn" data-action="open-char" data-id="${c.id}">🧭 Refazer escolhas no assistente</button>
        <span class="muted small" id="saveStatus">Salvo automaticamente ✓</span>
      </div>
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
          ${newHere && d.level > 1 ? `<div class="callout small lnew">🎉 <b>Novidades do nível ${d.level}:</b> ${newHere.items.map(i => esc(i.t)).join(' · ')}. <span class="muted">Anote as habilidades novas em “Habilidades e características”.</span></div>` : ''}
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

        <section class="lcard lc-attacks"><h3>🗡️ Ataques</h3>
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
      case 'sp-add-list': {
        const sid = document.getElementById('spAddSel').value;
        if (!sid) { ui.toast('Escolha uma magia na lista.'); return false; }
        sh.spells.push({ sid, name: R.spells[sid].name, circle: R.spells[sid].lvl, prep: !PREPARERS.includes(c.classId), notes: '' });
        return true;
      }
      case 'sp-add-free': {
        const name = document.getElementById('spAddName').value.trim();
        if (!name) { ui.toast('Digite o nome da magia.'); return false; }
        const srd = srdByName(name);
        sh.spells.push({ sid: srd ? srd.id : '', name: srd ? srd.name : name, circle: srd ? srd.lvl : Number(document.getElementById('spAddCircle').value), prep: !PREPARERS.includes(c.classId), notes: '' });
        if (!srd) ui.afterRender = () => { const t = document.querySelector(`[data-st="sheet.spells.${sh.spells.length - 1}.notes"]`); if (t) t.focus(); };
        return true;
      }
      case 'sp-reseed': { const before = sh.spells.length; sh.spells = seedSpells(c, d, sh.spells); ui.toast(sh.spells.length > before ? `${sh.spells.length - before} magia(s) trazida(s) do assistente.` : 'O quadro já tem todas as magias do assistente.'); return true; }
      case 'rm-item': sh.removedItems.push(id); return true;
      case 'restore-items': sh.removedItems = []; return true;
      case 'print-live': document.getElementById('printSheet').innerHTML = ui.sheetHTML(c); window.print(); return false;
    }
    return null; // não é uma ação da ficha
  }

  CF.sheetTab = { render, action, ensureSheet, seedSpells };
})();
