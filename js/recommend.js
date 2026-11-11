/* Character Forge — recomendações de antecedente, idiomas e ferramentas conforme classe, caminho e espécie. */
window.CF = window.CF || {};

CF.recommend = (function () {
  const R = CF.RULES;

  const BG_BY_CLASS = {
    barbarian: ['outlander', 'folkhero', 'soldier'], bard: ['entertainer', 'charlatan', 'noble'],
    cleric: ['acolyte', 'hermit', 'sage'], druid: ['hermit', 'outlander', 'folkhero'],
    fighter: ['soldier', 'folkhero', 'sailor'], monk: ['hermit', 'acolyte', 'urchin'],
    paladin: ['noble', 'acolyte', 'soldier'], ranger: ['outlander', 'folkhero', 'soldier'],
    rogue: ['criminal', 'urchin', 'charlatan'], sorcerer: ['noble', 'sage', 'charlatan'],
    warlock: ['sage', 'charlatan', 'hermit'], wizard: ['sage', 'acolyte', 'guildartisan']
  };
  const BG_BY_RACE = {
    anao: ['guildartisan', 'soldier', 'folkhero'], elfo: ['outlander', 'sage', 'hermit'], halfling: ['urchin', 'entertainer', 'folkhero'],
    humano: ['soldier', 'noble', 'folkhero'], draconato: ['noble', 'soldier', 'acolyte'], gnomo: ['guildartisan', 'sage', 'entertainer'],
    meioelfo: ['entertainer', 'noble', 'charlatan'], meioorc: ['soldier', 'outlander', 'criminal'], tiefling: ['charlatan', 'criminal', 'urchin']
  };
  const RACE_BG_OVERRIDE = { drow: ['criminal', 'urchin', 'outlander'] };

  const skill = id => R.skills.find(s => s.id === id);
  const abName = id => R.abilities.find(a => a.id === id).name;

  /** Antecedentes ordenados por adequação, com os motivos. */
  function backgrounds(c) {
    const cls = R.classes[c.classId], race = R.races[c.raceId];
    const fromClass = BG_BY_CLASS[c.classId] || [];
    const fromRace = (race && (RACE_BG_OVERRIDE[c.raceId] || BG_BY_RACE[race.group])) || [];
    const classSkills = cls ? (cls.skillList === 'any' ? R.skills.map(s => s.id) : cls.skillList) : [];
    const raceSkills = new Set(race && race.skills ? race.skills : []);
    return Object.entries(R.backgrounds).filter(([, b]) => !b.custom).map(([id, b]) => {
      let score = 0; const why = [];
      if (fromClass.includes(id)) { score += 3; why.push(`combina com a história de um ${cls.name}`); }
      if (fromRace.includes(id)) { score += 1; why.push(`é comum entre ${race.name.toLowerCase().replace(/ \(.*\)/, '')}s`); }
      const good = b.skills.filter(s => cls && (cls.primary.includes(skill(s).ab)));
      if (good.length) { score += good.length; why.push(`${good.map(s => skill(s).name).join(' e ')} usa${good.length > 1 ? 'm' : ''} ${abName(skill(good[0]).ab)}, seu atributo principal`); }
      const fresh = b.skills.filter(s => !classSkills.includes(s) && !raceSkills.has(s));
      if (fresh.length === 2) { score += 0.5; why.push('traz perícias que a classe não oferece'); }
      if (b.skills.some(s => raceSkills.has(s))) { score -= 1; why.push('repete uma perícia da espécie (você troca por outra)'); }
      return { id, score, why };
    }).sort((a, b) => b.score - a.score);
  }

  const LANG_CLASS = {
    cleric: [['Celestial', 'idioma dos seres celestiais, ligado à fé']], paladin: [['Celestial', 'idioma dos seres celestiais, ligado ao juramento']],
    druid: [['Silvestre', 'idioma das fadas e criaturas da floresta'], ['Primordial', 'idioma dos elementais']],
    ranger: [['Goblin', 'goblins são inimigos comuns nas trilhas'], ['Orc', 'útil para rastrear e interrogar orcs'], ['Silvestre', 'criaturas da floresta']],
    wizard: [['Dracônico', 'muito usado em livros de magia'], ['Élfico', 'tradições arcanas antigas'], ['Celestial', 'textos religiosos e planares']],
    sorcerer: [['Dracônico', 'idioma da magia e dos dragões'], ['Primordial', 'magia elemental']],
    warlock: [['Infernal', 'idioma de demônios e corruptores'], ['Abissal', 'idioma dos demônios do Abismo']],
    rogue: [['Subcomum', 'idioma do comércio no Subterrâneo'], ['Goblin', 'muito falado em esconderijos e covis']],
    bard: [['Élfico', 'canções e poesia élfica'], ['Anão', 'baladas e histórias anãs'], ['Halfling', 'conversa de taverna']],
    barbarian: [['Gigante', 'gigantes e povos das montanhas'], ['Orc', 'tribos e inimigos selvagens']],
    fighter: [['Orc', 'inimigos comuns no campo de batalha'], ['Goblin', 'inimigos comuns no campo de batalha']],
    monk: [['Celestial', 'textos sagrados'], ['Élfico', 'tradições contemplativas']]
  };
  const LANG_SUB = {
    archfey: [['Silvestre', 'idioma do seu patrono feérico']], greatold: [['Dialeto Subterrâneo', 'idioma de aberrações e seres estranhos']],
    celestial: [['Celestial', 'idioma do seu patrono']], hexblade: [['Dialeto Subterrâneo', 'segredos sombrios']], fiend: [['Infernal', 'idioma do seu patrono']],
    divinesoul: [['Celestial', 'sua alma tocada pelos deuses']], storm: [['Primordial', 'idioma dos ventos e tempestades']], shadow: [['Subcomum', 'reinos sombrios']]
  };
  const LANG_RACE = {
    anao: [['Gnômico', 'vizinhos antigos dos anões'], ['Goblin', 'inimigos tradicionais dos anões'], ['Gigante', 'inimigos das montanhas']],
    elfo: [['Silvestre', 'criaturas feéricas'], ['Dracônico', 'saber arcano']], drow: [['Subcomum', 'idioma do Subterrâneo, onde os drow vivem']],
    halfling: [['Anão', 'vizinhos e parceiros de comércio'], ['Élfico', 'vizinhos e parceiros de comércio']], humano: [['Anão', 'idioma comum em cidades'], ['Élfico', 'idioma comum em cidades']],
    gnomo: [['Anão', 'vizinhos e aliados antigos'], ['Silvestre', 'criaturas da floresta']], meioelfo: [['Silvestre', 'sua herança feérica']],
    meioorc: [['Goblin', 'muito ouvido entre tribos orcs']], tiefling: [['Abissal', 'sua herança infernal']], draconato: [['Gigante', 'antigos rivais dos dragões']]
  };
  /** Idiomas sugeridos (que o personagem ainda não fala), com o motivo. */
  function languages(c, known) {
    const race = R.races[c.raceId];
    const list = [...(LANG_SUB[c.choices.subclass] || []), ...(LANG_CLASS[c.classId] || []), ...((race && (LANG_RACE[c.raceId] || LANG_RACE[race.group])) || []),
      ['Anão', 'um dos idiomas mais úteis em aventuras'], ['Élfico', 'um dos idiomas mais úteis em aventuras'], ['Goblin', 'inimigos comuns no início da campanha'], ['Orc', 'inimigos comuns no início da campanha']];
    const seen = new Set(known || []); const out = [];
    list.forEach(([lang, why]) => { if (!seen.has(lang) && R.languages.includes(lang)) { seen.add(lang); out.push({ lang, why }); } });
    return out.slice(0, 5);
  }

  const TOOL_CLASS = {
    fighter: [['Ferramentas de ferreiro', 'consertar armas e armaduras'], ['Conjunto de dados', 'passatempo de quartel']],
    paladin: [['Ferramentas de ferreiro', 'cuidar da armadura'], ['Xadrez de dragão', 'estratégia e nobreza']],
    barbarian: [['Ferramentas de carpinteiro', 'construir abrigos'], ['Conjunto de dados', 'apostas na taverna']],
    wizard: [['Suprimentos de caligrafia', 'copiar pergaminhos e grimórios'], ['Xadrez de dragão', 'mente estratégica']],
    cleric: [['Suprimentos de caligrafia', 'copiar textos sagrados'], ['Utensílios de cozinheiro', 'cuidar dos fiéis']],
    sorcerer: [['Ferramentas de joalheiro', 'gemas e focos arcanos'], ['Baralho', 'carisma e sorte']],
    warlock: [['Suprimentos de caligrafia', 'pactos por escrito'], ['Baralho', 'lábia e apostas']],
    rogue: [['Ferramentas de funileiro', 'mecanismos e fechaduras'], ['Baralho', 'trapaças e jogatina']],
    ranger: [['Utensílios de cozinheiro', 'preparar o que caça'], ['Ferramentas de carpinteiro', 'arcos e abrigos']],
    druid: [['Utensílios de cozinheiro', 'ervas e alimentos'], ['Ferramentas de oleiro', 'trabalhar com a terra']],
    monk: [['Suprimentos de caligrafia', 'disciplina e meditação'], ['Flauta', 'música contemplativa']],
    bard: [['Alaúde', 'versátil e fácil de carregar'], ['Flauta', 'leve e marcante'], ['Lira', 'clássica dos bardos']]
  };
  const TOOL_RACE = { anao: [['Ferramentas de ferreiro', 'tradição anã'], ['Ferramentas de cervejeiro', 'tradição anã']], gnomo: [['Ferramentas de funileiro', 'gnomos adoram engenhocas']], halfling: [['Utensílios de cozinheiro', 'halflings amam boa comida']], elfo: [['Lira', 'música élfica'], ['Ferramentas de joalheiro', 'arte élfica']] };
  /** Ferramentas recomendadas: Map nome → motivo. */
  function tools(c) {
    const race = R.races[c.raceId];
    const m = new Map();
    [...(TOOL_CLASS[c.classId] || []), ...((race && TOOL_RACE[race.group]) || [])].forEach(([t, why]) => { if (!m.has(t)) m.set(t, why); });
    return m;
  }

  return { backgrounds, languages, tools };
})();
