/*
 * Character Forge — antecedentes do Livro do Jogador.
 * Proficiências, idiomas e dinheiro inicial são dados de regra; nomes, páginas e resumos curtos e originais.
 * Os detalhes completos (itens, características, tabelas de personalidade) ficam no livro, na página indicada.
 */
(function () {
  const R = CF.RULES;
  R.toolLists.artisan = R.artisanTools;
  R.toolLists.games = ['Conjunto de dados', 'Baralho', 'Xadrez de dragão', 'Jogo dos Três Dragões'];

  Object.assign(R.backgrounds.acolyte, { src: 'srd', page: 129, gold: 15 });
  R.backgrounds.custom.gold = 10;

  const add = (id, o) => {
    R.gear['bg_' + id] = { name: 'Itens do antecedente (' + o.name + ')', desc: 'Roupas e pertences típicos — lista completa no Livro do Jogador, p. ' + o.page + '.' };
    R.backgrounds[id] = Object.assign({ src: 'ldj', languages: 0, tools: [], toolChoice: null, equipment: ['bg_' + id] }, o);
  };
  add('guildartisan', {
    name: 'Artesão de Guilda', page: 130, skills: ['insight', 'persuasion'], toolChoice: { count: 1, list: 'artisan', label: 'Ferramenta de artesão' }, languages: 1, gold: 15,
    tagline: 'Artesão habilidoso, membro de uma guilda de comerciantes.',
    feature: { name: 'Contatos da guilda', desc: 'A guilda oferece apoio, abrigo e contatos influentes (em troca de uma mensalidade).' }
  });
  add('entertainer', {
    name: 'Artista', page: 131, skills: ['acrobatics', 'performance'], tools: ['Kit de disfarce'], toolChoice: { count: 1, list: 'instruments', label: 'Instrumento musical' }, gold: 15,
    tagline: 'Vive de se apresentar: música, dança, acrobacia ou teatro.',
    feature: { name: 'Fama de palco', desc: 'Consegue hospedagem e comida simples em troca de apresentações, e as pessoas te reconhecem.' }
  });
  add('charlatan', {
    name: 'Charlatão', page: 133, skills: ['deception', 'sleight'], tools: ['Kit de disfarce', 'Kit de falsificação'], gold: 15,
    tagline: 'Golpista de lábia afiada, mestre em enganar.',
    feature: { name: 'Identidade falsa', desc: 'Tem uma segunda identidade completa, com documentos e contatos, e sabe imitar papéis que já viu.' }
  });
  add('criminal', {
    name: 'Criminoso', page: 134, skills: ['deception', 'stealth'], tools: ['Ferramentas de ladrão'], toolChoice: { count: 1, list: 'games', label: 'Jogo' }, gold: 15,
    tagline: 'Tem experiência fora da lei e contatos no submundo.',
    feature: { name: 'Contato no submundo', desc: 'Conhece alguém de confiança na rede criminosa para levar mensagens e trazer informações.' }
  });
  add('hermit', {
    name: 'Eremita', page: 135, skills: ['medicine', 'religion'], tools: ['Kit de herbalismo'], languages: 1, gold: 5,
    tagline: 'Passou anos isolado, em busca de respostas.',
    feature: { name: 'A descoberta', desc: 'No isolamento você descobriu um segredo importante. Combine com o mestre o que é.' }
  });
  add('outlander', {
    name: 'Forasteiro', page: 136, skills: ['athletics', 'survival'], toolChoice: { count: 1, list: 'instruments', label: 'Instrumento musical' }, languages: 1, gold: 10,
    tagline: 'Cresceu longe da civilização, nas terras selvagens.',
    feature: { name: 'Andarilho', desc: 'Ótima memória para mapas e terrenos; acha comida e água para até 5 pessoas por dia na natureza.' }
  });
  add('folkhero', {
    name: 'Herói do Povo', page: 137, skills: ['animal', 'survival'], tools: ['Veículos terrestres'], toolChoice: { count: 1, list: 'artisan', label: 'Ferramenta de artesão' }, gold: 10,
    tagline: 'Gente simples que se tornou a esperança da sua vila.',
    feature: { name: 'Abrigo do povo', desc: 'Pessoas comuns te escondem e ajudam, desde que você não as coloque em perigo.' }
  });
  add('sailor', {
    name: 'Marinheiro', page: 138, skills: ['athletics', 'perception'], tools: ['Ferramentas de navegador', 'Veículos aquáticos'], gold: 10,
    tagline: 'Passou anos a bordo de navios, enfrentando tempestades.',
    feature: { name: 'Lugar a bordo', desc: 'Consegue viagens gratuitas de navio para você e o grupo, trabalhando durante a travessia.' }
  });
  add('noble', {
    name: 'Nobre', page: 139, skills: ['history', 'persuasion'], toolChoice: { count: 1, list: 'games', label: 'Jogo' }, languages: 1, gold: 25,
    tagline: 'Nasceu em família rica e com títulos.',
    feature: { name: 'Privilégios de berço', desc: 'É bem recebido na alta sociedade e consegue audiências com nobres e autoridades.' }
  });
  add('urchin', {
    name: 'Órfão', page: 140, skills: ['sleight', 'stealth'], tools: ['Kit de disfarce', 'Ferramentas de ladrão'], gold: 10,
    tagline: 'Cresceu sozinho e pobre nas ruas da cidade.',
    feature: { name: 'Atalhos da cidade', desc: 'Conhece becos e passagens; fora de combate, atravessa cidades com o dobro da velocidade.' }
  });
  add('sage', {
    name: 'Sábio', page: 141, skills: ['arcana', 'history'], languages: 2, gold: 10,
    tagline: 'Passou anos estudando livros e pergaminhos.',
    feature: { name: 'Pesquisador', desc: 'Quando não sabe algo, geralmente sabe onde ou com quem descobrir.' }
  });
  add('soldier', {
    name: 'Soldado', page: 142, skills: ['athletics', 'intimidation'], tools: ['Veículos terrestres'], toolChoice: { count: 1, list: 'games', label: 'Jogo' }, gold: 10,
    tagline: 'Serviu em um exército, milícia ou guarda.',
    feature: { name: 'Patente militar', desc: 'Soldados leais à sua antiga força reconhecem sua patente e podem ajudar.' }
  });

  // o antecedente personalizado fica por último
  const custom = R.backgrounds.custom;
  delete R.backgrounds.custom;
  R.backgrounds.custom = custom;
})();
