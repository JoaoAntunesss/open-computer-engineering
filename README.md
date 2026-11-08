# Engenharia Informática Aberta

Um curso de **Engenharia Informática completo e gratuito**, em português e inglês. Não é só uma lista de links: tem **lições escritas**, **exercícios resolvidos**, um **trilho guiado** que te diz sempre o que fazer a seguir e uma **placa de circuito em 3D** que acende à medida que aprendes.

Cada cadeira junta o que ensinam o **IST, FEUP, UMinho, Universidade Aberta, MIT, Harvard, Oxford, Stanford, CMU e Berkeley**.

<p align="center"><img src="docs/inicio.jpg" width="100%" alt="Página inicial com a placa de circuito do curso em 3D"></p>

**Site:** [joaoantunesss.github.io/open-computer-engineering](https://joaoantunesss.github.io/open-computer-engineering/)

## O que tem

- **Trilho guiado.** O botão *Continuar* e o painel *O teu próximo passo* levam-te sempre à lição seguinte. O curso está dividido em fases (a Fase 0, seis semestres, uma fase avançada e as fases Júnior e Sénior, para depois do curso) e cada cadeira mostra o seu estado: concluída, em curso, pronta a começar ou à espera de pré-requisitos.
- **O curso como uma placa de circuito em 3D.** Cada cadeira é um chip que se ergue da placa, os tópicos são os componentes à volta dele e os pré-requisitos são as pistas de cobre. O que já dominas acende cor de fogo e envia impulsos pelas pistas. Dá para rodar, aproximar, deslizar e abrir qualquer chip. É feita em WebGL com Three.js, abre com uma sequência cinematográfica na página inicial e tem versões alternativas: uma placa em Canvas 2D para browsers sem WebGL e uma versão estática para quem reduz o movimento.
- **Lições completas.** Explicação, exemplos de código, erros comuns e exercícios com a solução escondida até a abrires. Já escritas: *Ferramentas do Programador* (terminal, shell, editores, Git, GitHub, SSH, depuração, Markdown e LaTeX), *Introdução à Programação* (de variáveis a recursão, tipos abstratos, testes e complexidade), *Lógica* (de tabelas de verdade a Prolog, SAT e completude) *Cálculo* (limites, derivadas, integrais, séries de Taylor, várias variáveis, descida do gradiente e equações diferenciais), *Álgebra Linear* (de vetores e eliminação de Gauss a valores próprios, mínimos quadrados e SVD) e *Ética e Profissão* (códigos de ética, RGPD, licenças, enviesamento, acessibilidade e comunicação técnica). O 1.º semestre do 1.º ano está completo; do 2.º semestre já há *Programação Imperativa em C* (compilação, apontadores, memória dinâmica, listas ligadas, tabelas de dispersão, ficheiros, gdb e Valgrind).
- **Fase 0, para quem usa IA e ainda não sabe ler nem escrever código.** Ler código com tabelas de rastreio, depurar, escrever do zero sem IA, rever código gerado por IA e ler as linguagens do curso (Python, C, Java, JavaScript, SQL, Haskell, Prolog e Assembly). Os exemplos em Python e JavaScript correm no próprio browser: prevês o resultado, mudas o código e carregas em *Correr*.
- **Depois do curso: Júnior e Sénior.** Trabalhar em equipa, testes e CI, backend com FastAPI, PostgreSQL, Docker e deploy gratuito; arquitetura, produção e fiabilidade, segurança e liderança técnica.
- **46 cadeiras**, do zero ao nível sénior, todas com lições escritas na Fase 0, Júnior e Sénior.
- **Programas e linguagens** usados em cada cadeira, e **livros e cursos gratuitos e legais** (MIT OpenCourseWare, CS50, OSTEP, Crafting Interpreters, …).
- **Equivalências entre universidades**: em cada cadeira, a cadeira correspondente em cada universidade, com ligação ao plano de estudos.
- **O teu progresso** fica guardado no browser, com exportação e importação para mudares de computador.
- **Pesquisa e filtros** por semestre, área, dificuldade e estado.

<p align="center"><img src="docs/proximo-passo.jpg" width="49%" alt="O teu próximo passo"> <img src="docs/trilho.jpg" width="49%" alt="O trilho por fases"></p>
<p align="center"><img src="docs/rede.jpg" width="49%" alt="A placa de circuito do curso em 3D"> <img src="docs/licao.jpg" width="49%" alt="Uma lição com a lista de tópicos da cadeira"></p>
<p align="center"><img src="docs/cadeira.jpg" width="49%" alt="Página de uma cadeira: pré-requisitos e o que vem a seguir"></p>

## Publicar no GitHub Pages

1. **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
2. Ramo `main`, pasta `/ (root)`, **Save**.
3. Em um ou dois minutos o site fica em `https://<utilizador>.github.io/open-computer-engineering/`.

## Correr localmente

    python3 -m http.server 8000      # depois abre http://localhost:8000

Não há passo de compilação: é HTML, CSS e JavaScript simples. As dependências externas são o Three.js e o Pyodide (Python no browser, só carregado quando alguém carrega em *Correr*), ambos do jsDelivr.

## Escrever lições

Cada lição é um ficheiro Markdown em `conteudo/<id-da-cadeira>/<n>.md`, onde `n` é o número do tópico, a contar de 1. Os blocos `??? Soluções` … `???` ficam escondidos até o leitor os abrir. Um bloco de código marcado como ` ```python run ` ou ` ```js run ` fica editável e com o botão *Correr*. Depois de editar, corre:

    node scripts/build-lessons.mjs

que gera `js/lessons.js`.

## Estrutura

    index.html            página única (rotas com #/)
    style.css             todo o design
    js/data*.js           as cadeiras: tópicos, tarefas, programas, livros e equivalências (data5.js: Fase 0, Júnior e Sénior)
    js/lessons.js         lições (gerado a partir de conteudo/)
    js/placa3d.js         a placa de circuito em WebGL (Three.js, carregado do jsDelivr)
    js/placa.js           a mesma placa em Canvas 2D, usada quando não há WebGL
    js/app.js             trilho, páginas, progresso e pesquisa
    conteudo/             lições em Markdown
    docs/                 capturas de ecrã deste README

## Fontes

Os nomes das cadeiras de cada universidade vêm dos planos de estudos oficiais (ligações na página *Sobre* do site). Os planos mudam de ano para ano: confirma sempre no site da universidade. Os livros e cursos ligados pertencem aos seus autores; este projeto só os organiza e liga.

Tipos de letra: Bricolage Grotesque, Figtree e JetBrains Mono (SIL Open Font License), servidos pelo Google Fonts.
