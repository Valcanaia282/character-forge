# ⚒️ Character Forge

Assistente web, em português, para **criar personagens de D&D 5e passo a passo** — feito para jogadores de primeira viagem.

Ele pergunta o que você quer jogar, explica cada escolha com linguagem simples e **faz todas as contas da ficha** (PV, CA, modificadores, perícias, ataques, CD de magia…). No final, você imprime ou salva a ficha em PDF.

## O que tem

| Módulo | O que faz |
|---|---|
| **Criador guiado** | 10 etapas: conceito → classe → espécie → antecedente → atributos → perícias e magias → equipamento → história → revisão → ficha final. Prévia da ficha atualizada em tempo real. |
| **Descubra seu aventureiro** | Quiz de 5 perguntas que recomenda as 3 classes que mais combinam com você. |
| **Ficha inteligente** | Cálculo automático de PV, CA (testa todas as opções e usa a melhor), iniciativa, resistências, perícias, ataques, CD e ataque mágico, recursos de classe. Validação de regras com atalhos para corrigir. |
| **Gerador de histórias** | Perguntas de origem (motivação, medo, confiança, objetivo, segredo) com ideias clicáveis e um rascunho editável. |
| **Grupo (Party Builder)** | O mestre cola o código de cada jogador, vê a composição do grupo e cria vínculos entre os personagens. |
| **Tutorial de combate** | Encontro com um goblin usando a sua ficha, com dados de verdade e explicação da regra a cada jogada. |
| **Glossário** | Termos como CA, vantagem, truque e concentração explicados sem complicação (também aparecem como dica ao clicar nos termos sublinhados). |

## Como usar com os amigos

1. Cada jogador abre o site e clica em **Criar meu personagem**.
2. Na **Ficha final**, clica em **Copiar código para o mestre** e manda no WhatsApp/Discord (ou **Imprimir / Salvar PDF**).
3. O mestre abre **Grupo**, clica em **Colar código de personagem** e cola o código de cada um.

O progresso fica salvo automaticamente no navegador de cada pessoa (não há login nem servidor).

## Regras e licença do conteúdo

- Edição: **D&D 5ª edição (2014)**, usando apenas o conteúdo aberto do **SRD 5.1**, no **1º nível**: 12 classes (com a subclasse do SRD quando ela vem no 1º nível), 9 espécies, o antecedente Acólito + um antecedente personalizado, magias de truque e 1º nível, arranjo padrão / compra de pontos / valores rolados.
- Os textos explicativos em português são originais.

> This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC, available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode. Character Forge não é afiliado à Wizards of the Coast.

## Estrutura

```
index.html               página única (rotas por #hash)
css/styles.css           tema visual + layout de impressão da ficha
js/data/rules-srd51.js   TODAS as regras (classes, espécies, armas, magias…) — troque este arquivo para mudar de edição
js/data/content.js       conteúdo didático: conceitos, quiz, glossário, ideias de história
js/engine.js             motor de cálculo e validação (sem lógica visual)
js/app.js                interface
```

Não precisa de build: é HTML, CSS e JavaScript puro. Para rodar localmente, abra o `index.html` no navegador ou sirva a pasta:

```bash
python -m http.server 8000
```

## Próximos passos (roadmap da proposta)

- Fase 2: retrato do personagem e mais opções de conteúdo (definidas pelo mestre).
- Fase 3: campanha online compartilhada (ex.: Supabase) com login.
- Fase 4: modo “companion” para a sessão (controle de PV, espaços de magia, recursos).
- Fase 5: assistência de IA para narrativa, com regras sempre validadas pelo motor.
