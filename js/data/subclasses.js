/*
 * Character Forge — caminhos (subclasses) e trilhas de evolução até o nível 12.
 *
 * Nomes e páginas referenciam o Livro do Jogador (LdJ) e o Guia de Xanathar para Todas as Coisas (Xanathar)
 * nas edições em português usadas pelo grupo. As descrições abaixo são RESUMOS ORIGINAIS e curtos,
 * pensados para orientar a escolha — as regras completas de cada caminho estão no livro indicado.
 * Só os caminhos do SRD 5.1 (Vida, Linhagem Dracônica, Corruptor) têm efeitos calculados na ficha.
 */
window.CF = window.CF || {};

CF.PATHS = {
  levelCap: 12,
  sources: {
    srd: { short: 'SRD', name: 'SRD 5.1 (regras abertas)' },
    ldj: { short: 'LdJ', name: 'Livro do Jogador' },
    xge: { short: 'Xanathar', name: 'Guia de Xanathar para Todas as Coisas' }
  },
  roleNames: {
    frente: 'Linha de frente', dano: 'Dano', cura: 'Cura', suporte: 'Suporte', controle: 'Controle',
    social: 'Social', pericias: 'Perícias', exploracao: 'Exploração', mobilidade: 'Mobilidade', utilidade: 'Utilidade', furtivo: 'Furtividade'
  },

  classes: {
    barbarian: {
      term: 'Caminho Primitivo', pickLevel: 3, featureLevels: [3, 6, 10],
      options: [
        { id: 'berserker', srd: true, name: 'Caminho do Furioso', src: 'ldj', page: 49, beginner: true, roles: ['dano', 'frente'],
          pitch: 'Fúria pura: troca cautela por ataques extras e golpes brutais.', rumo: 'Vira uma máquina de dano corpo a corpo, difícil de assustar ou enfeitiçar, mas que se cansa se exagerar.' },
        { id: 'totem', name: 'Caminho do Guerreiro Totêmico', src: 'ldj', page: 50, beginner: true, roles: ['frente', 'exploracao'],
          pitch: 'Um espírito animal (urso, águia, lobo…) guia sua fúria.', rumo: 'Escolhas por nível mudam o estilo: tanque quase indestrutível, batedor ágil ou parceiro que abre espaço para o grupo.' },
        { id: 'ancestral', name: 'Caminho do Guardião Ancestral', src: 'xge', page: 9, roles: ['frente', 'suporte'],
          pitch: 'Espíritos dos antepassados protegem seus aliados.', rumo: 'O inimigo que você golpeia tem dificuldade de ferir o resto do grupo — um protetor de verdade.' },
        { id: 'storm', name: 'Caminho do Arauto da Tempestade', src: 'xge', page: 10, roles: ['dano', 'controle'],
          pitch: 'Sua fúria vem com uma aura de deserto, mar ou tundra.', rumo: 'Causa dano ou protege quem está perto de você toda rodada, como uma tempestade ambulante.' },
        { id: 'zealot', name: 'Caminho do Fanático', src: 'xge', page: 11, roles: ['dano', 'frente'],
          pitch: 'Guerreiro de um deus que luta com fervor sagrado.', rumo: 'Dano extra divino e uma teimosia sobrenatural em continuar lutando mesmo à beira da morte.' }
      ]
    },
    bard: {
      term: 'Colégio de Bardo', pickLevel: 3, featureLevels: [3, 6],
      options: [
        { id: 'lore', srd: true, name: 'Colégio do Conhecimento', src: 'ldj', page: 54, beginner: true, roles: ['suporte', 'utilidade', 'pericias'],
          pitch: 'O sabe-tudo do grupo: mais perícias e magias de outras listas.', rumo: 'Atrapalha os inimigos com palavras afiadas e aprende magias que normalmente seriam de outras classes.' },
        { id: 'valor', name: 'Colégio da Bravura', src: 'ldj', page: 55, beginner: true, roles: ['suporte', 'frente'],
          pitch: 'Bardo que vai para a luta: armaduras médias, escudo e armas.', rumo: 'Mistura canção e espada, com ataque extra e inspiração que ajuda aliados a acertar e se defender.' },
        { id: 'glamour', name: 'Colégio do Glamour', src: 'xge', page: 14, roles: ['suporte', 'social', 'controle'],
          pitch: 'Encanto feérico: presença magnética e apresentações hipnóticas.', rumo: 'Movimenta aliados pelo campo e encanta multidões; ótimo para mesas com muita interpretação.' },
        { id: 'swords', name: 'Colégio das Espadas', src: 'xge', page: 15, roles: ['dano', 'mobilidade'],
          pitch: 'Artista de lâminas: malabarismo com espadas como espetáculo.', rumo: 'Usa a inspiração para golpes acrobáticos que causam dano, empurram ou protegem.' },
        { id: 'whispers', name: 'Colégio dos Sussurros', src: 'xge', page: 16, roles: ['dano', 'social', 'furtivo'],
          pitch: 'Espião e chantagista: segredos são sua arma.', rumo: 'Dano psíquico com a inspiração e truques de infiltração e manipulação. Combina com campanhas de intriga.' }
      ]
    },
    cleric: {
      term: 'Domínio Divino', pickLevel: 1, featureLevels: [1, 2, 6, 8],
      options: [
        { id: 'life', name: 'Domínio da Vida', src: 'ldj', page: 70, srd: true, beginner: true, roles: ['cura', 'frente'], grants: { armor: ['heavy'] },
          pitch: 'O curandeiro clássico, com armadura pesada.', rumo: 'Curas cada vez mais fortes e golpes abençoados. É o “salva-vidas” do grupo. ' },
        { id: 'knowledge', name: 'Domínio do Conhecimento', src: 'ldj', page: 66, roles: ['utilidade', 'pericias'],
          pitch: 'Sacerdote estudioso, com idiomas e perícias de conhecimento.', rumo: 'Descobre segredos, lê pensamentos e resolve mistérios. Mais útil fora do combate.' },
        { id: 'trickery', name: 'Domínio da Enganação', src: 'ldj', page: 67, roles: ['furtivo', 'suporte'],
          pitch: 'Servo de um deus trapaceiro: ilusões e furtividade.', rumo: 'Cria duplicatas ilusórias e ajuda aliados a passarem despercebidos.' },
        { id: 'war', name: 'Domínio da Guerra', src: 'ldj', page: 68, beginner: true, roles: ['frente', 'dano'], grants: { armor: ['heavy'], weapons: ['martial'] },
          pitch: 'Clérigo guerreiro, com armas marciais e armadura pesada.', rumo: 'Ataques extras abençoados e bônus para acertar no momento decisivo.' },
        { id: 'light', name: 'Domínio da Luz', src: 'ldj', page: 68, beginner: true, roles: ['dano', 'controle'],
          pitch: 'Fogo e luz sagrados: o clérigo que causa muito dano.', rumo: 'Magias de fogo poderosas e um clarão que ofusca os inimigos. Funciona quase como um mago divino.' },
        { id: 'nature', name: 'Domínio da Natureza', src: 'ldj', page: 69, roles: ['controle', 'utilidade'], grants: { armor: ['heavy'] },
          pitch: 'Sacerdote da natureza, com armadura pesada e um truque druídico.', rumo: 'Encanta animais e plantas e acrescenta dano elemental aos golpes.' },
        { id: 'tempest', name: 'Domínio da Tempestade', src: 'ldj', page: 69, beginner: true, roles: ['dano', 'frente'], grants: { armor: ['heavy'], weapons: ['martial'] },
          pitch: 'Trovão e relâmpago, com armadura pesada e armas marciais.', rumo: 'Pune quem te ataca e maximiza o dano de raios e trovões.' },
        { id: 'forge', name: 'Domínio da Forja', src: 'xge', page: 23, roles: ['frente', 'utilidade'], grants: { armor: ['heavy'] },
          pitch: 'Ferreiro divino: abençoa armas e armaduras.', rumo: 'Uma das CAs mais altas do jogo e resistência a fogo. Um tanque sagrado.' },
        { id: 'grave', name: 'Domínio da Sepultura', src: 'xge', page: 24, roles: ['cura', 'suporte'],
          pitch: 'Guardião da fronteira entre a vida e a morte.', rumo: 'Levanta aliados caídos com eficiência e deixa inimigos vulneráveis aos golpes do grupo.' }
      ]
    },
    druid: {
      term: 'Círculo Druídico', pickLevel: 2, featureLevels: [2, 6, 10],
      options: [
        { id: 'land', srd: true, name: 'Círculo da Terra', src: 'ldj', page: 75, beginner: true, roles: ['controle', 'utilidade'],
          pitch: 'Conjurador focado em magias, ligado a um tipo de terreno.', rumo: 'Mais magias preparadas e recuperação de espaços de magia. Para quem gosta de lançar feitiços.' },
        { id: 'moon', name: 'Círculo da Lua', src: 'ldj', page: 76, beginner: true, roles: ['frente', 'controle'],
          pitch: 'Vira feras grandes e perigosas para lutar.', rumo: 'Transforma-se em animais cada vez mais fortes e, mais tarde, em elementais.' },
        { id: 'dreams', name: 'Círculo dos Sonhos', src: 'xge', page: 27, roles: ['cura', 'suporte'],
          pitch: 'Ligado às fadas: cura e proteção ao redor da fogueira.', rumo: 'Um curandeiro natural que também protege o acampamento e teletransporta o grupo.' },
        { id: 'shepherd', name: 'Círculo do Pastor', src: 'xge', page: 28, roles: ['suporte', 'controle'],
          pitch: 'Invoca espíritos e protege criaturas convocadas.', rumo: 'Totens espirituais que fortalecem o grupo e criaturas invocadas mais resistentes.' }
      ]
    },
    fighter: {
      term: 'Arquétipo Marcial', pickLevel: 3, featureLevels: [3, 7, 10],
      options: [
        { id: 'champion', srd: true, name: 'Campeão', src: 'ldj', page: 85, beginner: true, roles: ['dano', 'frente'],
          pitch: 'Simples e eficiente: acerta críticos com mais facilidade.', rumo: 'Cada vez mais atlético e resistente. A opção ideal para quem quer poucas regras.' },
        { id: 'battlemaster', name: 'Mestre de Batalha', src: 'ldj', page: 87, beginner: true, roles: ['dano', 'controle'],
          pitch: 'Tático com manobras: derrubar, desarmar, comandar aliados.', rumo: 'Mais manobras e dados de superioridade maiores; muitas decisões interessantes a cada turno.' },
        { id: 'eldritch', name: 'Cavaleiro Arcano', src: 'ldj', page: 86, roles: ['frente', 'utilidade'],
          pitch: 'Guerreiro que aprende magias de mago (proteção e dano).', rumo: 'Mistura ataques e magias no mesmo turno. Bom para quem quer experimentar magia sem largar a espada.' },
        { id: 'arcanearcher', name: 'Arqueiro Arcano', src: 'xge', page: 38, roles: ['dano', 'controle'],
          pitch: 'Flechas encantadas com efeitos mágicos.', rumo: 'Disparos especiais que banem, cegam ou atravessam inimigos. O mestre do arco.' },
        { id: 'cavalier', name: 'Cavaleiro', src: 'xge', page: 39, roles: ['frente', 'suporte'],
          pitch: 'Defensor montado que marca e prende inimigos.', rumo: 'Protege aliados próximos e pune quem os ataca. Excelente em montaria.' },
        { id: 'samurai', name: 'Samurai', src: 'xge', page: 41, beginner: true, roles: ['dano', 'social'],
          pitch: 'Disciplina e determinação: rajadas de ataques precisos.', rumo: 'Ganha vantagem quando precisa e se torna difícil de derrubar. Também ajuda em situações sociais.' }
      ]
    },
    monk: {
      term: 'Tradição Monástica', pickLevel: 3, featureLevels: [3, 6, 11],
      options: [
        { id: 'openhand', srd: true, name: 'Caminho da Mão Aberta', src: 'ldj', page: 105, beginner: true, roles: ['dano', 'controle'],
          pitch: 'Mestre das artes marciais clássicas.', rumo: 'Golpes que derrubam e empurram, além de autocura. O monge mais direto.' },
        { id: 'shadow', name: 'Caminho da Sombra', src: 'ldj', page: 106, roles: ['furtivo', 'mobilidade'],
          pitch: 'Ninja: usa chi para criar escuridão e silêncio.', rumo: 'Teletransporta-se entre sombras e ataca de surpresa.' },
        { id: 'elements', name: 'Caminho dos Quatro Elementos', src: 'ldj', page: 106, roles: ['controle', 'dano'],
          pitch: 'Dobra fogo, água, ar e terra com o chi.', rumo: 'Efeitos elementais variados, mas que gastam bastante chi. Mais complexo.' },
        { id: 'drunken', name: 'Estilo do Mestre Bêbado', src: 'xge', page: 50, roles: ['mobilidade', 'dano'],
          pitch: 'Luta cambaleante e imprevisível.', rumo: 'Entra e sai do combate sem levar golpes e redireciona ataques inimigos.' },
        { id: 'kensei', name: 'Estilo do Kensei', src: 'xge', page: 51, beginner: true, roles: ['dano'],
          pitch: 'Monge mestre de armas específicas, incluindo arcos.', rumo: 'Armas como extensão do corpo: mais dano e defesa com elas.' },
        { id: 'sunsoul', name: 'Estilo da Alma Solar', src: 'xge', page: 52, beginner: true, roles: ['dano'],
          pitch: 'Dispara raios de luz radiante.', rumo: 'Ataques de luz à distância e explosões em área. Um monge que luta de longe.' }
      ]
    },
    paladin: {
      term: 'Juramento Sagrado', pickLevel: 3, featureLevels: [3, 7],
      options: [
        { id: 'devotion', srd: true, name: 'Juramento de Devoção', src: 'ldj', page: 112, beginner: true, roles: ['frente', 'suporte'],
          pitch: 'O cavaleiro honrado clássico.', rumo: 'Arma abençoada, imunidade a enfeitiçamento para o grupo e luz contra o mal.' },
        { id: 'ancients', name: 'Juramento dos Anciões', src: 'ldj', page: 112, roles: ['frente', 'suporte'],
          pitch: 'Defensor da luz e da natureza.', rumo: 'Uma aura que protege aliados contra magias. Excelente contra conjuradores.' },
        { id: 'vengeance', name: 'Juramento de Vingança', src: 'ldj', page: 114, beginner: true, roles: ['dano'],
          pitch: 'Caçador implacável de um inimigo jurado.', rumo: 'Fixa um alvo e não o deixa escapar, com muito dano.' },
        { id: 'conquest', name: 'Juramento da Conquista', src: 'xge', page: 54, roles: ['controle', 'frente'],
          pitch: 'Domina pelo medo e pela força.', rumo: 'Aterroriza inimigos e os prende perto de você.' },
        { id: 'redemption', name: 'Juramento da Redenção', src: 'xge', page: 55, roles: ['suporte', 'social'],
          pitch: 'Pacifista armado: a violência é o último recurso.', rumo: 'Absorve o dano dos aliados e devolve a dor a quem ataca.' }
      ]
    },
    ranger: {
      term: 'Conclave de Patrulheiro', pickLevel: 3, featureLevels: [3, 7, 11],
      note: 'No PDF do Livro do Jogador que vocês usam, o Patrulheiro aparece na versão revisada (com “conclaves”). O Character Forge calcula o 1º nível pelo patrulheiro oficial do SRD — confirme com o mestre qual versão a mesa usa.',
      options: [
        { id: 'hunter', srd: true, name: 'Conclave do Caçador', src: 'ldj', page: 120, beginner: true, roles: ['dano'],
          pitch: 'Especialista em derrubar monstros grandes ou grupos.', rumo: 'Você escolhe técnicas de ataque e defesa por nível. Versátil e direto.' },
        { id: 'beast', name: 'Conclave da Besta', src: 'ldj', page: 119, roles: ['dano', 'exploracao'],
          pitch: 'Luta ao lado de um companheiro animal.', rumo: 'Você e o animal ficam mais coordenados e fortes juntos.' },
        { id: 'deepstalker', name: 'Conclave do Rastreador Subterrâneo', src: 'ldj', page: 121, roles: ['furtivo', 'dano'],
          pitch: 'Caçador dos subterrâneos e da escuridão.', rumo: 'Emboscadas no escuro. Esta opção vem da versão revisada presente no PDF — combine com o mestre.' },
        { id: 'gloom', name: 'Perseguidor Obscuro', src: 'xge', page: 58, beginner: true, roles: ['dano', 'furtivo'],
          pitch: 'Caçador das trevas: invisível no escuro e ótimo na primeira rodada.', rumo: 'Começa as lutas com ataques extras e fica muito difícil de ver.' },
        { id: 'horizon', name: 'Andarilho do Horizonte', src: 'xge', page: 59, roles: ['dano', 'mobilidade'],
          pitch: 'Guardião contra ameaças de outros planos.', rumo: 'Teleporte curto entre ataques e dano de força. Muita mobilidade.' },
        { id: 'monsterslayer', name: 'Exterminador de Monstros', src: 'xge', page: 60, roles: ['dano', 'controle'],
          pitch: 'Especialista em criaturas sobrenaturais.', rumo: 'Estuda a presa e anula as magias e poderes dela.' }
      ]
    },
    rogue: {
      term: 'Arquétipo de Ladino', pickLevel: 3, featureLevels: [3, 9],
      options: [
        { id: 'thief', srd: true, name: 'Ladrão', src: 'ldj', page: 92, beginner: true, roles: ['pericias', 'mobilidade'],
          pitch: 'Mãos rápidas: usa itens e escala como ninguém.', rumo: 'Usa objetos como ação bônus e se move com agilidade incrível.' },
        { id: 'assassin', name: 'Assassino', src: 'ldj', page: 92, roles: ['dano', 'furtivo'],
          pitch: 'Disfarce e golpes devastadores na primeira rodada.', rumo: 'Brilha em emboscadas e infiltração com identidades falsas.' },
        { id: 'arcanetrickster', name: 'Trapaceiro Arcano', src: 'ldj', page: 92, roles: ['utilidade', 'controle'],
          pitch: 'Ladino com magias de ilusão e encantamento.', rumo: 'A mão mágica invisível rouba e distrai. Mistura truques e furtividade.' },
        { id: 'inquisitive', name: 'Inquiridor', src: 'xge', page: 43, roles: ['pericias', 'social'],
          pitch: 'Detetive: percebe mentiras e acha pistas.', rumo: 'Lê os inimigos para garantir ataques furtivos. Ótimo em campanhas de mistério.' },
        { id: 'mastermind', name: 'Mentor', src: 'xge', page: 44, roles: ['suporte', 'social'],
          pitch: 'Estrategista que ajuda aliados à distância.', rumo: 'Imita sotaques e redireciona ataques. Ideal para intriga política.' },
        { id: 'scout', name: 'Batedor', src: 'xge', page: 45, beginner: true, roles: ['exploracao', 'mobilidade'],
          pitch: 'Explorador ágil das áreas selvagens.', rumo: 'Recua sem levar golpes e lidera o grupo na exploração.' },
        { id: 'swashbuckler', name: 'Espadachim', src: 'xge', page: 45, beginner: true, roles: ['dano', 'social'],
          pitch: 'Duelista charmoso que luta um contra um.', rumo: 'Ataque furtivo sem precisar de aliado por perto e muito carisma em combate.' }
      ]
    },
    sorcerer: {
      term: 'Origem de Feitiçaria', pickLevel: 1, featureLevels: [1, 6],
      options: [
        { id: 'draconic', name: 'Linhagem Dracônica', src: 'ldj', page: 80, srd: true, beginner: true, roles: ['dano'],
          pitch: 'Sangue de dragão: mais PV e pele resistente.', rumo: 'Reforça as magias do elemento do seu dragão e, mais tarde, ganha asas. ' },
        { id: 'wildmagic', name: 'Magia Selvagem', src: 'ldj', page: 81, roles: ['dano', 'utilidade'],
          pitch: 'Magia caótica e imprevisível.', rumo: 'Surtos aleatórios (às vezes bons, às vezes engraçados) e controle sobre a sorte. Divertido para mesas descontraídas.' },
        { id: 'divinesoul', name: 'Alma Favorecida', src: 'xge', page: 34, beginner: true, roles: ['cura', 'dano'],
          pitch: 'Alma tocada pelos deuses: acesso às magias de clérigo.', rumo: 'Feiticeiro que também cura e protege. Muito flexível.' },
        { id: 'shadow', name: 'Adepto das Sombras', src: 'xge', page: 34, roles: ['controle', 'furtivo'],
          pitch: 'Magia vinda do Pendor das Sombras.', rumo: 'Enxerga na escuridão mágica, resiste à morte e invoca um cão sombrio.' },
        { id: 'storm', name: 'Feiticeiro da Tempestade', src: 'xge', page: 35, roles: ['dano', 'mobilidade'],
          pitch: 'Poder dos ventos e raios.', rumo: 'Voa um pouco depois de conjurar e resiste a raios e trovões.' }
      ]
    },
    warlock: {
      term: 'Patrono', pickLevel: 1, featureLevels: [1, 6, 10],
      options: [
        { id: 'fiend', name: 'O Corruptor', src: 'ldj', page: 60, srd: true, beginner: true, roles: ['dano'],
          pitch: 'Pacto com um ser infernal.', rumo: 'Ganha vida temporária ao derrubar inimigos e magias de fogo. ' },
        { id: 'archfey', name: 'A Arquifada', src: 'ldj', page: 59, roles: ['controle', 'social'],
          pitch: 'Pacto com um senhor das fadas.', rumo: 'Encanta e amedronta inimigos e some em névoa quando ameaçado.' },
        { id: 'greatold', name: 'O Grande Antigo', src: 'ldj', page: 60, roles: ['controle', 'social'],
          pitch: 'Pacto com uma entidade incompreensível.', rumo: 'Telepatia e proteção mental. Ótimo para histórias de horror e mistério.' },
        { id: 'celestial', name: 'O Celestial', src: 'xge', page: 18, beginner: true, roles: ['cura', 'dano'],
          pitch: 'Pacto com um ser de luz.', rumo: 'Um bruxo que cura aliados e causa dano radiante.' },
        { id: 'hexblade', name: 'A Lâmina Maldita', src: 'xge', page: 19, beginner: true, roles: ['frente', 'dano'],
          pitch: 'Pacto com uma arma senciente das sombras.', rumo: 'Ataca com Carisma, usa armadura média e escudo e amaldiçoa um alvo.' }
      ]
    },
    wizard: {
      term: 'Tradição Arcana', pickLevel: 2, featureLevels: [2, 6, 10],
      options: [
        { id: 'abjuration', name: 'Escola de Abjuração', src: 'ldj', page: 97, beginner: true, roles: ['suporte', 'frente'],
          pitch: 'Especialista em proteção e escudos mágicos.', rumo: 'Um escudo arcano absorve o dano. É o mago mais resistente.' },
        { id: 'divination', name: 'Escola de Adivinhação', src: 'ldj', page: 98, roles: ['controle', 'utilidade'],
          pitch: 'Vê o futuro e manipula a sorte.', rumo: 'Guarda resultados de dados para trocar pelos de qualquer um. Muito poderoso.' },
        { id: 'conjuration', name: 'Escola de Conjuração', src: 'ldj', page: 98, roles: ['utilidade', 'controle'],
          pitch: 'Cria objetos e se teletransporta.', rumo: 'Mobilidade com teleporte e criaturas invocadas mais duráveis.' },
        { id: 'enchantment', name: 'Escola de Encantamento', src: 'ldj', page: 99, roles: ['controle', 'social'],
          pitch: 'Controla mentes e emoções.', rumo: 'Hipnotiza inimigos e redireciona ataques.' },
        { id: 'evocation', srd: true, name: 'Escola de Evocação', src: 'ldj', page: 99, beginner: true, roles: ['dano'],
          pitch: 'Bolas de fogo sem queimar os amigos.', rumo: 'Protege aliados das suas explosões e aumenta o dano dos truques.' },
        { id: 'illusion', name: 'Escola de Ilusão', src: 'ldj', page: 100, roles: ['controle', 'utilidade'],
          pitch: 'Mestre de enganos visuais e sonoros.', rumo: 'Ilusões que mudam no meio da cena e, depois, ganham partes reais.' },
        { id: 'necromancy', name: 'Escola de Necromancia', src: 'ldj', page: 100, roles: ['controle', 'dano'],
          pitch: 'Lida com a morte e mortos-vivos.', rumo: 'Recupera vida ao derrubar inimigos e comanda mortos-vivos mais fortes. Converse com o mestre sobre o tom!' },
        { id: 'transmutation', name: 'Escola de Transmutação', src: 'ldj', page: 101, roles: ['utilidade'],
          pitch: 'Altera a matéria: alquimia e transformação.', rumo: 'Uma pedra mágica que concede bônus e transformações mais eficientes.' },
        { id: 'warmagic', name: 'Mago de Guerra', src: 'xge', page: 47, beginner: true, roles: ['dano', 'frente'],
          pitch: 'Mistura defesa e ataque mágico.', rumo: 'Reações defensivas e bônus na iniciativa. Um mago mais robusto.' }
      ]
    }
  },

  /* Marcos da classe até o nível 12 (resumos originais). */
  milestones: {
    barbarian: { 2: ['Ataque Descuidado e Sentido de Perigo'], 3: ['Fúria: 3 usos'], 5: ['Ataque Extra', '+3 m de deslocamento'], 6: ['Fúria: 4 usos'], 7: ['Instinto Selvagem (vantagem na iniciativa)'], 9: ['Crítico Brutal (+1 dado no crítico)', 'Dano da Fúria +3'], 11: ['Fúria Implacável (resistir a cair a 0 PV)'], 12: ['Fúria: 5 usos'] },
    bard: { 2: ['Versatilidade (metade da proficiência em testes sem treino)', 'Canção de Descanso'], 3: ['Especialização em 2 perícias'], 5: ['Inspiração vira d8 e volta no descanso curto'], 6: ['Contraencanto (proteção contra medo e enfeitiçamento)'], 10: ['Inspiração d10', '+2 especializações', 'Segredos Mágicos (magias de qualquer lista)'] },
    cleric: { 2: ['Canalizar Divindade (Expulsar Mortos-Vivos + poder do domínio)'], 5: ['Destruir Mortos-Vivos'], 6: ['Canalizar Divindade 2×/descanso'], 10: ['Intervenção Divina (pedir ajuda direta ao seu deus)'] },
    druid: { 2: ['Forma Selvagem (virar animal)'], 4: ['Formas que nadam'], 8: ['Formas que voam'] },
    fighter: { 2: ['Surto de Ação (ação extra 1×/descanso)'], 5: ['Ataque Extra (2 ataques)'], 9: ['Indomável (rolar de novo uma resistência)'], 11: ['3 ataques por ação'] },
    monk: { 2: ['Chi: rajada de golpes, defesa paciente, passo do vento', 'Movimento sem armadura'], 3: ['Defletir Projéteis'], 4: ['Queda Lenta'], 5: ['Ataque Extra', 'Golpe Atordoante'], 6: ['Golpes desarmados contam como mágicos'], 7: ['Evasão', 'Mente Tranquila'], 10: ['Pureza Corporal (imune a doenças e venenos)'] },
    paladin: { 2: ['Estilo de Luta', 'Magias de paladino', 'Destruição Divina (smite)'], 3: ['Saúde Divina (imune a doenças)'], 5: ['Ataque Extra'], 6: ['Aura de Proteção (+CAR nas resistências de aliados próximos)'], 10: ['Aura de Coragem'], 11: ['Destruição Divina Aprimorada (+1d8 radiante em todo acerto)'] },
    ranger: { 2: ['Estilo de Luta', 'Magias de patrulheiro'], 3: ['Consciência Primitiva'], 5: ['Ataque Extra'], 6: ['+1 inimigo e +1 terreno favoritos'], 8: ['Caminhar pela Terra'], 10: ['Esconder-se à Plena Vista', '+1 terreno favorito'] },
    rogue: { 2: ['Ação Ardilosa (correr, desengajar ou esconder como ação bônus)'], 3: ['Ataque Furtivo 2d6'], 5: ['Esquiva Sobrenatural (dano pela metade)', 'Ataque Furtivo 3d6'], 6: ['+2 especializações'], 7: ['Evasão', 'Ataque Furtivo 4d6'], 9: ['Ataque Furtivo 5d6'], 11: ['Talento Confiável (mínimo 10 no d20 em perícias treinadas)', 'Ataque Furtivo 6d6'] },
    sorcerer: { 2: ['Pontos de Feitiçaria'], 3: ['Metamagia (2 opções)'], 10: ['+1 Metamagia'] },
    warlock: { 2: ['Invocações Místicas (2)'], 3: ['Dádiva do Pacto (corrente, lâmina ou tomo)'], 5: ['Invocações: 3'], 7: ['Invocações: 4'], 9: ['Invocações: 5'], 11: ['Arcana Mística (uma magia de 6º círculo por dia)', '3 espaços de magia'], 12: ['Invocações: 6'] },
    wizard: { 2: ['Grimório cresce 2 magias por nível'] }
  },
  casterType: { bard: 'full', cleric: 'full', druid: 'full', sorcerer: 'full', wizard: 'full', warlock: 'pact', paladin: 'half', ranger: 'half' },
  extraAttack: ['barbarian', 'fighter', 'monk', 'paladin', 'ranger'],
  asi: { default: [4, 8, 12], fighter: [4, 6, 8, 12], rogue: [4, 8, 10, 12] }
};

