/*
 * Character Forge — dados de regras
 * Edição: D&D 5ª edição (2014), conteúdo do System Reference Document 5.1 (SRD 5.1).
 * Regras ficam SEPARADAS da interface: para mudar de edição, troque este arquivo.
 *
 * This work includes material taken from the System Reference Document 5.1 ("SRD 5.1")
 * by Wizards of the Coast LLC, available at https://dnd.wizards.com/resources/systems-reference-document.
 * The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License
 * (https://creativecommons.org/licenses/by/4.0/legalcode). Textos explicativos em português são originais.
 */
window.CF = window.CF || {};

CF.RULES = {
  edition: 'D&D 5e (2014) — SRD 5.1',
  level: 1,
  proficiencyBonus: 2,

  abilities: [
    { id: 'str', name: 'Força', short: 'FOR', desc: 'Potência física: levantar, empurrar, golpear com armas pesadas, saltar.' },
    { id: 'dex', name: 'Destreza', short: 'DES', desc: 'Agilidade e reflexos: esquivar, mirar com arcos, mover-se em silêncio. Também melhora sua CA e iniciativa.' },
    { id: 'con', name: 'Constituição', short: 'CON', desc: 'Saúde e resistência: aumenta seus Pontos de Vida e ajuda a manter a concentração em magias.' },
    { id: 'int', name: 'Inteligência', short: 'INT', desc: 'Raciocínio e memória: conhecimento, investigação. Atributo de magia do Mago.' },
    { id: 'wis', name: 'Sabedoria', short: 'SAB', desc: 'Percepção e intuição: notar perigos, ler pessoas. Atributo de magia de Clérigo e Druida.' },
    { id: 'cha', name: 'Carisma', short: 'CAR', desc: 'Presença e força de personalidade: convencer, enganar, inspirar. Atributo de magia de Bardo, Feiticeiro e Bruxo.' }
  ],

  skills: [
    { id: 'acrobatics', name: 'Acrobacia', ab: 'dex', desc: 'Equilibrar-se, rolar, fazer manobras ágeis.' },
    { id: 'animal', name: 'Adestrar Animais', ab: 'wis', desc: 'Acalmar, controlar ou entender animais.' },
    { id: 'arcana', name: 'Arcanismo', ab: 'int', desc: 'Conhecimento sobre magia, símbolos e planos.' },
    { id: 'athletics', name: 'Atletismo', ab: 'str', desc: 'Escalar, nadar, saltar, agarrar.' },
    { id: 'performance', name: 'Atuação', ab: 'cha', desc: 'Entreter com música, dança, teatro.' },
    { id: 'deception', name: 'Enganação', ab: 'cha', desc: 'Mentir de forma convincente, disfarçar intenções.' },
    { id: 'stealth', name: 'Furtividade', ab: 'dex', desc: 'Mover-se sem ser visto ou ouvido.' },
    { id: 'history', name: 'História', ab: 'int', desc: 'Lembrar eventos, reinos, guerras e lendas.' },
    { id: 'intimidation', name: 'Intimidação', ab: 'cha', desc: 'Influenciar alguém pelo medo ou ameaça.' },
    { id: 'insight', name: 'Intuição', ab: 'wis', desc: 'Perceber se alguém mente ou o que sente.' },
    { id: 'investigation', name: 'Investigação', ab: 'int', desc: 'Procurar pistas e deduzir a partir delas.' },
    { id: 'medicine', name: 'Medicina', ab: 'wis', desc: 'Estabilizar feridos, diagnosticar doenças.' },
    { id: 'nature', name: 'Natureza', ab: 'int', desc: 'Conhecimento sobre plantas, animais e clima.' },
    { id: 'perception', name: 'Percepção', ab: 'wis', desc: 'Notar coisas: ouvir, ver, sentir o perigo.' },
    { id: 'persuasion', name: 'Persuasão', ab: 'cha', desc: 'Convencer com argumentos, tato e boa vontade.' },
    { id: 'sleight', name: 'Prestidigitação', ab: 'dex', desc: 'Truques de mão: bater carteira, esconder objetos.' },
    { id: 'religion', name: 'Religião', ab: 'int', desc: 'Conhecimento sobre deuses, ritos e cultos.' },
    { id: 'survival', name: 'Sobrevivência', ab: 'wis', desc: 'Rastrear, caçar, não se perder na natureza.' }
  ],

  languages: ['Comum', 'Anão', 'Élfico', 'Gigante', 'Gnômico', 'Goblin', 'Halfling', 'Orc',
    'Abissal', 'Celestial', 'Dracônico', 'Dialeto Subterrâneo', 'Infernal', 'Primordial', 'Silvestre', 'Subcomum'],

  instruments: ['Alaúde', 'Flauta', 'Gaita de foles', 'Lira', 'Tambor', 'Trompa', 'Viola', 'Xalmo', 'Dulcimer', 'Flauta de pã'],
  artisanTools: ['Ferramentas de ferreiro', 'Ferramentas de carpinteiro', 'Ferramentas de cervejeiro', 'Ferramentas de pedreiro',
    'Ferramentas de joalheiro', 'Ferramentas de sapateiro', 'Suprimentos de caligrafia', 'Suprimentos de pintor',
    'Utensílios de cozinheiro', 'Ferramentas de funileiro', 'Ferramentas de oleiro', 'Ferramentas de tecelão'],

  pointBuy: { budget: 27, min: 8, max: 15, cost: { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 } },
  standardArray: [15, 14, 13, 12, 10, 8],

  /* ------------------------------------------------------------------ ARMAS */
  weapons: {
    club: { name: 'Clava', cat: 'simple', type: 'melee', dmg: '1d4', dt: 'concussão', props: ['leve'] },
    dagger: { name: 'Adaga', cat: 'simple', type: 'melee', dmg: '1d4', dt: 'perfurante', props: ['acuidade', 'leve', 'arremesso (6/18 m)'] },
    greatclub: { name: 'Clava grande', cat: 'simple', type: 'melee', dmg: '1d8', dt: 'concussão', props: ['duas mãos'] },
    handaxe: { name: 'Machadinha', cat: 'simple', type: 'melee', dmg: '1d6', dt: 'cortante', props: ['leve', 'arremesso (6/18 m)'] },
    javelin: { name: 'Azagaia', cat: 'simple', type: 'melee', dmg: '1d6', dt: 'perfurante', props: ['arremesso (9/36 m)'] },
    lighthammer: { name: 'Martelo leve', cat: 'simple', type: 'melee', dmg: '1d4', dt: 'concussão', props: ['leve', 'arremesso (6/18 m)'] },
    mace: { name: 'Maça', cat: 'simple', type: 'melee', dmg: '1d6', dt: 'concussão', props: [] },
    quarterstaff: { name: 'Bordão', cat: 'simple', type: 'melee', dmg: '1d6', dt: 'concussão', props: ['versátil (1d8)'] },
    sickle: { name: 'Foice curta', cat: 'simple', type: 'melee', dmg: '1d4', dt: 'cortante', props: ['leve'] },
    spear: { name: 'Lança', cat: 'simple', type: 'melee', dmg: '1d6', dt: 'perfurante', props: ['arremesso (6/18 m)', 'versátil (1d8)'] },
    lightcrossbow: { name: 'Besta leve', cat: 'simple', type: 'ranged', dmg: '1d8', dt: 'perfurante', props: ['munição (24/96 m)', 'recarga', 'duas mãos'] },
    dart: { name: 'Dardo', cat: 'simple', type: 'ranged', dmg: '1d4', dt: 'perfurante', props: ['acuidade', 'arremesso (6/18 m)'] },
    shortbow: { name: 'Arco curto', cat: 'simple', type: 'ranged', dmg: '1d6', dt: 'perfurante', props: ['munição (24/96 m)', 'duas mãos'] },
    sling: { name: 'Funda', cat: 'simple', type: 'ranged', dmg: '1d4', dt: 'concussão', props: ['munição (9/36 m)'] },

    battleaxe: { name: 'Machado de batalha', cat: 'martial', type: 'melee', dmg: '1d8', dt: 'cortante', props: ['versátil (1d10)'] },
    flail: { name: 'Mangual', cat: 'martial', type: 'melee', dmg: '1d8', dt: 'concussão', props: [] },
    glaive: { name: 'Glaive', cat: 'martial', type: 'melee', dmg: '1d10', dt: 'cortante', props: ['pesada', 'alcance', 'duas mãos'] },
    greataxe: { name: 'Machado grande', cat: 'martial', type: 'melee', dmg: '1d12', dt: 'cortante', props: ['pesada', 'duas mãos'] },
    greatsword: { name: 'Espada grande', cat: 'martial', type: 'melee', dmg: '2d6', dt: 'cortante', props: ['pesada', 'duas mãos'] },
    halberd: { name: 'Alabarda', cat: 'martial', type: 'melee', dmg: '1d10', dt: 'cortante', props: ['pesada', 'alcance', 'duas mãos'] },
    longsword: { name: 'Espada longa', cat: 'martial', type: 'melee', dmg: '1d8', dt: 'cortante', props: ['versátil (1d10)'] },
    maul: { name: 'Malho', cat: 'martial', type: 'melee', dmg: '2d6', dt: 'concussão', props: ['pesada', 'duas mãos'] },
    morningstar: { name: 'Maça estrela', cat: 'martial', type: 'melee', dmg: '1d8', dt: 'perfurante', props: [] },
    rapier: { name: 'Rapieira', cat: 'martial', type: 'melee', dmg: '1d8', dt: 'perfurante', props: ['acuidade'] },
    scimitar: { name: 'Cimitarra', cat: 'martial', type: 'melee', dmg: '1d6', dt: 'cortante', props: ['acuidade', 'leve'] },
    shortsword: { name: 'Espada curta', cat: 'martial', type: 'melee', dmg: '1d6', dt: 'perfurante', props: ['acuidade', 'leve'] },
    trident: { name: 'Tridente', cat: 'martial', type: 'melee', dmg: '1d6', dt: 'perfurante', props: ['arremesso (6/18 m)', 'versátil (1d8)'] },
    warpick: { name: 'Picareta de guerra', cat: 'martial', type: 'melee', dmg: '1d8', dt: 'perfurante', props: [] },
    warhammer: { name: 'Martelo de guerra', cat: 'martial', type: 'melee', dmg: '1d8', dt: 'concussão', props: ['versátil (1d10)'] },
    whip: { name: 'Chicote', cat: 'martial', type: 'melee', dmg: '1d4', dt: 'cortante', props: ['acuidade', 'alcance'] },
    handcrossbow: { name: 'Besta de mão', cat: 'martial', type: 'ranged', dmg: '1d6', dt: 'perfurante', props: ['munição (9/36 m)', 'leve', 'recarga'] },
    heavycrossbow: { name: 'Besta pesada', cat: 'martial', type: 'ranged', dmg: '1d10', dt: 'perfurante', props: ['munição (30/120 m)', 'pesada', 'recarga', 'duas mãos'] },
    longbow: { name: 'Arco longo', cat: 'martial', type: 'ranged', dmg: '1d8', dt: 'perfurante', props: ['munição (45/180 m)', 'pesada', 'duas mãos'] }
  },

  /* ---------------------------------------------------------------- ARMADURAS */
  armor: {
    leather: { name: 'Armadura de couro', cat: 'light', base: 11, dexMax: null },
    scale: { name: 'Brunea (cota de escamas)', cat: 'medium', base: 14, dexMax: 2, stealthDis: true },
    chain: { name: 'Cota de malha', cat: 'heavy', base: 16, dexMax: 0, str: 13, stealthDis: true },
    shield: { name: 'Escudo', cat: 'shield', bonus: 2 }
  },

  /* ------------------------------------------------- OUTROS ITENS E PACOTES */
  gear: {
    explorer: { name: 'Pacote de aventureiro', desc: 'Mochila, saco de dormir, kit de refeição, caixa de fogo, 10 tochas, 10 dias de rações, cantil e 15 m de corda de cânhamo.' },
    dungeoneer: { name: 'Pacote de explorador de masmorras', desc: 'Mochila, pé de cabra, martelo, 10 pítons, 10 tochas, caixa de fogo, 10 dias de rações, cantil e 15 m de corda de cânhamo.' },
    priest: { name: 'Pacote de sacerdote', desc: 'Mochila, cobertor, 10 velas, caixa de fogo, caixa de esmolas, 2 blocos de incenso, incensário, vestimentas, 2 dias de rações e cantil.' },
    scholar: { name: 'Pacote de estudioso', desc: 'Mochila, livro de conhecimento, vidro de tinta, pena, 10 folhas de pergaminho, saquinho de areia e faca pequena.' },
    burglar: { name: 'Pacote de assaltante', desc: 'Mochila, 1.000 esferas de metal, 3 m de barbante, sino, 5 velas, pé de cabra, martelo, 10 pítons, lanterna furta-fogo, 2 frascos de óleo, 5 dias de rações, caixa de fogo, cantil e 15 m de corda.' },
    diplomat: { name: 'Pacote de diplomata', desc: 'Baú, 2 estojos para mapas, roupas finas, vidro de tinta, pena, lâmpada, 2 frascos de óleo, 5 folhas de papel, frasco de perfume, cera de lacre e sabão.' },
    entertainer: { name: 'Pacote de artista', desc: 'Mochila, saco de dormir, 2 fantasias, 5 velas, 5 dias de rações, cantil e kit de disfarce.' },
    holysymbol: { name: 'Símbolo sagrado', desc: 'Foco para magias divinas (Clérigo e Paladino).' },
    componentpouch: { name: 'Bolsa de componentes', desc: 'Contém os pequenos materiais que suas magias pedem.' },
    arcanefocus: { name: 'Foco arcano', desc: 'Cristal, orbe, cajado ou varinha usado para canalizar magia arcana.' },
    druidicfocus: { name: 'Foco druídico', desc: 'Ramo de visco, totem ou cajado de madeira viva.' },
    spellbook: { name: 'Grimório', desc: 'Livro com as magias que o Mago aprendeu.' },
    thievestools: { name: 'Ferramentas de ladrão', desc: 'Gazuas e limas para abrir fechaduras e desarmar armadilhas.' },
    lute: { name: 'Alaúde', desc: 'Instrumento musical.' },
    instrument: { name: 'Instrumento musical (à escolha)', desc: 'Combine com o mestre qual instrumento.' },
    arrows20: { name: '20 flechas (aljava)', desc: 'Munição para arcos.' },
    bolts20: { name: '20 virotes', desc: 'Munição para bestas.' },
    acolytekit: { name: 'Kit do acólito', desc: 'Livro de orações, 5 varetas de incenso, vestimentas, roupas comuns e algibeira com 15 po.' },
    commonkit: { name: 'Roupas comuns e algibeira com 10 po', desc: 'Pertences pessoais básicos (combine detalhes com o mestre).' }
  },

  /* ------------------------------------------------------------------ CLASSES */
  classes: {
    barbarian: {
      name: 'Bárbaro', hitDie: 12, primary: ['str'], saves: ['str', 'con'],
      armor: ['light', 'medium', 'shield'], weapons: ['simple', 'martial'],
      skillChoices: 2, skillList: ['animal', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
      difficulty: 1, role: 'Linha de frente',
      tagline: 'Combatente furioso que aguenta muito dano e bate forte de perto.',
      howItWorks: 'Você entra em Fúria (ação bônus) para causar mais dano e resistir a golpes. Sem armadura, sua CA usa Destreza + Constituição.',
      exampleTurn: 'Ação bônus: entrar em Fúria. Movimento: correr até o orc. Ação: atacar com o machado grande (1d12 + FOR + 2 da Fúria).',
      suggested: ['str', 'con', 'dex', 'wis', 'cha', 'int'],
      features: [
        { name: 'Fúria', desc: 'Como ação bônus, por 1 minuto: vantagem em testes e resistências de Força, +2 de dano em ataques corpo a corpo com Força e resistência a dano de concussão, perfurante e cortante. 2 usos por descanso longo. Não funciona com armadura pesada nem permite conjurar magias.' },
        { name: 'Defesa sem Armadura', desc: 'Sem armadura, sua CA é 10 + Destreza + Constituição (pode usar escudo).' }
      ],
      equipment: [
        { label: 'Arma principal', options: [{ label: 'Machado grande', items: ['greataxe'] }, { label: 'Qualquer arma marcial corpo a corpo', items: [{ pick: 'martialMelee' }] }] },
        { label: 'Arma secundária', options: [{ label: 'Duas machadinhas', items: ['handaxe', 'handaxe'] }, { label: 'Qualquer arma simples', items: [{ pick: 'simple' }] }] }
      ],
      fixedEquipment: ['explorer', 'javelin', 'javelin', 'javelin', 'javelin']
    },
    bard: {
      name: 'Bardo', hitDie: 8, primary: ['cha'], saves: ['dex', 'cha'],
      armor: ['light'], weapons: ['simple', 'handcrossbow', 'longsword', 'rapier', 'shortsword'],
      skillChoices: 3, skillList: 'any', toolChoices: { count: 3, list: 'instruments', label: 'Instrumentos musicais' },
      difficulty: 2, role: 'Suporte / Social',
      tagline: 'Artista mágico que inspira aliados, encanta inimigos e é bom em quase tudo.',
      howItWorks: 'Usa Carisma para conjurar magias e dá dados de Inspiração Bárdica para os aliados somarem em testes.',
      exampleTurn: 'Ação bônus: dar Inspiração Bárdica ao guerreiro. Ação: lançar Zombaria Viciosa no inimigo.',
      suggested: ['cha', 'dex', 'con', 'wis', 'int', 'str'],
      casting: { ability: 'cha', cantrips: 2, known: 4, slots: [2], type: 'known' },
      features: [
        { name: 'Inspiração Bárdica (d6)', desc: 'Ação bônus: um aliado que possa ouvir você ganha 1d6 para somar em um teste, ataque ou resistência nos próximos 10 minutos. Usos = modificador de Carisma (mínimo 1) por descanso longo.' },
        { name: 'Conjuração', desc: 'Conhece 2 truques e 4 magias de 1º nível. Tem 2 espaços de magia de 1º nível.' }
      ],
      equipment: [
        { label: 'Arma', options: [{ label: 'Rapieira', items: ['rapier'] }, { label: 'Espada longa', items: ['longsword'] }, { label: 'Qualquer arma simples', items: [{ pick: 'simple' }] }] },
        { label: 'Pacote', options: [{ label: 'Pacote de diplomata', items: ['diplomat'] }, { label: 'Pacote de artista', items: ['entertainer'] }] },
        { label: 'Instrumento', options: [{ label: 'Alaúde', items: ['lute'] }, { label: 'Outro instrumento', items: ['instrument'] }] }
      ],
      fixedEquipment: ['leather', 'dagger']
    },
    cleric: {
      name: 'Clérigo', hitDie: 8, primary: ['wis'], saves: ['wis', 'cha'],
      armor: ['light', 'medium', 'shield'], weapons: ['simple'],
      skillChoices: 2, skillList: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
      difficulty: 2, role: 'Cura / Suporte',
      tagline: 'Servo de uma divindade que cura aliados, protege o grupo e enfrenta o mal.',
      howItWorks: 'Prepara magias divinas usando Sabedoria. Escolhe o domínio do seu deus já no 1º nível (Vida, Luz, Guerra, Tempestade…).',
      exampleTurn: 'Ação bônus: Palavra Curativa no amigo caído. Ação: Chama Sagrada no inimigo.',
      suggested: ['wis', 'str', 'con', 'cha', 'int', 'dex'],
      subclass: { id: 'life', name: 'Domínio da Vida', alwaysPrepared: ['bless', 'curewounds'] },
      casting: { ability: 'wis', cantrips: 3, slots: [2], type: 'prepared' },
      features: [
        { sub: 'life', name: 'Domínio da Vida', desc: 'Proficiência com armadura pesada. Bênção e Curar Ferimentos estão sempre preparadas (não contam no limite).' },
        { sub: 'life', name: 'Discípulo da Vida', desc: 'Suas magias de cura (de 1º nível ou mais) recuperam 2 + nível da magia PV extras.' },
        { name: 'Conjuração', desc: 'Conhece 3 truques. Prepara magias da lista de clérigo: modificador de Sabedoria + 1 (mínimo 1). Tem 2 espaços de 1º nível.' }
      ],
      equipment: [
        { label: 'Arma', options: [{ label: 'Maça', items: ['mace'] }, { label: 'Martelo de guerra (se tiver proficiência)', items: ['warhammer'], reqWeapon: 'warhammer' }] },
        { label: 'Armadura', options: [{ label: 'Brunea (média)', items: ['scale'] }, { label: 'Armadura de couro (leve)', items: ['leather'] }, { label: 'Cota de malha (pesada)', items: ['chain'], reqArmor: 'heavy' }] },
        { label: 'Arma extra', options: [{ label: 'Besta leve e 20 virotes', items: ['lightcrossbow', 'bolts20'] }, { label: 'Qualquer arma simples', items: [{ pick: 'simple' }] }] },
        { label: 'Pacote', options: [{ label: 'Pacote de sacerdote', items: ['priest'] }, { label: 'Pacote de aventureiro', items: ['explorer'] }] }
      ],
      fixedEquipment: ['shield', 'holysymbol']
    },
    druid: {
      name: 'Druida', hitDie: 8, primary: ['wis'], saves: ['int', 'wis'],
      armor: ['light', 'medium', 'shield'], armorNote: 'Druidas não usam armaduras nem escudos de metal.',
      weapons: ['club', 'dagger', 'dart', 'javelin', 'mace', 'quarterstaff', 'scimitar', 'sickle', 'sling', 'spear'],
      fixedTools: ['Kit de herbalismo'],
      skillChoices: 2, skillList: ['arcana', 'animal', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
      difficulty: 3, role: 'Controle / Cura',
      tagline: 'Guardião da natureza com magias de plantas, animais e elementos.',
      howItWorks: 'Prepara magias usando Sabedoria. Fala o idioma secreto Druídico. (A forma selvagem só chega no 2º nível.)',
      exampleTurn: 'Ação: lançar Constrição para prender inimigos em vinhas. Depois, ficar atrás dos aliados.',
      suggested: ['wis', 'con', 'dex', 'int', 'cha', 'str'],
      casting: { ability: 'wis', cantrips: 2, slots: [2], type: 'prepared' },
      extraLanguages: ['Druídico'],
      features: [
        { name: 'Druídico', desc: 'Você conhece o idioma secreto dos druidas e pode deixar mensagens ocultas.' },
        { name: 'Conjuração', desc: 'Conhece 2 truques. Prepara magias da lista de druida: modificador de Sabedoria + 1 (mínimo 1). Tem 2 espaços de 1º nível.' }
      ],
      equipment: [
        { label: 'Defesa', options: [{ label: 'Escudo de madeira', items: ['shield'] }, { label: 'Qualquer arma simples', items: [{ pick: 'druidWeapon' }] }] },
        { label: 'Arma', options: [{ label: 'Cimitarra', items: ['scimitar'] }, { label: 'Qualquer arma simples corpo a corpo', items: [{ pick: 'druidMelee' }] }] }
      ],
      fixedEquipment: ['leather', 'explorer', 'druidicfocus']
    },
    fighter: {
      name: 'Guerreiro', hitDie: 10, primary: ['str', 'dex'], saves: ['str', 'con'],
      armor: ['light', 'medium', 'heavy', 'shield'], weapons: ['simple', 'martial'],
      skillChoices: 2, skillList: ['acrobatics', 'animal', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
      difficulty: 1, role: 'Linha de frente / Dano',
      tagline: 'Mestre das armas e armaduras. Simples de jogar e muito eficiente.',
      howItWorks: 'Escolhe um Estilo de Luta que melhora seu jeito de combater e pode recuperar vida com Retomar o Fôlego.',
      exampleTurn: 'Movimento: posicionar-se na frente do mago. Ação: atacar com a espada longa. Se estiver ferido, ação bônus: Retomar o Fôlego.',
      suggested: ['str', 'con', 'dex', 'wis', 'cha', 'int'],
      fightingStyle: true,
      features: [
        { name: 'Estilo de Luta', desc: 'Escolha um estilo (veja abaixo). Ele dá um bônus permanente.' },
        { name: 'Retomar o Fôlego', desc: 'Ação bônus: recupera 1d10 + nível de guerreiro em PV. Uma vez por descanso curto ou longo.' }
      ],
      equipment: [
        { label: 'Armadura', options: [{ label: 'Cota de malha', items: ['chain'] }, { label: 'Armadura de couro, arco longo e 20 flechas', items: ['leather', 'longbow', 'arrows20'] }] },
        { label: 'Armas', options: [{ label: 'Uma arma marcial e um escudo', items: [{ pick: 'martial' }, 'shield'] }, { label: 'Duas armas marciais', items: [{ pick: 'martial' }, { pick: 'martial' }] }] },
        { label: 'Arma de apoio', options: [{ label: 'Besta leve e 20 virotes', items: ['lightcrossbow', 'bolts20'] }, { label: 'Duas machadinhas', items: ['handaxe', 'handaxe'] }] },
        { label: 'Pacote', options: [{ label: 'Pacote de explorador de masmorras', items: ['dungeoneer'] }, { label: 'Pacote de aventureiro', items: ['explorer'] }] }
      ],
      fixedEquipment: []
    },
    monk: {
      name: 'Monge', hitDie: 8, primary: ['dex', 'wis'], saves: ['str', 'dex'],
      armor: [], weapons: ['simple', 'shortsword'],
      toolChoices: { count: 1, list: 'monkTools', label: 'Ferramenta de artesão ou instrumento' },
      skillChoices: 2, skillList: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
      difficulty: 2, role: 'Mobilidade / Dano',
      tagline: 'Artista marcial ágil que luta com as mãos e se move rápido.',
      howItWorks: 'Sem armadura, sua CA usa Destreza + Sabedoria. Artes Marciais deixam você dar um soco extra como ação bônus.',
      exampleTurn: 'Ação: atacar com o bordão. Ação bônus: um golpe desarmado extra (1d4 + DES).',
      suggested: ['dex', 'wis', 'con', 'str', 'int', 'cha'],
      features: [
        { name: 'Defesa sem Armadura', desc: 'Sem armadura e sem escudo, sua CA é 10 + Destreza + Sabedoria.' },
        { name: 'Artes Marciais', desc: 'Com golpes desarmados ou armas de monge (espada curta e armas simples corpo a corpo sem as propriedades duas mãos ou pesada): pode usar Destreza em vez de Força, o dano mínimo vira 1d4, e após atacar com elas pode fazer um golpe desarmado como ação bônus.' }
      ],
      equipment: [
        { label: 'Arma', options: [{ label: 'Espada curta', items: ['shortsword'] }, { label: 'Qualquer arma simples', items: [{ pick: 'simple' }] }] },
        { label: 'Pacote', options: [{ label: 'Pacote de explorador de masmorras', items: ['dungeoneer'] }, { label: 'Pacote de aventureiro', items: ['explorer'] }] }
      ],
      fixedEquipment: ['dart10']
    },
    paladin: {
      name: 'Paladino', hitDie: 10, primary: ['str', 'cha'], saves: ['wis', 'cha'],
      armor: ['light', 'medium', 'heavy', 'shield'], weapons: ['simple', 'martial'],
      skillChoices: 2, skillList: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
      difficulty: 2, role: 'Linha de frente / Suporte',
      tagline: 'Guerreiro sagrado, protetor resistente que também cura com as mãos.',
      howItWorks: 'Luta como um guerreiro de armadura pesada e tem uma reserva de cura (Cura pelas Mãos). As magias chegam no 2º nível.',
      exampleTurn: 'Movimento: ir até o aliado ferido. Ação: Cura pelas Mãos (5 PV). No próximo turno, atacar com a espada.',
      suggested: ['str', 'cha', 'con', 'wis', 'dex', 'int'],
      features: [
        { name: 'Sentido Divino', desc: 'Ação: até o fim do seu próximo turno, sabe onde há celestiais, corruptores ou mortos-vivos a até 18 m (sem cobertura total). Usos = 1 + modificador de Carisma por descanso longo.' },
        { name: 'Cura pelas Mãos', desc: 'Reserva de 5 PV (5 × nível) por descanso longo. Ação: toque uma criatura e gaste PV da reserva para curá-la (ou 5 pontos para curar uma doença ou veneno).' }
      ],
      equipment: [
        { label: 'Armas', options: [{ label: 'Uma arma marcial e um escudo', items: [{ pick: 'martial' }, 'shield'] }, { label: 'Duas armas marciais', items: [{ pick: 'martial' }, { pick: 'martial' }] }] },
        { label: 'Arma extra', options: [{ label: 'Cinco azagaias', items: ['javelin', 'javelin', 'javelin', 'javelin', 'javelin'] }, { label: 'Qualquer arma simples corpo a corpo', items: [{ pick: 'simpleMelee' }] }] },
        { label: 'Pacote', options: [{ label: 'Pacote de sacerdote', items: ['priest'] }, { label: 'Pacote de aventureiro', items: ['explorer'] }] }
      ],
      fixedEquipment: ['chain', 'holysymbol']
    },
    ranger: {
      name: 'Patrulheiro', hitDie: 10, primary: ['dex', 'wis'], saves: ['str', 'dex'],
      armor: ['light', 'medium', 'shield'], weapons: ['simple', 'martial'],
      skillChoices: 3, skillList: ['animal', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
      difficulty: 2, role: 'Dano à distância / Exploração',
      tagline: 'Caçador e explorador, ótimo com arco e em terrenos selvagens.',
      howItWorks: 'Escolhe um tipo de inimigo favorito e um terreno favorito, onde é especialista. As magias chegam no 2º nível.',
      exampleTurn: 'Movimento: subir numa rocha. Ação: atirar com o arco longo (1d8 + DES).',
      suggested: ['dex', 'wis', 'con', 'str', 'int', 'cha'],
      favoredEnemy: true,
      features: [
        { name: 'Inimigo Favorito', desc: 'Vantagem em testes de Sobrevivência para rastrear e de Inteligência para lembrar informações sobre esse tipo de inimigo. Aprende um idioma falado por ele, se houver.' },
        { name: 'Explorador Natural', desc: 'No terreno favorito: dobra o bônus de proficiência em testes de Inteligência ou Sabedoria relacionados a ele, o grupo não é atrasado por terreno difícil e não se perde (exceto por magia), entre outros benefícios de viagem.' }
      ],
      equipment: [
        { label: 'Armadura', options: [{ label: 'Brunea (média)', items: ['scale'] }, { label: 'Armadura de couro (leve)', items: ['leather'] }] },
        { label: 'Armas corpo a corpo', options: [{ label: 'Duas espadas curtas', items: ['shortsword', 'shortsword'] }, { label: 'Duas armas simples corpo a corpo', items: [{ pick: 'simpleMelee' }, { pick: 'simpleMelee' }] }] },
        { label: 'Pacote', options: [{ label: 'Pacote de explorador de masmorras', items: ['dungeoneer'] }, { label: 'Pacote de aventureiro', items: ['explorer'] }] }
      ],
      fixedEquipment: ['longbow', 'arrows20']
    },
    rogue: {
      name: 'Ladino', hitDie: 8, primary: ['dex'], saves: ['dex', 'int'],
      armor: ['light'], weapons: ['simple', 'handcrossbow', 'longsword', 'rapier', 'shortsword'],
      fixedTools: ['Ferramentas de ladrão'],
      skillChoices: 4, skillList: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleight', 'stealth'],
      difficulty: 2, role: 'Dano / Perícias',
      tagline: 'Especialista furtivo: abre fechaduras, desarma armadilhas e acerta pontos fracos.',
      howItWorks: 'Causa Ataque Furtivo (+1d6) quando tem vantagem ou um aliado está ao lado do alvo. Tem muitas perícias e é especialista em duas.',
      exampleTurn: 'Movimento: flanquear o inimigo ao lado do guerreiro. Ação: atacar com a rapieira + Ataque Furtivo.',
      suggested: ['dex', 'con', 'wis', 'cha', 'int', 'str'],
      expertise: 2,
      extraLanguages: ['Gíria de Ladrão'],
      features: [
        { name: 'Especialização', desc: 'Escolha 2 perícias em que é proficiente (ou 1 perícia e ferramentas de ladrão): seu bônus de proficiência dobra nelas.' },
        { name: 'Ataque Furtivo (1d6)', desc: 'Uma vez por turno, +1d6 de dano em um ataque com arma de acuidade ou à distância, se tiver vantagem ou se um aliado estiver a 1,5 m do alvo (e você não tiver desvantagem).' },
        { name: 'Gíria de Ladrão', desc: 'Linguagem secreta de gírias e sinais do submundo.' }
      ],
      equipment: [
        { label: 'Arma principal', options: [{ label: 'Rapieira', items: ['rapier'] }, { label: 'Espada curta', items: ['shortsword'] }] },
        { label: 'Arma secundária', options: [{ label: 'Arco curto e 20 flechas', items: ['shortbow', 'arrows20'] }, { label: 'Espada curta', items: ['shortsword'] }] },
        { label: 'Pacote', options: [{ label: 'Pacote de assaltante', items: ['burglar'] }, { label: 'Pacote de explorador de masmorras', items: ['dungeoneer'] }, { label: 'Pacote de aventureiro', items: ['explorer'] }] }
      ],
      fixedEquipment: ['leather', 'dagger', 'dagger', 'thievestools']
    },
    sorcerer: {
      name: 'Feiticeiro', hitDie: 6, primary: ['cha'], saves: ['con', 'cha'],
      armor: [], weapons: ['dagger', 'dart', 'sling', 'quarterstaff', 'lightcrossbow'],
      skillChoices: 2, skillList: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
      difficulty: 2, role: 'Dano mágico',
      tagline: 'Nasceu com magia no sangue: dragões, deuses, tempestades ou puro caos.',
      howItWorks: 'Usa Carisma para conjurar. Escolhe a origem da sua magia já no 1º nível (ex.: Linhagem Dracônica dá +1 PV por nível e CA 13 + Destreza).',
      exampleTurn: 'Ação: lançar Raio de Fogo (1d10 de fogo) a até 36 m.',
      suggested: ['cha', 'con', 'dex', 'wis', 'int', 'str'],
      subclass: { id: 'draconic', name: 'Linhagem Dracônica', hpPerLevel: 1, extraLanguages: ['Dracônico'] },
      dragonAncestor: true,
      casting: { ability: 'cha', cantrips: 4, known: 2, slots: [2], type: 'known' },
      features: [
        { sub: 'draconic', name: 'Ancestral Dracônico', desc: 'Escolha um tipo de dragão. Você fala Dracônico e, ao fazer testes de Carisma com dragões, dobra o bônus de proficiência.' },
        { sub: 'draconic', name: 'Resiliência Dracônica', desc: '+1 PV por nível de feiticeiro. Sem armadura, sua CA é 13 + Destreza.' },
        { name: 'Conjuração', desc: 'Conhece 4 truques e 2 magias de 1º nível. Tem 2 espaços de 1º nível.' }
      ],
      equipment: [
        { label: 'Arma', options: [{ label: 'Besta leve e 20 virotes', items: ['lightcrossbow', 'bolts20'] }, { label: 'Qualquer arma simples', items: [{ pick: 'simple' }] }] },
        { label: 'Foco', options: [{ label: 'Bolsa de componentes', items: ['componentpouch'] }, { label: 'Foco arcano', items: ['arcanefocus'] }] },
        { label: 'Pacote', options: [{ label: 'Pacote de explorador de masmorras', items: ['dungeoneer'] }, { label: 'Pacote de aventureiro', items: ['explorer'] }] }
      ],
      fixedEquipment: ['dagger', 'dagger']
    },
    warlock: {
      name: 'Bruxo', hitDie: 8, primary: ['cha'], saves: ['wis', 'cha'],
      armor: ['light'], weapons: ['simple'],
      skillChoices: 2, skillList: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
      difficulty: 2, role: 'Dano mágico / Social',
      tagline: 'Fez um pacto com um ser poderoso: um demônio, uma fada, uma arma amaldiçoada…',
      howItWorks: 'Usa Carisma. Tem poucos espaços de magia, mas eles voltam num descanso curto. Rajada Mística é o truque de dano mais confiável.',
      exampleTurn: 'Ação: Rajada Mística (1d10 de força) a até 36 m.',
      suggested: ['cha', 'con', 'dex', 'wis', 'int', 'str'],
      subclass: { id: 'fiend', name: 'O Corruptor', expanded: ['burninghands', 'command'] },
      casting: { ability: 'cha', cantrips: 2, known: 2, slots: [1], type: 'known', pact: true },
      features: [
        { sub: 'fiend', name: 'Patrono: O Corruptor', desc: 'Mãos Flamejantes e Comando entram na sua lista de magias de bruxo.' },
        { sub: 'fiend', name: 'Bênção do Obscuro', desc: 'Quando você reduz uma criatura hostil a 0 PV, ganha PV temporários = modificador de Carisma + nível de bruxo (mínimo 1).' },
        { name: 'Magia de Pacto', desc: 'Conhece 2 truques e 2 magias de 1º nível. Tem 1 espaço de magia, recuperado em descanso curto ou longo.' }
      ],
      equipment: [
        { label: 'Arma', options: [{ label: 'Besta leve e 20 virotes', items: ['lightcrossbow', 'bolts20'] }, { label: 'Qualquer arma simples', items: [{ pick: 'simple' }] }] },
        { label: 'Foco', options: [{ label: 'Bolsa de componentes', items: ['componentpouch'] }, { label: 'Foco arcano', items: ['arcanefocus'] }] },
        { label: 'Pacote', options: [{ label: 'Pacote de estudioso', items: ['scholar'] }, { label: 'Pacote de explorador de masmorras', items: ['dungeoneer'] }] },
        { label: 'Arma simples extra', options: [{ label: 'Qualquer arma simples', items: [{ pick: 'simple' }] }] }
      ],
      fixedEquipment: ['leather', 'dagger', 'dagger']
    },
    wizard: {
      name: 'Mago', hitDie: 6, primary: ['int'], saves: ['int', 'wis'],
      armor: [], weapons: ['dagger', 'dart', 'sling', 'quarterstaff', 'lightcrossbow'],
      skillChoices: 2, skillList: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
      difficulty: 3, role: 'Controle / Utilidade',
      tagline: 'Estudioso da magia com o maior leque de magias, mas frágil.',
      howItWorks: 'Usa Inteligência. Tem um grimório com 6 magias e prepara algumas por dia. Recupera espaços com Recuperação Arcana.',
      exampleTurn: 'Ação: lançar Sono nos goblins. Movimento: ficar longe da linha de frente.',
      suggested: ['int', 'con', 'dex', 'wis', 'cha', 'str'],
      casting: { ability: 'int', cantrips: 3, spellbook: 6, slots: [2], type: 'spellbook' },
      features: [
        { name: 'Recuperação Arcana', desc: 'Uma vez por dia, ao terminar um descanso curto, recupera espaços de magia (no 1º nível: 1 espaço de 1º nível).' },
        { name: 'Conjuração', desc: 'Conhece 3 truques. Grimório com 6 magias de 1º nível; prepara modificador de Inteligência + 1 (mínimo 1) delas. Tem 2 espaços de 1º nível.' }
      ],
      equipment: [
        { label: 'Arma', options: [{ label: 'Bordão', items: ['quarterstaff'] }, { label: 'Adaga', items: ['dagger'] }] },
        { label: 'Foco', options: [{ label: 'Bolsa de componentes', items: ['componentpouch'] }, { label: 'Foco arcano', items: ['arcanefocus'] }] },
        { label: 'Pacote', options: [{ label: 'Pacote de estudioso', items: ['scholar'] }, { label: 'Pacote de aventureiro', items: ['explorer'] }] }
      ],
      fixedEquipment: ['spellbook']
    }
  },

  fightingStyles: [
    { id: 'archery', name: 'Arquearia', desc: '+2 nas jogadas de ataque com armas à distância.' },
    { id: 'defense', name: 'Defesa', desc: '+1 de CA enquanto estiver usando armadura.' },
    { id: 'dueling', name: 'Duelismo', desc: '+2 de dano com uma arma corpo a corpo em uma mão, sem outra arma.' },
    { id: 'gwf', name: 'Combate com Armas Grandes', desc: 'Ao rolar 1 ou 2 no dado de dano de uma arma de duas mãos/versátil (usada com as duas), role de novo.' },
    { id: 'protection', name: 'Proteção', desc: 'Com escudo: use sua reação para dar desvantagem a um ataque contra um aliado a até 1,5 m.' },
    { id: 'twf', name: 'Combate com Duas Armas', desc: 'Ao atacar com a segunda arma (ação bônus), soma o modificador de atributo ao dano.' }
  ],
  favoredEnemies: ['Aberrações', 'Bestas', 'Celestiais', 'Constructos', 'Dragões', 'Elementais', 'Fadas', 'Corruptores', 'Gigantes',
    'Monstruosidades', 'Limos', 'Plantas', 'Mortos-vivos', 'Humanoides (dois tipos: ex. goblins e orcs)'],
  terrains: ['Ártico', 'Litoral', 'Deserto', 'Floresta', 'Planície', 'Montanha', 'Pântano', 'Subterrâneo'],

  dragons: [
    { id: 'black', name: 'Preto', dmg: 'ácido', area: 'linha de 1,5 × 9 m', save: 'dex' },
    { id: 'blue', name: 'Azul', dmg: 'elétrico', area: 'linha de 1,5 × 9 m', save: 'dex' },
    { id: 'brass', name: 'Latão', dmg: 'fogo', area: 'linha de 1,5 × 9 m', save: 'dex' },
    { id: 'bronze', name: 'Bronze', dmg: 'elétrico', area: 'linha de 1,5 × 9 m', save: 'dex' },
    { id: 'copper', name: 'Cobre', dmg: 'ácido', area: 'linha de 1,5 × 9 m', save: 'dex' },
    { id: 'gold', name: 'Ouro', dmg: 'fogo', area: 'cone de 4,5 m', save: 'dex' },
    { id: 'green', name: 'Verde', dmg: 'veneno', area: 'cone de 4,5 m', save: 'con' },
    { id: 'red', name: 'Vermelho', dmg: 'fogo', area: 'cone de 4,5 m', save: 'dex' },
    { id: 'silver', name: 'Prata', dmg: 'frio', area: 'cone de 4,5 m', save: 'con' },
    { id: 'white', name: 'Branco', dmg: 'frio', area: 'cone de 4,5 m', save: 'con' }
  ],

  /* ----------------------------------------------------------------- ESPÉCIES */
  races: {
    dwarf: {
      name: 'Anão da Colina', size: 'Médio', speed: 7.5, darkvision: true,
      asi: { con: 2, wis: 1 }, hpPerLevel: 1,
      languages: ['Comum', 'Anão'], weapons: ['battleaxe', 'handaxe', 'lighthammer', 'warhammer'],
      toolChoice: ['Ferramentas de ferreiro', 'Ferramentas de cervejeiro', 'Ferramentas de pedreiro'],
      tagline: 'Resistentes e teimosos, mestres da pedra e do metal.',
      traits: [
        { name: 'Visão no Escuro', desc: 'Enxerga no escuro a até 18 m como se fosse penumbra (sem cores).' },
        { name: 'Resiliência Anã', desc: 'Vantagem em resistências contra veneno e resistência a dano de veneno.' },
        { name: 'Treinamento Anão', desc: 'Proficiência com machado de batalha, machadinha, martelo leve e martelo de guerra.' },
        { name: 'Robustez Anã', desc: '+1 PV por nível.' },
        { name: 'Especialista em Rochas', desc: 'Em testes de História sobre trabalho em pedra, soma o dobro da proficiência.' },
        { name: 'Deslocamento', desc: '7,5 m, que não é reduzido por armadura pesada.' }
      ]
    },
    elf: {
      name: 'Alto Elfo', size: 'Médio', speed: 9, darkvision: true,
      asi: { dex: 2, int: 1 }, skills: ['perception'],
      languages: ['Comum', 'Élfico'], extraLanguages: 1, weapons: ['longsword', 'shortsword', 'shortbow', 'longbow'],
      cantrip: 'wizard',
      tagline: 'Graciosos, longevos e com afinidade natural pela magia.',
      traits: [
        { name: 'Visão no Escuro', desc: 'Enxerga no escuro a até 18 m como se fosse penumbra.' },
        { name: 'Sentidos Aguçados', desc: 'Proficiência em Percepção.' },
        { name: 'Ancestralidade Feérica', desc: 'Vantagem em resistências contra ficar enfeitiçado; magia não pode colocá-lo para dormir.' },
        { name: 'Transe', desc: 'Medita 4 horas em vez de dormir 8.' },
        { name: 'Treinamento Élfico', desc: 'Proficiência com espada longa, espada curta, arco curto e arco longo.' },
        { name: 'Truque', desc: 'Conhece um truque de mago à sua escolha (usa Inteligência).' },
        { name: 'Idioma Extra', desc: 'Fala mais um idioma à sua escolha.' }
      ]
    },
    halfling: {
      name: 'Halfling Pés-Leves', size: 'Pequeno', speed: 7.5,
      asi: { dex: 2, cha: 1 },
      languages: ['Comum', 'Halfling'],
      tagline: 'Pequenos, sortudos e surpreendentemente corajosos.',
      traits: [
        { name: 'Sortudo', desc: 'Quando tirar 1 no d20 de um ataque, teste ou resistência, pode rolar de novo e usar o novo resultado.' },
        { name: 'Bravura', desc: 'Vantagem em resistências contra ficar amedrontado.' },
        { name: 'Agilidade Halfling', desc: 'Pode passar pelo espaço de criaturas de tamanho maior que o seu.' },
        { name: 'Furtividade Natural', desc: 'Pode tentar se esconder atrás de uma criatura pelo menos um tamanho maior.' }
      ]
    },
    human: {
      name: 'Humano', size: 'Médio', speed: 9,
      asi: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
      languages: ['Comum'], extraLanguages: 1,
      tagline: 'Versáteis e ambiciosos: +1 em todos os atributos.',
      traits: [
        { name: 'Versatilidade', desc: '+1 em todos os atributos.' },
        { name: 'Idioma Extra', desc: 'Fala mais um idioma à sua escolha.' }
      ]
    },
    dragonborn: {
      name: 'Draconato', size: 'Médio', speed: 9,
      asi: { str: 2, cha: 1 },
      languages: ['Comum', 'Dracônico'], dragonAncestry: true,
      tagline: 'Descendentes de dragões, com sopro elemental.',
      traits: [
        { name: 'Ancestralidade Dracônica', desc: 'Escolha um tipo de dragão: define o dano do sopro e sua resistência.' },
        { name: 'Arma de Sopro', desc: 'Ação: área conforme o dragão, 2d6 de dano (resistência: CD 8 + CON + proficiência; metade se passar). Uma vez por descanso curto ou longo.' },
        { name: 'Resistência a Dano', desc: 'Resistência ao tipo de dano do seu ancestral.' }
      ]
    },
    gnome: {
      name: 'Gnomo das Rochas', size: 'Pequeno', speed: 7.5, darkvision: true,
      asi: { int: 2, con: 1 }, fixedTools: ['Ferramentas de funileiro'],
      languages: ['Comum', 'Gnômico'],
      tagline: 'Curiosos inventores, resistentes à magia.',
      traits: [
        { name: 'Visão no Escuro', desc: 'Enxerga no escuro a até 18 m como se fosse penumbra.' },
        { name: 'Esperteza Gnômica', desc: 'Vantagem em resistências de Inteligência, Sabedoria e Carisma contra magia.' },
        { name: 'Conhecimento de Artífice', desc: 'Em testes de História sobre itens mágicos, alquímicos ou tecnológicos, soma o dobro da proficiência.' },
        { name: 'Engenhoqueiro', desc: 'Proficiência com ferramentas de funileiro; pode construir pequenos mecanismos.' }
      ]
    },
    halfelf: {
      name: 'Meio-Elfo', size: 'Médio', speed: 9, darkvision: true,
      asi: { cha: 2 }, asiChoice: { count: 2, amount: 1, exclude: ['cha'] },
      skillChoices: 2, languages: ['Comum', 'Élfico'], extraLanguages: 1,
      tagline: 'Entre dois mundos, carismáticos e adaptáveis.',
      traits: [
        { name: 'Visão no Escuro', desc: 'Enxerga no escuro a até 18 m como se fosse penumbra.' },
        { name: 'Ancestralidade Feérica', desc: 'Vantagem contra ficar enfeitiçado; magia não pode colocá-lo para dormir.' },
        { name: 'Versatilidade em Perícias', desc: 'Proficiência em 2 perícias à sua escolha.' },
        { name: 'Atributos', desc: '+2 Carisma e +1 em outros dois atributos à sua escolha.' }
      ]
    },
    halforc: {
      name: 'Meio-Orc', size: 'Médio', speed: 9, darkvision: true,
      asi: { str: 2, con: 1 }, skills: ['intimidation'],
      languages: ['Comum', 'Orc'],
      tagline: 'Fortes e intimidadores, difíceis de derrubar.',
      traits: [
        { name: 'Visão no Escuro', desc: 'Enxerga no escuro a até 18 m como se fosse penumbra.' },
        { name: 'Ameaçador', desc: 'Proficiência em Intimidação.' },
        { name: 'Resistência Implacável', desc: 'Quando cair a 0 PV sem morrer, fica com 1 PV. Uma vez por descanso longo.' },
        { name: 'Ataques Selvagens', desc: 'Num acerto crítico corpo a corpo, role um dado de dano da arma a mais.' }
      ]
    },
    tiefling: {
      name: 'Tiefling', size: 'Médio', speed: 9, darkvision: true,
      asi: { cha: 2, int: 1 },
      languages: ['Comum', 'Infernal'], knownCantrips: ['thaumaturgy'],
      tagline: 'Marcados por uma herança infernal, enfrentam desconfiança com carisma.',
      traits: [
        { name: 'Visão no Escuro', desc: 'Enxerga no escuro a até 18 m como se fosse penumbra.' },
        { name: 'Resistência Infernal', desc: 'Resistência a dano de fogo.' },
        { name: 'Legado Infernal', desc: 'Conhece o truque Taumaturgia (Carisma). No 3º nível ganha Repreensão Infernal.' }
      ]
    }
  },

  /* ------------------------------------------------------------- ANTECEDENTES */
  backgrounds: {
    acolyte: {
      name: 'Acólito', skills: ['insight', 'religion'], languages: 2, equipment: ['holysymbol', 'acolytekit'],
      tagline: 'Você serviu em um templo e conhece os ritos da sua fé.',
      feature: { name: 'Abrigo dos Fiéis', desc: 'Você e seus companheiros recebem cura e cuidados gratuitos em templos da sua fé, e você pode pedir ajuda a sacerdotes dela.' }
    },
    custom: {
      name: 'Antecedente personalizado', custom: true, skillChoices: 2, languages: 0, toolOrLanguage: 2, equipment: ['commonkit'],
      tagline: 'Monte seu passado: escolha 2 perícias e 2 idiomas/ferramentas que combinem com a história. Combine com o mestre.',
      feature: { name: 'Característica combinada com o mestre', desc: 'Converse com o mestre sobre um benefício narrativo (contatos, abrigo, reputação etc.).' }
    }
  },
  customBackgroundIdeas: [
    { name: 'Soldado', skills: ['athletics', 'intimidation'], hint: 'Servi em um exército ou na guarda da cidade.' },
    { name: 'Criado nas ruas', skills: ['sleight', 'stealth'], hint: 'Sobrevivi por conta própria nas ruas da cidade.' },
    { name: 'Estudioso', skills: ['arcana', 'history'], hint: 'Passei anos estudando em bibliotecas.' },
    { name: 'Artista de estrada', skills: ['acrobatics', 'performance'], hint: 'Viajava me apresentando de vila em vila.' },
    { name: 'Andarilho da floresta', skills: ['athletics', 'survival'], hint: 'Cresci longe da civilização.' },
    { name: 'Nobre', skills: ['history', 'persuasion'], hint: 'Venho de uma família rica e influente.' },
    { name: 'Herói do povo', skills: ['animal', 'survival'], hint: 'Era gente simples até fazer algo grandioso.' },
    { name: 'Charlatão', skills: ['deception', 'sleight'], hint: 'Vivia de golpes e truques.' }
  ],

  alignments: ['Leal e Bom', 'Neutro e Bom', 'Caótico e Bom', 'Leal e Neutro', 'Neutro', 'Caótico e Neutro', 'Leal e Mau', 'Neutro e Mau', 'Caótico e Mau']
};

/* --------------------------------------------------------------- MAGIAS (SRD) */
/* tags: dano, cura, suporte, controle, utilidade. beginner = recomendada para iniciantes. */
CF.RULES.spells = {
  // Truques
  acidsplash: { name: 'Respingo Ácido', lvl: 0, cls: ['sorcerer', 'wizard'], tag: 'dano', desc: 'Ação, 18 m. Um ou dois alvos próximos entre si fazem resistência de Destreza ou sofrem 1d6 de ácido.' },
  chilltouch: { name: 'Toque Arrepiante', lvl: 0, cls: ['sorcerer', 'warlock', 'wizard'], tag: 'dano', desc: 'Ação, 36 m. Ataque mágico à distância: 1d8 necrótico e o alvo não pode recuperar PV até seu próximo turno.' },
  dancinglights: { name: 'Globos de Luz', lvl: 0, cls: ['bard', 'sorcerer', 'wizard'], tag: 'utilidade', desc: 'Ação, 36 m, concentração. Cria até 4 luzes flutuantes que você move.' },
  druidcraft: { name: 'Arte Druídica', lvl: 0, cls: ['druid'], tag: 'utilidade', desc: 'Ação, 9 m. Pequenos efeitos naturais: prever o tempo, fazer uma flor desabrochar, acender uma vela.' },
  eldritchblast: { name: 'Rajada Mística', lvl: 0, cls: ['warlock'], tag: 'dano', beginner: true, desc: 'Ação, 36 m. Ataque mágico à distância: 1d10 de dano de força.' },
  firebolt: { name: 'Raio de Fogo', lvl: 0, cls: ['sorcerer', 'wizard'], tag: 'dano', beginner: true, desc: 'Ação, 36 m. Ataque mágico à distância: 1d10 de fogo. Incendeia objetos inflamáveis.' },
  guidance: { name: 'Orientação', lvl: 0, cls: ['cleric', 'druid'], tag: 'suporte', beginner: true, desc: 'Ação, toque, concentração. O aliado soma 1d4 em um teste de habilidade.' },
  light: { name: 'Luz', lvl: 0, cls: ['bard', 'cleric', 'sorcerer', 'wizard'], tag: 'utilidade', desc: 'Ação, toque. Um objeto brilha como uma tocha por 1 hora.' },
  magehand: { name: 'Mão Mágica', lvl: 0, cls: ['bard', 'sorcerer', 'warlock', 'wizard'], tag: 'utilidade', desc: 'Ação, 9 m. Uma mão espectral manipula objetos leves à distância.' },
  mending: { name: 'Consertar', lvl: 0, cls: ['bard', 'cleric', 'druid', 'sorcerer', 'wizard'], tag: 'utilidade', desc: '1 minuto, toque. Conserta uma quebra ou rasgo pequeno em um objeto.' },
  message: { name: 'Mensagem', lvl: 0, cls: ['bard', 'sorcerer', 'wizard'], tag: 'utilidade', desc: 'Ação, 36 m. Sussurra uma mensagem que só o alvo ouve; ele pode responder.' },
  minorillusion: { name: 'Ilusão Menor', lvl: 0, cls: ['bard', 'sorcerer', 'warlock', 'wizard'], tag: 'utilidade', desc: 'Ação, 9 m. Cria um som ou imagem pequena de um objeto por 1 minuto.' },
  poisonspray: { name: 'Rajada de Veneno', lvl: 0, cls: ['druid', 'sorcerer', 'warlock', 'wizard'], tag: 'dano', desc: 'Ação, 3 m. O alvo faz resistência de Constituição ou sofre 1d12 de veneno.' },
  prestidigitation: { name: 'Prestidigitação', lvl: 0, cls: ['bard', 'sorcerer', 'warlock', 'wizard'], tag: 'utilidade', desc: 'Ação, 3 m. Truques mágicos simples: limpar, aquecer, criar faíscas, sabores.' },
  produceflame: { name: 'Produzir Chamas', lvl: 0, cls: ['druid'], tag: 'dano', beginner: true, desc: 'Ação. Chama na mão que ilumina; pode arremessá-la (ataque mágico, 9 m) para 1d8 de fogo.' },
  rayoffrost: { name: 'Raio de Gelo', lvl: 0, cls: ['sorcerer', 'wizard'], tag: 'dano', desc: 'Ação, 18 m. Ataque mágico à distância: 1d8 de frio e o alvo perde 3 m de deslocamento.' },
  resistance: { name: 'Resistência', lvl: 0, cls: ['cleric', 'druid'], tag: 'suporte', desc: 'Ação, toque, concentração. O aliado soma 1d4 em um teste de resistência.' },
  sacredflame: { name: 'Chama Sagrada', lvl: 0, cls: ['cleric'], tag: 'dano', beginner: true, desc: 'Ação, 18 m. O alvo faz resistência de Destreza ou sofre 1d8 radiante (cobertura não ajuda).' },
  shillelagh: { name: 'Bordão Místico', lvl: 0, cls: ['druid'], tag: 'dano', desc: 'Ação bônus. Sua clava ou bordão usa Sabedoria para atacar e causa 1d8, por 1 minuto.' },
  shockinggrasp: { name: 'Toque Chocante', lvl: 0, cls: ['sorcerer', 'wizard'], tag: 'dano', desc: 'Ação, toque. Ataque mágico corpo a corpo: 1d8 elétrico (vantagem contra armadura de metal); o alvo não pode usar reações.' },
  sparethedying: { name: 'Poupar os Moribundos', lvl: 0, cls: ['cleric'], tag: 'cura', desc: 'Ação, toque. Estabiliza uma criatura com 0 PV.' },
  thaumaturgy: { name: 'Taumaturgia', lvl: 0, cls: ['cleric'], tag: 'utilidade', desc: 'Ação, 9 m. Pequenos prodígios: voz trovejante, tremores, chamas que mudam de cor.' },
  truestrike: { name: 'Golpe Certeiro', lvl: 0, cls: ['bard', 'sorcerer', 'warlock', 'wizard'], tag: 'suporte', desc: 'Ação, 9 m, concentração. Você ganha vantagem no primeiro ataque contra o alvo no próximo turno.' },
  viciousmockery: { name: 'Zombaria Viciosa', lvl: 0, cls: ['bard'], tag: 'dano', beginner: true, desc: 'Ação, 18 m. O alvo faz resistência de Sabedoria ou sofre 1d4 psíquico e tem desvantagem no próximo ataque.' },

  // 1º nível
  alarm: { name: 'Alarme', lvl: 1, cls: ['ranger', 'wizard'], tag: 'utilidade', ritual: true, desc: '1 minuto, 9 m. Um alarme avisa se alguém entrar na área protegida por 8 horas.' },
  animalfriendship: { name: 'Amizade Animal', lvl: 1, cls: ['bard', 'druid', 'ranger'], tag: 'controle', desc: 'Ação, 9 m. Uma besta com Inteligência 3 ou menos faz resistência de Sabedoria ou fica enfeitiçada por 24 horas.' },
  bane: { name: 'Perdição', lvl: 1, cls: ['bard', 'cleric'], tag: 'controle', desc: 'Ação, 9 m, concentração. Até 3 inimigos fazem resistência de Carisma ou subtraem 1d4 de ataques e resistências.' },
  bless: { name: 'Bênção', lvl: 1, cls: ['cleric', 'paladin'], tag: 'suporte', beginner: true, desc: 'Ação, 9 m, concentração. Até 3 aliados somam 1d4 em ataques e resistências por 1 minuto.' },
  burninghands: { name: 'Mãos Flamejantes', lvl: 1, cls: ['sorcerer', 'wizard'], tag: 'dano', beginner: true, desc: 'Ação, cone de 4,5 m. Resistência de Destreza: 3d6 de fogo (metade se passar).' },
  charmperson: { name: 'Enfeitiçar Pessoa', lvl: 1, cls: ['bard', 'druid', 'sorcerer', 'warlock', 'wizard'], tag: 'controle', desc: 'Ação, 9 m. Um humanoide faz resistência de Sabedoria ou fica enfeitiçado e amigável por 1 hora.' },
  colorspray: { name: 'Spray de Cores', lvl: 1, cls: ['sorcerer', 'wizard'], tag: 'controle', desc: 'Ação, cone de 4,5 m. Rola 6d10: criaturas com menos PV (a partir da mais fraca) ficam cegas até o fim do seu próximo turno.' },
  command: { name: 'Comando', lvl: 1, cls: ['cleric', 'paladin'], tag: 'controle', desc: 'Ação, 18 m. Uma palavra de ordem (“Fuja!”, “Caia!”). Resistência de Sabedoria ou o alvo obedece no próximo turno.' },
  comprehendlanguages: { name: 'Compreender Idiomas', lvl: 1, cls: ['bard', 'sorcerer', 'warlock', 'wizard'], tag: 'utilidade', ritual: true, desc: 'Ação. Por 1 hora você entende qualquer idioma falado ou escrito.' },
  createdestroywater: { name: 'Criar ou Destruir Água', lvl: 1, cls: ['cleric', 'druid'], tag: 'utilidade', desc: 'Ação, 9 m. Cria ou destrói até 40 litros de água.' },
  curewounds: { name: 'Curar Ferimentos', lvl: 1, cls: ['bard', 'cleric', 'druid', 'paladin', 'ranger'], tag: 'cura', beginner: true, desc: 'Ação, toque. Cura 1d8 + seu modificador de conjuração.' },
  detectevilgood: { name: 'Detectar o Bem e o Mal', lvl: 1, cls: ['cleric', 'paladin'], tag: 'utilidade', desc: 'Ação, concentração. Sente aberrações, celestiais, elementais, fadas, corruptores e mortos-vivos a até 9 m.' },
  detectmagic: { name: 'Detectar Magia', lvl: 1, cls: ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'wizard'], tag: 'utilidade', ritual: true, desc: 'Ação, concentração. Sente a presença de magia a até 9 m.' },
  detectpoison: { name: 'Detectar Veneno e Doença', lvl: 1, cls: ['cleric', 'druid', 'paladin', 'ranger'], tag: 'utilidade', ritual: true, desc: 'Ação, concentração. Sente venenos, criaturas venenosas e doenças a até 9 m.' },
  disguiseself: { name: 'Disfarçar-se', lvl: 1, cls: ['bard', 'sorcerer', 'wizard'], tag: 'utilidade', desc: 'Ação. Muda sua aparência (roupas, rosto, altura aproximada) por 1 hora.' },
  divinefavor: { name: 'Favor Divino', lvl: 1, cls: ['paladin'], tag: 'dano', desc: 'Ação bônus, concentração. Seus ataques com arma causam +1d4 radiante.' },
  entangle: { name: 'Constrição', lvl: 1, cls: ['druid'], tag: 'controle', beginner: true, desc: 'Ação, 27 m, concentração. Vinhas num quadrado de 6 m: resistência de Força ou as criaturas ficam impedidas.' },
  expeditiousretreat: { name: 'Recuo Acelerado', lvl: 1, cls: ['sorcerer', 'warlock', 'wizard'], tag: 'utilidade', desc: 'Ação bônus, concentração. Pode usar a ação Disparada como ação bônus a cada turno.' },
  faeriefire: { name: 'Fogo das Fadas', lvl: 1, cls: ['bard', 'druid'], tag: 'suporte', desc: 'Ação, 18 m, concentração. Criaturas num cubo de 6 m fazem resistência de Destreza ou brilham: ataques contra elas têm vantagem.' },
  falselife: { name: 'Vitalidade Falsa', lvl: 1, cls: ['sorcerer', 'wizard'], tag: 'suporte', desc: 'Ação. Ganha 1d4 + 4 PV temporários por 1 hora.' },
  featherfall: { name: 'Queda Suave', lvl: 1, cls: ['bard', 'sorcerer', 'wizard'], tag: 'utilidade', desc: 'Reação, 18 m. Até 5 criaturas caindo descem devagar e não sofrem dano.' },
  fogcloud: { name: 'Névoa Obscurecente', lvl: 1, cls: ['druid', 'ranger', 'sorcerer', 'wizard'], tag: 'controle', desc: 'Ação, 36 m, concentração. Esfera de névoa de 6 m de raio que bloqueia a visão.' },
  goodberry: { name: 'Bom Fruto', lvl: 1, cls: ['druid', 'ranger'], tag: 'cura', desc: 'Ação. Cria 10 frutas; cada uma cura 1 PV e alimenta por um dia.' },
  grease: { name: 'Área Escorregadia', lvl: 1, cls: ['wizard'], tag: 'controle', desc: 'Ação, 18 m. Quadrado de 3 m de graxa: resistência de Destreza ou cai no chão.' },
  guidingbolt: { name: 'Raio Guiador', lvl: 1, cls: ['cleric'], tag: 'dano', beginner: true, desc: 'Ação, 36 m. Ataque mágico: 4d6 radiante e o próximo ataque contra o alvo tem vantagem.' },
  healingword: { name: 'Palavra Curativa', lvl: 1, cls: ['bard', 'cleric', 'druid'], tag: 'cura', beginner: true, desc: 'Ação bônus, 18 m. Cura 1d4 + seu modificador de conjuração à distância. Ótima para levantar aliados caídos.' },
  hellishrebuke: { name: 'Repreensão Infernal', lvl: 1, cls: ['warlock'], tag: 'dano', desc: 'Reação ao sofrer dano, 18 m. O atacante faz resistência de Destreza: 2d10 de fogo (metade se passar).' },
  heroism: { name: 'Heroísmo', lvl: 1, cls: ['bard', 'paladin'], tag: 'suporte', desc: 'Ação, toque, concentração. Aliado fica imune a medo e ganha PV temporários = seu modificador a cada turno.' },
  hideouslaughter: { name: 'Riso Histérico', lvl: 1, cls: ['bard', 'wizard'], tag: 'controle', desc: 'Ação, 9 m, concentração. Resistência de Sabedoria ou o alvo cai no chão rindo, incapacitado.' },
  identify: { name: 'Identificação', lvl: 1, cls: ['bard', 'wizard'], tag: 'utilidade', ritual: true, desc: '1 minuto, toque. Descobre as propriedades de um item mágico.' },
  illusoryscript: { name: 'Escrita Ilusória', lvl: 1, cls: ['bard', 'warlock', 'wizard'], tag: 'utilidade', ritual: true, desc: '1 minuto. Escreve uma mensagem que só pessoas escolhidas conseguem ler.' },
  inflictwounds: { name: 'Infligir Ferimentos', lvl: 1, cls: ['cleric'], tag: 'dano', desc: 'Ação, toque. Ataque mágico corpo a corpo: 3d10 necrótico.' },
  jump: { name: 'Salto', lvl: 1, cls: ['druid', 'ranger', 'sorcerer', 'wizard'], tag: 'utilidade', desc: 'Ação, toque. Triplica a distância de salto do alvo por 1 minuto.' },
  longstrider: { name: 'Passos Longos', lvl: 1, cls: ['bard', 'druid', 'ranger', 'wizard'], tag: 'utilidade', desc: 'Ação, toque. +3 m de deslocamento por 1 hora.' },
  magearmor: { name: 'Armadura Arcana', lvl: 1, cls: ['sorcerer', 'wizard'], tag: 'suporte', beginner: true, desc: 'Ação, toque. Alvo sem armadura fica com CA 13 + Destreza por 8 horas.' },
  magicmissile: { name: 'Mísseis Mágicos', lvl: 1, cls: ['sorcerer', 'wizard'], tag: 'dano', beginner: true, desc: 'Ação, 36 m. Três dardos que sempre acertam, cada um com 1d4 + 1 de força.' },
  protectionevilgood: { name: 'Proteção contra o Bem e o Mal', lvl: 1, cls: ['cleric', 'paladin', 'warlock', 'wizard'], tag: 'suporte', desc: 'Ação, toque, concentração. Protege contra aberrações, celestiais, elementais, fadas, corruptores e mortos-vivos.' },
  purifyfood: { name: 'Purificar Comida e Bebida', lvl: 1, cls: ['cleric', 'druid', 'paladin'], tag: 'utilidade', ritual: true, desc: 'Ação, 3 m. Remove venenos e doenças de comida e bebida.' },
  sanctuary: { name: 'Santuário', lvl: 1, cls: ['cleric'], tag: 'suporte', desc: 'Ação bônus, 9 m. Quem quiser atacar o alvo precisa passar numa resistência de Sabedoria.' },
  shield: { name: 'Escudo Arcano', lvl: 1, cls: ['sorcerer', 'wizard'], tag: 'suporte', beginner: true, desc: 'Reação ao ser atingido. +5 de CA até o início do seu próximo turno.' },
  shieldoffaith: { name: 'Escudo da Fé', lvl: 1, cls: ['cleric', 'paladin'], tag: 'suporte', desc: 'Ação bônus, 18 m, concentração. +2 de CA para uma criatura por 10 minutos.' },
  silentimage: { name: 'Imagem Silenciosa', lvl: 1, cls: ['bard', 'sorcerer', 'wizard'], tag: 'utilidade', desc: 'Ação, 18 m, concentração. Cria uma ilusão visual de até um cubo de 4,5 m.' },
  sleep: { name: 'Sono', lvl: 1, cls: ['bard', 'sorcerer', 'wizard'], tag: 'controle', beginner: true, desc: 'Ação, 27 m. Rola 5d8: criaturas com menos PV (a partir da mais fraca) caem no sono.' },
  speakwithanimals: { name: 'Falar com Animais', lvl: 1, cls: ['bard', 'druid', 'ranger'], tag: 'utilidade', ritual: true, desc: 'Ação. Por 10 minutos você conversa com animais.' },
  thunderwave: { name: 'Onda Trovejante', lvl: 1, cls: ['bard', 'druid', 'sorcerer', 'wizard'], tag: 'dano', beginner: true, desc: 'Ação, cubo de 4,5 m. Resistência de Constituição: 2d8 trovejante e empurrado 3 m (metade e sem empurrão se passar).' },
  unseenservant: { name: 'Servo Invisível', lvl: 1, cls: ['bard', 'warlock', 'wizard'], tag: 'utilidade', ritual: true, desc: 'Ação, 18 m. Cria uma força invisível que faz tarefas simples por 1 hora.' },
  floatingdisk: { name: 'Disco Flutuante', lvl: 1, cls: ['wizard'], tag: 'utilidade', ritual: true, desc: 'Ação, 9 m. Um disco de força carrega até 225 kg e segue você por 1 hora.' }
};

/* Listas para escolhas "qualquer arma X" */
(function () {
  const W = CF.RULES.weapons;
  const ids = Object.keys(W);
  CF.RULES.weaponPicks = {
    simple: ids.filter(id => W[id].cat === 'simple'),
    simpleMelee: ids.filter(id => W[id].cat === 'simple' && W[id].type === 'melee'),
    martial: ids.filter(id => W[id].cat === 'martial'),
    martialMelee: ids.filter(id => W[id].cat === 'martial' && W[id].type === 'melee'),
    druidWeapon: ['club', 'dagger', 'dart', 'javelin', 'mace', 'quarterstaff', 'sickle', 'sling', 'spear'],
    druidMelee: ['club', 'dagger', 'javelin', 'mace', 'quarterstaff', 'sickle', 'spear']
  };
  CF.RULES.gear.dart10 = { name: '10 dardos', desc: 'Armas de arremesso leves.', weapon: 'dart' };
  CF.RULES.toolLists = {
    instruments: CF.RULES.instruments,
    monkTools: CF.RULES.artisanTools.concat(CF.RULES.instruments),
    toolOrLanguage: CF.RULES.languages.concat(CF.RULES.artisanTools, CF.RULES.instruments, ['Kit de disfarce', 'Kit de falsificação', 'Kit de herbalismo', 'Ferramentas de navegador', 'Ferramentas de ladrão', 'Jogo (dados, cartas)', 'Veículos terrestres'])
  };
})();
