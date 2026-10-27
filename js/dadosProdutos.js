"use strict";

/* Catálogo demonstrativo: os produtos e as imagens ficam definidos em um único arquivo. */
// Cada objeto cria um Produto com os dados usados nos cartões, detalhes e carrinho.
// Preços, avaliações e descrições são exemplos acadêmicos, não uma oferta comercial real.
window.CATALOGO_PRODUTOS = [
  // Eletrônica: kit introdutório para projetos com Arduino e automação.
  new Produto({
    id: "kit-arduino",
    nome: "Kit Arduino para Iniciantes",
    descricao: "Uma base prática para explorar sensores, LEDs e automação.",
    detalhes: "Comece a criar circuitos interativos e protótipos eletrônicos. O kit é indicado para quem está aprendendo programação física e quer experimentar entradas, saídas, sensores e atuadores em projetos próprios.",
    especificacoes: ["Categoria: eletrônica e programação física", "Nível sugerido: iniciante", "Aplicações: LEDs, sensores e automação", "A placa e os componentes devem ser conferidos no kit físico"],
    indicadoPara: "Estudantes, educadores e pessoas que estão começando no universo Arduino.",
    preco: 129.90, precoAnterior: 159.90, categoria: "Eletrônica", avaliacao: 4.9,
    imagem: "assets/images/arduino.png", alt: "Placa Arduino sobre uma bancada de eletrônica", destaque: true
  }),
  // Eletrônica: componentes para aprender circuitos e prototipagem.
  new Produto({
    id: "kit-eletronica",
    nome: "Kit de Eletrônica Criativa",
    descricao: "Componentes para experimentar circuitos e pequenas montagens.",
    detalhes: "Um conjunto demonstrativo para estudar como componentes eletrônicos trabalham juntos. Use-o para planejar circuitos, reconhecer componentes e construir protótipos simples com orientação adequada.",
    especificacoes: ["Categoria: eletrônica", "Nível sugerido: iniciante a intermediário", "Aplicações: circuitos e prototipagem", "Componentes exatos devem ser conferidos antes da compra real"],
    indicadoPara: "Oficinas educativas, experiências de bancada e introdução à eletrônica.",
    preco: 89.90, categoria: "Eletrônica", avaliacao: 4.8,
    imagem: "assets/images/eletronica.png", alt: "Placa de circuito e componentes eletrônicos em close", destaque: true
  }),
  // Impressão 3D: material de consumo para protótipos e peças.
  new Produto({
    id: "filamento-pla",
    nome: "Filamento PLA para Impressão 3D",
    descricao: "Material ilustrativo para protótipos, peças e experimentos 3D.",
    detalhes: "Produto demonstrativo voltado ao tema de fabricação aditiva. Antes de uma compra real, confirme diâmetro, peso do carretel, cor, tolerância e compatibilidade com a impressora utilizada.",
    especificacoes: ["Material ilustrativo: PLA", "Verificar diâmetro compatível com a impressora", "Conferir peso, cor e fabricante no produto real", "Armazenar em local seco"],
    indicadoPara: "Protótipos, objetos decorativos, peças de reposição e atividades maker.",
    preco: 99.90, categoria: "Impressão 3D", avaliacao: 4.9,
    imagem: "assets/images/impressao-3d.png", alt: "Impressora 3D fabricando uma peça sobre a mesa de impressão", destaque: true
  }),
  // Impressão 3D: exemplo de conjunto de peças fabricadas sob medida.
  new Produto({
    id: "pecas-personalizadas",
    nome: "Kit de Peças 3D Personalizadas",
    descricao: "Peças e protótipos para inspirar projetos fabricados em 3D.",
    detalhes: "Uma seleção demonstrativa de peças impressas em 3D para testar encaixes, dimensões e ideias de personalização. A geometria, o acabamento e as medidas variam de acordo com o modelo final.",
    especificacoes: ["Processo: impressão 3D", "Geometria e dimensões conforme o modelo", "Acabamento pode apresentar marcas de camadas", "Confirmar medidas antes de utilizar como peça funcional"],
    indicadoPara: "Quem deseja explorar encaixes, personalização e desenho tridimensional.",
    preco: 74.90, categoria: "Impressão 3D", avaliacao: 4.7,
    imagem: "assets/images/pecas-3d.png", alt: "Impressora 3D e peça em processo de fabricação"
  }),
  // Fabricação digital: materiais para corte, gravação e encaixes.
  new Produto({
    id: "corte-laser",
    nome: "Kit de Materiais para Corte a Laser",
    descricao: "Materiais demonstrativos para placas, encaixes e fabricação digital.",
    detalhes: "Kit conceitual para planejar objetos que utilizam corte e gravação a laser. A escolha do material depende da máquina, potência, espessura e configuração recomendada pelo fabricante.",
    especificacoes: ["Aplicação: corte e gravação a laser", "Material e espessura precisam ser confirmados", "Utilizar somente materiais compatíveis com a máquina", "Operação sob supervisão e com exaustão adequada"],
    indicadoPara: "Pessoas que criam placas, gabaritos, peças planas e objetos com encaixes.",
    preco: 79.90, categoria: "Fabricação digital", avaliacao: 4.8,
    imagem: "assets/images/corte-laser.png", alt: "Máquina de corte a laser trabalhando em uma placa", destaque: true
  }),
  // Fabricação digital: proposta para personalização e gravação a laser.
  new Produto({
    id: "corte-laser-criativo",
    nome: "Kit de Criação com Laser",
    descricao: "Inspiração para gravação, personalização e desenho vetorial.",
    detalhes: "Uma proposta de material para personalizar objetos, testar arquivos vetoriais e aprender sobre gravação e corte. Os arquivos devem ser preparados conforme os requisitos da máquina utilizada.",
    especificacoes: ["Aplicação: personalização e fabricação digital", "Preparação de arquivos vetoriais", "Compatibilidade de materiais deve ser verificada", "A imagem é ilustrativa do processo"],
    indicadoPara: "Atividades de design, personalização, sinalização e criação de protótipos.",
    preco: 59.90, categoria: "Fabricação digital", avaliacao: 4.6,
    imagem: "assets/images/corte-laser-detalhe.png", alt: "Equipamento de corte a laser instalado em uma oficina"
  }),
  // Ferramentas e marcenaria: materiais para construir objetos e protótipos.
  new Produto({
    id: "marcenaria-digital",
    nome: "Kit de Marcenaria Maker",
    descricao: "Combine planejamento, desenho e técnicas de construção em madeira.",
    detalhes: "Uma seleção demonstrativa para projetos que misturam desenho, fabricação digital e acabamento manual. O uso de ferramentas deve respeitar os procedimentos de segurança e os equipamentos de proteção indicados.",
    especificacoes: ["Tema: marcenaria e fabricação", "Uso: planejamento e construção de objetos", "Ferramentas não incluídas salvo indicação explícita", "Materiais e dimensões devem ser definidos no pedido real"],
    indicadoPara: "Projetos de mobiliário pequeno, suportes, organizadores e protótipos.",
    preco: 119.90, categoria: "Ferramentas", avaliacao: 4.7,
    imagem: "assets/images/marcenaria.png", alt: "Pessoa trabalhando madeira em uma oficina de marcenaria"
  }),
  // Robótica: exemplo educativo que integra estrutura, eletrônica e programação.
  new Produto({
    id: "robo-educacional",
    nome: "Kit de Robótica Educacional",
    descricao: "Explore estruturas, sensores e programação em protótipos robóticos.",
    detalhes: "Produto demonstrativo para atividades introdutórias de robótica, integrando estrutura mecânica, eletrônica e lógica de programação. O projeto exato depende dos componentes incluídos e da montagem realizada.",
    especificacoes: ["Tema: robótica educacional", "Áreas: estrutura, eletrônica e programação", "Nível sugerido: iniciante a intermediário", "Verificar a lista de componentes no produto físico"],
    indicadoPara: "Oficinas, trabalhos escolares, clubes de robótica e protótipos interativos.",
    preco: 189.90, precoAnterior: 219.90, categoria: "Robótica", avaliacao: 5.0,
    imagem: "assets/images/robotica.png", alt: "Protótipo eletrônico montado sobre uma bancada de trabalho", destaque: true
  }),
  // Programação: material conceitual para planejar algoritmos e testes.
  new Produto({
    id: "guia-programacao",
    nome: "Caderno de Projetos de Programação",
    descricao: "Organize ideias, algoritmos e experiências antes de codificar.",
    detalhes: "Um produto conceitual para registrar requisitos, fluxos, pseudocódigo, testes e aprendizados durante o desenvolvimento de software. A imagem ilustra o tema da programação e não representa necessariamente a capa física de um caderno.",
    especificacoes: ["Tema: organização de projetos e programação", "Uso: planejamento e registro de testes", "Formato e número de páginas a definir para uma edição física", "Produto ilustrativo para a atividade acadêmica"],
    indicadoPara: "Estudantes de programação e equipes que precisam documentar projetos.",
    preco: 49.90, categoria: "Programação", avaliacao: 4.6,
    imagem: "assets/images/programacao.png", alt: "Pessoa programando em um computador em uma estação de trabalho"
  }),
  // Programação e IA: material demonstrativo para explorar ideias de forma responsável.
  new Produto({
    id: "ia-maker",
    nome: "Laboratório de Ideias com IA",
    descricao: "Material demonstrativo para explorar soluções criativas com IA.",
    detalhes: "Uma proposta de material educativo para discutir usos responsáveis de ferramentas de inteligência artificial na criação, documentação e experimentação de ideias maker. Não inclui acesso pago a serviços de terceiros.",
    especificacoes: ["Tema: inteligência artificial aplicada à criatividade", "Uso: planejamento e exploração de ideias", "Ferramentas externas podem exigir contas próprias", "Não inclui licenças de software de terceiros"],
    indicadoPara: "Pessoas interessadas em prototipagem, pesquisa, criação e tecnologia.",
    preco: 139.90, categoria: "Programação", avaliacao: 4.8,
    imagem: "assets/images/inteligencia-artificial.png", alt: "Representação visual de inteligência artificial em um ambiente digital"
  })
];