/** Monta a trilha nível a nível (1–12) de uma classe, opcionalmente com o caminho escolhido. */
CF.PATHS.track = function (classId, subId) {
  const P = CF.PATHS, pc = P.classes[classId];
  if (!pc) return [];
  const sub = pc.options.find(o => o.id === subId);
  const out = [];
  const cantrips = ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'].includes(classId);
  for (let lv = 1; lv <= P.levelCap; lv++) {
    const items = [];
    const named = sub && CF.PROG ? CF.PROG.subFeatureNames(classId, sub.id, lv) : [];
    if (lv === pc.pickLevel) items.push({ k: 'pick', t: `Escolhe ${pc.term.toLowerCase()}` + (sub ? `: ${sub.name}` : '') + (named.length ? ` — ${named.join(', ')}` : '') });
    else if (named.length) items.push({ k: 'sub', t: `${sub.name}: ${named.join(', ')}` });
    else if (pc.featureLevels.includes(lv)) items.push({ k: 'sub', t: `Nova habilidade do ${pc.term.toLowerCase()}` + (sub ? ` (${sub.name})` : '') });
    if (CF.PROG) {
      const picks = (CF.PROG.CLASS_PICKS[classId] || []).filter(d => d.lvl === lv).concat(sub && CF.PROG.SUBS[classId + '.' + sub.id] && CF.PROG.SUBS[classId + '.' + sub.id].picks ? CF.PROG.SUBS[classId + '.' + sub.id].picks.filter(d => d.lvl === lv) : []);
      picks.forEach(d => items.push({ k: 'choice', t: 'Escolha: ' + d.label + (d.n > 1 && !/\d/.test(d.label) ? ` (${d.n})` : '') }));
    }
    (P.asi[classId] || P.asi.default).includes(lv) && items.push({ k: 'asi', t: 'Aumento de atributo (+2) ou talento' });
    if (lv === 5 && P.extraAttack.includes(classId) && !(P.milestones[classId][5] || []).some(x => x.startsWith('Ataque Extra'))) items.push({ k: 'atk', t: 'Ataque Extra' });
    const ct = P.casterType[classId];
    const circle = ct === 'full' || ct === 'pact' ? { 3: 2, 5: 3, 7: 4, 9: 5 }[lv] : ct === 'half' ? { 2: 1, 5: 2, 9: 3 }[lv] : null;
    if (circle) items.push({ k: 'spell', t: `Magias de ${circle}º círculo` });
    if (ct === 'full' && lv === 11) items.push({ k: 'spell', t: 'Magias de 6º círculo' });
    if (cantrips && (lv === 5 || lv === 11)) items.push({ k: 'spell', t: 'Truques de dano ficam mais fortes' });
    (P.milestones[classId][lv] || []).forEach(t => items.push({ k: 'class', t }));
    if (lv === 1) items.unshift({ k: 'class', t: 'Personagem criado (é aqui que o Character Forge te ajuda!)' });
    out.push({ lv, items, key: lv === pc.pickLevel || pc.featureLevels.includes(lv) });
  }
  return out;
};
