/* Character Forge — conteúdo didático original (conceitos, quiz, glossário, histórias). */
window.CF = window.CF || {};

CF.CONTENT = {
  concepts: [
    { id: 'protector', icon: '🛡️', name: 'Protetor', desc: 'Fica na frente do grupo e aguenta os golpes para que ninguém se machuque.', classes: ['fighter', 'paladin', 'barbarian'] },
    { id: 'scholar', icon: '📜', name: 'Erudito', desc: 'Resolve problemas com conhecimento e magia estudada.', classes: ['wizard', 'cleric', 'druid'] },
    { id: 'cunning', icon: '🗝️', name: 'Astuto', desc: 'Furtivo, esperto, encontra o caminho que ninguém viu.', classes: ['rogue', 'ranger', 'bard'] },
    { id: 'inspiring', icon: '🎺', name: 'Inspirador', desc: 'Lidera, motiva e fala pelo grupo.', classes: ['bard', 'paladin', 'cleric'] },
    { id: 'healer', icon: '✨', name: 'Curandeiro', desc: 'Mantém os amigos de pé e protege quem precisa.', classes: ['cleric', 'druid', 'bard'] },
    { id: 'wild', icon: '🐺', name: 'Selvagem', desc: 'Ligado à natureza, à caça e aos instintos.', classes: ['druid', 'ranger', 'barbarian'] },
    { id: 'mystic', icon: '🔮', name: 'Místico', desc: 'Poder misterioso: sangue mágico, pactos e segredos.', classes: ['warlock', 'sorcerer', 'wizard'] },
    { id: 'disciplined', icon: '🥋', name: 'Disciplinado', desc: 'Treino, foco e técnica acima de tudo.', classes: ['monk', 'fighter', 'paladin'] }
  ],

  quiz: [
    {
      q: 'Quando a luta começa, onde você quer estar?',
      a: [
        { t: 'Na linha de frente, aguentando pancada', w: { barbarian: 2, fighter: 2, paladin: 2 } },
        { t: 'Atacando de longe, com segurança', w: { ranger: 2, warlock: 1, sorcerer: 1, wizard: 1 } },
        { t: 'Ajudando e curando os aliados', w: { cleric: 2, druid: 1, bard: 1, paladin: 1 } },
        { t: 'Nas sombras, pegando o inimigo desprevenido', w: { rogue: 2, monk: 1, ranger: 1 } }
      ]
    },
    {
      q: 'Magia ou armas?',
      a: [
        { t: 'Só armas. Aço resolve.', w: { barbarian: 2, fighter: 2, rogue: 1, monk: 1 } },
        { t: 'Um pouco de cada', w: { paladin: 2, ranger: 2, bard: 1 } },
        { t: 'Magia é tudo!', w: { wizard: 2, sorcerer: 2, warlock: 2, druid: 1, cleric: 1 } }
      ]
    },
    {
      q: 'Fora do combate, como você prefere ajudar?',
      a: [
        { t: 'Conversando e convencendo pessoas', w: { bard: 2, warlock: 1, sorcerer: 1, paladin: 1 } },
        { t: 'Explorando, abrindo portas, achando armadilhas', w: { rogue: 2, ranger: 1, monk: 1 } },
        { t: 'Estudando mistérios e lendas', w: { wizard: 2, cleric: 1, druid: 1 } },
        { t: 'Na força bruta mesmo', w: { barbarian: 2, fighter: 1 } }
      ]
    },
    {
      q: 'De onde vem o seu poder?',
      a: [
        { t: 'Treino e disciplina', w: { fighter: 2, monk: 2, rogue: 1 } },
        { t: 'Fé ou um juramento sagrado', w: { cleric: 2, paladin: 2 } },
        { t: 'A natureza e os instintos', w: { druid: 2, ranger: 2, barbarian: 1 } },
        { t: 'Talento, pacto ou estudo arcano', w: { sorcerer: 2, warlock: 2, wizard: 2, bard: 1 } }
      ]
    },
    {
      q: 'Quantas regras você quer administrar na mesa?',
      a: [
        { t: 'Poucas: quero algo direto', w: { barbarian: 2, fighter: 2, rogue: 1 } },
        { t: 'Um meio-termo', w: { paladin: 1, ranger: 1, warlock: 1, cleric: 1, monk: 1, sorcerer: 1 } },
        { t: 'Muitas: adoro opções', w: { wizard: 2, druid: 2, bard: 1, cleric: 1 } }
      ]
    }
  ],

  story: {
    questions: [
      { id: 'motivation', q: 'Por que você virou aventureiro?', ideas: ['Proteger minha vila de uma ameaça', 'Encontrar um familiar desaparecido', 'Conquistar fortuna e fama', 'Pagar uma dívida antiga', 'Descobrir a verdade sobre meu passado', 'Cumprir uma promessa feita a alguém'] },
      { id: 'fear', q: 'Do que você tem medo?', ideas: ['Ficar sozinho', 'Fogo', 'Decepcionar quem confia em mim', 'Lugares fechados', 'Perder o controle', 'Ser esquecido'] },
      { id: 'trust', q: 'Em quem você confia de olhos fechados?', ideas: ['Minha irmã mais velha', 'Meu antigo mentor', 'Uma amiga de infância', 'Ninguém… ainda', 'Meu animal de estimação', 'O líder do meu templo'] },
      { id: 'goal', q: 'Qual é o seu grande objetivo?', ideas: ['Fundar minha própria guilda', 'Ter meu nome lembrado em canções', 'Vingar alguém', 'Restaurar a honra da família', 'Viver uma vida tranquila depois de tudo', 'Desvendar um segredo antigo'] },
      { id: 'secret', q: 'Que segredo você esconde?', ideas: ['Já trabalhei para o vilão', 'Não sou quem digo ser', 'Tenho uma dívida perigosa', 'Ouço uma voz em sonhos', 'Fugi de um compromisso importante', 'Roubei algo valioso'] }
    ],
    traits: ['Faço piada até nas piores horas.', 'Desconfio de estranhos.', 'Ajudo qualquer um que pedir.', 'Falo pouco, observo muito.', 'Fico animado com qualquer novidade.', 'Gosto de tudo organizado, até demais.'],
    ideals: ['Justiça: todos merecem um julgamento justo.', 'Liberdade: ninguém deve ser acorrentado.', 'Lealdade: minha palavra é tudo.', 'Conhecimento: entender o mundo é o maior tesouro.', 'Compaixão: ajudar quem sofre.', 'Ambição: vou chegar ao topo.'],
    flaws: ['Teimosia é meu sobrenome.', 'Não resisto a uma aposta.', 'Confio rápido demais.', 'Tenho pavio curto.', 'Escondo meus erros.', 'Minha curiosidade sempre me mete em encrenca.']
  },

  roles: {
    barbarian: ['frente'], fighter: ['frente', 'dano'], paladin: ['frente', 'cura'],
    cleric: ['cura', 'suporte'], druid: ['controle', 'cura'], bard: ['suporte', 'social'],
    rogue: ['dano', 'pericias'], ranger: ['dano', 'exploracao'], monk: ['dano', 'mobilidade'],
    sorcerer: ['dano', 'social'], warlock: ['dano', 'social'], wizard: ['controle', 'utilidade']
  },
  roleNames: {
    frente: 'Linha de frente', dano: 'Dano', cura: 'Cura', suporte: 'Suporte', controle: 'Controle',
    social: 'Social', pericias: 'Perícias', exploracao: 'Exploração', mobilidade: 'Mobilidade', utilidade: 'Utilidade'
  },

  glossary: {
    atributo: { t: 'Atributo', d: 'Seis números que descrevem seu personagem: Força, Destreza, Constituição, Inteligência, Sabedoria e Carisma. Normalmente vão de 8 a 15 no início (mais bônus da espécie).' },
    modificador: { t: 'Modificador', d: 'O número que você realmente soma nas rolagens. Calcule: (atributo − 10) ÷ 2, arredondando para baixo. Ex.: 14 → +2, 8 → −1.' },
    proficiencia: { t: 'Bônus de proficiência', d: 'Bônus que você soma no que sabe fazer bem (perícias, armas, resistências treinadas). No 1º nível é +2.' },
    ca: { t: 'Classe de Armadura (CA)', d: 'Quão difícil é acertar você. O inimigo rola d20 + bônus: se igualar ou passar sua CA, acerta.' },
    pv: { t: 'Pontos de Vida (PV)', d: 'Sua saúde. Ao chegar a 0, você cai inconsciente e começa a fazer testes contra a morte.' },
    dadodevida: { t: 'Dado de Vida', d: 'Dado ligado à sua classe (d6 a d12). Define seus PV e pode ser gasto em descansos curtos para se curar.' },
    resistencia: { t: 'Teste de resistência', d: 'Rolagem para evitar algo ruim (veneno, uma magia, cair). d20 + modificador do atributo (+ proficiência se for treinado nele).' },
    pericia: { t: 'Perícia', d: 'Algo em que você é bom, como Furtividade ou Persuasão. Em um teste: d20 + modificador do atributo + proficiência (se treinado).' },
    vantagem: { t: 'Vantagem e Desvantagem', d: 'Com vantagem, role 2d20 e use o maior. Com desvantagem, use o menor. Elas se anulam.' },
    iniciativa: { t: 'Iniciativa', d: 'Define a ordem dos turnos no combate: d20 + modificador de Destreza.' },
    percepcaopassiva: { t: 'Percepção passiva', d: '10 + seu bônus de Percepção. O mestre usa para saber se você nota algo sem precisar rolar.' },
    truque: { t: 'Truque', d: 'Magia simples que pode ser lançada à vontade, sem gastar espaços de magia.' },
    espaco: { t: 'Espaço de magia', d: 'As “cargas” para lançar magias de 1º nível ou mais. Voltam depois de um descanso longo (o Bruxo recupera no curto).' },
    concentracao: { t: 'Concentração', d: 'Algumas magias duram enquanto você se concentra. Só pode manter uma de cada vez; ao sofrer dano, faz resistência de Constituição para não perdê-la.' },
    acao: { t: 'Ação', d: 'Em cada turno você tem 1 ação (atacar, lançar magia, correr, esconder-se…), 1 movimento e às vezes 1 ação bônus.' },
    acaobonus: { t: 'Ação bônus', d: 'Uma ação extra e rápida que você só tem se alguma habilidade ou magia disser que usa ação bônus.' },
    reacao: { t: 'Reação', d: 'Resposta instantânea fora do seu turno, como um ataque de oportunidade. Uma por rodada.' },
    deslocamento: { t: 'Deslocamento', d: 'Quantos metros você anda por turno (normalmente 9 m, ou 7,5 m para espécies pequenas e anões).' },
    cdmagia: { t: 'CD de magia', d: 'O número que o alvo precisa alcançar na resistência contra sua magia: 8 + proficiência + modificador de conjuração.' },
    ataquemagico: { t: 'Ataque mágico', d: 'Rolagem para acertar com uma magia: d20 + proficiência + modificador de conjuração.' },
    acuidade: { t: 'Acuidade', d: 'Armas com acuidade podem usar Força ou Destreza (o maior) para atacar e causar dano.' },
    descanso: { t: 'Descanso curto e longo', d: 'Curto: 1 hora, pode gastar Dados de Vida para curar. Longo: 8 horas, recupera todos os PV e a maioria dos recursos.' },
    visaonoescuro: { t: 'Visão no escuro', d: 'Enxerga no escuro a até 18 m como se fosse penumbra, sem distinguir cores.' },
    especializacao: { t: 'Especialização', d: 'Seu bônus de proficiência é dobrado naquela perícia.' },
    dados: { t: 'Notação de dados', d: '“2d6” significa rolar dois dados de 6 lados e somar. “1d20 + 5” é rolar um d20 e somar 5.' },
    antecedente: { t: 'Antecedente', d: 'O que seu personagem fazia antes de virar aventureiro. Dá perícias, idiomas e itens.' },
    especie: { t: 'Espécie (raça)', d: 'Sua origem: humano, elfo, anão… Dá bônus em atributos e características especiais.' }
  },

  goblin: { name: 'Goblin', ac: 15, hp: 7, atk: 4, dmg: '1d6+2', dmgName: 'cimitarra' }
};
