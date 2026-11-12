# ⚒️ Character Forge

Assistente web, em português, para **criar personagens de D&D 5e passo a passo** — feito para jogadores de primeira viagem.

Ele pergunta o que você quer jogar, explica cada escolha com linguagem simples e **faz todas as contas da ficha** (PV, CA, modificadores, perícias, ataques, CD de magia…). No final, você imprime ou salva a ficha em PDF.

## O que tem

| Módulo | O que faz |
|---|---|
| **Criador guiado** | 10 etapas: conceito → classe → espécie → antecedente → atributos → perícias e magias → equipamento → história → revisão → ficha final. Prévia da ficha atualizada em tempo real. |
| **Aba Ficha (edição livre)** | A ficha de jogo depois da criação: subir de nível (até 12, com PV, proficiência, espaços de magia e recursos recalculados), PV atuais e temporários com botões de dano/cura, testes contra a morte, condições, espaços e recursos gastos, descansos curto/longo, ajuste manual de qualquer número (com botão para voltar ao automático), perícias, ataques, itens, moedas, magias e recursos personalizados, habilidades novas e anotações. Tudo vai para a ficha impressa/PDF. |
| **Caminhos e trilhas (nível 1–12)** | Todas as subclasses do Livro do Jogador e do Guia de Xanathar, com página de referência, resumo do estilo e “para onde vai” até o nível 12. O jogador marca o caminho planejado (ou escolhe já no 1º nível, no caso de Clérigo, Feiticeiro e Bruxo), e a ficha mostra a trilha nível a nível. |
| **Recomendações** | Antecedentes (os 13 do Livro do Jogador + personalizado), idiomas e ferramentas sugeridos conforme classe, caminho e espécie, com o motivo de cada sugestão. |
| **Habilidades automáticas** | Todas as habilidades de classe do nível 1 ao 12 calculadas na ficha (Ataque Furtivo, Fúria, chi, Aura de Proteção, ataques extras, deslocamento etc.), nos 12 caminhos do SRD e nos 36 caminhos do Livro do Jogador/Xanathar que também existem no Baldur's Gate 3. Nos demais caminhos, a ficha indica nível e página do livro. |
| **Evolução no estilo BG3** | Quadro “Evolução: escolhas por nível” na ficha: aumento de atributo ou talento (os 42 talentos do Livro do Jogador, com os do BG3 em destaque), estilos de luta, especializações, manobras, metamagias, invocações, dádiva do pacto, disciplinas elementais, disparos arcanos, totens, companheiro animal, terreno do druida etc. A ficha aplica os efeitos (atributos, CA, iniciativa, PV, perícias, resistências, recursos, magias do caminho). |
| **Descubra seu aventureiro** | Quiz de 5 perguntas que recomenda as 3 classes que mais combinam com você. |
| **Ficha inteligente** | Cálculo automático de PV, CA (testa todas as opções e usa a melhor), iniciativa, resistências, perícias, ataques, CD e ataque mágico, recursos de classe. Validação de regras com atalhos para corrigir. |
| **Gerador de histórias** | Perguntas de origem (motivação, medo, confiança, objetivo, segredo) com ideias clicáveis e um rascunho editável. |
| **Grupo (Party Builder)** | O mestre vê a composição do grupo e cria vínculos entre os personagens. As fichas entram pela mesa ao vivo ou colando o código de cada jogador. |
| **Mesa ao vivo** | O mestre cria a mesa na aba Grupo e manda o link de convite. Cada jogador conecta o personagem uma vez; depois disso, toda alteração salva na ficha (nível, PV, magias, itens…) aparece sozinha na aba Grupo do mestre, em segundos. |
| **Tutorial de combate** | Encontro com um goblin usando a sua ficha, com dados de verdade e explicação da regra a cada jogada. |
| **Glossário** | Termos como CA, vantagem, truque e concentração explicados sem complicação (também aparecem como dica ao clicar nos termos sublinhados). |

## Como usar com os amigos

