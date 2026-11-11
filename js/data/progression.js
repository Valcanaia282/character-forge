/*
 * Character Forge — evolução automática por nível (1–12), no modelo do Baldur's Gate 3:
 * a cada nível o jogador faz as escolhas da classe/caminho (talentos, estilos, manobras, metamagias,
 * invocações, disciplinas…) e a ficha aplica os efeitos sozinha.
 *
 * Regras: Livro do Jogador e Guia de Xanathar (edições em português usadas pelo grupo). Os textos abaixo são
 * RESUMOS ORIGINAIS e curtos das mecânicas — para o texto completo, veja a página indicada no livro.
 * Caminhos incluídos aqui: os que existem no BG3 e também nesses livros (os do SRD ficam em features.js).
 *
 * Cada "desc" recebe ctx = { L, m, PB, s, dc(ab), pk(chave) } e devolve o texto já calculado.
 */
window.CF = window.CF || {};
(function () {
  const sg = n => (n >= 0 ? '+' : '−') + Math.abs(n);
  const min1 = n => Math.max(1, n);
  const half = n => Math.floor(n / 2);
  const ALL_AB = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  /* ------------------------------------------------------------------ TALENTOS (Livro do Jogador, cap. 6) */
  // ab: atributo que o jogador escolhe (+1); abFixed: +1 fixo; opts: escolhas extras; bg3: também existe no BG3.
  const FEATS = [
    { id: 'elementaladept', name: 'Adepto Elemental', page: 167, bg3: true, req: 'conjurar ao menos uma magia', opts: [{ k: 'el', type: 'pool', pool: 'element', n: 1, label: 'Tipo de dano' }],
      desc: 'Suas magias ignoram resistência ao tipo escolhido, e cada 1 nos dados de dano desse tipo conta como 2.' },
    { id: 'martialadept', name: 'Adepto Marcial', page: 167, bg3: true, opts: [{ k: 'man', type: 'pool', pool: 'maneuver', n: 2, label: 'Manobras' }],
      desc: 'Aprende 2 manobras do Mestre de Batalha e ganha 1 dado de superioridade (d6) por descanso curto.' },
    { id: 'alert', name: 'Alerta', page: 167, bg3: true, desc: '+5 na iniciativa (já somado), não pode ser surpreendido enquanto consciente e criaturas escondidas não ganham vantagem para te atacar.' },
    { id: 'dualwielder', name: 'Ambidestro', page: 167, bg3: true, desc: '+1 de CA quando empunha uma arma corpo a corpo em cada mão; pode lutar com duas armas mesmo que não sejam leves e sacar duas de uma vez.' },
    { id: 'savageattacker', name: 'Atacante Bestial', page: 167, bg3: true, desc: 'Uma vez por turno, rola de novo o dano de um ataque corpo a corpo com arma e fica com o melhor resultado.' },
    { id: 'sharpshooter', name: 'Atirador Aguçado', page: 167, bg3: true, desc: 'Sem desvantagem a longa distância, ignora meia cobertura e três-quartos; com arma à distância pode aceitar −5 no ataque para +10 no dano.' },
    { id: 'spellsniper', name: 'Atirador de Magia', page: 167, bg3: true, req: 'conjurar ao menos uma magia', desc: 'Dobra o alcance das magias de ataque, ignora meia cobertura e três-quartos e aprende um truque de ataque (anote no quadro de magias).' },
    { id: 'athlete', name: 'Atleta', page: 168, bg3: true, ab: ['str', 'dex'], desc: '+1 em Força ou Destreza. Levantar-se custa só 1,5 m, escalar não gasta movimento extra e o salto com corrida precisa de apenas 1,5 m.' },
    { id: 'actor', name: 'Ator', page: 168, bg3: true, abFixed: { cha: 1 }, desc: '+1 em Carisma. Vantagem em Enganação e Atuação para se passar por outra pessoa; imita vozes e sons.' },
    { id: 'mounted', name: 'Combatente Montado', page: 168, desc: 'Montado: vantagem contra criaturas menores que a montaria, pode atrair para si ataques feitos contra ela, e a montaria ganha evasão.' },
    { id: 'warcaster', name: 'Conjurador de Guerra', page: 169, bg3: true, req: 'conjurar ao menos uma magia', desc: 'Vantagem nas resistências de Constituição para manter concentração, conjura com as mãos ocupadas e pode usar uma magia como ataque de oportunidade.' },
    { id: 'ritualcaster', name: 'Conjurador de Ritual', page: 169, bg3: true, req: 'Inteligência ou Sabedoria 13', opts: [{ k: 'cls', type: 'pool', pool: 'casterClass', n: 1, label: 'Classe dos rituais' }],
      desc: 'Ganha um livro com 2 rituais de 1º círculo da classe escolhida e pode copiar outros rituais que encontrar.' },
    { id: 'healer', name: 'Curandeiro', page: 169, desc: 'Com kit de curandeiro: estabiliza e deixa a criatura com 1 PV; como ação, cura 1d6 + 4 + o nº de Dados de Vida dela (1× por descanso por criatura).' },
    { id: 'defensiveduelist', name: 'Duelista Defensivo', page: 169, bg3: true, req: 'Destreza 13', desc: 'Reação, empunhando arma de acuidade: soma a proficiência na CA contra um ataque corpo a corpo que iria te acertar.' },
    { id: 'crossbowexpert', name: 'Especialista em Besta', page: 169, bg3: true, desc: 'Ignora a propriedade recarga, não tem desvantagem por inimigo adjacente e pode atacar com besta de mão como ação bônus.' },
    { id: 'tavernbrawler', name: 'Especialista em Briga', page: 169, bg3: true, ab: ['str', 'con'], desc: '+1 em Força ou Constituição. Proficiência com armas improvisadas, golpe desarmado de 1d4 e, ao acertar desarmado ou improvisado, pode agarrar como ação bônus.' },
    { id: 'dungeondelver', name: 'Explorador de Cavernas', page: 169, bg3: true, desc: 'Vantagem para achar portas secretas e nas resistências contra armadilhas, resistência ao dano delas e procura armadilhas sem andar devagar.' },
    { id: 'grappler', name: 'Imobilizador', page: 169, req: 'Força 13', desc: 'Vantagem nos ataques contra quem você agarra e pode tentar imobilizar a criatura agarrada.' },
    { id: 'magicinitiate', name: 'Iniciado em Magia', page: 170, bg3: true, opts: [{ k: 'cls', type: 'pool', pool: 'casterClass', n: 1, label: 'Lista de magias' }],
      desc: 'Aprende 2 truques e 1 magia de 1º círculo da lista escolhida (a magia: 1× por descanso longo sem gastar espaço). Adicione-as no quadro de magias.' },
    { id: 'charger', name: 'Investida Poderosa', page: 170, bg3: true, desc: 'Depois de usar Disparada, como ação bônus: um ataque corpo a corpo com +5 de dano ou um empurrão de 3 m (se andou 3 m em linha reta).' },
    { id: 'inspiringleader', name: 'Líder Inspirador', page: 170, req: 'Carisma 13', desc: 'Com 10 minutos de discurso, até 6 aliados ganham PV temporários iguais ao seu nível + Carisma (1× por descanso).' },
    { id: 'polearmmaster', name: 'Maestria em Arma de Haste', page: 170, bg3: true, desc: 'Com glaive, alabarda ou bordão: ataque extra com o cabo (1d4) como ação bônus, e ataque de oportunidade quando alguém entra no seu alcance.' },
    { id: 'mediumarmormaster', name: 'Maestria em Armadura Média', page: 170, bg3: true, req: 'proficiência em armadura média', desc: 'Armadura média não atrapalha a Furtividade e soma até +3 de Destreza na CA (já calculado).' },
    { id: 'heavyarmormaster', name: 'Maestria em Armadura Pesada', page: 170, bg3: true, req: 'proficiência em armadura pesada', abFixed: { str: 1 }, desc: '+1 em Força. De armadura pesada, reduz em 3 o dano de concussão, perfurante e cortante de ataques não mágicos.' },
    { id: 'mageslayer', name: 'Matador de Conjuradores', page: 170, bg3: true, desc: 'Reação para atacar quem conjura a 1,5 m de você, vantagem nas resistências contra magias de quem está adjacente e quem você fere tem desvantagem para manter concentração.' },
    { id: 'keenmind', name: 'Mente Afiada', page: 170, abFixed: { int: 1 }, desc: '+1 em Inteligência. Sempre sabe onde fica o norte e que horas são, e lembra de tudo que viu ou ouviu no último mês.' },
    { id: 'weaponmaster', name: 'Mestre de Armas', page: 170, bg3: true, ab: ['str', 'dex'], opts: [{ k: 'wpn', type: 'pool', pool: 'weapon', n: 4, label: 'Armas' }], desc: '+1 em Força ou Destreza e proficiência com 4 armas à sua escolha.' },
    { id: 'gwm', name: 'Mestre de Armas Grandes', page: 171, bg3: true, desc: 'Ao acertar um crítico ou derrubar alguém a 0 PV, ganha um ataque extra como ação bônus; com arma pesada, pode aceitar −5 no ataque para +10 no dano.' },
    { id: 'shieldmaster', name: 'Mestre de Escudo', page: 171, bg3: true, desc: 'Empurra com o escudo como ação bônus ao Atacar, soma a CA do escudo em resistências de Destreza contra efeitos em você e pode anular o dano se passar nelas.' },
    { id: 'mobile', name: 'Mobilidade', page: 171, bg3: true, desc: '+3 m de deslocamento (já somado), Disparada ignora terreno difícil e quem você ataca corpo a corpo não pode fazer ataque de oportunidade contra você.' },
    { id: 'observant', name: 'Observador', page: 171, ab: ['int', 'wis'], desc: '+1 em Inteligência ou Sabedoria, lê lábios e +5 em Percepção e Investigação passivas (já somado na percepção passiva).' },
    { id: 'skilled', name: 'Perito', page: 172, bg3: true, opts: [{ k: 'sk', type: 'skill', n: 3, label: 'Perícias' }], desc: 'Proficiência em 3 perícias à sua escolha (ou ferramentas — anote nas proficiências).' },
    { id: 'linguist', name: 'Poliglota', page: 172, abFixed: { int: 1 }, opts: [{ k: 'lang', type: 'lang', n: 3, label: 'Idiomas' }], desc: '+1 em Inteligência, aprende 3 idiomas e consegue criar cifras secretas.' },
    { id: 'lightlyarmored', name: 'Proteção Leve', page: 172, bg3: true, ab: ['str', 'dex'], desc: '+1 em Força ou Destreza e proficiência em armaduras leves.' },
    { id: 'moderatelyarmored', name: 'Proteção Moderada', page: 172, bg3: true, req: 'proficiência em armadura leve', ab: ['str', 'dex'], desc: '+1 em Força ou Destreza e proficiência em armaduras médias e escudos.' },
    { id: 'heavilyarmored', name: 'Proteção Pesada', page: 172, bg3: true, req: 'proficiência em armadura média', abFixed: { str: 1 }, desc: '+1 em Força e proficiência em armaduras pesadas.' },
    { id: 'resilient', name: 'Resiliente', page: 172, bg3: true, ab: ALL_AB, desc: '+1 no atributo escolhido e proficiência nas resistências dele (já marcado).' },
    { id: 'durable', name: 'Resistente', page: 172, bg3: true, abFixed: { con: 1 }, desc: '+1 em Constituição. Ao gastar Dados de Vida, recupera no mínimo o dobro do seu modificador de Constituição.' },
    { id: 'tough', name: 'Robusto', page: 172, bg3: true, desc: '+2 PV máximos por nível (já somado).' },
    { id: 'sentinel', name: 'Sentinela', page: 172, bg3: true, desc: 'Seu ataque de oportunidade zera o deslocamento do alvo, Desengajar não evita seus ataques e você pode reagir quando atacam um aliado perto de você.' },
    { id: 'skulker', name: 'Sorrateiro', page: 172, req: 'Destreza 13', desc: 'Pode se esconder na penumbra, errar um ataque à distância escondido não revela sua posição e penumbra não atrapalha sua Percepção.' },
    { id: 'lucky', name: 'Sortudo', page: 172, bg3: true, desc: '3 pontos de sorte por descanso longo: gaste um para rolar um d20 extra num ataque, teste ou resistência (seu ou contra você).' }
  ];

  /* ------------------------------------------------------------------ OPÇÕES ESCOLHÍVEIS */
  const POOLS = {
    element: ['ácido', 'elétrico', 'fogo', 'frio', 'trovejante'].map(x => ({ id: x, name: x[0].toUpperCase() + x.slice(1) })),
    casterClass: [['bard', 'Bardo'], ['warlock', 'Bruxo'], ['cleric', 'Clérigo'], ['druid', 'Druida'], ['sorcerer', 'Feiticeiro'], ['wizard', 'Mago']].map(([id, name]) => ({ id, name })),

    /* Mestre de Batalha (LdJ p. 88) — CD = 8 + proficiência + FOR ou DES */
    maneuver: [
      { id: 'parry', name: 'Aparar', desc: ({ m }) => `Reação ao sofrer dano corpo a corpo: reduz o dano em 1 dado de superioridade ${sg(m.dex)}.` },
      { id: 'menacing', name: 'Ataque Ameaçador', desc: () => 'Ao acertar: soma o dado ao dano e o alvo faz resistência de Sabedoria ou fica amedrontado até o fim do seu próximo turno.' },
      { id: 'pushing', name: 'Ataque de Encontrão', desc: () => 'Ao acertar: soma o dado ao dano; alvo Grande ou menor faz resistência de Força ou é empurrado até 4,5 m.' },
      { id: 'feinting', name: 'Ataque de Finta', desc: () => 'Ação bônus contra alguém a 1,5 m: vantagem no próximo ataque contra ele neste turno e, se acertar, soma o dado ao dano.' },
      { id: 'maneuvering', name: 'Ataque de Manobra', desc: () => 'Ao acertar: soma o dado ao dano e um aliado pode usar a reação para andar metade do deslocamento sem provocar ataques do alvo.' },
      { id: 'precision', name: 'Ataque de Precisão', desc: () => 'Soma o dado de superioridade à jogada de ataque (pode decidir depois de rolar, antes de saber o resultado).' },
      { id: 'disarming', name: 'Ataque Desarmante', desc: () => 'Ao acertar: soma o dado ao dano e o alvo faz resistência de Força ou larga um objeto que esteja segurando.' },
      { id: 'lunging', name: 'Ataque Estendido', desc: () => 'Aumenta em 1,5 m o alcance de um ataque corpo a corpo e, se acertar, soma o dado ao dano.' },
      { id: 'goading', name: 'Ataque Provocante', desc: () => 'Ao acertar: soma o dado ao dano e o alvo faz resistência de Sabedoria ou tem desvantagem para atacar outros que não você.' },
      { id: 'sweeping', name: 'Ataque Trespassante', desc: () => 'Ao acertar corpo a corpo: se o mesmo ataque acertaria outra criatura adjacente, ela sofre o valor do dado.' },
      { id: 'riposte', name: 'Contra-Atacar', desc: () => 'Reação quando um inimigo erra um ataque corpo a corpo contra você: ataca de volta e soma o dado ao dano.' },
      { id: 'trip', name: 'Derrubar', desc: () => 'Ao acertar: soma o dado ao dano; alvo Grande ou menor faz resistência de Força ou cai no chão.' },
      { id: 'distracting', name: 'Golpe Distrativo', desc: () => 'Ao acertar: soma o dado ao dano e o próximo ataque de um aliado contra o alvo tem vantagem.' },
      { id: 'commander', name: 'Golpe do Comandante', desc: () => 'Troca um dos seus ataques para que um aliado ataque com a reação dele, somando o dado ao dano.' },
      { id: 'rally', name: 'Inspirar', desc: ({ m }) => `Ação bônus: um aliado ganha PV temporários = dado de superioridade ${sg(m.cha)}.` },
      { id: 'evasive', name: 'Passo Evasivo', desc: () => 'Ao se mover, soma o dado de superioridade à CA até parar.' }
    ],

    /* Metamágica (LdJ p. 79–80) */
    metamagic: [
      { id: 'quickened', name: 'Magia Acelerada', desc: () => '2 pontos: uma magia de 1 ação vira ação bônus.' },
      { id: 'heightened', name: 'Magia Aumentada', desc: () => '3 pontos: um alvo tem desvantagem na primeira resistência contra a magia.' },
      { id: 'careful', name: 'Magia Cuidadosa', desc: ({ m }) => `1 ponto: até ${min1(m.cha)} criatura(s) passam automaticamente na resistência da magia.` },
      { id: 'distant', name: 'Magia Distante', desc: () => '1 ponto: dobra o alcance (magia de toque passa a alcançar 9 m).' },
      { id: 'twinned', name: 'Magia Duplicada', desc: () => 'Pontos = círculo (1 para truque): magia de um alvo só atinge um segundo alvo.' },
      { id: 'extended', name: 'Magia Estendida', desc: () => '1 ponto: dobra a duração (máximo 24 horas).' },
      { id: 'empowered', name: 'Magia Potencializada', desc: ({ m }) => `1 ponto: rola de novo até ${min1(m.cha)} dado(s) de dano e fica com os novos.` },
      { id: 'subtle', name: 'Magia Sutil', desc: () => '1 ponto: conjura sem componentes verbais nem gestos (ninguém percebe).' }
    ],

    /* Invocações Místicas (LdJ p. 61–62) — só as que cabem até o nível 12 */
    invocation: [
      { id: 'armorshadows', name: 'Armadura de Sombras', desc: () => 'Conjura Armadura Arcana em si mesmo à vontade (CA 13 + DES sem armadura; já entra nas opções de CA).' },
      { id: 'mire', name: 'Encharcar a Mente', min: 5, desc: () => 'Conjura Lentidão uma vez com um espaço de bruxo (por descanso longo).' },
      { id: 'sculptor', name: 'Escultor de Carne', min: 7, desc: () => 'Conjura Metamorfose uma vez com um espaço de bruxo (por descanso longo).' },
      { id: 'agonizing', name: 'Explosão Agonizante', eb: true, desc: ({ m }) => `Cada raio da Rajada Mística causa ${sg(m.cha)} de dano extra.` },
      { id: 'repelling', name: 'Explosão Repulsiva', eb: true, desc: () => 'Cada raio da Rajada Mística que acerta empurra o alvo 3 m.' },
      { id: 'beastspeech', name: 'Idioma Bestial', desc: () => 'Conjura Falar com Animais à vontade.' },
      { id: 'beguiling', name: 'Influência Enganadora', desc: () => 'Proficiência em Enganação e Persuasão (já marcadas).' },
      { id: 'minions', name: 'Lacaios do Caos', min: 9, desc: () => 'Conjura Conjurar Elemental uma vez com um espaço de bruxo (por descanso longo).' },
      { id: 'thirsting', name: 'Lâmina Sedenta', min: 5, pact: 'blade', desc: () => 'Ataca duas vezes com a arma do pacto na ação Atacar.' },
      { id: 'spear', name: 'Lança Mística', eb: true, desc: () => 'A Rajada Mística alcança 90 m.' },
      { id: 'fivefates', name: 'Larápio dos Cinco Destinos', desc: () => 'Conjura Perdição uma vez com um espaço de bruxo (por descanso longo).' },
      { id: 'ancientsecrets', name: 'Livro de Segredos Antigos', pact: 'tome', desc: () => 'Anota 2 rituais de 1º círculo no Livro das Sombras e pode copiar outros rituais que encontrar.' },
      { id: 'maskfaces', name: 'Máscara das Muitas Faces', desc: () => 'Conjura Disfarçar-se à vontade.' },
      { id: 'twominds', name: 'Olhar de Duas Mentes', desc: () => 'Toca um humanoide voluntário e passa a ver e ouvir pelos sentidos dele.' },
      { id: 'runekeeper', name: 'Olhos do Guardião das Runas', desc: () => 'Lê qualquer escrita.' },
      { id: 'dreadful', name: 'Palavra Terrível', min: 7, desc: () => 'Conjura Confusão uma vez com um espaço de bruxo (por descanso longo).' },
      { id: 'ascendant', name: 'Passo Ascendente', min: 9, desc: () => 'Conjura Levitação em si mesmo à vontade.' },
      { id: 'otherworldly', name: 'Salto Transcendental', min: 9, desc: () => 'Conjura Salto em si mesmo à vontade.' },
      { id: 'illomen', name: 'Sinal de Mau Agouro', min: 5, desc: () => 'Conjura Rogar Maldição uma vez com um espaço de bruxo (por descanso longo).' },
      { id: 'lifedrinker', name: 'Sorvedor de Vida', min: 12, pact: 'blade', desc: ({ m }) => `Acertos com a arma do pacto causam ${sg(min1(m.cha))} de dano necrótico extra.` },
      { id: 'grave', name: 'Sussurros da Sepultura', min: 9, desc: () => 'Conjura Falar com os Mortos à vontade.' },
      { id: 'beguilingwhispers', name: 'Sussurros Sedutores', desc: () => 'Conjura Compulsão uma vez com um espaço de bruxo (por descanso longo).' },
      { id: 'oneshadows', name: 'Uno com as Sombras', min: 5, desc: () => 'Parado na penumbra ou na escuridão, fica invisível até se mover ou agir.' },
      { id: 'fiendishvigor', name: 'Vigor Abissal', desc: () => 'Conjura Vitalidade Falsa em si mesmo à vontade (PV temporários).' },
      { id: 'devilsight', name: 'Visão Diabólica', desc: () => 'Enxerga normalmente na escuridão, inclusive mágica, até 36 m.' },
      { id: 'eldritchsight', name: 'Visão Mística', desc: () => 'Conjura Detectar Magia à vontade.' },
      { id: 'mistyvisions', name: 'Visões nas Brumas', desc: () => 'Conjura Imagem Silenciosa à vontade.' },
      { id: 'chainmaster', name: 'Voz do Mestre das Correntes', pact: 'chain', desc: () => 'Fala pelo familiar e usa os sentidos dele a qualquer distância no mesmo plano.' }
    ],
    pact: [
      { id: 'chain', name: 'Pacto da Corrente', desc: () => 'Convocar Familiar como ritual, com formas especiais (diabrete, pseudodragão, quasit ou sprite); o familiar pode atacar no lugar de um dos seus ataques.' },
      { id: 'blade', name: 'Pacto da Lâmina', desc: () => 'Cria uma arma de pacto na mão (você é proficiente com ela) e pode vincular uma arma mágica.' },
      { id: 'tome', name: 'Pacto do Tomo', desc: () => 'Livro das Sombras com 3 truques de qualquer classe (adicione no quadro de magias).' }
    ],

    /* Guerreiro Totêmico (LdJ p. 50) */
    totemSpirit: [
      { id: 'bear', name: 'Urso', desc: () => 'Em Fúria, resistência a todo dano, exceto psíquico.' },
      { id: 'eagle', name: 'Águia', desc: () => 'Em Fúria e sem armadura pesada, inimigos têm desvantagem nos ataques de oportunidade contra você e Disparada vira ação bônus.' },
      { id: 'wolf', name: 'Lobo', desc: () => 'Em Fúria, aliados têm vantagem nos ataques corpo a corpo contra inimigos a 1,5 m de você.' }
    ],
    totemAspect: [
      { id: 'bear', name: 'Urso', desc: () => 'Capacidade de carga dobrada e vantagem em testes de Força para empurrar, erguer ou quebrar.' },
      { id: 'eagle', name: 'Águia', desc: () => 'Enxerga com nitidez a até 1,6 km e a penumbra não atrapalha sua Percepção.' },
      { id: 'wolf', name: 'Lobo', desc: () => 'Rastreia em ritmo rápido e anda furtivamente em ritmo normal.' }
    ],

    /* Conclave do Caçador (LdJ p. 120–121) */
    huntPrey: [
      { id: 'colossus', name: 'Assassino de Colossos', desc: () => 'Uma vez por turno, +1d8 de dano em alvo que já esteja ferido.' },
      { id: 'giant', name: 'Matador de Gigantes', desc: () => 'Reação: quando uma criatura Grande ou maior a 1,5 m te ataca, você ataca de volta.' },
      { id: 'horde', name: 'Destruidor de Hordas', desc: () => 'Uma vez por turno, ataca outra criatura a 1,5 m do alvo original.' }
    ],
    huntDef: [
      { id: 'escape', name: 'Escapar da Horda', desc: () => 'Ataques de oportunidade contra você têm desvantagem.' },
      { id: 'multi', name: 'Defesa Contra Múltiplos Ataques', desc: () => 'Quando uma criatura te acerta, você ganha +4 de CA contra os próximos ataques dela no mesmo turno.' },
      { id: 'steel', name: 'Vontade de Aço', desc: () => 'Vantagem nas resistências contra ficar amedrontado.' }
    ],
    huntMulti: [
      { id: 'volley', name: 'Saraivada', desc: () => 'Ação: ataque à distância contra cada criatura num raio de 3 m de um ponto que você vê.' },
      { id: 'whirlwind', name: 'Ataque Giratório', desc: () => 'Ação: ataque corpo a corpo contra cada criatura a 1,5 m de você.' }
    ],

    /* Companheiro do Conclave da Besta — feras de ND 1/4 (estatísticas do SRD) */
    companion: [
      { id: 'wolf', name: 'Lobo', st: { ac: 13, hp: 11, spd: '12 m', atk: 4, dmg: '2d4 + 2 perfurante', note: 'derruba o alvo (Força CD 11)' } },
      { id: 'panther', name: 'Pantera', st: { ac: 12, hp: 13, spd: '15 m, escalar 12 m', atk: 4, dmg: '1d6 + 2 perfurante (mordida) / 1d4 + 2 cortante (garra)', note: 'bote: derruba se correr 6 m antes' } },
      { id: 'boar', name: 'Javali', st: { ac: 11, hp: 11, spd: '12 m', atk: 3, dmg: '1d6 + 1 cortante', note: 'investida +1d6; resiste a cair a 0 PV 1×/descanso' } },
      { id: 'mastiff', name: 'Mastim', st: { ac: 12, hp: 5, spd: '12 m', atk: 3, dmg: '1d6 + 1 perfurante', note: 'derruba o alvo (Força CD 11)' } },
      { id: 'bloodhawk', name: 'Falcão Sangrento', st: { ac: 12, hp: 7, spd: '3 m, voo 18 m', atk: 4, dmg: '1d4 + 2 perfurante', note: 'vantagem se um aliado estiver ao lado do alvo' } }
    ],

    /* Quatro Elementos (LdJ p. 107) — custo em chi */
    discipline: [
      { id: 'waterwhip', name: 'Chicote de Água', desc: ({ dc }) => `2 chi, ação: alvo a 9 m faz resistência de Destreza CD ${dc('wis')}; falha = 3d10 concussão (+1d10 por chi extra) e é derrubado ou puxado 7,5 m.` },
      { id: 'cinder', name: 'Golpe de Varredura Cauterizante', desc: () => '2 chi: conjura Mãos Flamejantes.' },
      { id: 'gale', name: 'Investida dos Espíritos da Ventania', desc: () => '2 chi: conjura Lufada de Vento.' },
      { id: 'river', name: 'Moldar o Rio Corrente', desc: () => '1 chi, ação: molda água e gelo num cubo de 9 m a até 36 m.' },
      { id: 'firesnake', name: 'Presas da Serpente de Fogo', desc: () => '1 chi: golpes desarmados alcançam 3 m neste turno e causam dano de fogo (+1d10 por chi extra num acerto).' },
      { id: 'unbrokenair', name: 'Punho do Ar Contínuo', desc: ({ dc }) => `2 chi, ação: alvo a 9 m faz resistência de Força CD ${dc('wis')}; falha = 3d10 concussão (+1d10 por chi extra), empurrado 6 m e derrubado.` },
      { id: 'fourthunders', name: 'Punho dos Quatro Trovões', desc: () => '2 chi: conjura Onda Trovejante.' },
      { id: 'northwind', name: 'Serragem do Vento do Norte', min: 6, desc: () => '3 chi: conjura Imobilizar Pessoa.' },
      { id: 'summit', name: 'Gongo do Pico', min: 6, desc: () => '3 chi: conjura Despedaçar.' },
      { id: 'phoenix', name: 'Chamas da Fênix', min: 11, desc: () => '4 chi: conjura Bola de Fogo.' },
      { id: 'mist', name: 'Postura da Neblina', min: 11, desc: () => '4 chi: conjura Forma Gasosa em si mesmo.' },
      { id: 'ridewind', name: 'Cavalgar o Vento', min: 11, desc: () => '4 chi: conjura Voo em si mesmo.' }
    ],

    /* Arqueiro Arcano (Xanathar p. 38–39) — CD = 8 + proficiência + INT */
    arcaneShot: [
      { id: 'banishing', name: 'Flecha do Banimento', desc: ({ dc }) => `Resistência de Carisma CD ${dc('int')} ou o alvo é banido para a Agrestia das Fadas até o fim do seu próximo turno.` },
      { id: 'beguiling', name: 'Flecha da Sedução', desc: ({ dc }) => `+2d6 psíquico; resistência de Sabedoria CD ${dc('int')} ou fica enfeitiçado por um aliado seu.` },
      { id: 'bursting', name: 'Flecha da Explosão', desc: () => 'Explode: +2d6 de força no alvo e em criaturas a 3 m dele.' },
      { id: 'enfeebling', name: 'Flecha do Enfraquecimento', desc: ({ dc }) => `+2d6 necrótico; resistência de Constituição CD ${dc('int')} ou o dano das armas do alvo cai pela metade.` },
      { id: 'grasping', name: 'Flecha do Agarrar', desc: ({ dc }) => `+2d6 veneno; espinhos prendem o alvo (−3 m de deslocamento e 2d6 cortante ao se mover) até um teste de Atletismo CD ${dc('int')}.` },
      { id: 'piercing', name: 'Flecha Perfurante', desc: ({ dc }) => `Atravessa uma linha de 9 m: resistência de Destreza CD ${dc('int')} para cada criatura (dano da flecha + 1d6).` },
      { id: 'seeking', name: 'Flecha Perseguidora', desc: ({ dc }) => `Persegue um alvo que você viu no último minuto, contornando obstáculos: resistência de Destreza CD ${dc('int')} (dano + 1d6 de força).` },
      { id: 'shadow', name: 'Flecha Sombria', desc: ({ dc }) => `+2d6 psíquico; resistência de Sabedoria CD ${dc('int')} ou o alvo só enxerga até 1,5 m.` }
    ],
    aaCantrip: [{ id: 'Prestidigitação', name: 'Prestidigitação' }, { id: 'Druidismo', name: 'Druidismo' }],

    /* Círculo da Terra (LdJ p. 75) — magias sempre preparadas por nível de druida */
    landTerrain: [
      { id: 'arctic', name: 'Ártico', spells: { 3: ['Imobilizar Pessoa', 'Crescer Espinhos'], 5: ['Nevasca', 'Lentidão'], 7: ['Movimentação Livre', 'Tempestade de Gelo'], 9: ['Comunhão com a Natureza', 'Cone de Frio'] } },
      { id: 'coast', name: 'Costa', spells: { 3: ['Passo Nebuloso', 'Reflexos'], 5: ['Andar na Água', 'Respirar na Água'], 7: ['Movimentação Livre', 'Controlar a Água'], 9: ['Vidência', 'Conjurar Elemental'] } },
      { id: 'desert', name: 'Deserto', spells: { 3: ['Nublar', 'Silêncio'], 5: ['Criar Alimentos', 'Proteção contra Energia'], 7: ['Malogro', 'Terreno Alucinógeno'], 9: ['Muralha de Pedra', 'Praga de Insetos'] } },
      { id: 'forest', name: 'Floresta', spells: { 3: ['Patas de Aranha', 'Pele de Árvore'], 5: ['Convocar Relâmpagos', 'Ampliar Plantas'], 7: ['Adivinhação', 'Movimentação Livre'], 9: ['Comunhão com a Natureza', 'Caminhar em Árvores'] } },
      { id: 'mountain', name: 'Montanha', spells: { 3: ['Crescer Espinhos', 'Patas de Aranha'], 5: ['Mesclar-se às Rochas', 'Relâmpago'], 7: ['Moldar Rochas', 'Pele de Pedra'], 9: ['Criar Passagem', 'Muralha de Pedra'] } },
      { id: 'swamp', name: 'Pântano', spells: { 3: ['Escuridão', 'Flecha Ácida de Melf'], 5: ['Andar na Água', 'Névoa Fétida'], 7: ['Localizar Criatura', 'Movimentação Livre'], 9: ['Vidência', 'Praga de Insetos'] } },
      { id: 'grassland', name: 'Planície', spells: { 3: ['Invisibilidade', 'Passos sem Pegadas'], 5: ['Luz do Dia', 'Velocidade'], 7: ['Adivinhação', 'Movimentação Livre'], 9: ['Praga de Insetos', 'Sonho'] } },
      { id: 'underdark', name: 'Subterrâneo', spells: { 3: ['Patas de Aranha', 'Teia'], 5: ['Forma Gasosa', 'Névoa Fétida'], 7: ['Invisibilidade Maior', 'Moldar Rochas'], 9: ['Praga de Insetos', 'Névoa Mortal'] } }
    ],

    /* Pedra de Transmutador (LdJ p. 101) */
    stone: [
      { id: 'darkvision', name: 'Visão no escuro', desc: () => 'Quem carrega a pedra enxerga no escuro até 18 m.' },
      { id: 'speed', name: 'Velocidade', desc: () => 'Quem carrega a pedra ganha +3 m de deslocamento.' },
      { id: 'consave', name: 'Resistência de Constituição', desc: () => 'Quem carrega a pedra é proficiente nas resistências de Constituição.' },
      { id: 'resist', name: 'Resistência elemental', desc: () => 'Resistência a ácido, frio, fogo, elétrico ou trovejante (escolha ao criar a pedra).' }
    ]
  };

  /* ------------------------------------------------------------------ ESCOLHAS DA CLASSE */
  // type: pool (opções acima ou estilos/inimigos/terrenos), skill (prof/exp), lang, tool, cantrip, asi (atributo ou talento)
  const CLASS_PICKS = {
    bard: [
      { lvl: 3, key: 'exp3', type: 'skill', mode: 'exp', n: 2, label: 'Aptidão: 2 especializações' },
      { lvl: 10, key: 'exp10', type: 'skill', mode: 'exp', n: 2, label: 'Aptidão: mais 2 especializações' }
    ],
    paladin: [{ lvl: 2, key: 'fs2', type: 'pool', pool: 'style', allow: ['defense', 'dueling', 'gwf', 'protection'], n: 1, label: 'Estilo de Luta' }],
    ranger: [
      { lvl: 2, key: 'fs2', type: 'pool', pool: 'style', allow: ['archery', 'defense', 'dueling', 'twf'], n: 1, label: 'Estilo de Luta' },
      { lvl: 6, key: 'fe6', type: 'pool', pool: 'enemy', n: 1, label: 'Mais um inimigo favorito' },
      { lvl: 6, key: 'te6', type: 'pool', pool: 'terrain', n: 1, label: 'Mais um terreno favorito' },
      { lvl: 10, key: 'te10', type: 'pool', pool: 'terrain', n: 1, label: 'Mais um terreno favorito' }
    ],
    rogue: [{ lvl: 6, key: 'exp6', type: 'skill', mode: 'exp', n: 2, label: 'Especialização: mais 2' }],
    sorcerer: [
      { lvl: 3, key: 'meta3', type: 'pool', pool: 'metamagic', n: 2, label: 'Metamágica' },
      { lvl: 10, key: 'meta10', type: 'pool', pool: 'metamagic', n: 1, label: 'Mais uma Metamágica' }
    ],
    warlock: [
      { lvl: 2, key: 'inv2', type: 'pool', pool: 'invocation', n: 2, label: 'Invocações Místicas' },
      { lvl: 3, key: 'pact3', type: 'pool', pool: 'pact', n: 1, label: 'Dádiva do Pacto' },
      { lvl: 5, key: 'inv5', type: 'pool', pool: 'invocation', n: 1, label: 'Nova invocação' },
      { lvl: 7, key: 'inv7', type: 'pool', pool: 'invocation', n: 1, label: 'Nova invocação' },
      { lvl: 9, key: 'inv9', type: 'pool', pool: 'invocation', n: 1, label: 'Nova invocação' },
      { lvl: 12, key: 'inv12', type: 'pool', pool: 'invocation', n: 1, label: 'Nova invocação' }
    ]
  };

  /* ------------------------------------------------------------------ CAMINHOS (subclasses) */
  // Chave "classe.caminho". feats: habilidades por nível; picks: escolhas; spells: magias do caminho por nível de classe;
  // fx(ctx, pk): efeitos numéricos (proficiências, recursos, CA, iniciativa…).
  const div = (L, list) => list.filter(([lv]) => L >= lv).pop();
  const SUBS = {
    /* ---------------- Bárbaro */
    'barbarian.totem': {
      feats: [
        { lvl: 3, name: 'Conselheiro Espiritual', desc: () => 'Conjura Sentido Bestial e Falar com Animais como rituais.' },
        { lvl: 3, name: 'Totem Espiritual', desc: c => { const it = c.pkItem('totem3'); return it ? `${it.name}: ${it.desc(c)}` : 'Escolha o animal (urso, águia ou lobo) no quadro de escolhas.'; } },
        { lvl: 6, name: 'Aspecto da Besta', desc: c => { const it = c.pkItem('totem6'); return it ? `${it.name}: ${it.desc(c)}` : 'Escolha o animal (urso, águia ou lobo) no quadro de escolhas.'; } },
        { lvl: 10, name: 'Andarilho Espiritual', desc: () => 'Conjura Comunhão com a Natureza como ritual; um espírito animal responde.' }
      ],
      picks: [
        { lvl: 3, key: 'totem3', type: 'pool', pool: 'totemSpirit', n: 1, label: 'Totem Espiritual' },
        { lvl: 6, key: 'totem6', type: 'pool', pool: 'totemAspect', n: 1, label: 'Aspecto da Besta' }
      ]
    },

    /* ---------------- Bardo */
    'bard.valor': {
      feats: [
        { lvl: 3, name: 'Proficiência Adicional', desc: () => 'Armaduras médias, escudos e armas marciais (já aplicado).' },
        { lvl: 3, name: 'Inspiração em Combate', desc: () => 'Quem tem seu dado de Inspiração pode somá-lo ao dano de um ataque ou, como reação, à CA contra um ataque.' },
        { lvl: 6, name: 'Ataque Extra', desc: () => 'Ataca duas vezes quando usa a ação Atacar.' }
      ],
      fx: L => ({ armor: L >= 3 ? ['medium', 'shield'] : [], weapons: L >= 3 ? ['martial'] : [], attacks: L >= 6 ? 2 : 0 })
    },
    'bard.swords': {
      feats: [
        { lvl: 3, name: 'Proficiência Bônus', desc: () => 'Armaduras médias e cimitarra; pode usar uma arma corpo a corpo como foco de conjuração (já aplicado).' },
        { lvl: 3, name: 'Estilo de Luta', desc: ({ pk }) => `Duelismo ou Combate com Duas Armas: ${pk('swfs')[0] || '— escolha abaixo —'}.` },
        { lvl: 3, name: 'Floreio de Lâminas', desc: () => 'Ao usar Atacar, +3 m de deslocamento no turno. Uma vez por turno, ao acertar, gaste uma Inspiração: Floreio Defensivo (dado no dano e na CA), Cortante (dado no dano do alvo e de outro adjacente) ou Móvel (dado no dano e empurra 1,5 m + dado).' },
        { lvl: 6, name: 'Ataque Extra', desc: () => 'Ataca duas vezes quando usa a ação Atacar.' }
      ],
      picks: [{ lvl: 3, key: 'swfs', type: 'pool', pool: 'style', allow: ['dueling', 'twf'], n: 1, label: 'Estilo de Luta' }],
      fx: L => ({ armor: L >= 3 ? ['medium'] : [], weapons: L >= 3 ? ['scimitar'] : [], attacks: L >= 6 ? 2 : 0 })
    },

    /* ---------------- Clérigo */
    'cleric.knowledge': {
      feats: [
        { lvl: 1, name: 'Bênçãos do Conhecimento', desc: ({ pk }) => `2 idiomas (${pk('know1l').join(', ') || 'escolha abaixo'}) e 2 perícias entre Arcanismo, História, Natureza e Religião com especialização (${pk('know1s').join(', ') || 'escolha abaixo'}).` },
        { lvl: 2, name: 'Canalizar: Conhecimento das Eras', desc: () => 'Ação: proficiência numa perícia ou ferramenta à sua escolha por 10 minutos.' },
        { lvl: 6, name: 'Canalizar: Ler Pensamentos', desc: ({ dc }) => `Ação: alvo a 18 m faz resistência de Sabedoria CD ${dc('wis')}; falha = você lê pensamentos superficiais por 1 minuto e pode conjurar Sugestão nele sem espaço.` },
        { lvl: 8, name: 'Conjuração Poderosa', desc: ({ m }) => `Soma ${sg(m.wis)} ao dano dos seus truques de clérigo.` }
      ],
      picks: [
        { lvl: 1, key: 'know1l', type: 'lang', n: 2, label: 'Bênçãos do Conhecimento: 2 idiomas' },
        { lvl: 1, key: 'know1s', type: 'skill', mode: 'profexp', from: ['arcana', 'history', 'nature', 'religion'], n: 2, label: 'Bênçãos do Conhecimento: 2 perícias (com especialização)' }
      ],
      spells: { mode: 'always', 1: ['Comando', 'Identificação'], 3: ['Augúrio', 'Sugestão'], 5: ['Dificultar Detecção', 'Falar com os Mortos'], 7: ['Olho Arcano', 'Confusão'], 9: ['Conhecimento Lendário', 'Vidência'] }
    },
    'cleric.trickery': {
      feats: [
        { lvl: 1, name: 'Bênção do Trapaceiro', desc: () => 'Ação: uma criatura voluntária ganha vantagem em Furtividade por 1 hora.' },
        { lvl: 2, name: 'Canalizar: Invocar Duplicidade', desc: () => 'Ação: cria uma cópia ilusória sua por 1 minuto (concentração); pode conjurar a partir dela e tem vantagem contra quem estiver a 1,5 m dela.' },
        { lvl: 6, name: 'Canalizar: Manto de Sombras', desc: () => 'Ação: fica invisível até o fim do seu próximo turno.' },
        { lvl: 8, name: 'Golpe Divino', desc: () => 'Uma vez por turno, ao acertar com arma: +1d8 de dano de veneno.' }
      ],
      spells: { mode: 'always', 1: ['Enfeitiçar Pessoa', 'Disfarçar-se'], 3: ['Reflexos', 'Passos sem Pegadas'], 5: ['Piscar', 'Dissipar Magia'], 7: ['Porta Dimensional', 'Metamorfose'], 9: ['Dominar Pessoa', 'Modificar Memória'] },
      fx: L => ({ atk: L >= 8 ? [() => '+1d8 veneno 1×/turno (Golpe Divino)'] : [] })
    },
    'cleric.war': {
      feats: [
        { lvl: 1, name: 'Proficiência Adicional', desc: () => 'Armas marciais e armadura pesada (já aplicado).' },
        { lvl: 1, name: 'Sacerdote da Guerra', desc: () => 'Quando usa Atacar, pode fazer um ataque com arma como ação bônus (usos no quadro de recursos).' },
        { lvl: 2, name: 'Canalizar: Ataque Dirigido', desc: () => 'Ao atacar, soma +10 à jogada (decide depois de rolar, antes do resultado).' },
        { lvl: 6, name: 'Canalizar: Bênção do Deus da Guerra', desc: () => 'Reação: +10 na jogada de ataque de uma criatura a 9 m.' },
        { lvl: 8, name: 'Golpe Divino', desc: () => 'Uma vez por turno, ao acertar com arma: +1d8 do mesmo tipo de dano da arma.' }
      ],
      spells: { mode: 'always', 1: ['Auxílio Divino', 'Escudo da Fé'], 3: ['Arma Mágica', 'Arma Espiritual'], 5: ['Manto do Cruzado', 'Espíritos Guardiões'], 7: ['Movimentação Livre', 'Pele de Pedra'], 9: ['Coluna de Chamas', 'Imobilizar Monstro'] },
      fx: (L, { m }) => ({ res: [{ key: 'warpriest', name: 'Sacerdote da Guerra (ataque bônus)', uses: min1(m.wis), per: 'descanso longo' }], atk: L >= 8 ? [w => `+1d8 ${w.dt} 1×/turno (Golpe Divino)`] : [] })
    },
    'cleric.light': {
      feats: [
        { lvl: 1, name: 'Truque Adicional', desc: () => 'Conhece o truque Luz (já no quadro de magias).' },
        { lvl: 1, name: 'Labareda Protetora', desc: () => 'Reação: impõe desvantagem a um ataque contra você feito por quem você vê a 9 m (usos no quadro de recursos).' },
        { lvl: 2, name: 'Canalizar: Radiação do Amanhecer', desc: ({ L, dc }) => `Ação: dissipa escuridão mágica a 9 m; inimigos ali fazem resistência de Constituição CD ${dc('wis')} contra 2d10 + ${L} radiante (metade se passar).` },
        { lvl: 6, name: 'Labareda Aprimorada', desc: () => 'A Labareda Protetora também protege aliados atacados a 9 m de você.' },
        { lvl: 8, name: 'Conjuração Poderosa', desc: ({ m }) => `Soma ${sg(m.wis)} ao dano dos seus truques de clérigo.` }
      ],
      spells: { mode: 'always', 1: ['Mãos Flamejantes', 'Fogo das Fadas'], 3: ['Esfera Flamejante', 'Raio Ardente'], 5: ['Luz do Dia', 'Bola de Fogo'], 7: ['Guardião da Fé', 'Muralha de Fogo'], 9: ['Coluna de Chamas', 'Vidência'] },
      grant: { 1: ['Luz'] },
      fx: (L, { m }) => ({ res: [{ key: 'flare', name: 'Labareda Protetora', uses: min1(m.wis), per: 'descanso longo' }] })
    },
    'cleric.nature': {
      feats: [
        { lvl: 1, name: 'Acólito da Natureza', desc: ({ pk }) => `Um truque de druida (${pk('nat1c')[0] || 'escolha abaixo'}) e uma perícia entre Adestrar Animais, Natureza e Sobrevivência (${pk('nat1s')[0] || 'escolha abaixo'}).` },
        { lvl: 1, name: 'Proficiência Adicional', desc: () => 'Armadura pesada (já aplicado).' },
        { lvl: 2, name: 'Canalizar: Enfeitiçar Animais e Plantas', desc: ({ dc }) => `Ação: feras e plantas a 9 m fazem resistência de Sabedoria CD ${dc('wis')} ou ficam enfeitiçadas por 1 minuto.` },
        { lvl: 6, name: 'Amortecer Elementos', desc: () => 'Reação: dá resistência a ácido, frio, fogo, elétrico ou trovejante a você ou a um aliado a 9 m contra um dano.' },
        { lvl: 8, name: 'Golpe Divino', desc: () => 'Uma vez por turno, ao acertar com arma: +1d8 de frio, fogo ou elétrico (à sua escolha).' }
      ],
      picks: [
        { lvl: 1, key: 'nat1c', type: 'cantrip', cls: 'druid', n: 1, label: 'Acólito da Natureza: truque de druida' },
        { lvl: 1, key: 'nat1s', type: 'skill', mode: 'prof', from: ['animal', 'nature', 'survival'], n: 1, label: 'Acólito da Natureza: perícia' }
      ],
      spells: { mode: 'always', 1: ['Amizade Animal', 'Falar com Animais'], 3: ['Pele de Árvore', 'Crescer Espinhos'], 5: ['Ampliar Plantas', 'Muralha de Vento'], 7: ['Dominar Besta', 'Vinha Esmagadora'], 9: ['Praga de Insetos', 'Caminhar em Árvores'] },
      fx: L => ({ atk: L >= 8 ? [() => '+1d8 frio/fogo/elétrico 1×/turno (Golpe Divino)'] : [] })
    },
    'cleric.tempest': {
      feats: [
        { lvl: 1, name: 'Proficiência Adicional', desc: () => 'Armas marciais e armadura pesada (já aplicado).' },
        { lvl: 1, name: 'Ira da Tormenta', desc: ({ dc }) => `Reação quando alguém a 1,5 m te acerta: resistência de Destreza CD ${dc('wis')} contra 2d8 elétrico ou trovejante (metade se passar). Usos no quadro de recursos.` },
        { lvl: 2, name: 'Canalizar: Ira Destruidora', desc: () => 'Ao rolar dano elétrico ou trovejante, use o valor máximo em vez de rolar.' },
        { lvl: 6, name: 'Golpe de Relâmpago', desc: () => 'Ao causar dano elétrico numa criatura Grande ou menor, pode empurrá-la até 3 m.' },
        { lvl: 8, name: 'Golpe Divino', desc: () => 'Uma vez por turno, ao acertar com arma: +1d8 trovejante.' }
      ],
      spells: { mode: 'always', 1: ['Névoa Obscurecente', 'Onda Trovejante'], 3: ['Lufada de Vento', 'Despedaçar'], 5: ['Convocar Relâmpagos', 'Nevasca'], 7: ['Controlar a Água', 'Tempestade de Gelo'], 9: ['Onda Destrutiva', 'Praga de Insetos'] },
      fx: (L, { m }) => ({ res: [{ key: 'wrath', name: 'Ira da Tormenta', uses: min1(m.wis), per: 'descanso longo' }], atk: L >= 8 ? [() => '+1d8 trovejante 1×/turno (Golpe Divino)'] : [] })
    },

    /* ---------------- Druida */
    'druid.moon': {
      feats: [
        { lvl: 2, name: 'Forma Selvagem de Combate', desc: () => 'Vira fera como ação bônus e, transformado, pode gastar um espaço de magia (ação bônus) para curar 1d8 por círculo.' },
        { lvl: 2, name: 'Formas de Círculo', desc: ({ L }) => `Pode virar feras de ND até ${L >= 6 ? Math.floor(L / 3) : 1} (substitui o limite normal da Forma Selvagem).` },
        { lvl: 6, name: 'Ataque Primordial', desc: () => 'Em forma de fera, seus ataques contam como mágicos.' },
        { lvl: 10, name: 'Forma Selvagem de Elemental', desc: () => 'Gasta 2 usos de Forma Selvagem para virar um elemental do ar, da terra, do fogo ou da água.' }
      ]
    },
    'druid.land': {
      picks: [{ lvl: 2, key: 'land2', type: 'pool', pool: 'landTerrain', n: 1, label: 'Terreno do círculo' }]
    },

    /* ---------------- Guerreiro */
    'fighter.champion': { picks: [{ lvl: 10, key: 'fs10', type: 'pool', pool: 'style', n: 1, label: 'Estilo de Luta adicional' }] },
    'fighter.battlemaster': {
      feats: [
        { lvl: 3, name: 'Superioridade em Combate', desc: ({ L, PB, m }) => `${L >= 7 ? 5 : 4} dados de superioridade (d${L >= 10 ? 10 : 8}) por descanso curto. CD das manobras: ${8 + PB + Math.max(m.str, m.dex)}. Manobras: veja abaixo.` },
        { lvl: 3, name: 'Estudioso da Guerra', desc: ({ pk }) => `Proficiência com uma ferramenta de artesão (${pk('bmtool')[0] || 'escolha abaixo'}).` },
        { lvl: 7, name: 'Conheça seu Inimigo', desc: () => 'Observando alguém por 1 minuto fora de combate, descobre se ele é melhor, igual ou pior que você em duas características (atributos, CA, PV, nível).' },
        { lvl: 10, name: 'Superioridade em Combate Aprimorada', desc: () => 'Os dados de superioridade viram d10.' }
      ],
      picks: [
        { lvl: 3, key: 'man3', type: 'pool', pool: 'maneuver', n: 3, label: 'Manobras' },
        { lvl: 3, key: 'bmtool', type: 'tool', list: 'artisan', n: 1, label: 'Estudioso da Guerra: ferramenta' },
        { lvl: 7, key: 'man7', type: 'pool', pool: 'maneuver', n: 2, label: 'Mais 2 manobras' },
        { lvl: 10, key: 'man10', type: 'pool', pool: 'maneuver', n: 2, label: 'Mais 2 manobras' }
      ],
      fx: L => ({ res: [{ key: 'superiority', name: `Dados de superioridade (d${L >= 10 ? 10 : 8})`, uses: L >= 7 ? 5 : 4, per: 'descanso curto' }] })
    },
    'fighter.eldritch': {
      feats: [
        { lvl: 3, name: 'Conjuração', desc: ({ PB, m }) => `Magias de mago (Inteligência). CD ${8 + PB + m.int}, ataque mágico ${sg(PB + m.int)}. Use o quadro de magias.` },
        { lvl: 3, name: 'Vínculo com Arma', desc: () => 'Ritual de 1 hora vincula até duas armas: não pode ser desarmado delas e as chama de volta para a mão como ação bônus.' },
        { lvl: 7, name: 'Magia de Guerra', desc: () => 'Quando usa a ação para conjurar um truque, pode fazer um ataque com arma como ação bônus.' },
        { lvl: 10, name: 'Golpe Místico', desc: () => 'Quem você acerta com arma tem desvantagem na próxima resistência contra uma magia sua até o fim do seu próximo turno.' }
      ]
    },
    'fighter.arcanearcher': {
      feats: [
        { lvl: 3, name: 'Tradição do Arqueiro Arcano', desc: ({ pk }) => `Proficiência em ${pk('aas')[0] || 'Arcanismo ou Natureza'} e o truque ${pk('aac')[0] || 'Prestidigitação ou Druidismo'}.` },
        { lvl: 3, name: 'Disparo Arcano', desc: ({ PB, m }) => `2 usos por descanso curto (uma vez por turno, ao acertar com arco curto ou longo). CD ${8 + PB + m.int}. Opções conhecidas: veja abaixo.` },
        { lvl: 7, name: 'Flecha Mágica', desc: () => 'Flechas disparadas por você contam como mágicas.' },
        { lvl: 7, name: 'Tiro Curvado', desc: () => 'Ao errar com uma flecha mágica, ação bônus: rola de novo contra outro alvo a 18 m do original.' }
      ],
      picks: [
        { lvl: 3, key: 'aas', type: 'skill', mode: 'prof', from: ['arcana', 'nature'], n: 1, label: 'Tradição: perícia' },
        { lvl: 3, key: 'aac', type: 'pool', pool: 'aaCantrip', n: 1, label: 'Tradição: truque' },
        { lvl: 3, key: 'aa3', type: 'pool', pool: 'arcaneShot', n: 2, label: 'Disparos Arcanos' },
        { lvl: 7, key: 'aa7', type: 'pool', pool: 'arcaneShot', n: 1, label: 'Mais um Disparo Arcano' },
        { lvl: 10, key: 'aa10', type: 'pool', pool: 'arcaneShot', n: 1, label: 'Mais um Disparo Arcano' }
      ],
      fx: () => ({ res: [{ key: 'arcaneshot', name: 'Disparo Arcano', uses: 2, per: 'descanso curto' }] })
    },

    /* ---------------- Monge */
    'monk.shadow': {
      feats: [
        { lvl: 3, name: 'Artes Sombrias', desc: () => 'Gaste 2 chi para conjurar Escuridão, Visão no Escuro, Passos sem Pegadas ou Silêncio, sem componentes. Conhece o truque Ilusão Menor.' },
        { lvl: 6, name: 'Passo das Sombras', desc: () => 'Na penumbra ou escuridão, ação bônus: teleporta até 18 m para outro ponto escuro e tem vantagem no próximo ataque corpo a corpo do turno.' },
        { lvl: 11, name: 'Manto de Sombras', desc: () => 'Na penumbra ou escuridão, ação: fica invisível até atacar, conjurar ou ir para a luz.' }
      ],
      grant: { 3: ['Ilusão Menor'] }
    },
    'monk.elements': {
      feats: [
        { lvl: 3, name: 'Discípulo dos Elementos', desc: ({ L, dc }) => `Conhece Sintonia Elemental e as disciplinas escolhidas abaixo. Pode gastar até ${L >= 9 ? 4 : L >= 5 ? 3 : 2} chi por disciplina; CD ${dc('wis')}.` },
        { lvl: 3, name: 'Sintonia Elemental', desc: () => 'Ação: pequenos efeitos elementais (acender uma vela, esfriar comida, moldar terra, criar uma brisa).' }
      ],
      picks: [
        { lvl: 3, key: 'el3', type: 'pool', pool: 'discipline', n: 1, label: 'Disciplina elemental' },
        { lvl: 6, key: 'el6', type: 'pool', pool: 'discipline', n: 1, label: 'Nova disciplina' },
        { lvl: 11, key: 'el11', type: 'pool', pool: 'discipline', n: 1, label: 'Nova disciplina' }
      ]
    },
    'monk.drunken': {
      feats: [
        { lvl: 3, name: 'Proficiências Bônus', desc: () => 'Atuação e suprimentos de cervejeiro (já aplicado).' },
        { lvl: 3, name: 'Técnica Bêbada', desc: () => 'Ao usar Rajada de Golpes, ganha o efeito de Desengajar e +3 m de deslocamento no turno.' },
        { lvl: 6, name: 'Balanço Bêbado', desc: () => 'Levantar-se custa só 1,5 m; e, quando um inimigo erra você, gaste 1 chi (reação) para redirecionar o ataque a outra criatura a 1,5 m.' },
        { lvl: 11, name: 'Sorte do Bêbado', desc: () => 'Com desvantagem num teste, ataque ou resistência, gaste 2 chi para anular a desvantagem.' }
      ],
      fx: L => ({ skills: L >= 3 ? ['performance'] : [], tools: L >= 3 ? ['Suprimentos de cervejeiro'] : [] })
    },

    /* ---------------- Paladino */
    'paladin.ancients': {
      feats: [
        { lvl: 3, name: 'Canalizar: Fúria da Natureza', desc: ({ dc }) => `Ação: vinhas prendem uma criatura a 3 m (resistência de Força ou Destreza CD ${dc('cha')}; repete a cada turno).` },
        { lvl: 3, name: 'Canalizar: Expulsar os Infiéis', desc: ({ dc }) => `Ação: fadas e corruptores a 9 m fazem resistência de Sabedoria CD ${dc('cha')} ou fogem por 1 minuto.` },
        { lvl: 7, name: 'Aura de Vigilância', desc: () => 'Você e aliados a 3 m têm resistência a dano de magias.' }
      ],
      spells: { mode: 'always', 3: ['Golpe Constritor', 'Falar com Animais'], 5: ['Raio Lunar', 'Passo Nebuloso'], 9: ['Ampliar Plantas', 'Proteção contra Energia'] }
    },
    'paladin.vengeance': {
      feats: [
        { lvl: 3, name: 'Canalizar: Abjurar Inimigo', desc: ({ dc }) => `Ação: uma criatura a 18 m faz resistência de Sabedoria CD ${dc('cha')} ou fica amedrontada e sem deslocamento por 1 minuto.` },
        { lvl: 3, name: 'Canalizar: Voto de Inimizade', desc: () => 'Ação bônus: vantagem nos ataques contra uma criatura a 3 m por 1 minuto.' },
        { lvl: 7, name: 'Vingador Implacável', desc: () => 'Ao acertar um ataque de oportunidade, pode andar metade do deslocamento sem provocar ataques.' }
      ],
      spells: { mode: 'always', 3: ['Perdição', 'Marca do Caçador'], 5: ['Imobilizar Pessoa', 'Passo Nebuloso'], 9: ['Velocidade', 'Proteção contra Energia'] }
    },

    /* ---------------- Patrulheiro */
    'ranger.hunter': {
      picks: [
        { lvl: 3, key: 'hp3', type: 'pool', pool: 'huntPrey', n: 1, label: 'Presa do Caçador' },
        { lvl: 7, key: 'hd7', type: 'pool', pool: 'huntDef', n: 1, label: 'Táticas Defensivas' },
        { lvl: 11, key: 'hm11', type: 'pool', pool: 'huntMulti', n: 1, label: 'Ataque Múltiplo' }
      ],
      fx: (L, ctx, pk) => ({ atk: pk('hp3').includes('colossus') ? [() => '+1d8 1×/turno em alvo ferido (Assassino de Colossos)'] : [] })
    },
    'ranger.beast': {
      feats: [
        { lvl: 3, name: 'Companheiro do Patrulheiro', desc: ({ L, PB, pkItem }) => {
          const b = pkItem('beast3');
          if (!b) return 'Escolha abaixo uma fera de ND 1/4 ou menor. Ela age no seu turno quando você a comanda (gastando sua ação) e soma sua proficiência na CA, ataques, dano e resistências.';
          const st = b.st;
          return `${b.name}: CA ${st.ac + PB}, PV ${Math.max(st.hp, 4 * L)}, deslocamento ${st.spd}. Ataque ${sg(st.atk + PB)}, dano ${st.dmg} ${sg(PB)}; ${st.note}. Comande com sua ação (ataque, Disparada, Desengajar, Esquivar ou Ajudar).`;
        } },
        { lvl: 7, name: 'Treinamento Excepcional', desc: () => 'Se o companheiro não recebeu ordem de atacar, você pode mandá-lo usar Disparada, Desengajar, Esquivar ou Ajudar como ação bônus.' },
        { lvl: 11, name: 'Fúria Bestial', desc: () => 'Ao comandar o ataque, o companheiro ataca duas vezes.' }
      ],
      picks: [{ lvl: 3, key: 'beast3', type: 'pool', pool: 'companion', n: 1, label: 'Companheiro animal' }]
    },
    'ranger.gloom': {
      feats: [
        { lvl: 3, name: 'Emboscador Terrível', desc: ({ m }) => `Soma ${sg(m.wis)} na iniciativa (já somado). No 1º turno de cada combate: +3 m de deslocamento e, se usar Atacar, um ataque extra que causa +1d8.` },
        { lvl: 3, name: 'Visão Umbral', desc: () => 'Visão no escuro de 18 m (ou +9 m se já tiver). Na escuridão, criaturas que dependem de visão no escuro não te enxergam.' },
        { lvl: 7, name: 'Mente de Ferro', desc: () => 'Proficiência em resistências de Sabedoria (já marcada).' },
        { lvl: 11, name: 'Agitação Perseguidora', desc: () => 'Uma vez por turno, ao errar um ataque com arma, pode fazer outro ataque.' }
      ],
      spells: { mode: 'always', 3: ['Disfarçar-se'], 5: ['Truque de Corda'], 9: ['Medo'] },
      fx: (L, { m }) => ({ init: L >= 3 ? m.wis : 0, saves: L >= 7 ? ['wis'] : [] })
    },

    /* ---------------- Ladino */
    'rogue.assassin': {
      feats: [
        { lvl: 3, name: 'Proficiência Adicional', desc: () => 'Kit de disfarce e kit de venenos (já aplicado).' },
        { lvl: 3, name: 'Assassinar', desc: () => 'Vantagem contra quem ainda não agiu no combate; todo acerto contra uma criatura surpresa é crítico.' },
        { lvl: 9, name: 'Especialização em Infiltração', desc: () => 'Com 7 dias e 25 po, cria uma identidade falsa completa (história, documentos, contatos).' }
      ],
      fx: L => ({ tools: L >= 3 ? ['Kit de disfarce', 'Kit de venenos'] : [] })
    },
    'rogue.arcanetrickster': {
      feats: [
        { lvl: 3, name: 'Conjuração', desc: ({ PB, m }) => `Magias de mago (Inteligência), principalmente encantamento e ilusão. CD ${8 + PB + m.int}, ataque mágico ${sg(PB + m.int)}.` },
        { lvl: 3, name: 'Mãos Mágicas Malabaristas', desc: () => 'Sua Mãos Mágicas fica invisível e pode guardar ou pegar objetos de alguém, usar ferramentas de ladrão e abrir fechaduras à distância (ação bônus com Ação Ardilosa).' },
        { lvl: 9, name: 'Emboscada Mágica', desc: () => 'Se estiver escondido ao conjurar, o alvo tem desvantagem na resistência contra a magia.' }
      ],
      grant: { 3: ['Mãos Mágicas'] }
    },
    'rogue.swashbuckler': {
      feats: [
        { lvl: 3, name: 'Passo Elegante', desc: () => 'Quem você ataca corpo a corpo no seu turno não pode fazer ataque de oportunidade contra você nesse turno.' },
        { lvl: 3, name: 'Audácia Devassa', desc: ({ m }) => `Soma ${sg(m.cha)} na iniciativa (já somado). Ataque Furtivo funciona sem aliado por perto, desde que só o alvo esteja a 1,5 m de você (e sem desvantagem).` },
        { lvl: 9, name: 'Penachar', desc: () => 'Ação: Persuasão contra Intuição do alvo — inimigos ficam provocados (desvantagem contra outros); não hostis ficam encantados por 1 minuto.' }
      ],
      fx: (L, { m }) => ({ init: L >= 3 ? m.cha : 0 })
    },

    /* ---------------- Feiticeiro */
    'sorcerer.wildmagic': {
      feats: [
        { lvl: 1, name: 'Surto de Magia Selvagem', desc: () => 'Ao conjurar magia de 1º círculo ou maior, o mestre pode pedir um d20: com 1, role na tabela de Surto de Magia Selvagem (LdJ p. 82).' },
        { lvl: 1, name: 'Marés de Caos', desc: () => 'Uma vez, ganhe vantagem num ataque, teste ou resistência; volta no descanso longo (ou quando o mestre provoca um surto).' },
        { lvl: 6, name: 'Dobrar a Sorte', desc: () => 'Reação: gaste 2 pontos de feitiçaria para somar ou subtrair 1d4 da jogada de outra criatura que você vê.' }
      ],
      fx: () => ({ res: [{ key: 'tides', name: 'Marés de Caos', uses: 1, per: 'descanso longo' }] })
    },
    'sorcerer.storm': {
      feats: [
        { lvl: 1, name: 'Orador do Vento', desc: () => 'Fala Primordial e seus dialetos: Aquan, Auran, Ignan e Terran (já nos idiomas).' },
        { lvl: 1, name: 'Magia Tempestuosa', desc: () => 'Ao conjurar magia de 1º círculo ou maior, voa até 3 m como ação bônus sem provocar ataques de oportunidade.' },
        { lvl: 6, name: 'Coração da Tempestade', desc: ({ L }) => `Resistência a elétrico e trovejante. Ao conjurar magia de 1º círculo ou mais desses tipos, criaturas escolhidas a 3 m sofrem ${half(L)} de dano elétrico ou trovejante.` },
        { lvl: 6, name: 'Guia da Tempestade', desc: () => 'Para a chuva ao seu redor ou muda a direção do vento num raio de 30 m.' }
      ],
      fx: () => ({ langs: ['Primordial'] })
    },
    'sorcerer.shadow': {
      feats: [
        { lvl: 1, name: 'Olhos da Escuridão', desc: ({ L }) => `Visão no escuro de 36 m.${L >= 3 ? ' Conhece Escuridão (fora do limite) e pode conjurá-la com 2 pontos de feitiçaria, enxergando através dela.' : ''}` },
        { lvl: 1, name: 'Força do Túmulo', desc: () => 'Ao cair a 0 PV (exceto por dano radiante ou crítico), faça resistência de Carisma CD 5 + dano: se passar, fica com 1 PV. 1× por descanso longo.' },
        { lvl: 6, name: 'Cão do Mal Presságio', desc: () => 'Ação bônus, 3 pontos de feitiçaria: invoca um lobo atroz sombrio que persegue um alvo; o alvo tem desvantagem nas resistências contra suas magias enquanto o cão estiver perto.' }
      ],
      grant: { 3: ['Escuridão'] },
      fx: () => ({ res: [{ key: 'grave', name: 'Força do Túmulo', uses: 1, per: 'descanso longo' }] })
    },

    /* ---------------- Bruxo */
    'warlock.archfey': {
      feats: [
        { lvl: 1, name: 'Presença Feérica', desc: ({ dc }) => `Ação: criaturas num cubo de 3 m a partir de você fazem resistência de Sabedoria CD ${dc('cha')} ou ficam enfeitiçadas ou amedrontadas até o fim do seu próximo turno. 1× por descanso curto.` },
        { lvl: 6, name: 'Névoa de Fuga', desc: () => 'Reação ao sofrer dano: fica invisível e teleporta até 18 m. 1× por descanso curto.' },
        { lvl: 10, name: 'Defesa Sedutora', desc: () => 'Imune a enfeitiçamento; quando tentam te enfeitiçar, pode virar o efeito contra quem tentou.' }
      ],
      spells: { mode: 'expanded', 1: ['Fogo das Fadas', 'Sono'], 3: ['Acalmar Emoções', 'Força Fantasmagórica'], 5: ['Piscar', 'Ampliar Plantas'], 7: ['Dominar Besta', 'Invisibilidade Maior'], 9: ['Dominar Pessoa', 'Similaridade'] },
      fx: L => ({ res: [{ key: 'feypresence', name: 'Presença Feérica', uses: 1, per: 'descanso curto' }].concat(L >= 6 ? [{ key: 'mistyescape', name: 'Névoa de Fuga', uses: 1, per: 'descanso curto' }] : []) })
    },
    'warlock.greatold': {
      feats: [
        { lvl: 1, name: 'Despertar a Mente', desc: () => 'Fala telepaticamente com qualquer criatura a 9 m que entenda algum idioma.' },
        { lvl: 6, name: 'Proteção Entrópica', desc: () => 'Reação: impõe desvantagem a um ataque contra você; se ele errar, seu próximo ataque contra o atacante tem vantagem. 1× por descanso curto.' },
        { lvl: 10, name: 'Escudo de Pensamentos', desc: () => 'Ninguém lê sua mente sem permissão, resistência a dano psíquico e quem te causa dano psíquico sofre o mesmo.' }
      ],
      spells: { mode: 'expanded', 1: ['Sussurros Dissonantes', 'Riso Histérico de Tasha'], 3: ['Detectar Pensamentos', 'Força Fantasmagórica'], 5: ['Clarividência', 'Enviar Mensagem'], 7: ['Dominar Besta', 'Tentáculos Negros de Evard'], 9: ['Dominar Pessoa', 'Telecinésia'] },
      fx: L => ({ res: L >= 6 ? [{ key: 'entropic', name: 'Proteção Entrópica', uses: 1, per: 'descanso curto' }] : [] })
    },
    'warlock.hexblade': {
      feats: [
        { lvl: 1, name: 'Maldição da Lâmina Maldita', desc: ({ PB, L, m }) => `Ação bônus, alvo a 9 m por 1 minuto: +${PB} de dano contra ele, crítico com 19–20 e, se ele morrer, você cura ${L + m.cha} PV. 1× por descanso curto.` },
        { lvl: 1, name: 'Guerreiro Maldito', desc: () => 'Armaduras médias, escudos e armas marciais. Com uma arma sem a propriedade duas mãos (ou a arma do pacto), usa Carisma no ataque e no dano (já calculado).' },
        { lvl: 6, name: 'Espectro Amaldiçoado', desc: ({ L, m }) => `Ao matar um humanoide, transforma o espírito num espectro aliado até o fim do próximo descanso longo (PV temporários ${half(L)}, +${Math.max(0, m.cha)} nos ataques). 1× por descanso longo.` },
        { lvl: 10, name: 'Armadura de Maldições', desc: () => 'Quando o alvo amaldiçoado te acerta, role d6: com 4 ou mais, o ataque erra.' }
      ],
      spells: { mode: 'expanded', 1: ['Escudo Arcano', 'Destruição Colérica'], 3: ['Nublar', 'Marca da Punição'], 5: ['Piscar', 'Arma Elemental'], 7: ['Assassino Fantasmagórico', 'Destruição Estonteante'], 9: ['Destruição Banidora', 'Cone de Frio'] },
      fx: (L, { m }) => ({ armor: ['medium', 'shield'], weapons: ['martial'], hexWarrior: true, res: [{ key: 'hexcurse', name: 'Maldição da Lâmina Maldita', uses: 1, per: 'descanso curto' }].concat(L >= 6 ? [{ key: 'specter', name: 'Espectro Amaldiçoado', uses: 1, per: 'descanso longo' }] : []) })
    },

    /* ---------------- Mago */
    'wizard.abjuration': {
      feats: [
        { lvl: 2, name: 'Abjuração Instruída', desc: () => 'Copiar magias de abjuração no grimório custa metade do tempo e do ouro.' },
        { lvl: 2, name: 'Proteção Arcana', desc: ({ L, m }) => `Ao conjurar abjuração de 1º círculo ou maior, cria uma proteção com ${2 * L + m.int} PV que absorve o dano antes de você; recupera 2 × círculo ao conjurar outras abjurações.` },
        { lvl: 6, name: 'Proteção Projetada', desc: () => 'Reação: sua Proteção Arcana absorve o dano de um aliado a 9 m.' },
        { lvl: 10, name: 'Abjuração Aprimorada', desc: ({ PB }) => `Soma +${PB} nos testes de atributo de magias de abjuração (como Contramágica e Dissipar Magia).` }
      ],
      fx: (L, { m }) => ({ res: [{ key: 'ward', name: 'Proteção Arcana (PV)', uses: 2 * L + m.int, per: 'descanso longo' }] })
    },
    'wizard.conjuration': {
      feats: [
        { lvl: 2, name: 'Conjuração Instruída', desc: () => 'Copiar magias de conjuração no grimório custa metade do tempo e do ouro.' },
        { lvl: 2, name: 'Conjuração Menor', desc: () => 'Ação: cria um objeto não mágico de até 1,5 kg e 90 cm, visível, que dura 1 hora.' },
        { lvl: 6, name: 'Transposição Benigna', desc: () => 'Ação: teleporta até 9 m ou troca de lugar com um aliado. Volta no descanso longo ou ao conjurar conjuração de 1º círculo ou maior.' },
        { lvl: 10, name: 'Conjuração Focada', desc: () => 'Dano não quebra sua concentração em magias de conjuração.' }
      ],
      fx: L => ({ res: L >= 6 ? [{ key: 'transpose', name: 'Transposição Benigna', uses: 1, per: 'descanso longo' }] : [] })
    },
    'wizard.divination': {
      feats: [
        { lvl: 2, name: 'Adivinhação Instruída', desc: () => 'Copiar magias de adivinhação no grimório custa metade do tempo e do ouro.' },
        { lvl: 2, name: 'Prodígio', desc: () => 'Após o descanso longo, role 2d20 e anote: pode trocar qualquer jogada de ataque, teste ou resistência (sua ou de outra criatura que você vê) por um desses valores.' },
        { lvl: 6, name: 'Especialista em Adivinhação', desc: () => 'Ao conjurar adivinhação de 2º círculo ou mais, recupera um espaço de círculo menor (até o 5º).' },
        { lvl: 10, name: 'O Terceiro Olho', desc: () => 'Ação, até o descanso: visão no escuro 18 m, visão etérea 18 m, ler qualquer idioma ou ver invisível 3 m (escolha um).' }
      ],
      fx: () => ({ res: [{ key: 'portent', name: 'Prodígio (d20 guardados)', uses: 2, per: 'descanso longo' }] })
    },
    'wizard.enchantment': {
      feats: [
        { lvl: 2, name: 'Encantamento Instruído', desc: () => 'Copiar magias de encantamento no grimório custa metade do tempo e do ouro.' },
        { lvl: 2, name: 'Olhar Hipnotizante', desc: ({ dc }) => `Ação: uma criatura a 1,5 m faz resistência de Sabedoria CD ${dc('int')} ou fica enfeitiçada e incapacitada; mantenha com sua ação a cada turno.` },
        { lvl: 6, name: 'Encanto Instintivo', desc: ({ dc }) => `Reação: desvia para outra criatura um ataque feito contra você (resistência de Sabedoria CD ${dc('int')}).` },
        { lvl: 10, name: 'Dividir Encantamento', desc: () => 'Encantamentos de um alvo só podem afetar uma segunda criatura.' }
      ]
    },
    'wizard.illusion': {
      feats: [
        { lvl: 2, name: 'Ilusão Instruída', desc: () => 'Copiar magias de ilusão no grimório custa metade do tempo e do ouro.' },
        { lvl: 2, name: 'Ilusão Menor Aprimorada', desc: () => 'Conhece Ilusão Menor (no quadro de magias) e pode criar som e imagem na mesma conjuração.' },
        { lvl: 6, name: 'Ilusões Moldáveis', desc: () => 'Ação: altera ilusões de 1 minuto ou mais que estiverem ativas.' },
        { lvl: 10, name: 'Eu Ilusório', desc: () => 'Reação: uma duplicata ilusória faz um ataque contra você errar automaticamente. 1× por descanso curto.' }
      ],
      grant: { 2: ['Ilusão Menor'] },
      fx: L => ({ res: L >= 10 ? [{ key: 'illself', name: 'Eu Ilusório', uses: 1, per: 'descanso curto' }] : [] })
    },
    'wizard.necromancy': {
      feats: [
        { lvl: 2, name: 'Necromancia Instruída', desc: () => 'Copiar magias de necromancia no grimório custa metade do tempo e do ouro.' },
        { lvl: 2, name: 'Colheita Sinistra', desc: () => 'Uma vez por turno, ao matar com uma magia, recupera PV = 2 × círculo (3 × se for necromancia).' },
        { lvl: 6, name: 'Escravos Mortos-Vivos', desc: ({ L }) => `Animar Mortos entra no grimório; ao conjurá-la, anima um alvo extra. Seus mortos-vivos ganham +${L} PV máximos e sua proficiência no dano.` },
        { lvl: 10, name: 'Acostumado à Morte-Vida', desc: () => 'Resistência a dano necrótico, e seus PV máximos não podem ser reduzidos.' }
      ],
      grant: { 6: ['Animar mortos'] }
    },
    'wizard.transmutation': {
      feats: [
        { lvl: 2, name: 'Transmutação Instruída', desc: () => 'Copiar magias de transmutação no grimório custa metade do tempo e do ouro.' },
        { lvl: 2, name: 'Alquimia Menor', desc: () => 'Com 10 minutos, transforma temporariamente madeira, pedra, ferro, cobre ou prata em outro desses materiais (1 hora).' },
        { lvl: 6, name: 'Pedra de Transmutador', desc: ({ pk }) => `Cria uma pedra com um benefício para quem a carrega: ${pk('stone6')[0] || 'escolha abaixo'}. Pode mudar o benefício ao conjurar transmutação de 1º círculo ou maior.` },
        { lvl: 10, name: 'Metamorfo', desc: () => 'Metamorfose entra no grimório; pode conjurá-la em si mesmo (fera de ND 1 ou menos) sem gastar espaço, 1× por descanso curto.' }
      ],
      picks: [{ lvl: 6, key: 'stone6', type: 'pool', pool: 'stone', n: 1, label: 'Pedra de Transmutador' }],
      grant: { 10: ['Metamorfose'] },
      fx: L => ({ res: L >= 10 ? [{ key: 'shapechanger', name: 'Metamorfo', uses: 1, per: 'descanso curto' }] : [] })
    },

    /* ---------------- Caminhos do SRD com escolhas */
    'bard.lore': { picks: [{ lvl: 3, key: 'lore3', type: 'skill', mode: 'prof', n: 3, label: 'Proficiência Adicional: 3 perícias' }] }
  };

  const PREFIX = { style: 'Estilo de Luta', maneuver: 'Manobra', metamagic: 'Metamágica', invocation: 'Invocação', pact: 'Dádiva do Pacto', huntPrey: 'Presa do Caçador', huntDef: 'Táticas Defensivas', huntMulti: 'Ataque Múltiplo', discipline: 'Disciplina', arcaneShot: 'Disparo Arcano', stone: 'Pedra de Transmutador' };

  /* ------------------------------------------------------------------ MOTOR */
  const P = () => CF.PATHS;
  const R = () => CF.RULES;
  const featById = id => FEATS.find(f => f.id === id);

  function poolItems(pool) {
    if (pool === 'style') return R().fightingStyles.map(f => ({ id: f.id, name: f.name, desc: () => f.desc }));
    if (pool === 'enemy') return R().favoredEnemies.map(x => ({ id: x, name: x }));
    if (pool === 'terrain') return R().terrains.map(x => ({ id: x, name: x }));
    if (pool === 'weapon') return Object.entries(R().weapons).map(([id, w]) => ({ id, name: w.name }));
    return POOLS[pool] || [];
  }
  function asiLevels(classId) { const A = P().asi; return A[classId] || A.default; }

  /** Caminho escolhido e já liberado no nível. */
  function subKey(c, L) {
    const pc = P().classes[c.classId];
    if (!pc || !c.choices.subclass || L < pc.pickLevel) return null;
    return c.classId + '.' + c.choices.subclass;
  }

  /** Todas as escolhas (definições) até o nível L, na ordem em que aparecem. */
  function defs(c, L) {
    const out = [];
    const race = R().races[c.raceId];
    if (race && race.feat) out.push({ lvl: 1, key: 'racefeat', type: 'feat', label: 'Talento (' + race.name + ')', src: race.name });
    (CLASS_PICKS[c.classId] || []).forEach(d => out.push(Object.assign({ src: 'class' }, d)));
    asiLevels(c.classId).forEach(l => out.push({ lvl: l, key: 'asi' + l, type: 'asi', label: 'Aumento de atributo ou talento', src: 'class' }));
    const sk = subKey(c, 12);
    if (sk && SUBS[sk] && SUBS[sk].picks) SUBS[sk].picks.forEach(d => out.push(Object.assign({ src: 'sub' }, d)));
    return out.filter(d => d.lvl <= L).sort((a, b) => a.lvl - b.lvl);
  }

  const picksOf = c => (c.sheet && c.sheet.picks) || {};
  const arr = v => (Array.isArray(v) ? v.filter(x => x != null && x !== '') : []);

  /** Lista de talentos efetivamente escolhidos (raça + aumentos de atributo). */
  function chosenFeats(c, L) {
    const pk = picksOf(c);
    return defs(c, L).filter(d => d.type === 'feat' || d.type === 'asi').map(d => ({ d, v: pk[d.key] || {} }))
      .filter(({ d, v }) => (d.type === 'feat' || v.mode === 'feat') && featById(v.feat))
      .map(({ d, v }) => ({ def: d, feat: featById(v.feat), fo: v.fo || {} }));
  }

  /** Bônus de atributo vindos de aumentos e talentos (antes dos modificadores). */
  function abilityBonus(c, L) {
    const out = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
    const pk = picksOf(c);
    defs(c, L).filter(d => d.type === 'asi').forEach(d => {
      const v = pk[d.key];
      if (v && v.mode !== 'feat') arr(v.a).slice(0, 2).forEach(k => { if (out[k] != null) out[k] += 1; });
    });
    chosenFeats(c, L).forEach(({ feat, fo }) => {
      Object.entries(feat.abFixed || {}).forEach(([k, n]) => { out[k] += n; });
      if (feat.ab && feat.ab.includes(fo.ab)) out[fo.ab] += 1;
    });
    return out;
  }

  /** Estado de cada escolha: completa ou pendente. */
  function isComplete(c, d) {
    const v = picksOf(c)[d.key];
    if (d.type === 'asi' || d.type === 'feat') {
      if (!v) return false;
      if (d.type === 'asi' && v.mode !== 'feat') return arr(v.a).length === 2;
      const f = featById(v.feat);
      if (!f) return false;
      if (f.ab && !f.ab.includes((v.fo || {}).ab)) return false;
      return (f.opts || []).every(o => arr((v.fo || {})[o.k]).length >= o.n);
    }
    return arr(v).length >= (d.n || 1);
  }
  function pending(c, L) { return defs(c, L).filter(d => !isComplete(c, d)); }

  /** Magias concedidas (sempre preparadas/conhecidas) e magias que entram na lista. */
  function spellGrants(c, L) {
    const out = { always: [], extra: [] };
    const sk = subKey(c, L);
    const S = sk && SUBS[sk];
    const add = (map, mode) => Object.keys(map).filter(k => k !== 'mode' && Number(k) <= L).forEach(k => {
      out.extra.push(...map[k]); if (mode !== 'expanded') out.always.push(...map[k]);
    });
    if (S && S.spells) add(S.spells, S.spells.mode);
    if (S && S.grant) add(S.grant, 'always');
    const pk = picksOf(c);
    defs(c, L).forEach(d => {
      const v = arr(pk[d.key]);
      if (d.type === 'cantrip') out.always.push(...v);
      if (d.pool === 'aaCantrip') out.always.push(...v);
      if (d.pool === 'landTerrain' && v[0]) { const t = POOLS.landTerrain.find(x => x.id === v[0]); if (t) add(t.spells, 'always'); }
    });
    return { always: [...new Set(out.always)], extra: [...new Set(out.extra)] };
  }

  /**
   * Efeitos de todas as escolhas, talentos e caminhos até o nível L.
   * ctx = { m, PB } (modificadores já com os aumentos de atributo).
   */
  function collect(c, L, ctx) {
    const X = { skills: [], expertise: [], saves: [], langs: [], tools: [], armor: [], weapons: [], init: 0, speed: 0, hpPerLevel: 0, passive: 0,
      res: [], atk: [], features: [], styles: [], attacks: 0, mageArmor: false, medMaster: false, hexWarrior: false, unarmedD4: false, dualAC: false };
    const pk = picksOf(c);
    const m = ctx.m, PB = ctx.PB;
    const dc = ab => 8 + PB + m[ab];
    const itemOf = (key, pool) => { const id = arr(pk[key])[0]; return poolItems(pool).find(x => x.id === id) || null; };
    const names = (key, pool) => arr(pk[key]).map(id => { const it = pool ? poolItems(pool).find(x => x.id === id) : null; return it ? it.name : (R().skills.find(s => s.id === id) || {}).name || id; });
    const D = defs(c, L);
    const poolOf = key => (D.find(d => d.key === key) || {}).pool;
    const dctx = { L, m, PB, s: ctx.s, dc, pk: key => names(key, poolOf(key)), pkItem: key => itemOf(key, poolOf(key)) };
    const merge = (fx, src) => {
      if (!fx) return;
      ['skills', 'expertise', 'saves', 'langs', 'tools', 'armor', 'weapons', 'res', 'atk', 'styles'].forEach(k => { if (fx[k]) X[k].push(...fx[k]); });
      ['init', 'speed', 'hpPerLevel', 'passive'].forEach(k => { if (fx[k]) X[k] += fx[k]; });
      if (fx.attacks) X.attacks = Math.max(X.attacks, fx.attacks);
      ['mageArmor', 'medMaster', 'hexWarrior', 'unarmedD4', 'dualAC'].forEach(k => { if (fx[k]) X[k] = true; });
    };

    // Escolhas por nível
    D.forEach(d => {
      const v = pk[d.key];
      const srcName = d.src === 'sub' ? ((P().classes[c.classId].options.find(o => o.id === c.choices.subclass) || {}).name || 'Caminho') : d.src === 'class' ? R().classes[c.classId].name : d.src;
      const src = srcName + ' ' + d.lvl;
      if (d.type === 'pool') {
        const items = poolItems(d.pool);
        arr(v).forEach(id => {
          const it = items.find(x => x.id === id);
          if (!it) return;
          if (d.pool === 'style') X.styles.push(id);
          if (d.pool === 'invocation') {
            if (id === 'armorshadows') X.mageArmor = true;
            if (id === 'beguiling') X.skills.push('deception', 'persuasion');
            if (id === 'thirsting') X.attacks = Math.max(X.attacks, 2);
            if (id === 'lifedrinker') X.atk.push((w, info) => (info.pact ? `+${Math.max(1, m.cha)} necrótico (Sorvedor de Vida)` : null));
          }
          if (d.pool === 'stone' && id === 'consave') X.saves.push('con');
          if (['landTerrain', 'companion', 'aaCantrip', 'enemy', 'terrain', 'element', 'casterClass', 'weapon', 'totemSpirit', 'totemAspect'].includes(d.pool)) return; // descritos no próprio cartão do caminho/classe
          X.features.push({ name: (PREFIX[d.pool] || d.label) + ': ' + it.name, desc: it.desc ? it.desc(dctx) : '', src, lvl: d.lvl, pick: true });
        });
        if (d.pool === 'enemy' && arr(v)[0]) X.features.push({ name: 'Inimigo favorito: ' + arr(v)[0], desc: 'Vantagem para rastrear e lembrar informações sobre ele; aprende um idioma dele, se houver.', src, lvl: d.lvl, pick: true });
        if (d.pool === 'terrain' && arr(v)[0]) X.features.push({ name: 'Terreno favorito: ' + arr(v)[0], desc: 'Explorador Natural também vale neste terreno.', src, lvl: d.lvl, pick: true });
        if (d.pool === 'landTerrain' && arr(v)[0]) { const t = itemOf(d.key, 'landTerrain'); if (t) X.features.push({ name: 'Círculo da Terra: ' + t.name, desc: 'Magias de círculo sempre preparadas (não contam no limite): ' + Object.keys(t.spells).filter(k => Number(k) <= L).map(k => t.spells[k].join(', ')).join('; ') + (L < 3 ? ' — a partir do nível 3.' : '.'), src, lvl: d.lvl, pick: true }); }
      }
      if (d.type === 'skill') {
        const ids = arr(v);
        if (d.mode === 'prof' || d.mode === 'profexp') X.skills.push(...ids);
        if (d.mode === 'exp' || d.mode === 'profexp') X.expertise.push(...ids);
      }
      if (d.type === 'lang') X.langs.push(...arr(v));
      if (d.type === 'tool') X.tools.push(...arr(v));
      if ((d.type === 'asi' && v && v.mode !== 'feat') && arr(v.a).length) {
        const a = arr(v.a);
        const txt = a[0] === a[1] ? `+2 em ${CF.engine.abName(a[0])}` : a.map(k => '+1 em ' + CF.engine.abName(k)).join(' e ');
        X.features.push({ name: 'Aumento no Valor de Habilidade', desc: txt + ' (já somado nos atributos; máximo 20).', src, lvl: d.lvl, pick: true, asi: true });
      }
    });

    // Talentos
    chosenFeats(c, L).forEach(({ def, feat, fo }) => {
      const src = (def.type === 'feat' ? def.src : R().classes[c.classId].name) + ' ' + def.lvl;
      const extra = [];
      if (feat.ab && fo.ab) extra.push('+1 em ' + CF.engine.abName(fo.ab));
      (feat.opts || []).forEach(o => {
        const vals = arr(fo[o.k]);
        if (!vals.length) return;
        const nm = o.type === 'pool' ? vals.map(id => (poolItems(o.pool).find(x => x.id === id) || { name: id }).name) : o.type === 'skill' ? vals.map(CF.engine.skillName) : vals;
        extra.push(o.label + ': ' + nm.join(', '));
        if (o.type === 'skill') X.skills.push(...vals);
        if (o.type === 'lang') X.langs.push(...vals);
        if (o.pool === 'weapon') X.weapons.push(...vals);
        if (o.pool === 'maneuver') vals.forEach(id => { const it = POOLS.maneuver.find(x => x.id === id); if (it) X.features.push({ name: 'Manobra: ' + it.name, desc: it.desc(dctx), src, lvl: def.lvl, pick: true }); });
      });
      X.features.push({ name: 'Talento: ' + feat.name, desc: feat.desc + (extra.length ? ' — ' + extra.join('; ') + '.' : '') + ` (LdJ p. ${feat.page})`, src, lvl: def.lvl, pick: true, feat: true });
      const id = feat.id;
      if (id === 'alert') X.init += 5;
      if (id === 'mobile') X.speed += 3;
      if (id === 'tough') X.hpPerLevel += 2;
      if (id === 'observant') X.passive += 5;
      if (id === 'resilient' && fo.ab) X.saves.push(fo.ab);
      if (id === 'lightlyarmored') X.armor.push('light');
      if (id === 'moderatelyarmored') X.armor.push('medium', 'shield');
      if (id === 'heavilyarmored') X.armor.push('heavy');
      if (id === 'mediumarmormaster') X.medMaster = true;
      if (id === 'tavernbrawler') X.unarmedD4 = true;
      if (id === 'dualwielder') X.dualAC = true;
      if (id === 'lucky') X.res.push({ key: 'luck', name: 'Pontos de sorte (Sortudo)', uses: 3, per: 'descanso longo' });
      if (id === 'martialadept') X.res.push({ key: 'madie', name: 'Dado de superioridade d6 (Adepto Marcial)', uses: 1, per: 'descanso curto' });
      if (id === 'sharpshooter') X.atk.push(w => (w.type === 'ranged' ? 'pode trocar −5 no ataque por +10 de dano (Atirador Aguçado)' : null));
      if (id === 'gwm') X.atk.push(w => (w.props.includes('pesada') ? 'pode trocar −5 no ataque por +10 de dano (Mestre de Armas Grandes)' : null));
      if (id === 'savageattacker') X.atk.push(w => (w.type === 'melee' ? 'rola o dano 2× e fica com o maior, 1×/turno' : null));
    });

    // Caminho
    const sk = subKey(c, L);
    const S = sk && SUBS[sk];
    if (S) {
      const srcName = (P().classes[c.classId].options.find(o => o.id === c.choices.subclass) || {}).name;
      (S.feats || []).filter(f => f.lvl <= L).forEach(f => X.features.push({ name: f.name, desc: f.desc(dctx), src: srcName + ' ' + f.lvl, lvl: f.lvl, sub: true }));
      if (S.fx) merge(S.fx(L, { m, PB }, key => arr(pk[key])), srcName);
    }
    // Estilo de luta "Defesa" e afins são tratados no motor (derive) a partir de X.styles.
    X.skills = [...new Set(X.skills)]; X.expertise = [...new Set(X.expertise)];
    X.saves = [...new Set(X.saves)]; X.langs = [...new Set(X.langs)]; X.tools = [...new Set(X.tools)];
    return X;
  }

  /** O caminho tem efeitos calculados (SRD ou automação deste arquivo)? */
  function automated(classId, subId) {
    const o = P().classes[classId] && P().classes[classId].options.find(x => x.id === subId);
    return !!o && (!!o.srd || !!(SUBS[classId + '.' + subId] && SUBS[classId + '.' + subId].feats));
  }
  /** Nomes das habilidades do caminho em um nível (para a trilha). */
  function subFeatureNames(classId, subId, lv) {
    const S = SUBS[classId + '.' + subId];
    const F = CF.FEATURES && CF.FEATURES.subclasses[subId];
    const o = P().classes[classId] && P().classes[classId].options.find(x => x.id === subId);
    const list = S && S.feats ? S.feats : (o && o.srd && F ? F : []);
    return list.filter(f => f.lvl === lv).map(f => f.name);
  }

  // Marca nos caminhos quais são automáticos (e quais existem no BG3).
  const BG3 = { barbarian: ['berserker', 'totem'], bard: ['lore', 'valor', 'swords'], cleric: ['life', 'knowledge', 'trickery', 'war', 'light', 'nature', 'tempest'], druid: ['land', 'moon'], fighter: ['champion', 'battlemaster', 'eldritch', 'arcanearcher'], monk: ['openhand', 'shadow', 'elements', 'drunken'], paladin: ['devotion', 'ancients', 'vengeance'], ranger: ['hunter', 'beast', 'gloom'], rogue: ['thief', 'assassin', 'arcanetrickster', 'swashbuckler'], sorcerer: ['draconic', 'wildmagic', 'storm', 'shadow'], warlock: ['fiend', 'archfey', 'greatold', 'hexblade'], wizard: ['abjuration', 'conjuration', 'divination', 'enchantment', 'evocation', 'illusion', 'necromancy', 'transmutation'] };
  Object.entries(BG3).forEach(([cls, ids]) => ids.forEach(id => {
    const o = CF.PATHS && CF.PATHS.classes[cls] && CF.PATHS.classes[cls].options.find(x => x.id === id);
    if (o) { o.bg3 = true; o.auto = !!o.srd || !!(SUBS[cls + '.' + id] && SUBS[cls + '.' + id].feats); }
  }));

  CF.PROG = { FEATS, POOLS, CLASS_PICKS, SUBS, BG3, featById, poolItems, defs, isComplete, pending, abilityBonus, chosenFeats, collect, spellGrants, automated, subFeatureNames, asiLevels };
})();
