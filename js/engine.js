/* Character Forge — motor de regras: cálculos derivados e validação. Sem nenhuma lógica visual. */
window.CF = window.CF || {};

CF.engine = (function () {
  const R = CF.RULES;
  const AB = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const PB = R.proficiencyBonus;

  const mod = s => Math.floor((s - 10) / 2);
  const sign = n => (n >= 0 ? '+' : '−') + Math.abs(n);
  const abName = id => R.abilities.find(a => a.id === id).name;
  const skillName = id => (R.skills.find(s => s.id === id) || {}).name || id;

  function uid() { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /** Estado da ficha em jogo: nível, ajustes manuais e itens livres. */
  function defaultSheet() {
    return {
      level: 1, xp: 0, hpCurrent: null, hpTemp: 0, hdUsed: 0, death: { s: 0, f: 0 }, inspiration: false,
      conditions: [], slotsUsed: {}, resUsed: {}, ov: {}, skillProf: {}, skillExp: {}, saveProf: {},
      customAttacks: [], customItems: [], removedItems: [], extraSpells: [], customRes: [],
      coins: { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 }, coinsInit: false, features: '', profsExtra: '', notes: '',
      spells: [], spellsInit: false, abilities: [], abUsed: {}
    };
  }
  const profByLevel = lv => 2 + Math.floor((Math.min(12, Math.max(1, lv)) - 1) / 4);

  /* Espaços de magia por nível (SRD), níveis 1–12. */
  const SLOTS_FULL = [null, [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1]];
  const SLOTS_HALF = [null, [], [2], [3], [3], [4, 2], [4, 2], [4, 3], [4, 3], [4, 3, 2], [4, 3, 2], [4, 3, 3], [4, 3, 3]];
  const PACT = [null, [1, 1], [2, 1], [2, 2], [2, 2], [2, 3], [2, 3], [2, 4], [2, 4], [2, 5], [2, 5], [3, 5], [3, 5]]; // [quantidade, círculo]
  function slotsFor(classId, level) {
    const t = { bard: 'full', cleric: 'full', druid: 'full', sorcerer: 'full', wizard: 'full', paladin: 'half', ranger: 'half', warlock: 'pact' }[classId];
    if (t === 'full') return SLOTS_FULL[level].map((n, i) => ({ circle: i + 1, n }));
    if (t === 'half') return SLOTS_HALF[level].map((n, i) => ({ circle: i + 1, n }));
    if (t === 'pact') { const [n, circle] = PACT[level]; return [{ circle, n, pact: true }]; }
    return [];
  }

  /**
   * Quais listas de magias o personagem usa e até que círculo pode aprender no nível atual.
   * lists: classes cujas listas valem; max: maior círculo liberado (0 = nenhum); cantrips: aprende truques;
   * secrets: Bardo com Segredos Mágicos (pode pegar magias de qualquer classe).
   */
  function spellAccess(c, levelArg) {
    const level = Math.min(20, Math.max(1, Number(levelArg || (c.sheet && c.sheet.level) || 1)));
    const sub = c.choices.subclass;
    const out = { lists: [], max: 0, cantrips: false, secrets: false, source: '' };
    const full = ['bard', 'cleric', 'druid', 'sorcerer', 'wizard'];
    if (full.includes(c.classId)) { out.lists = [c.classId]; out.max = Math.min(9, Math.ceil(level / 2)); out.cantrips = true; }
    else if (c.classId === 'warlock') { out.lists = ['warlock']; out.max = level >= 11 ? 6 : PACT[Math.min(12, level)][1]; out.cantrips = true; }
    else if (c.classId === 'paladin' || c.classId === 'ranger') { out.lists = [c.classId]; out.max = level < 2 ? 0 : level < 5 ? 1 : level < 9 ? 2 : level < 13 ? 3 : level < 17 ? 4 : 5; }
    else if ((c.classId === 'fighter' && sub === 'eldritch') || (c.classId === 'rogue' && sub === 'arcanetrickster')) {
      if (level >= 3) { out.lists = ['wizard']; out.max = level < 7 ? 1 : level < 13 ? 2 : level < 19 ? 3 : 4; out.cantrips = true; out.source = 'caminho'; }
    }
    if (c.classId === 'sorcerer' && sub === 'divinesoul') out.lists.push('cleric');
    out.secrets = c.classId === 'bard' && (level >= 10 || (sub === 'lore' && level >= 6));
    return out;
  }

  function newCharacter() {
    return {
      sheet: defaultSheet(),
      id: uid(), version: 1, createdAt: Date.now(), updatedAt: Date.now(), step: 0,
      name: '', player: '', concept: '', classId: '', raceId: '', backgroundId: '',
      abilities: { method: 'standard', standard: { str: null, dex: null, con: null, int: null, wis: null, cha: null }, pointbuy: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 }, manual: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } },
      choices: { classSkills: [], raceSkills: [], bgSkills: [], raceLangs: [], bgLangs: [], bgToolLang: [], tools: [], raceTool: '', fightingStyle: '', favoredEnemy: '', terrain: '', expertise: [], dragon: '', sorcDragon: '', halfElfAsi: [], elfCantrip: '', cantrips: [], spells: [], prepared: [], bgIdea: '', subclass: '', feat: '' },
      equipment: { groups: {}, picks: {} },
      story: { alignment: '', age: '', appearance: '', motivation: '', fear: '', trust: '', goal: '', secret: '', traits: '', ideals: '', bonds: '', flaws: '', backstory: '' }
    };
  }

  /* -------------------------------------------------------------- Atributos */
  function baseScores(c) {
    const a = c.abilities;
    const src = a[a.method] || {};
    const out = {};
    AB.forEach(k => { out[k] = src[k] == null ? (a.method === 'standard' ? null : 8) : Number(src[k]); });
    return out;
  }
  function racialBonus(c) {
    const out = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
    const race = R.races[c.raceId];
    if (!race) return out;
    Object.entries(race.asi || {}).forEach(([k, v]) => { out[k] += v; });
    if (race.asiChoice) (c.choices.halfElfAsi || []).slice(0, race.asiChoice.count).forEach(k => { if (out[k] != null) out[k] += race.asiChoice.amount; });
    return out;
  }
  function finalScores(c) {
    const b = baseScores(c), r = racialBonus(c), out = {};
    AB.forEach(k => { out[k] = b[k] == null ? null : b[k] + r[k]; });
    return out;
  }
  function pointBuyCost(scores) {
    return AB.reduce((t, k) => t + (R.pointBuy.cost[scores[k]] ?? 99), 0);
  }
  /** Sugestão de distribuição pelo arranjo padrão, conforme a prioridade da classe. */
  function suggestStandard(classId) {
    const cls = R.classes[classId];
    const order = cls ? cls.suggested : AB;
    const out = {};
    order.forEach((k, i) => { out[k] = R.standardArray[i]; });
    return out;
  }
  function suggestPointBuy(classId) {
    const cls = R.classes[classId];
    const order = cls ? cls.suggested : AB;
    // 15,14,13,12,10,8 custa exatamente 27 pontos.
    return suggestStandard(classId);
  }

  /* ------------------------------------------------------------- Caminhos */
  /** Caminho (subclasse) escolhido, segundo CF.PATHS. */
  function pathInfo(c) {
    const pc = CF.PATHS && CF.PATHS.classes[c.classId];
    if (!pc) return null;
    return { term: pc.term, pickLevel: pc.pickLevel, option: pc.options.find(o => o.id === c.choices.subclass) || null, data: pc };
  }
  /** Subclasse do SRD com efeitos calculados — só se for a escolhida. */
  function activeSub(c) {
    const cls = R.classes[c.classId];
    return cls && cls.subclass && c.choices.subclass === cls.subclass.id ? cls.subclass : null;
  }

  /* ---------------------------------------------------------- Equipamento */
  function classEquipmentGroups(c) {
    const cls = R.classes[c.classId];
    return cls ? cls.equipment : [];
  }
  function selectedOption(c, gi) {
    return Number(c.equipment.groups[gi] ?? 0);
  }
  function pickKey(gi, oi, k) { return gi + '.' + oi + '.' + k; }
  function equipmentItems(c) {
    const cls = R.classes[c.classId];
    const bg = R.backgrounds[c.backgroundId];
    const items = [];
    if (cls) {
      cls.equipment.forEach((g, gi) => {
        const oi = Math.min(selectedOption(c, gi), g.options.length - 1);
        g.options[oi].items.forEach((it, k) => {
          if (typeof it === 'string') items.push(it);
          else {
            const list = R.weaponPicks[it.pick];
            const chosen = c.equipment.picks[pickKey(gi, oi, k)];
            items.push(list.includes(chosen) ? chosen : list[0]);
          }
        });
      });
      cls.fixedEquipment.forEach(i => items.push(i));
    }
    if (bg) bg.equipment.forEach(i => items.push(i));
    return items;
  }
  function itemName(id) {
    return (R.weapons[id] || R.armor[id] || R.gear[id] || { name: id }).name;
  }
  function groupedItems(items) {
    const map = new Map();
    items.forEach(i => map.set(i, (map.get(i) || 0) + 1));
    return [...map.entries()].map(([id, n]) => ({ id, n, name: itemName(id), desc: (R.gear[id] || {}).desc || '' }));
  }

  /* -------------------------------------------------------- Proficiências */
  function proficiencies(c) {
    const cls = R.classes[c.classId], race = R.races[c.raceId], bg = R.backgrounds[c.backgroundId];
    const armor = new Set(cls ? cls.armor : []);
    if (race && race.armor) race.armor.forEach(a => armor.add(a));
    const path = pathInfo(c);
    const grants = path && path.pickLevel === 1 && path.option && path.option.grants;
    if (grants && grants.armor) grants.armor.forEach(a => armor.add(a));
    const weapons = new Set(cls ? cls.weapons : []);
    if (race && race.weapons) race.weapons.forEach(w => weapons.add(w));
    if (grants && grants.weapons) grants.weapons.forEach(w => weapons.add(w));

    const skills = new Map(); // id -> origem
    const add = (id, src) => { if (id && !skills.has(id)) skills.set(id, src); };
    if (bg && !bg.custom) bg.skills.forEach(s => add(s, bg.name));
    if (bg && bg.custom) c.choices.bgSkills.forEach(s => add(s, 'Antecedente'));
    if (race && race.skills) race.skills.forEach(s => add(s, race.name));
    if (race && race.skillChoices) c.choices.raceSkills.forEach(s => add(s, race.name));
    if (cls) c.choices.classSkills.forEach(s => add(s, cls.name));

    const languages = new Set(race ? race.languages : ['Comum']);
    [...(c.choices.raceLangs || []), ...(c.choices.bgLangs || [])].forEach(l => l && languages.add(l));
    if (cls && cls.extraLanguages) cls.extraLanguages.forEach(l => languages.add(l));
    const sub = activeSub(c);
    if (sub && sub.extraLanguages) sub.extraLanguages.forEach(l => languages.add(l));
    const tools = [];
    if (cls && cls.fixedTools) tools.push(...cls.fixedTools);
    if (cls && cls.toolChoices) c.choices.tools.forEach(t => t && tools.push(t));
    if (race && race.fixedTools) tools.push(...race.fixedTools);
    if (race && race.toolChoice && c.choices.raceTool) tools.push(c.choices.raceTool);
    if (bg && bg.custom) c.choices.bgToolLang.forEach(t => { if (!t) return; if (R.languages.includes(t)) languages.add(t); else tools.push(t); });
    const expertise = new Set(cls && cls.expertise ? c.choices.expertise : []);
    return { armor, weapons, skills, languages: [...languages], tools: [...new Set(tools)], expertise };
  }
  function weaponProficient(id, p) {
    const w = R.weapons[id];
    return !!w && (p.weapons.has(w.cat) || p.weapons.has(id));
  }

  /* ---------------------------------------------------------------- Ficha */
  function derive(c) {
    const cls = R.classes[c.classId], race = R.races[c.raceId], bg = R.backgrounds[c.backgroundId];
    const sh = Object.assign(defaultSheet(), c.sheet || {});
    const ov = sh.ov || {};
    const num = v => (v === '' || v == null || isNaN(Number(v)) ? null : Number(v));
    const level = Math.min(12, Math.max(1, Number(sh.level) || 1));
    const profComputed = profByLevel(level);
    const PB = num(ov.prof) ?? profComputed;
    const scores = finalScores(c);
    const computedScores = Object.assign({}, scores);
    AB.forEach(k => { if (num(ov['ab.' + k]) != null) scores[k] = num(ov['ab.' + k]); });
    const ready = AB.every(k => scores[k] != null);
    const s = {}; AB.forEach(k => { s[k] = scores[k] == null ? 10 : scores[k]; });
    const m = {}; AB.forEach(k => { m[k] = mod(s[k]); });
    const p = proficiencies(c);
    const items = equipmentItems(c);
    const sub = activeSub(c);
    const path = pathInfo(c);

    // PV
    let hp = null, hpSuggested = null;
    if (cls) {
      const perLevelBonus = (race && race.hpPerLevel ? race.hpPerLevel : 0) + (sub && sub.hpPerLevel ? sub.hpPerLevel : 0);
      const first = Math.max(1, cls.hitDie + m.con + perLevelBonus);
      const avg = Math.max(1, cls.hitDie / 2 + 1 + m.con + perLevelBonus); // média fixa por nível
      hpSuggested = first + (level - 1) * avg;
      hp = num(ov.hpMax) ?? hpSuggested;
    }

    // CA: avalia todas as formas possíveis e usa a melhor
    const bodyArmors = items.filter(i => R.armor[i] && R.armor[i].cat !== 'shield');
    const hasShield = items.includes('shield') && p.armor.has('shield');
    const acOptions = [];
    const shieldTxt = hasShield ? ' + escudo' : '';
    const sb = hasShield ? 2 : 0;
    acOptions.push({ v: 10 + m.dex + sb, label: 'Sem armadura (10 + DES' + shieldTxt + ')', armor: null });
    if (c.classId === 'barbarian') acOptions.push({ v: 10 + m.dex + m.con + sb, label: 'Defesa sem Armadura (10 + DES + CON' + shieldTxt + ')', armor: null });
    if (c.classId === 'monk') acOptions.push({ v: 10 + m.dex + m.wis, label: 'Defesa sem Armadura (10 + DES + SAB, sem escudo)', armor: null });
    if (c.classId === 'sorcerer' && sub) acOptions.push({ v: 13 + m.dex + sb, label: 'Resiliência Dracônica (13 + DES' + shieldTxt + ')', armor: null });
    bodyArmors.forEach(id => {
      const a = R.armor[id];
      const dex = a.cat === 'heavy' ? 0 : a.dexMax == null ? m.dex : Math.min(m.dex, a.dexMax); // armadura pesada ignora Destreza
      let v = a.base + dex + sb;
      let label = a.name + shieldTxt;
      if (c.choices.fightingStyle === 'defense' && c.classId === 'fighter') { v += 1; label += ' + estilo Defesa'; }
      acOptions.push({ v, label, armor: id, proficient: p.armor.has(a.cat) });
    });
    const best = acOptions.reduce((a, b) => (b.v > a.v ? b : a));
    const wornArmor = best.armor ? R.armor[best.armor] : null;

    // Deslocamento
    let speed = race ? race.speed : 9;
    let speedNote = '';
    if (wornArmor && wornArmor.str && s.str < wornArmor.str && c.raceId !== 'dwarf') { speed -= 3; speedNote = 'Força abaixo de ' + wornArmor.str + ' para ' + wornArmor.name + ': −3 m'; }

    // Perícias e resistências
    const skills = R.skills.map(sk => {
      const prof = sh.skillProf[sk.id] ?? p.skills.has(sk.id);
      const exp = prof && (sh.skillExp[sk.id] ?? p.expertise.has(sk.id));
      return { id: sk.id, name: sk.name, ab: sk.ab, prof, exp, src: p.skills.get(sk.id) || '', bonus: m[sk.ab] + (prof ? PB * (exp ? 2 : 1) : 0) };
    });
    const saves = AB.map(k => {
      const prof = sh.saveProf[k] ?? !!(cls && cls.saves.includes(k));
      return { id: k, prof, bonus: m[k] + (prof ? PB : 0) };
    });
    const perception = skills.find(x => x.id === 'perception').bonus;

    // Ataques
    const attacks = [];
    const seen = new Set();
    const weaponIds = items.map(i => (R.gear[i] && R.gear[i].weapon) || i).filter(i => R.weapons[i]);
    weaponIds.forEach(id => {
      if (seen.has(id)) return; seen.add(id);
      const w = R.weapons[id];
      const finesse = w.props.includes('acuidade');
      const monkWeapon = c.classId === 'monk' && (id === 'shortsword' || (w.cat === 'simple' && w.type === 'melee' && !w.props.includes('duas mãos') && !w.props.includes('pesada')));
      let ab = w.type === 'ranged' && !finesse ? 'dex' : 'str';
      if (finesse || monkWeapon) ab = m.dex > m.str ? 'dex' : 'str';
      const prof = weaponProficient(id, p);
      let atk = m[ab] + (prof ? PB : 0);
      if (c.choices.fightingStyle === 'archery' && w.type === 'ranged') atk += 2;
      let dmgBonus = m[ab];
      const notes = [];
      if (c.choices.fightingStyle === 'dueling' && w.type === 'melee' && !w.props.includes('duas mãos')) { dmgBonus += 2; notes.push('+2 Duelismo se for a única arma'); }
      if (c.classId === 'barbarian' && w.type === 'melee' && ab === 'str') notes.push('+2 de dano em Fúria');
      if (c.classId === 'rogue' && (finesse || w.type === 'ranged')) notes.push('Ataque Furtivo +1d6');
      if (!prof) notes.push('sem proficiência');
      const versatile = (w.props.find(x => x.startsWith('versátil')) || '').match(/\((.*)\)/);
      attacks.push({
        id, name: w.name, bonus: atk, ability: ab,
        damage: w.dmg + (dmgBonus ? ' ' + sign(dmgBonus) : '') + ' ' + w.dt,
        versatile: versatile ? versatile[1] + (dmgBonus ? ' ' + sign(dmgBonus) : '') : '',
        props: w.props, notes, proficient: prof
      });
    });
    if (c.classId === 'monk') {
      const ab = m.dex > m.str ? 'dex' : 'str';
      attacks.push({ id: 'unarmed', name: 'Golpe desarmado', bonus: m[ab] + PB, ability: ab, damage: '1d4 ' + sign(m[ab]) + ' concussão', versatile: '', props: ['Artes Marciais'], notes: ['pode ser feito como ação bônus após atacar'], proficient: true });
    }

    (sh.customAttacks || []).forEach((a, i) => {
      if (!a || !(a.name || '').trim()) return;
      attacks.push({ id: 'custom' + i, name: a.name, bonus: num(a.bonus) ?? 0, ability: '', damage: a.damage || '', versatile: '', props: [], notes: a.notes ? [a.notes] : [], proficient: true, custom: true });
    });

    // Magia
    let spellcasting = null;
    if (cls && (cls.casting || (level >= 2 && (c.classId === 'paladin' || c.classId === 'ranger')))) {
      const k = cls.casting || { ability: c.classId === 'paladin' ? 'cha' : 'wis', cantrips: 0, slots: [], type: 'prepared' };
      const am = m[k.ability];
      spellcasting = {
        ability: k.ability, mod: am, dc: num(ov.spellDc) ?? 8 + PB + am, attack: num(ov.spellAtk) ?? PB + am,
        dcComputed: 8 + PB + am, attackComputed: PB + am, slotsByLevel: slotsFor(c.classId, level),
        cantrips: k.cantrips, known: k.known || 0, spellbook: k.spellbook || 0,
        prepared: (k.type === 'prepared' || k.type === 'spellbook') ? Math.max(1, am + 1) : 0,
        slots: k.slots, type: k.type, pact: !!k.pact,
        always: (sub && sub.alwaysPrepared) || []
      };
    }
    // Truques de espécie
    const raceCantrips = [];
    if (race && race.cantrip === 'wizard' && c.choices.elfCantrip) raceCantrips.push({ id: c.choices.elfCantrip, ability: 'int' });
    if (race && race.knownCantrips) race.knownCantrips.forEach(id => raceCantrips.push({ id, ability: race.cantripAbility || 'cha' }));

    // Características
    const features = [];
    if (cls) cls.features.filter(f => !f.sub || f.sub === c.choices.subclass).forEach(f => features.push({ ...f, src: cls.name }));
    if (path && path.option && path.pickLevel === 1 && !path.option.srd) {
      const srcName = CF.PATHS.sources[path.option.src].name;
      features.push({ name: path.option.name, desc: `Habilidades de 1º nível deste caminho: veja ${srcName}, p. ${path.option.page}, e anote aqui com o mestre (não são calculadas automaticamente).`, src: cls.name });
    }
    if (cls && cls.fightingStyle && c.choices.fightingStyle) {
      const fs = R.fightingStyles.find(f => f.id === c.choices.fightingStyle);
      if (fs) features.push({ name: 'Estilo: ' + fs.name, desc: fs.desc, src: cls.name });
    }
    if (cls && cls.favoredEnemy) {
      if (c.choices.favoredEnemy) features.push({ name: 'Inimigo favorito: ' + c.choices.favoredEnemy, desc: '', src: cls.name });
      if (c.choices.terrain) features.push({ name: 'Terreno favorito: ' + c.choices.terrain, desc: '', src: cls.name });
    }
    if (cls && cls.dragonAncestor && sub && c.choices.sorcDragon) {
      const d = R.dragons.find(x => x.id === c.choices.sorcDragon);
      if (d) features.push({ name: 'Ancestral: dragão ' + d.name, desc: 'Tipo de dano associado: ' + d.dmg + '.', src: cls.name });
    }
    if (race) race.traits.forEach(t => features.push({ ...t, src: race.name }));
    if (race && race.dragonAncestry && c.choices.dragon) {
      const d = R.dragons.find(x => x.id === c.choices.dragon);
      if (d) features.push({ name: 'Sopro de dragão ' + d.name, desc: d.area + ', 2d6 de ' + d.dmg + ', resistência de ' + abName(d.save) + ' CD ' + (8 + m.con + PB) + '. Resistência a ' + d.dmg + '.', src: race.name });
    }
    if (race && race.feat) features.push({ name: 'Talento: ' + ((c.choices.feat || '').trim() || '(a escolher)'), desc: 'Anote o efeito do talento (Livro do Jogador, capítulo de talentos).', src: race.name });
    if (bg) features.push({ ...bg.feature, src: bg.name });

    // Recursos com contagem
    const resources = [];
    const L = level, res = (key, name, uses, per) => resources.push({ key, name, uses, per });
    if (c.classId === 'barbarian') res('rage', 'Fúria', L >= 12 ? 5 : L >= 6 ? 4 : L >= 3 ? 3 : 2, 'descanso longo');
    if (c.classId === 'bard') res('bardic', `Inspiração Bárdica (d${L >= 10 ? 10 : L >= 5 ? 8 : 6})`, Math.max(1, m.cha), L >= 5 ? 'descanso curto' : 'descanso longo');
    if (c.classId === 'cleric' && L >= 2) res('channel', 'Canalizar Divindade', L >= 6 ? 2 : 1, 'descanso curto');
    if (c.classId === 'druid' && L >= 2) res('wildshape', 'Forma Selvagem', 2, 'descanso curto');
    if (c.classId === 'fighter') { res('secondwind', 'Retomar o Fôlego', 1, 'descanso curto'); if (L >= 2) res('surge', 'Surto de Ação', 1, 'descanso curto'); if (L >= 9) res('indomitable', 'Indomável', 1, 'descanso longo'); }
    if (c.classId === 'monk' && L >= 2) res('ki', 'Pontos de Chi', L, 'descanso curto');
    if (c.classId === 'paladin') { res('sense', 'Sentido Divino', 1 + m.cha, 'descanso longo'); res('lay', 'Cura pelas Mãos (PV)', 5 * L, 'descanso longo'); if (L >= 3) res('channel', 'Canalizar Divindade', 1, 'descanso curto'); }
    if (c.classId === 'sorcerer' && L >= 2) res('sorcery', 'Pontos de Feitiçaria', L, 'descanso longo');
    if (c.classId === 'wizard') res('arcrec', 'Recuperação Arcana', 1, 'dia');
    if (c.raceId === 'dragonborn') res('breath', 'Arma de Sopro', 1, 'descanso curto');
    if (c.raceId === 'halforc') res('relentless', 'Resistência Implacável', 1, 'descanso longo');
    if (race && race.raceSpells) race.raceSpells.filter(x => level >= x.level).forEach((x, i) => res('racespell' + i, x.name + ' (' + race.name + ')', 1, x.per));
    (sh.customRes || []).forEach((r, i) => { if (r && (r.name || '').trim()) res('custom' + i, r.name, Math.max(0, Number(r.max) || 0), r.per || 'descanso longo'); });

    return {
      ready, path, scores: s, rawScores: scores, mods: m, prof: PB, hp, hitDie: cls ? 'd' + cls.hitDie : '—',
      ac: num(ov.ac) ?? best.v, acLabel: num(ov.ac) != null ? 'Ajustada manualmente' : best.label, acOptions, wornArmor, speed: num(ov.speed) ?? speed, speedNote,
      initiative: num(ov.init) ?? m.dex, passivePerception: num(ov.passive) ?? 10 + perception, passiveComputed: 10 + perception,
      skills, saves, attacks, spellcasting, raceCantrips, features, resources,
      profs: p, items, itemList: (() => {
        const left = items.slice();
        (sh.removedItems || []).forEach(id => { const i = left.indexOf(id); if (i >= 0) left.splice(i, 1); });
        const list = groupedItems(left);
        (sh.customItems || []).forEach((it, i) => { if (it && (it.name || '').trim()) list.push({ id: 'custom' + i, n: Number(it.qty) || 1, name: it.name, desc: it.notes || '', custom: true }); });
        return list;
      })(),
      level, profComputed, hpSuggested, computedScores, ov, sheet: sh,
      acComputed: best.v, initComputed: m.dex, speedComputed: speed, hitDiceTotal: level,
      armorProfText: [...p.armor].map(a => ({ light: 'leves', medium: 'médias', heavy: 'pesadas', shield: 'escudos' }[a])).join(', ') || 'nenhuma',
      weaponProfText: [...p.weapons].map(w => w === 'simple' ? 'armas simples' : w === 'martial' ? 'armas marciais' : (R.weapons[w] || {}).name || w).join(', ')
    };
  }

  /* -------------------------------------------------------- Listas de magia */
  function spellList(classId, lvl, subId) {
    const cls = R.classes[classId];
    const extra = cls && cls.subclass && cls.subclass.expanded && cls.subclass.id === subId ? cls.subclass.expanded : [];
    return Object.entries(R.spells)
      .filter(([id, sp]) => sp.lvl === lvl && (sp.cls.includes(classId) || extra.includes(id)))
      .map(([id, sp]) => ({ id, ...sp }));
  }

  /* --------------------------------------------------------------- Validação */
  function validate(c) {
    const out = [];
    const err = (step, msg) => out.push({ step, level: 'error', msg });
    const warn = (step, msg) => out.push({ step, level: 'warn', msg });
    const cls = R.classes[c.classId], race = R.races[c.raceId], bg = R.backgrounds[c.backgroundId];
    const ch = c.choices;

    if (!c.name.trim()) err(0, 'Dê um nome ao personagem.');
    if (!cls) err(1, 'Escolha uma classe.');
    const path = pathInfo(c);
    if (path && path.pickLevel === 1 && !path.option) err(1, `O ${cls.name} escolhe ${path.term.toLowerCase()} já no 1º nível: escolha um caminho.`);
    if (path && path.pickLevel === 1 && path.option && !path.option.srd) warn(1, `${path.option.name}: as habilidades de 1º nível deste caminho não são calculadas automaticamente. Anote-as do livro (p. ${path.option.page}) com o mestre.`);
    if (!race) err(2, 'Escolha uma espécie.');
    if (!bg) err(3, 'Escolha um antecedente.');

    // Atributos
    const a = c.abilities;
    if (a.method === 'standard') {
      const vals = AB.map(k => a.standard[k]);
      if (vals.some(v => v == null)) err(4, 'Distribua todos os valores do arranjo padrão (15, 14, 13, 12, 10, 8).');
      else {
        const sorted = vals.map(Number).sort((x, y) => y - x).join(',');
        if (sorted !== R.standardArray.join(',')) err(4, 'Cada valor do arranjo padrão deve ser usado exatamente uma vez.');
      }
    } else if (a.method === 'pointbuy') {
      const cost = pointBuyCost(a.pointbuy);
      if (cost > R.pointBuy.budget) err(4, 'Você gastou ' + cost + ' pontos; o limite é ' + R.pointBuy.budget + '.');
      else if (cost < R.pointBuy.budget) warn(4, 'Ainda sobram ' + (R.pointBuy.budget - cost) + ' pontos para gastar.');
    } else {
      if (AB.some(k => !(a.manual[k] >= 3 && a.manual[k] <= 18))) err(4, 'Valores rolados devem ficar entre 3 e 18.');
    }
    if (race && race.asiChoice) {
      const hc = (ch.halfElfAsi || []).filter(Boolean);
      if (hc.length !== race.asiChoice.count || new Set(hc).size !== hc.length) err(2, `Escolha ${race.asiChoice.count} atributos diferentes${race.asiChoice.exclude.length ? ' (exceto Carisma)' : ''} para receber +1.`);
    }
    if (race && race.toolChoice && !ch.raceTool) err(2, 'Escolha sua ferramenta de anão.');
    if (race && race.dragonAncestry && !ch.dragon) err(2, 'Escolha sua ancestralidade dracônica.');
    if (race && race.feat && !(ch.feat || '').trim()) err(2, 'Escreva o talento escolhido (combine com o mestre).');
    if (race && race.cantrip === 'wizard' && !ch.elfCantrip) err(5, 'Escolha o truque de mago do Alto Elfo.');

    // Idiomas
    const rl = race ? race.extraLanguages || 0 : 0, bl = bg ? bg.languages || 0 : 0;
    if ((ch.raceLangs || []).slice(0, rl).filter(Boolean).length < rl) err(2, 'Escolha ' + rl + ' idioma(s) extra(s) da espécie.');
    if ((ch.bgLangs || []).slice(0, bl).filter(Boolean).length < bl) err(3, 'Escolha ' + bl + ' idioma(s) do antecedente.');
    if (bg && bg.custom) {
      if (ch.bgSkills.filter(Boolean).length !== bg.skillChoices) err(3, 'Escolha ' + bg.skillChoices + ' perícias para o antecedente personalizado.');
      if (ch.bgToolLang.filter(Boolean).length < bg.toolOrLanguage) err(3, 'Escolha ' + bg.toolOrLanguage + ' idiomas ou ferramentas para o antecedente.');
    }

    // Perícias
    if (cls) {
      if (ch.classSkills.length !== cls.skillChoices) err(5, 'Escolha ' + cls.skillChoices + ' perícias da classe (escolhidas: ' + ch.classSkills.length + ').');
      if (cls.toolChoices && ch.tools.filter(Boolean).length !== cls.toolChoices.count) err(5, 'Escolha ' + cls.toolChoices.count + ' ' + cls.toolChoices.label.toLowerCase() + '.');
      if (cls.fightingStyle && !ch.fightingStyle) err(5, 'Escolha um Estilo de Luta.');
      if (cls.favoredEnemy && (!ch.favoredEnemy || !ch.terrain)) err(5, 'Escolha inimigo favorito e terreno favorito.');
      if (cls.expertise && ch.expertise.length !== cls.expertise) err(5, 'Escolha ' + cls.expertise + ' especializações.');
      if (cls.dragonAncestor && activeSub(c) && !ch.sorcDragon) err(5, 'Escolha seu ancestral dracônico.');
    }
    if (race && race.skillChoices && ch.raceSkills.length !== race.skillChoices) err(2, 'Escolha ' + race.skillChoices + ' perícias da espécie.');
    // Duplicatas
    const all = [...(bg && !bg.custom ? bg.skills : ch.bgSkills), ...(race && race.skills ? race.skills : []), ...ch.raceSkills, ...ch.classSkills].filter(Boolean);
    const dup = all.filter((x, i) => all.indexOf(x) !== i);
    if (dup.length) err(5, 'Perícia repetida: ' + [...new Set(dup)].map(skillName).join(', ') + '. Troque por outra.');

    // Magias
    const d = derive(c);
    // Contagem de magias da criação (1º nível); depois disso o jogador ajusta livremente na aba Ficha.
    if (d.spellcasting && cls.casting && d.level === 1) {
      const sc = d.spellcasting;
      if (ch.cantrips.length !== sc.cantrips) err(5, 'Escolha ' + sc.cantrips + ' truques (escolhidos: ' + ch.cantrips.length + ').');
      if (sc.type === 'known' && ch.spells.length !== sc.known) err(5, 'Escolha ' + sc.known + ' magias de 1º nível (escolhidas: ' + ch.spells.length + ').');
      if (sc.type === 'spellbook') {
        if (ch.spells.length !== sc.spellbook) err(5, 'Escolha ' + sc.spellbook + ' magias para o grimório (escolhidas: ' + ch.spells.length + ').');
        const prep = ch.prepared.filter(x => ch.spells.includes(x));
        if (prep.length !== sc.prepared) warn(5, 'Marque ' + sc.prepared + ' magias preparadas do grimório (marcadas: ' + prep.length + ').');
      }
      if (sc.type === 'prepared' && ch.prepared.length !== sc.prepared) warn(5, 'Prepare ' + sc.prepared + ' magias de 1º nível (preparadas: ' + ch.prepared.length + ').');
    }

    // Equipamento
    if (cls) {
      cls.equipment.forEach((g, gi) => {
        const o = g.options[selectedOption(c, gi)];
        if (o && o.reqWeapon && !weaponProficient(o.reqWeapon, d.profs)) err(6, g.label + ': você não tem proficiência para “' + o.label + '”.');
        if (o && o.reqArmor && !d.profs.armor.has(o.reqArmor)) err(6, g.label + ': você não tem proficiência para “' + o.label + '”.');
      });
      d.acOptions.filter(x => x.armor && x.proficient === false).forEach(x => warn(6, 'Sem proficiência em ' + R.armor[x.armor].name + ': desvantagem em testes e ataques e não pode conjurar magias usando-a.'));
      if (d.speedNote) warn(6, d.speedNote + '.');
      if (d.wornArmor && d.wornArmor.cat === 'heavy' && c.classId === 'barbarian') warn(6, 'A Fúria não funciona com armadura pesada.');
      d.attacks.filter(x => !x.proficient).forEach(x => warn(6, 'Sem proficiência com ' + x.name + ': não soma o bônus de proficiência no ataque.'));
    }

    // História
    if (!c.story.backstory.trim()) warn(7, 'A história está vazia. Não é obrigatória, mas ajuda muito o mestre!');
    if (!c.story.alignment) warn(7, 'Tendência não escolhida (opcional).');
    return out;
  }

  return { AB, mod, sign, abName, skillName, newCharacter, baseScores, racialBonus, finalScores, pointBuyCost, suggestStandard, suggestPointBuy, classEquipmentGroups, selectedOption, pickKey, equipmentItems, itemName, pathInfo, activeSub, defaultSheet, profByLevel, slotsFor, spellAccess, proficiencies, weaponProficient, derive, spellList, validate };
})();