1. O mestre abre **Grupo**, clica em **Criar mesa ao vivo** e manda o **link de convite** no WhatsApp/Discord.
2. Cada jogador abre o link, escolhe o personagem (ou cria um) e clica em **Conectar**.
3. Pronto: quando o jogador altera a ficha, a aba Grupo do mestre se atualiza sozinha.

Sem a mesa ao vivo, ainda dá para usar **Copiar código para o mestre** → **Colar código de personagem** (nesse caso, a ficha não se atualiza sozinha).

O progresso fica salvo no navegador de cada pessoa, sem cadastro. A mesa ao vivo usa o Firebase (Google) com login anônimo: só as fichas conectadas a uma mesa são enviadas, e só quem tem o link da mesa consegue lê-las. As regras de acesso estão em `firestore.rules` (cada jogador só altera a própria ficha; o mestre pode removê-las da mesa).

## Regras e licença do conteúdo

- Edição: **D&D 5ª edição (2014)**, usando apenas o conteúdo aberto do **SRD 5.1**, no **1º nível**: 12 classes (com a subclasse do SRD quando ela vem no 1º nível), 9 espécies, o antecedente Acólito + um antecedente personalizado, magias de truque e 1º nível, arranjo padrão / compra de pontos / valores rolados.
- Os textos explicativos em português são originais.
- **Caminhos (subclasses):** nomes e páginas do *Livro do Jogador* e do *Guia de Xanathar para Todas as Coisas*, com resumos próprios e curtos das mecânicas — as regras completas ficam no livro. Têm trilha automática os caminhos do SRD e os que também existem no *Baldur's Gate 3* (as regras seguem os livros; o BG3 serve de modelo para quais caminhos automatizar e para o sistema de escolhas por nível). Nos demais caminhos, a ficha indica a página para anotar as habilidades com o mestre.
- A campanha vai até o **nível 12**, então as trilhas param aí.

> This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC, available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode. Character Forge não é afiliado à Wizards of the Coast.

## Estrutura

```
index.html               página única (rotas por #hash)
css/styles.css           tema visual + layout de impressão da ficha
js/data/rules-srd51.js   TODAS as regras (classes, espécies, armas, magias…) — troque este arquivo para mudar de edição
js/data/content.js       conteúdo didático: conceitos, quiz, glossário, ideias de história
js/data/backgrounds-ldj.js antecedentes do Livro do Jogador (proficiências e resumos próprios)
js/data/features.js      habilidades de classe por nível e caminhos do SRD
js/data/progression.js   evolução no estilo BG3: talentos, escolhas por nível e caminhos automáticos
js/data/spell-desc.js    resumos próprios das magias do SRD até o 6º círculo
js/data/spells-index.js  índice de magias por classe e círculo (nome, escola, página)
js/recommend.js          recomendações de antecedente, idiomas e ferramentas
js/data/subclasses.js    caminhos (subclasses) por classe e marcos de evolução até o nível 12
js/engine.js             motor de cálculo e validação (sem lógica visual)
js/sheet.js              aba Ficha: ficha de jogo editável
js/live.js               mesa ao vivo (Firebase: login anônimo + Firestore, carregado só quando usado)
js/app.js                interface
firestore.rules          regras de acesso do banco da mesa ao vivo (cópia do que está publicado no Firebase)
```

Não precisa de build: é HTML, CSS e JavaScript puro. Para rodar localmente, abra o `index.html` no navegador ou sirva a pasta:

```bash
python -m http.server 8000
```

## Próximos passos (roadmap da proposta)

- Fase 2: retrato do personagem e mais opções de conteúdo (definidas pelo mestre).
- Fase 3: campanha online compartilhada — primeira parte pronta (mesa ao vivo com Firebase); falta login com conta para usar a mesma ficha em vários aparelhos.
- Fase 4: modo “companion” para a sessão (controle de PV, espaços de magia, recursos).
- Fase 5: assistência de IA para narrativa, com regras sempre validadas pelo motor.
