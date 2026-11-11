/*
 * Character Forge — habilidades de classe por nível (2–12) e caminhos do SRD.
 * Baseado nas regras abertas do SRD 5.1 (CC BY 4.0); textos explicativos originais e resumidos.
 * Cada "desc" recebe o contexto { L (nível), m (modificadores), PB (proficiência) } e devolve o texto já calculado.
 */
window.CF = window.CF || {};
(function () {
  const sg = n => (n >= 0 ? '+' : '−') + Math.abs(n);
  const atLeast1 = n => Math.max(1, n);

  CF.FEATURES = {
    classes: {
      barbarian: [
        { lvl: 2, name: 'Ataque Descuidado', desc: () => 'No primeiro ataque do turno, pode atacar com vantagem (Força, corpo a corpo); em troca, ataques contra você também têm vantagem até seu próximo turno.' },
        { lvl: 2, name: 'Sentido de Perigo', desc: () => 'Vantagem em resistências de Destreza contra efeitos que você consegue ver (armadilhas, magias), se não estiver cego, surdo ou incapacitado.' },
        { lvl: 5, name: 'Ataque Extra', desc: () => 'Ataca duas vezes quando usa a ação Atacar.' },
        { lvl: 5, name: 'Movimento Rápido', desc: () => '+3 m de deslocamento quando não está usando armadura pesada (já somado na ficha).' },
        { lvl: 7, name: 'Instinto Selvagem', desc: () => 'Vantagem na iniciativa; se for surpreendido, pode agir no primeiro turno se entrar em Fúria.' },
        { lvl: 9, name: 'Crítico Brutal', desc: ({ L }) => `Num acerto crítico corpo a corpo, role ${L >= 13 ? 2 : 1} dado de dano da arma a mais.` },
        { lvl: 11, name: 'Fúria Implacável', desc: () => 'Em Fúria, ao cair a 0 PV sem morrer, faça resistência de Constituição CD 10 (+5 a cada uso até o descanso) para ficar com 1 PV.' }
      ],
      bard: [
        { lvl: 2, name: 'Versatilidade', desc: ({ PB }) => `Soma +${Math.floor(PB / 2)} (metade da proficiência) em testes de atributo sem proficiência, incluindo a iniciativa (já somado na ficha).` },
        { lvl: 2, name: 'Canção de Descanso', desc: ({ L }) => `Em descanso curto, aliados que gastarem Dados de Vida recuperam 1d${L >= 13 ? 10 : L >= 9 ? 8 : 6} PV extras.` },
        { lvl: 3, name: 'Especialização', desc: () => 'Escolha 2 perícias em que é proficiente: o bônus de proficiência dobra nelas (marque ◆ nas perícias).' },
        { lvl: 5, name: 'Fonte de Inspiração', desc: () => 'Sua Inspiração Bárdica volta também no descanso curto.' },
        { lvl: 6, name: 'Contraencanto', desc: () => 'Ação: até o fim do seu próximo turno, você e aliados a até 9 m têm vantagem em resistências contra medo e enfeitiçamento.' },
        { lvl: 10, name: 'Especialização (mais 2)', desc: () => 'Mais 2 perícias com bônus de proficiência dobrado.' },
        { lvl: 10, name: 'Segredos Mágicos', desc: () => 'Aprende 2 magias de qualquer classe (use “Segredos Mágicos” no quadro de magias).' }
      ],
      cleric: [
        { lvl: 2, name: 'Canalizar Divindade', desc: ({ L }) => `${L >= 6 ? 2 : 1} uso(s) por descanso curto. Inclui Expulsar Mortos-Vivos e o poder do seu domínio.` },
        { lvl: 2, name: 'Expulsar Mortos-Vivos', desc: ({ m, PB }) => `Ação: mortos-vivos a até 9 m fazem resistência de Sabedoria CD ${8 + PB + m.wis} ou fogem de você por 1 minuto.` },
        { lvl: 5, name: 'Destruir Mortos-Vivos', desc: ({ L }) => `Mortos-vivos de ND ${L >= 11 ? '2' : L >= 8 ? '1' : '1/2'} ou menor que falharem contra Expulsar são destruídos.` },
        { lvl: 10, name: 'Intervenção Divina', desc: ({ L }) => `Ação: pede ajuda direta ao seu deus. Role d100: com ${L} ou menos, ele intervém (1 vez por semana se der certo).` }
      ],
      druid: [
        { lvl: 2, name: 'Forma Selvagem', desc: ({ L }) => `2 usos por descanso curto. Vira uma fera já vista de ND até ${L >= 8 ? '1' : L >= 4 ? '1/2' : '1/4'}${L >= 8 ? '' : L >= 4 ? ' (sem voo)' : ' (sem voo nem natação)'}, por até ${Math.floor(L / 2)} hora(s).` }
      ],
      fighter: [
        { lvl: 2, name: 'Surto de Ação', desc: () => 'Uma vez por descanso curto, ganha uma ação extra no seu turno.' },
        { lvl: 5, name: 'Ataque Extra', desc: ({ L }) => `Ataca ${L >= 11 ? 3 : 2} vezes quando usa a ação Atacar.` },
        { lvl: 9, name: 'Indomável', desc: () => 'Uma vez por descanso longo, rola de novo uma resistência que falhou.' }
      ],
      monk: [
        { lvl: 2, name: 'Chi', desc: ({ L, m, PB }) => `${L} pontos por descanso curto. Rajada de Golpes (2 golpes desarmados como ação bônus), Defesa Paciente (Esquivar como ação bônus) e Passo do Vento (Disparada ou Desengajar como ação bônus e salto dobrado). CD do chi: ${8 + PB + m.wis}.` },
        { lvl: 2, name: 'Movimento sem Armadura', desc: ({ L }) => `+${L >= 10 ? '6' : L >= 6 ? '4,5' : '3'} m de deslocamento sem armadura e sem escudo (já somado na ficha)${L >= 9 ? '; pode correr por paredes e sobre líquidos no seu turno' : ''}.` },
        { lvl: 3, name: 'Defletir Projéteis', desc: ({ L, m }) => `Reação: reduz o dano de um ataque à distância em 1d10 ${sg(m.dex)} ${L}; se zerar, pode gastar 1 chi para arremessá-lo de volta.` },
        { lvl: 4, name: 'Queda Lenta', desc: ({ L }) => `Reação: reduz o dano de queda em ${5 * L}.` },
        { lvl: 5, name: 'Ataque Extra', desc: () => 'Ataca duas vezes quando usa a ação Atacar.' },
        { lvl: 5, name: 'Golpe Atordoante', desc: ({ m, PB }) => `Ao acertar um ataque corpo a corpo, gaste 1 chi: o alvo faz resistência de Constituição CD ${8 + PB + m.wis} ou fica atordoado até o fim do seu próximo turno.` },
        { lvl: 6, name: 'Golpes de Chi', desc: () => 'Seus golpes desarmados contam como mágicos.' },
        { lvl: 7, name: 'Evasão', desc: () => 'Em resistências de Destreza para sofrer metade do dano, não sofre nada se passar e metade se falhar.' },
        { lvl: 7, name: 'Mente Tranquila', desc: () => 'Ação: encerra em você um efeito de enfeitiçado ou amedrontado.' },
        { lvl: 10, name: 'Pureza Corporal', desc: () => 'Imune a doenças e venenos.' }
      ],
      paladin: [
        { lvl: 2, name: 'Destruição Divina', desc: () => 'Ao acertar corpo a corpo, gaste um espaço de magia: +2d8 radiante (+1d8 por círculo acima do 1º, máx. 5d8; +1d8 contra mortos-vivos e corruptores).' },
        { lvl: 3, name: 'Saúde Divina', desc: () => 'Imune a doenças.' },
        { lvl: 5, name: 'Ataque Extra', desc: () => 'Ataca duas vezes quando usa a ação Atacar.' },
        { lvl: 6, name: 'Aura de Proteção', desc: ({ m }) => `Você e aliados a até 3 m somam ${sg(atLeast1(m.cha))} em todas as resistências enquanto você estiver consciente (já somado nas suas).` },
        { lvl: 10, name: 'Aura de Coragem', desc: () => 'Você e aliados a até 3 m não podem ficar amedrontados enquanto você estiver consciente.' },
        { lvl: 11, name: 'Destruição Divina Aprimorada', desc: () => 'Todo acerto com arma corpo a corpo causa +1d8 radiante.' }
      ],
      ranger: [
        { lvl: 3, name: 'Consciência Primitiva', desc: () => 'Gaste um espaço de magia para sentir, por alguns minutos, se há certos tipos de criatura (aberrações, dragões, mortos-vivos…) por perto.' },
        { lvl: 5, name: 'Ataque Extra', desc: () => 'Ataca duas vezes quando usa a ação Atacar.' },
        { lvl: 6, name: 'Inimigo e Terreno Favoritos (melhoria)', desc: () => 'Escolha mais um inimigo favorito e mais um terreno favorito.' },
        { lvl: 8, name: 'Caminhar pela Terra', desc: () => 'Terreno difícil não mágico não te atrasa; vantagem contra plantas mágicas que atrapalham o movimento.' },
        { lvl: 10, name: 'Esconder-se à Plena Vista', desc: () => 'Com 1 minuto de preparo, camufla-se: +10 em Furtividade enquanto ficar parado.' }
      ],
      rogue: [
        { lvl: 2, name: 'Ação Ardilosa', desc: () => 'Pode usar Disparada, Desengajar ou Esconder como ação bônus.' },
        { lvl: 5, name: 'Esquiva Sobrenatural', desc: () => 'Reação: quando um atacante que você vê te acerta, o dano cai pela metade.' },
        { lvl: 6, name: 'Especialização (mais 2)', desc: () => 'Mais 2 perícias (ou ferramentas de ladrão) com proficiência dobrada.' },
        { lvl: 7, name: 'Evasão', desc: () => 'Em resistências de Destreza para sofrer metade do dano, não sofre nada se passar e metade se falhar.' },
        { lvl: 11, name: 'Talento Confiável', desc: () => 'Em testes de perícias treinadas, qualquer resultado 9 ou menos no d20 conta como 10.' }
      ],
      sorcerer: [
        { lvl: 2, name: 'Fonte de Magia', desc: ({ L }) => `${L} pontos de feitiçaria por descanso longo. Converta pontos em espaços de magia (ação bônus) ou espaços em pontos.` },
        { lvl: 3, name: 'Metamagia', desc: ({ L }) => `Conhece ${L >= 10 ? 3 : 2} opções de Metamagia para modificar magias gastando pontos (ex.: Acelerar, Sutil, Distante, Gêmea).` }
      ],
      warlock: [
        { lvl: 2, name: 'Invocações Místicas', desc: ({ L }) => `Conhece ${L >= 12 ? 6 : L >= 9 ? 5 : L >= 7 ? 4 : L >= 5 ? 3 : 2} invocações (anote as suas no quadro de habilidades).` },
        { lvl: 3, name: 'Dádiva do Pacto', desc: () => 'Escolha: Pacto da Corrente (familiar especial), Pacto da Lâmina (arma de pacto) ou Pacto do Tomo (3 truques extras de qualquer classe).' },
        { lvl: 11, name: 'Arcana Mística', desc: () => 'Escolha uma magia de bruxo de 6º círculo: conjure-a uma vez por descanso longo sem gastar espaço.' }
      ],
      wizard: [
        { lvl: 2, name: 'Grimório em crescimento', desc: ({ L }) => `A cada nível você copia 2 magias de mago no grimório (${6 + 2 * (L - 1)} magias até agora, sem contar as encontradas em aventuras).` }
      ]
    },

    /* Caminhos do SRD (os demais caminhos mostram nível e página do livro). */
    subclasses: {
      berserker: [
        { lvl: 3, name: 'Frenesi', desc: () => 'Ao entrar em Fúria, pode ficar em frenesi: ataque corpo a corpo extra como ação bônus a cada turno; ao terminar, ganha 1 nível de exaustão.' },
        { lvl: 6, name: 'Fúria Inconsciente', desc: () => 'Em Fúria, não pode ser enfeitiçado nem amedrontado (efeitos ativos ficam suspensos).' },
        { lvl: 10, name: 'Presença Intimidante', desc: ({ m, PB }) => `Ação: uma criatura a até 9 m faz resistência de Sabedoria CD ${8 + PB + m.cha} ou fica amedrontada até o fim do seu próximo turno (pode estender).` }
      ],
      lore: [
        { lvl: 3, name: 'Proficiências Bônus', desc: () => 'Ganha proficiência em 3 perícias à sua escolha (marque ● nas perícias da ficha).' },
        { lvl: 3, name: 'Palavras Cortantes', desc: () => 'Reação: gaste uma Inspiração Bárdica para subtrair o dado de um ataque, teste ou dano de uma criatura a até 18 m.' },
        { lvl: 6, name: 'Segredos Mágicos Adicionais', desc: () => 'Aprende 2 magias de qualquer classe (use “Segredos Mágicos” no quadro de magias).' }
      ],
      life: [
        { lvl: 2, name: 'Canalizar: Preservar a Vida', desc: ({ L }) => `Ação: distribui ${5 * L} PV de cura entre criaturas a até 9 m (cada uma até metade do PV máximo).` },
        { lvl: 6, name: 'Curandeiro Abençoado', desc: () => 'Ao curar outra criatura com magia de 1º círculo ou maior, você também recupera 2 + o círculo da magia.' },
        { lvl: 8, name: 'Golpe Divino', desc: ({ L }) => `Uma vez por turno, ao acertar com arma: +${L >= 14 ? 2 : 1}d8 radiante.` }
      ],
      land: [
        { lvl: 2, name: 'Truque Bônus', desc: () => 'Aprende um truque de druida extra.' },
        { lvl: 2, name: 'Recuperação Natural', desc: ({ L }) => `Uma vez por dia, no descanso curto, recupera espaços de magia somando até ${Math.ceil(L / 2)} círculos (nenhum de 6º ou maior).` },
        { lvl: 3, name: 'Magias de Círculo', desc: () => 'Conforme o terreno escolhido (ártico, litoral, deserto, floresta, planície, montanha, pântano ou subterrâneo), ganha magias sempre preparadas nos níveis 3, 5, 7 e 9.' },
        { lvl: 6, name: 'Caminhar pela Terra', desc: () => 'Terreno difícil não mágico não te atrasa; vantagem contra plantas mágicas que atrapalham o movimento.' },
        { lvl: 10, name: 'Proteção da Natureza', desc: () => 'Não pode ser enfeitiçado nem amedrontado por elementais ou fadas e é imune a veneno e doenças.' }
      ],
      champion: [
        { lvl: 3, name: 'Crítico Aprimorado', desc: () => 'Seus ataques com arma são críticos com 19 ou 20 no d20.' },
        { lvl: 7, name: 'Atleta Notável', desc: ({ PB }) => `Soma +${Math.ceil(PB / 2)} em testes de Força, Destreza e Constituição sem proficiência (inclui iniciativa; já somado na ficha).` },
        { lvl: 10, name: 'Estilo de Luta Adicional', desc: () => 'Escolha um segundo Estilo de Luta.' }
      ],
      openhand: [
        { lvl: 3, name: 'Técnica da Mão Aberta', desc: ({ m, PB }) => `Na Rajada de Golpes, cada acerto pode derrubar (Destreza), empurrar 4,5 m (Força) ou impedir reações — CD ${8 + PB + m.wis}.` },
        { lvl: 6, name: 'Integridade Corporal', desc: ({ L }) => `Ação: recupera ${3 * L} PV, uma vez por descanso longo.` },
        { lvl: 11, name: 'Tranquilidade', desc: ({ m, PB }) => `Ao terminar um descanso longo, fica sob o efeito de Santuário (CD ${8 + PB + m.wis}) até atacar ou conjurar.` }
      ],
      devotion: [
        { lvl: 3, name: 'Canalizar: Arma Sagrada', desc: ({ m }) => `Ação: por 1 minuto sua arma brilha e soma ${sg(atLeast1(m.cha))} nos ataques.` },
        { lvl: 3, name: 'Canalizar: Expulsar o Profano', desc: ({ m, PB }) => `Ação: corruptores e mortos-vivos a até 9 m fazem resistência de Sabedoria CD ${8 + PB + m.cha} ou fogem.` },
        { lvl: 7, name: 'Aura de Devoção', desc: () => 'Você e aliados a até 3 m não podem ser enfeitiçados enquanto você estiver consciente.' }
      ],
      hunter: [
        { lvl: 3, name: 'Presa do Caçador', desc: () => 'Escolha: Matador de Colossos (+1d8 em alvo ferido, 1×/turno), Assassino de Gigantes (reação contra criaturas Grandes) ou Quebra-Hordas (ataque extra em criatura adjacente ao alvo).' },
        { lvl: 7, name: 'Táticas Defensivas', desc: () => 'Escolha: Escapar da Horda, Defesa contra Múltiplos Ataques ou Vontade de Aço (vantagem contra medo).' },
        { lvl: 11, name: 'Ataque Múltiplo', desc: () => 'Escolha: Saraivada (ataque à distância contra todos numa área) ou Ataque Giratório (ataque corpo a corpo contra todos ao redor).' }
      ],
      thief: [
        { lvl: 3, name: 'Mãos Rápidas', desc: () => 'A Ação Ardilosa também serve para Prestidigitação, usar ferramentas de ladrão ou a ação Usar um Objeto.' },
        { lvl: 3, name: 'Trabalho de Segundo Andar', desc: ({ m }) => `Escalar não custa movimento extra e seus saltos com corrida vão ${Math.max(0, m.dex) * 0.3 ? (Math.max(0, m.dex) * 0.3).toFixed(1).replace('.', ',') + ' m' : 'um pouco'} mais longe.` },
        { lvl: 9, name: 'Furtividade Suprema', desc: () => 'Vantagem em Furtividade se mover no máximo metade do deslocamento no turno.' }
      ],
      draconic: [
        { lvl: 6, name: 'Afinidade Elemental', desc: ({ m }) => `Magias do elemento do seu dragão causam ${sg(m.cha)} de dano extra; gaste 1 ponto de feitiçaria para ganhar resistência a esse elemento por 1 hora.` }
      ],
      fiend: [
        { lvl: 6, name: 'Sorte do Próprio Obscuro', desc: () => 'Uma vez por descanso curto, soma 1d10 a um teste de atributo ou resistência.' },
        { lvl: 10, name: 'Resistência Infernal', desc: () => 'Após cada descanso, escolha um tipo de dano para ter resistência até o próximo descanso.' }
      ],
      evocation: [
        { lvl: 2, name: 'Erudito da Evocação', desc: () => 'Copiar magias de evocação no grimório custa metade do tempo e do ouro.' },
        { lvl: 2, name: 'Esculpir Magias', desc: () => 'Ao lançar evocação em área, escolha aliados (1 + círculo da magia): eles passam automaticamente e não sofrem dano.' },
        { lvl: 6, name: 'Truque Potente', desc: () => 'Seus truques de dano causam metade do dano mesmo quando o alvo passa na resistência.' },
        { lvl: 10, name: 'Evocação Potencializada', desc: ({ m }) => `Some ${sg(m.int)} ao dano de uma rolagem de magias de evocação.` }
      ]
    },

    /* Magias de caminho: sempre preparadas (always) ou que entram na lista (expanded), por nível. */
    subSpells: {
      life: { mode: 'always', 1: ['Bênção', 'Curar Ferimentos'], 3: ['Restauração Menor', 'Arma Espiritual'], 5: ['Sinal de Esperança', 'Revivificar'], 7: ['Proteção contra a Morte', 'Guardião da Fé'], 9: ['Curar Ferimentos em Massa', 'Reviver os Mortos'] },
      devotion: { mode: 'always', 3: ['Proteção contra o Bem e Mal', 'Santuário'], 5: ['Restauração Menor', 'Zona da Verdade'], 9: ['Sinal de Esperança', 'Dissipar Magia'] },
      fiend: { mode: 'expanded', 1: ['Mãos Flamejantes', 'Comando'], 3: ['Cegueira/Surdez', 'Raio Ardente'], 5: ['Bola de Fogo', 'Névoa Fétida'], 7: ['Escudo de Fogo', 'Muralha de Fogo'], 9: ['Coluna de Chamas', 'Consagrar'] }
    }
  };
})();
