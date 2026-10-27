"use strict";

/*
 * Aplicação da loja: catálogo, consulta, filtros, ordenação, tema,
 * carrinho persistente, cupom, frete e checkout demonstrativo.
 * O carrinho usa os modelos Produto, ItemCarrinho e Carrinho.
 */
(() => {
  const CHAVE_CARRINHO = "fabtech_market_cart_v1";
  const CHAVE_TEMA = "fabtech_market_theme_v1";
  const CHAVE_PEDIDOS = "fabtech_market_orders_v1";
  const FRETE_PADRAO = 19.90;
  const LIMITE_FRETE_GRATIS = 250;
  const VALOR_MINIMO_CUPOM = 100;
  const catalogo = Array.isArray(window.CATALOGO_PRODUTOS) ? window.CATALOGO_PRODUTOS : [];
  const configuracaoLoja = window.CONFIGURACAO_LOJA || {
    nomeRecebedorPix: "FABTECH MARKET",
    cidadeRecebedorPix: "SAO PAULO",
    chavePix: "pix-demo@exemplo.invalid",
    pixDemonstracao: true
  };
  const carrinho = new Carrinho();

  let categoriaAtual = "Todas";
  let cupomAtual = "";
  let temaAtual = "claro";
  let focoAnterior = null;
  let produtoEmDetalhes = null;
  let codigoPixAtual = "";
  let temporizadorMensagemRapida = null;

  // Reúne referências aos elementos do HTML para evitar repetir seletores em cada função.
  const elementos = {
    body: document.body,
    campoBusca: document.querySelector("#campo-busca"),
    formularioBusca: document.querySelector("#form-busca"),
    filtrosCategoria: document.querySelector("#filtros-categoria"),
    ordenar: document.querySelector("#ordenar-produtos"),
    gradeProdutos: document.querySelector("#lista-produtos"),
    modeloCardProduto: document.querySelector("#modelo-card-produto"),
    contadorResultados: document.querySelector("#contador-resultados"),
    estadoVazio: document.querySelector("#estado-vazio"),
    resumoConsulta: document.querySelector("#resumo-consulta"),
    textoConsulta: document.querySelector("#texto-consulta"),
    limparConsulta: document.querySelector("#limpar-consulta"),
    limparFiltros: document.querySelector("#limpar-filtros"),
    contadorCarrinho: document.querySelector("#contador-carrinho"),
    quantidadeTitulo: document.querySelector("#quantidade-no-titulo"),
    abrirCarrinho: document.querySelector("#abrir-carrinho"),
    fecharCarrinho: document.querySelector("#fechar-carrinho"),
    linkCarrinho: document.querySelector("#link-carrinho"),
    painelCarrinho: document.querySelector("#painel-carrinho"),
    sobreposicaoCarrinho: document.querySelector("#sobreposicao-carrinho"),
    listaCarrinho: document.querySelector("#lista-carrinho"),
    carrinhoVazio: document.querySelector("#carrinho-vazio"),
    resumoCarrinho: document.querySelector("#resumo-carrinho"),
    totaisCarrinho: document.querySelector("#totais-carrinho"),
    progressoFrete: document.querySelector("#progresso-frete"),
    formCupom: document.querySelector("#form-cupom"),
    codigoCupom: document.querySelector("#codigo-cupom"),
    feedbackCupom: document.querySelector("#feedback-cupom"),
    limparCarrinho: document.querySelector("#limpar-carrinho"),
    voltarCompras: document.querySelector("#voltar-compras"),
    btnFinalizar: document.querySelector("#btn-finalizar"),
    modalCheckout: document.querySelector("#modal-checkout"),
    fecharCheckout: document.querySelector("#fechar-checkout"),
    cancelarCheckout: document.querySelector("#cancelar-checkout"),
    formCheckout: document.querySelector("#form-checkout"),
    nomeCliente: document.querySelector("#nome-cliente"),
    emailCliente: document.querySelector("#email-cliente"),
    cepCliente: document.querySelector("#cep-cliente"),
    resumoCheckout: document.querySelector("#resumo-checkout"),
    modalSucesso: document.querySelector("#modal-sucesso"),
    mensagemSucesso: document.querySelector("#mensagem-sucesso"),
    numeroPedido: document.querySelector("#numero-pedido"),
    fecharSucesso: document.querySelector("#fechar-sucesso"),
    botaoTema: document.querySelector("#btn-tema"),
    formNewsletter: document.querySelector("#form-newsletter"),
    emailNewsletter: document.querySelector("#email-newsletter"),
    feedbackNewsletter: document.querySelector("#feedback-newsletter"),
    anoAtual: document.querySelector("#ano-atual"),
    regiaoToast: document.querySelector("#regiao-mensagem-rapida"),
    modalDetalhesProduto: document.querySelector("#modal-detalhes-produto"),
    fecharDetalhesProduto: document.querySelector("#fechar-detalhes-produto"),
    fecharDetalhesSecundario: document.querySelector("#fechar-detalhes-secundario"),
    detalhesImagem: document.querySelector("#detalhes-imagem"),
    detalhesCategoria: document.querySelector("#detalhes-categoria"),
    detalhesNome: document.querySelector("#detalhes-nome"),
    detalhesAvaliacao: document.querySelector("#detalhes-avaliacao"),
    detalhesPreco: document.querySelector("#detalhes-preco"),
    detalhesPrecoAnterior: document.querySelector("#detalhes-preco-anterior"),
    detalhesDescricao: document.querySelector("#detalhes-descricao"),
    detalhesEspecificacoes: document.querySelector("#detalhes-especificacoes"),
    detalhesIndicadoPara: document.querySelector("#detalhes-indicado-para"),
    btnAdicionarDetalhe: document.querySelector("#btn-adicionar-detalhe"),
    detalhesPagamento: document.querySelector("#detalhes-pagamento")
  };

  // Centraliza a formatação dos valores no padrão brasileiro de reais.
  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  // Monta um campo do código Pix usando o tamanho do texto em bytes, como pede o formato BR Code.
  function criarCampoPix(identificador, valor) {
    const conteudo = String(valor);
    return identificador + String(new TextEncoder().encode(conteudo).length).padStart(2, "0") + conteudo;
  }

  // Calcula o código de verificação do BR Code para detectar alterações no conteúdo.
  function calcularCRC16(texto) {
    let crc = 0xFFFF;
    for (let indice = 0; indice < texto.length; indice += 1) {
      crc ^= texto.charCodeAt(indice) << 8;
      for (let bit = 0; bit < 8; bit += 1) {
        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  // Monta o Pix demonstrativo com o total atualizado; a chave configurada é fictícia.
  function gerarCodigoPix(valorTotal) {
    const chave = String(configuracaoLoja.chavePix || "").trim();
    if (!chave) return "";
    const nomeRecebedor = String(configuracaoLoja.nomeRecebedorPix || "FABTECH MARKET")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().slice(0, 25);
    const cidadeRecebedor = String(configuracaoLoja.cidadeRecebedorPix || "SAO PAULO")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().slice(0, 15);
    const informacoesRecebedor = criarCampoPix("00", "br.gov.bcb.pix")
      + criarCampoPix("01", chave);
    const identificadorPagamento = criarCampoPix("05", "***");
    let payload = criarCampoPix("00", "01")
      + criarCampoPix("01", "11")
      + criarCampoPix("26", informacoesRecebedor)
      + criarCampoPix("52", "0000")
      + criarCampoPix("53", "986")
      + criarCampoPix("54", Number(valorTotal).toFixed(2))
      + criarCampoPix("58", "BR")
      + criarCampoPix("59", nomeRecebedor)
      + criarCampoPix("60", cidadeRecebedor)
      + criarCampoPix("62", identificadorPagamento)
      + "6304";
    payload += calcularCRC16(payload);
    return payload;
  }

  // Transforma o texto do QR Code em uma URL de imagem fornecida pelo serviço QRServer.
  function criarEnderecoQR(codigo) {
    return "https://api.qrserver.com/v1/create-qr-code/?size=240x240&format=png&charset-source=UTF-8&charset-target=UTF-8&data="
      + encodeURIComponent(codigo);
  }

  // Lê dados salvos no navegador e usa um valor padrão se não existirem ou estiverem inválidos.
  function lerStorage(chave, padrao) {
    try {
      const valor = localStorage.getItem(chave);
      return valor === null ? padrao : JSON.parse(valor);
    } catch (erro) {
      return padrao;
    }
  }

  // Centraliza a gravação no localStorage e evita que uma falha interrompa a loja.
  function gravarStorage(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
      return true;
    } catch (erro) {
      mostrarMensagemRapida("O navegador não permitiu salvar os dados localmente. A loja continuará funcionando nesta sessão.", "aviso");
      return false;
    }
  }

  // Exibe um aviso breve após uma ação, sem interromper a navegação com alert().
  function mostrarMensagemRapida(texto, tipo = "sucesso") {
    if (!elementos.regiaoToast) return;
    window.clearTimeout(temporizadorMensagemRapida);
    const notificacao = document.createElement("div");
    notificacao.className = `mensagem-rapida mensagem-rapida-${tipo}`;
    const icone = document.createElement("span");
    icone.className = "icone-mensagem-rapida";
    icone.setAttribute("aria-hidden", "true");
    icone.textContent = tipo === "erro" ? "!" : tipo === "aviso" ? "i" : "✓";
    const mensagem = document.createElement("p");
    mensagem.textContent = texto;
    notificacao.append(icone, mensagem);
    elementos.regiaoToast.replaceChildren(notificacao);
    temporizadorMensagemRapida = window.setTimeout(() => {
      notificacao.classList.add("mensagem-rapida-saida");
      window.setTimeout(() => notificacao.remove(), 250);
    }, 3300);
  }

  // Escapa caracteres antes de inserir valores do catálogo em trechos de HTML montados pelo JavaScript.
  function escaparHTML(valor) {
    return String(valor).replace(/[&<>"']/g, caractere => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[caractere]);
  }

  // Calcula todos os valores comerciais em um só lugar para manter carrinho e checkout consistentes.
  function obterResumoValores() {
    const subtotal = carrinho.subtotal;
    let frete = subtotal === 0 ? 0 : subtotal >= LIMITE_FRETE_GRATIS ? 0 : FRETE_PADRAO;
    let desconto = 0;
    if (cupomAtual === "FRETEGRATIS") frete = 0;
    if (cupomAtual === "MAKER10" && subtotal >= VALOR_MINIMO_CUPOM) desconto = subtotal * 0.10;
    return { subtotal, frete, desconto, total: Math.max(0, subtotal + frete - desconto) };
  }

  // Guarda itens e cupom no navegador para restaurar a compra após atualizar a página.
  function salvarCarrinho() {
    gravarStorage(CHAVE_CARRINHO, {
      itens: carrinho.toJSON(),
      cupom: cupomAtual
    });
  }

  // Reconstrói os itens salvos relacionando cada ID ao produto atual do catálogo.
  function carregarCarrinho() {
    const salvo = lerStorage(CHAVE_CARRINHO, null);
    if (!salvo || !Array.isArray(salvo.itens)) return;
    for (const entrada of salvo.itens) {
      const produto = catalogo.find(item => item.id === String(entrada.produtoId));
      const quantidade = Number.parseInt(entrada.quantidade, 10);
      if (produto && Number.isInteger(quantidade) && quantidade > 0 && quantidade <= 99) {
        for (let indice = 0; indice < quantidade; indice += 1) carrinho.adicionar(produto);
      }
    }
    if (salvo.cupom === "MAKER10" || salvo.cupom === "FRETEGRATIS") cupomAtual = salvo.cupom;
  }

  // Cria um botão para cada categoria encontrada nos produtos, sem duplicar nomes.
  function renderizarFiltros() {
    const categorias = ["Todas", ...new Set(catalogo.map(produto => produto.categoria))];
    elementos.filtrosCategoria.replaceChildren();
    for (const categoria of categorias) {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = `filtro-categoria ${categoria === "Todas" ? "categoria-cor-todas" : classeCategoria(categoria)}${categoria === categoriaAtual ? " is-active" : ""}`;
      botao.dataset.categoria = categoria;
      botao.setAttribute("aria-pressed", String(categoria === categoriaAtual));
      botao.textContent = categoria === "Todas" ? "Todos" : categoria;
      elementos.filtrosCategoria.appendChild(botao);
    }
  }

  // Facilita a busca removendo acentos e diferenças entre maiúsculas e minúsculas.
  function normalizarTexto(texto) {
    return String(texto).toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Associa o nome da categoria à classe CSS que define suas cores de apoio.
  function classeCategoria(categoria) {
    const categoriaNormalizada = normalizarTexto(categoria)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `categoria-cor-${categoriaNormalizada}`;
  }

  // Combina busca, filtro de categoria e ordenação antes de desenhar o catálogo.
  function obterProdutosFiltrados() {
    const consulta = normalizarTexto(elementos.campoBusca.value.trim());
    let produtos = catalogo.filter(produto => {
      const correspondeCategoria = categoriaAtual === "Todas" || produto.categoria === categoriaAtual;
      const textoConsulta = normalizarTexto(`${produto.nome} ${produto.descricao} ${produto.categoria}`);
      return correspondeCategoria && (!consulta || textoConsulta.includes(consulta));
    });

    switch (elementos.ordenar.value) {
      case "menor-preco": produtos.sort((a, b) => a.preco - b.preco); break;
      case "maior-preco": produtos.sort((a, b) => b.preco - a.preco); break;
      case "avaliacao": produtos.sort((a, b) => b.avaliacao - a.avaliacao || a.nome.localeCompare(b.nome, "pt-BR")); break;
      case "nome": produtos.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")); break;
      default: produtos.sort((a, b) => Number(b.destaque) - Number(a.destaque) || a.id.localeCompare(b.id));
    }
    return produtos;
  }

  // Cria um cartão a partir dos dados; assim a lista não precisa ficar escrita no HTML.
  function criarCartaoProduto(produto) {
    const artigo = elementos.modeloCardProduto.content.firstElementChild.cloneNode(true);
    artigo.dataset.produtoId = produto.id;
    const selo = produto.precoAnterior ? `<span class="selo-produto">Oferta</span>` : (produto.destaque ? `<span class="selo-produto selo-destaque">Escolha maker</span>` : "");
    const precoAnterior = produto.precoAnterior ? `<span class="preco-anterior">${formatarMoeda(produto.precoAnterior)}</span>` : "";
    artigo.innerHTML = `
      <div class="moldura-imagem-produto">
        ${selo}
        <button class="botao-imagem-produto" type="button" data-detalhes="${escaparHTML(produto.id)}" aria-label="Ver detalhes de ${escaparHTML(produto.nome)}">
          <img class="imagem-produto" src="${escaparHTML(produto.imagem)}" alt="${escaparHTML(produto.alt)}" loading="lazy" width="640" height="430">
        </button>
        <span class="categoria-produto ${classeCategoria(produto.categoria)}">${escaparHTML(produto.categoria)}</span>
      </div>
      <div class="informacoes-produto">
        <div class="avaliacao-produto" role="img" aria-label="Avaliação: ${produto.avaliacao.toFixed(1).replace(".", ",")} de 5"><span aria-hidden="true">★★★★★</span><strong>${produto.avaliacao.toFixed(1).replace(".", ",")}</strong><span class="escala-avaliacao">/ 5</span></div>
        <h3>${escaparHTML(produto.nome)}</h3>
        <p class="descricao-produto">${escaparHTML(produto.descricao)}</p>
        <button class="botao-detalhes-produto" type="button" data-detalhes="${escaparHTML(produto.id)}">Ver detalhes do produto <span aria-hidden="true">↗</span></button>
        <div class="rodape-cartao-produto"><div class="bloco-preco">${precoAnterior}<strong>${formatarMoeda(produto.preco)}</strong></div><button class="botao-adicionar-carrinho" type="button" data-adicionar="${escaparHTML(produto.id)}" aria-label="Adicionar ${escaparHTML(produto.nome)} ao carrinho"><span aria-hidden="true">+</span> Adicionar</button></div>
      </div>`;
    return artigo;
  }

  // Preenche a janela de detalhes com o produto escolhido no catálogo.
  function abrirDetalhesProduto(idProduto) {
    const produto = catalogo.find(item => item.id === String(idProduto));
    if (!produto) {
      mostrarMensagemRapida("Não foi possível encontrar os detalhes deste produto.", "erro");
      return;
    }
    produtoEmDetalhes = produto;
    elementos.detalhesImagem.src = produto.imagem;
    elementos.detalhesImagem.alt = produto.alt;
    elementos.detalhesCategoria.textContent = produto.categoria;
    elementos.detalhesCategoria.className = `categoria-detalhes-produto ${classeCategoria(produto.categoria)}`;
    elementos.detalhesNome.textContent = produto.nome;
    elementos.detalhesAvaliacao.textContent = `★★★★★  ${produto.avaliacao.toFixed(1).replace(".", ",")} de 5 avaliações`;
    elementos.detalhesPreco.textContent = formatarMoeda(produto.preco);
    elementos.detalhesPrecoAnterior.hidden = !produto.precoAnterior;
    elementos.detalhesPrecoAnterior.textContent = produto.precoAnterior ? formatarMoeda(produto.precoAnterior) : "";
    elementos.detalhesDescricao.textContent = produto.detalhes || produto.descricao;
    elementos.detalhesIndicadoPara.textContent = produto.indicadoPara;
    elementos.detalhesEspecificacoes.replaceChildren();
    for (const especificacao of produto.especificacoes || []) {
      const item = document.createElement("li");
      item.textContent = especificacao;
      elementos.detalhesEspecificacoes.appendChild(item);
    }
    elementos.btnAdicionarDetalhe.textContent = "Adicionar ao carrinho";
    const seta = document.createElement("span");
    seta.setAttribute("aria-hidden", "true");
    seta.textContent = " →";
    elementos.btnAdicionarDetalhe.appendChild(seta);
    if (!elementos.modalDetalhesProduto.open) elementos.modalDetalhesProduto.showModal();
  }

  // Confere o produto e o limite de unidades antes de atualizar e redesenhar o carrinho.
  function adicionarProdutoAoCarrinho(idProduto) {
    const produto = catalogo.find(item => item.id === String(idProduto));
    if (!produto) {
      mostrarMensagemRapida("Não foi possível encontrar este produto.", "erro");
      return;
    }
    const existente = carrinho.itens.find(item => item.produto.id === produto.id);
    if (existente && existente.quantidade >= 99) {
      mostrarMensagemRapida("O limite deste produto no carrinho é de 99 unidades.", "aviso");
      return;
    }
    carrinho.adicionar(produto);
    salvarCarrinho();
    renderizarCarrinho();
    mostrarMensagemRapida(`${produto.nome} foi adicionado ao carrinho.`);
  }

  // Atualiza cartões, contador de resultados e a mensagem de pesquisa ativa.
  function renderizarProdutos() {
    const produtos = obterProdutosFiltrados();
    elementos.gradeProdutos.replaceChildren(...produtos.map(criarCartaoProduto));
    elementos.gradeProdutos.setAttribute("aria-busy", "false");
    elementos.estadoVazio.hidden = produtos.length !== 0;
    elementos.contadorResultados.textContent = `${produtos.length} ${produtos.length === 1 ? "produto encontrado" : "produtos encontrados"}`;
    const consulta = elementos.campoBusca.value.trim();
    elementos.resumoConsulta.hidden = !consulta;
    elementos.textoConsulta.textContent = consulta ? `Consulta: “${consulta}”` : "";
  }

  // Mantém o contador do cabeçalho e o título do painel em sincronia com as quantidades.
  function renderizarContadorCarrinho() {
    const quantidade = carrinho.quantidadeTotal;
    elementos.contadorCarrinho.textContent = quantidade > 99 ? "99+" : String(quantidade);
    elementos.contadorCarrinho.setAttribute("aria-label", `${quantidade} ${quantidade === 1 ? "item" : "itens"} no carrinho`);
    elementos.quantidadeTitulo.textContent = `(${quantidade})`;
  }

  // Atualiza o progresso até o frete grátis e explica quanto falta para alcançar o limite.
  function renderizarFrete() {
    const subtotal = carrinho.subtotal;
    const barraProgresso = elementos.progressoFrete.querySelector(".trilho-progresso span");
    if (subtotal === 0) {
      elementos.progressoFrete.querySelector("p").textContent = "Adicione produtos ao carrinho para calcular o frete.";
      barraProgresso.style.width = "0%";
    } else if (subtotal >= LIMITE_FRETE_GRATIS || cupomAtual === "FRETEGRATIS") {
      elementos.progressoFrete.querySelector("p").textContent = "Boa! Você garantiu frete grátis.";
      barraProgresso.style.width = "100%";
    } else {
      const falta = LIMITE_FRETE_GRATIS - subtotal;
      elementos.progressoFrete.querySelector("p").textContent = `Faltam ${formatarMoeda(falta)} para ganhar frete grátis.`;
      barraProgresso.style.width = `${Math.min(100, (subtotal / LIMITE_FRETE_GRATIS) * 100)}%`;
    }
  }

  // Atualiza os itens, as quantidades e o resumo financeiro sempre que algo muda.
  function renderizarCarrinho() {
    const vazio = carrinho.estaVazio;
    elementos.carrinhoVazio.hidden = !vazio;
    elementos.resumoCarrinho.hidden = vazio;
    elementos.listaCarrinho.replaceChildren();
    elementos.listaCarrinho.hidden = vazio;

    if (!vazio) {
      for (const item of carrinho.itens) {
        const linha = document.createElement("article");
        linha.className = "item-carrinho";
        linha.innerHTML = `
          <img src="${escaparHTML(item.produto.imagem)}" alt="${escaparHTML(item.produto.alt)}" loading="lazy" width="100" height="85">
          <div class="informacoes-item-carrinho"><p class="categoria-item-carrinho ${classeCategoria(item.produto.categoria)}">${escaparHTML(item.produto.categoria)}</p><h3>${escaparHTML(item.produto.nome)}</h3><strong class="preco-item-carrinho">${formatarMoeda(item.produto.preco)}</strong>
            <div class="controles-quantidade" aria-label="Quantidade de ${escaparHTML(item.produto.nome)}"><button type="button" data-acao="diminuir" data-id="${escaparHTML(item.produto.id)}" aria-label="Diminuir quantidade de ${escaparHTML(item.produto.nome)}" ${item.quantidade <= 1 ? "disabled" : ""}>−</button><span aria-label="Quantidade atual">${item.quantidade}</span><button type="button" data-acao="aumentar" data-id="${escaparHTML(item.produto.id)}" aria-label="Aumentar quantidade de ${escaparHTML(item.produto.nome)}" ${item.quantidade >= 99 ? "disabled" : ""}>+</button></div>
          </div>
          <button class="botao-remover-item" type="button" data-acao="remover" data-id="${escaparHTML(item.produto.id)}" aria-label="Remover ${escaparHTML(item.produto.nome)} do carrinho" title="Remover item"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/></svg></button>`;
        elementos.listaCarrinho.appendChild(linha);
      }
    }

    const valores = obterResumoValores();
    const freteTexto = valores.frete === 0 ? "Grátis" : formatarMoeda(valores.frete);
    const descontoLinha = valores.desconto > 0 ? `<div class="linha-total linha-desconto"><dt>Desconto (${cupomAtual})</dt><dd>− ${formatarMoeda(valores.desconto)}</dd></div>` : "";
    elementos.totaisCarrinho.innerHTML = `
      <div class="linha-total"><dt>Subtotal</dt><dd>${formatarMoeda(valores.subtotal)}</dd></div>
      <div class="linha-total"><dt>Frete</dt><dd class="${valores.frete === 0 ? "frete-gratis" : ""}">${freteTexto}</dd></div>
      ${descontoLinha}
      <div class="linha-total total-carrinho-final"><dt>Total</dt><dd>${formatarMoeda(valores.total)}</dd></div>`;

    if (cupomAtual) {
      elementos.codigoCupom.value = cupomAtual;
      if (cupomAtual === "MAKER10" && valores.desconto > 0) {
        elementos.feedbackCupom.textContent = "Cupom MAKER10 aplicado: 10% de desconto no subtotal.";
        elementos.feedbackCupom.className = "retorno-cupom is-success";
      } else if (cupomAtual === "FRETEGRATIS") {
        elementos.feedbackCupom.textContent = "Cupom FRETEGRATIS aplicado.";
        elementos.feedbackCupom.className = "retorno-cupom is-success";
      } else {
        elementos.feedbackCupom.textContent = "Adicione mais produtos para liberar o desconto MAKER10.";
        elementos.feedbackCupom.className = "retorno-cupom is-warning";
      }
    }

    renderizarContadorCarrinho();
    renderizarFrete();
  }

  // Refaz os filtros e os cartões sempre que uma consulta ou ordenação é alterada.
  function atualizarCatalogo() {
    renderizarFiltros();
    renderizarProdutos();
  }

  // Enquanto um painel estiver aberto, impede que o teclado navegue pelos elementos ao fundo.
  function controlarFundoInerte(inerte) {
    document.querySelectorAll("body > .skip-link, body > .announcement-bar, body > .site-header, body > main, body > .site-footer").forEach(elemento => {
      elemento.inert = inerte;
    });
  }

  // Abre ou fecha a gaveta do carrinho, cuida da sobreposição e devolve o foco ao fechar.
  function definirCarrinhoAberto(abrir) {
    if (abrir) {
      focoAnterior = document.activeElement;
      elementos.sobreposicaoCarrinho.hidden = false;
      controlarFundoInerte(true);
      elementos.painelCarrinho.inert = false;
      elementos.painelCarrinho.setAttribute("aria-hidden", "false");
      elementos.painelCarrinho.classList.add("is-open");
      elementos.abrirCarrinho.setAttribute("aria-expanded", "true");
      elementos.body.classList.add("drawer-open");
      window.requestAnimationFrame(() => elementos.fecharCarrinho.focus());
    } else {
      elementos.painelCarrinho.classList.remove("is-open");
      elementos.painelCarrinho.setAttribute("aria-hidden", "true");
      elementos.painelCarrinho.inert = true;
      controlarFundoInerte(false);
      elementos.abrirCarrinho.setAttribute("aria-expanded", "false");
      elementos.body.classList.remove("drawer-open");
      window.setTimeout(() => {
        if (!elementos.painelCarrinho.classList.contains("is-open")) elementos.sobreposicaoCarrinho.hidden = true;
      }, 260);
      if (focoAnterior && typeof focoAnterior.focus === "function") focoAnterior.focus();
    }
  }

  // Troca a classe de tema e atualiza o nome acessível do botão sol/lua.
  function aplicarTema(tema, salvar = true) {
    temaAtual = tema === "escuro" ? "escuro" : "claro";
    document.documentElement.dataset.theme = temaAtual;
    elementos.botaoTema.setAttribute("aria-pressed", String(temaAtual === "escuro"));
    elementos.botaoTema.setAttribute("aria-label", temaAtual === "escuro" ? "Ativar tema claro" : "Ativar tema escuro");
    elementos.botaoTema.title = temaAtual === "escuro" ? "Ativar tema claro" : "Ativar tema escuro";
    if (salvar) {
      try { localStorage.setItem(CHAVE_TEMA, temaAtual); } catch (erro) { /* O tema ainda funciona na sessão. */ }
    }
  }

  // Recupera a escolha anterior; sem preferência salva, respeita o tema do sistema operacional.
  function carregarTema() {
    let salvo = null;
    try { salvo = localStorage.getItem(CHAVE_TEMA); } catch (erro) { /* Usa a preferência do sistema. */ }
    if (salvo === "claro" || salvo === "escuro") aplicarTema(salvo, false);
    else aplicarTema(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro", false);
  }

  // Valida apenas os cupons previstos e atualiza o total usado pelo carrinho e checkout.
  function aplicarCupom(codigo) {
    const normalizado = codigo.trim().toLocaleUpperCase("pt-BR");
    const valores = obterResumoValores();
    if (!normalizado) {
      cupomAtual = "";
      elementos.feedbackCupom.textContent = "Cupom removido. Use MAKER10 ou FRETEGRATIS.";
      elementos.feedbackCupom.className = "retorno-cupom";
      salvarCarrinho();
      renderizarCarrinho();
      return;
    }
    if (normalizado === "FRETEGRATIS") {
      cupomAtual = normalizado;
      elementos.feedbackCupom.textContent = "Cupom FRETEGRATIS aplicado: o frete ficou grátis.";
      elementos.feedbackCupom.className = "retorno-cupom is-success";
    } else if (normalizado === "MAKER10" && valores.subtotal >= VALOR_MINIMO_CUPOM) {
      cupomAtual = normalizado;
      elementos.feedbackCupom.textContent = "Cupom MAKER10 aplicado: você ganhou 10% de desconto.";
      elementos.feedbackCupom.className = "retorno-cupom is-success";
    } else if (normalizado === "MAKER10") {
      elementos.feedbackCupom.textContent = `O cupom MAKER10 exige subtotal de pelo menos ${formatarMoeda(VALOR_MINIMO_CUPOM)}.`;
      elementos.feedbackCupom.className = "retorno-cupom is-warning";
      return;
    } else {
      elementos.feedbackCupom.textContent = "Cupom não reconhecido. Teste MAKER10 ou FRETEGRATIS.";
      elementos.feedbackCupom.className = "retorno-cupom is-error";
      return;
    }
    salvarCarrinho();
    renderizarCarrinho();
  }

  // Preenche o resumo do checkout com itens, frete, desconto e total atuais.
  function gerarResumoCheckout() {
    const valores = obterResumoValores();
    const lista = carrinho.itens.map(item => `
      <div class="linha-finalizacao"><span>${item.quantidade} × ${escaparHTML(item.produto.nome)}</span><strong>${formatarMoeda(item.subtotal)}</strong></div>`).join("");
    const desconto = valores.desconto ? `<div class="linha-finalizacao desconto-finalizacao"><span>Desconto do cupom</span><strong>− ${formatarMoeda(valores.desconto)}</strong></div>` : "";
    elementos.resumoCheckout.innerHTML = `${lista}<div class="linha-finalizacao"><span>Subtotal</span><strong>${formatarMoeda(valores.subtotal)}</strong></div><div class="linha-finalizacao"><span>Frete</span><strong>${valores.frete === 0 ? "Grátis" : formatarMoeda(valores.frete)}</strong></div>${desconto}<div class="linha-finalizacao total-finalizacao"><span>Total do pedido</span><strong>${formatarMoeda(valores.total)}</strong></div>`;
  }

  // Lê o histórico local de pedidos demonstrativos para criar o próximo número.
  function carregarPedidosSalvos() {
    const pedidos = lerStorage(CHAVE_PEDIDOS, []);
    return Array.isArray(pedidos) ? pedidos : [];
  }

  // Mostra os campos específicos da forma escolhida sem coletar dados bancários reais.
  function renderizarFormaPagamento() {
    if (!elementos.detalhesPagamento) return;
    const selecionado = elementos.formCheckout.querySelector('input[name="forma-pagamento"]:checked');
    const formaPagamento = selecionado ? selecionado.value : "pix";
    const valores = obterResumoValores();

    if (formaPagamento === "pix") {
      codigoPixAtual = gerarCodigoPix(valores.total);
      const observacaoDemo = configuracaoLoja.pixDemonstracao
        ? "QR Code ilustrativo. A chave Pix configurada é fictícia; não efetue pagamento."
        : "Confira o nome do recebedor e o valor no aplicativo do seu banco antes de confirmar.";
      const imagemQR = codigoPixAtual
        ? `<img class="pix-qr-image" id="imagem-qr-pix" src="${escaparHTML(criarEnderecoQR(codigoPixAtual))}" alt="QR Code Pix para o valor de ${formatarMoeda(valores.total)}" width="240" height="240">`
        : `<div class="qr-pix-indisponivel" role="status">Configure uma chave Pix para gerar o QR Code.</div>`;
      elementos.detalhesPagamento.innerHTML = `
        <div class="painel-pagamento-pix">
          <div class="coluna-qr-pix">${imagemQR}<span class="legenda-qr-pix">QR Code Pix</span></div>
          <div class="conteudo-pagamento-pix">
            <p class="subtitulo-painel-pagamento">Pagamento via Pix</p>
            <p class="rotulo-total-pix">Valor do pedido</p><strong class="valor-total-pix">${formatarMoeda(valores.total)}</strong>
            <p class="explicacao-pagamento">Leia o QR Code com o aplicativo do banco ou copie o código abaixo.</p>
            <label class="visually-hidden" for="codigo-pix-copia-cola">Código Pix para copiar</label>
            <textarea id="codigo-pix-copia-cola" class="campo-codigo-pix" readonly rows="3">${escaparHTML(codigoPixAtual)}</textarea>
            <button class="button button-secondary botao-copiar-pix" type="button" id="copiar-codigo-pix" ${codigoPixAtual ? "" : "disabled"}>Copiar código Pix</button>
            <p class="aviso-pix-demonstrativo">${escaparHTML(observacaoDemo)}</p>
          </div>
        </div>`;
      const imagem = elementos.detalhesPagamento.querySelector("#imagem-qr-pix");
      if (imagem) {
        imagem.addEventListener("error", () => {
          imagem.hidden = true;
          const aviso = document.createElement("p");
          aviso.className = "erro-api-qr-pix";
          aviso.textContent = "Não foi possível carregar a imagem do QR Code. Confira a conexão com a internet; o código Pix demonstrativo continua disponível para copiar.";
          imagem.parentElement.appendChild(aviso);
        }, { once: true });
      }
      return;
    }

    codigoPixAtual = "";
    if (formaPagamento === "credito") {
      const opcoesParcelas = Array.from({ length: 6 }, (_, indice) => {
        const quantidade = indice + 1;
        const valorParcela = valores.total / quantidade;
        return `<option value="${quantidade}">${quantidade}x de ${formatarMoeda(valorParcela)} (simulação)</option>`;
      }).join("");
      elementos.detalhesPagamento.innerHTML = `
        <div class="painel-informacao-pagamento"><strong>Cartão de crédito</strong>
          <label for="parcelas-credito">Quantidade de parcelas</label>
          <select id="parcelas-credito" name="parcelas">${opcoesParcelas}</select>
          <p>Esta é apenas uma simulação de parcelamento. Não informe número de cartão, validade ou código de segurança: não há processadora de pagamentos conectada.</p>
        </div>`;
      return;
    }

    if (formaPagamento === "debito") {
      elementos.detalhesPagamento.innerHTML = `<div class="painel-informacao-pagamento"><strong>Cartão de débito</strong><p>A preferência será registrada no pedido demonstrativo. Nenhum dado bancário será solicitado ou enviado e nenhuma transação será realizada.</p></div>`;
      return;
    }

    elementos.detalhesPagamento.innerHTML = `<div class="painel-informacao-pagamento"><strong>Boleto bancário</strong><p>Um boleto válido precisa ser emitido por uma instituição ou provedor de pagamentos. Como este projeto não possui integração bancária, nenhum boleto real será gerado.</p></div>`;
  }

  // Copia o código Pix demonstrativo quando o navegador permite acesso à área de transferência.
  async function copiarCodigoPix() {
    if (!codigoPixAtual) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(codigoPixAtual);
      } else {
        const campoTemporario = document.createElement("textarea");
        campoTemporario.value = codigoPixAtual;
        campoTemporario.setAttribute("readonly", "");
        campoTemporario.style.position = "fixed";
        campoTemporario.style.opacity = "0";
        document.body.appendChild(campoTemporario);
        campoTemporario.select();
        const copiou = document.execCommand("copy");
        campoTemporario.remove();
        if (!copiou) throw new Error("A cópia não foi permitida pelo navegador.");
      }
      mostrarMensagemRapida(configuracaoLoja.pixDemonstracao ? "Código Pix de demonstração copiado." : "Código Pix copiado.");
    } catch (erro) {
      mostrarMensagemRapida("Não foi possível copiar automaticamente. Selecione o código e copie manualmente.", "aviso");
    }
  }

  // Valida os dados, registra um resumo no navegador e avisa que o pagamento não foi processado.
  function finalizarPedido(evento) {
    evento.preventDefault();
    if (carrinho.estaVazio) {
      elementos.modalCheckout.close();
      mostrarMensagemRapida("Adicione pelo menos um produto antes de finalizar.", "aviso");
      return;
    }
    const nome = elementos.nomeCliente.value.trim();
    const email = elementos.emailCliente.value.trim();
    if (nome.length < 2) {
      elementos.nomeCliente.setCustomValidity("Informe seu nome com pelo menos 2 caracteres.");
      elementos.nomeCliente.reportValidity();
      elementos.nomeCliente.setCustomValidity("");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      elementos.emailCliente.setCustomValidity("Informe um endereço de e-mail válido.");
      elementos.emailCliente.reportValidity();
      elementos.emailCliente.setCustomValidity("");
      return;
    }

    const valores = obterResumoValores();
    const formaSelecionada = elementos.formCheckout.querySelector('input[name="forma-pagamento"]:checked');
    const formaPagamento = formaSelecionada ? formaSelecionada.value : "pix";
    const campoParcelas = elementos.formCheckout.querySelector("#parcelas-credito");
    const pedido = {
      id: `FT-${String(Date.now()).slice(-7)}`,
      data: new Date().toISOString(),
      cliente: { nome, email, cep: elementos.cepCliente.value.trim() },
      itens: carrinho.toJSON(),
      subtotal: valores.subtotal,
      frete: valores.frete,
      desconto: valores.desconto,
      cupom: cupomAtual,
      total: valores.total,
      formaPagamento,
      parcelas: formaPagamento === "credito" && campoParcelas ? Number(campoParcelas.value) : null,
      status: "Registrado (demonstração) — pagamento não realizado"
    };
    const pedidos = carregarPedidosSalvos();
    pedidos.unshift(pedido);
    gravarStorage(CHAVE_PEDIDOS, pedidos.slice(0, 50));

    carrinho.limpar();
    cupomAtual = "";
    salvarCarrinho();
    renderizarCarrinho();
    elementos.modalCheckout.close();
    elementos.numeroPedido.textContent = `Número do pedido: ${pedido.id}`;
    const nomesFormasPagamento = {
      pix: "Pix (demonstração)",
      credito: "cartão de crédito (simulação)",
      debito: "cartão de débito (simulação)",
      boleto: "boleto (não emitido)"
    };
    elementos.mensagemSucesso.textContent = `Obrigado, ${nome}! O pedido foi registrado apenas neste navegador, com a opção ${nomesFormasPagamento[formaPagamento] || "demonstrativa"}. Nenhum pagamento foi realizado.`;
    elementos.modalSucesso.showModal();
    elementos.formCheckout.reset();
  }

  // Executa a preparação inicial: tema, carrinho salvo, catálogo, ano e eventos da página.
  function renderizarInicio() {
    elementos.anoAtual.textContent = String(new Date().getFullYear());
    carregarTema();
    carregarCarrinho();
    renderizarFiltros();
    renderizarProdutos();
    renderizarCarrinho();
  }

  /* Eventos do catálogo e da consulta: busca por texto, filtros, ordenação e detalhes. */
  elementos.formularioBusca.addEventListener("submit", evento => {
    evento.preventDefault();
    renderizarProdutos();
    document.querySelector("#catalogo").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  elementos.campoBusca.addEventListener("input", renderizarProdutos);
  elementos.limparConsulta.addEventListener("click", () => {
    elementos.campoBusca.value = "";
    renderizarProdutos();
    elementos.campoBusca.focus();
  });
  elementos.ordenar.addEventListener("change", renderizarProdutos);
  elementos.filtrosCategoria.addEventListener("click", evento => {
    const botao = evento.target.closest("button[data-categoria]");
    if (!botao) return;
    categoriaAtual = botao.dataset.categoria;
    renderizarFiltros();
    renderizarProdutos();
  });
  elementos.gradeProdutos.addEventListener("click", evento => {
    const botaoDetalhes = evento.target.closest("button[data-detalhes]");
    if (botaoDetalhes) {
      abrirDetalhesProduto(botaoDetalhes.dataset.detalhes);
      return;
    }
    const botaoAdicionar = evento.target.closest("button[data-adicionar]");
    if (botaoAdicionar) adicionarProdutoAoCarrinho(botaoAdicionar.dataset.adicionar);
  });

  elementos.modalDetalhesProduto.addEventListener("click", evento => {
    if (evento.target === elementos.modalDetalhesProduto) {
      elementos.modalDetalhesProduto.close();
      return;
    }
    if (evento.target.closest("#fechar-detalhes-produto, #fechar-detalhes-secundario")) {
      elementos.modalDetalhesProduto.close();
      return;
    }
    if (evento.target.closest("#btn-adicionar-detalhe") && produtoEmDetalhes) {
      const idProduto = produtoEmDetalhes.id;
      elementos.modalDetalhesProduto.close();
      adicionarProdutoAoCarrinho(idProduto);
    }
  });
  elementos.limparFiltros.addEventListener("click", () => {
    categoriaAtual = "Todas";
    elementos.campoBusca.value = "";
    elementos.ordenar.value = "destaque";
    atualizarCatalogo();
  });
  document.querySelectorAll("[data-link-categoria]").forEach(link => {
    link.addEventListener("click", () => {
      categoriaAtual = link.dataset.linkCategoria;
      elementos.campoBusca.value = "";
      atualizarCatalogo();
    });
  });

  /* Eventos do carrinho: abrir/fechar, mudar quantidades, remover e limpar itens. */
  elementos.abrirCarrinho.addEventListener("click", () => definirCarrinhoAberto(true));
  elementos.linkCarrinho.addEventListener("click", () => definirCarrinhoAberto(true));
  elementos.fecharCarrinho.addEventListener("click", () => definirCarrinhoAberto(false));
  elementos.sobreposicaoCarrinho.addEventListener("click", () => definirCarrinhoAberto(false));
  elementos.voltarCompras.addEventListener("click", () => definirCarrinhoAberto(false));
  elementos.listaCarrinho.addEventListener("click", evento => {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;
    const id = botao.dataset.id;
    const acao = botao.dataset.acao;
    const item = carrinho.itens.find(entrada => entrada.produto.id === id);
    if (!item) return;
    if (acao === "aumentar") {
      if (item.quantidade >= 99) {
        mostrarMensagemRapida("O limite deste produto no carrinho é de 99 unidades.", "aviso");
        return;
      }
      carrinho.alterarQuantidade(id, item.quantidade + 1);
    } else if (acao === "diminuir") {
      carrinho.alterarQuantidade(id, item.quantidade - 1);
    } else if (acao === "remover") {
      carrinho.remover(id);
      mostrarMensagemRapida(`${item.produto.nome} foi removido do carrinho.`, "aviso");
    }
    salvarCarrinho();
    renderizarCarrinho();
  });
  elementos.limparCarrinho.addEventListener("click", () => {
    carrinho.limpar();
    cupomAtual = "";
    elementos.codigoCupom.value = "";
    elementos.feedbackCupom.textContent = "Use MAKER10 ou FRETEGRATIS.";
    elementos.feedbackCupom.className = "retorno-cupom";
    salvarCarrinho();
    renderizarCarrinho();
    mostrarMensagemRapida("Carrinho esvaziado.", "aviso");
  });
  elementos.formCupom.addEventListener("submit", evento => {
    evento.preventDefault();
    aplicarCupom(elementos.codigoCupom.value);
  });
  elementos.btnFinalizar.addEventListener("click", () => {
    if (carrinho.estaVazio) {
      mostrarMensagemRapida("Seu carrinho está vazio.", "aviso");
      return;
    }
    gerarResumoCheckout();
    renderizarFormaPagamento();
    definirCarrinhoAberto(false);
    elementos.modalCheckout.showModal();
    window.requestAnimationFrame(() => elementos.nomeCliente.focus());
  });

  /* Checkout demonstrativo: seleção de pagamento, validação e confirmação local do pedido. */
  elementos.formCheckout.addEventListener("submit", finalizarPedido);
  elementos.formCheckout.addEventListener("change", evento => {
    if (evento.target.matches('input[name="forma-pagamento"]')) renderizarFormaPagamento();
  });
  elementos.detalhesPagamento.addEventListener("click", evento => {
    if (evento.target.closest("#copiar-codigo-pix")) copiarCodigoPix();
  });
  elementos.fecharCheckout.addEventListener("click", () => elementos.modalCheckout.close());
  elementos.cancelarCheckout.addEventListener("click", () => elementos.modalCheckout.close());
  elementos.fecharSucesso.addEventListener("click", () => elementos.modalSucesso.close());
  elementos.modalCheckout.addEventListener("click", evento => {
    if (evento.target === elementos.modalCheckout) elementos.modalCheckout.close();
  });
  elementos.modalSucesso.addEventListener("click", evento => {
    if (evento.target === elementos.modalSucesso) elementos.modalSucesso.close();
  });
  document.addEventListener("keydown", evento => {
    const carrinhoAberto = elementos.painelCarrinho.classList.contains("is-open");
    if (evento.key === "Escape" && carrinhoAberto) {
      definirCarrinhoAberto(false);
      return;
    }
    if (evento.key === "Tab" && carrinhoAberto) {
      const focaveis = elementos.painelCarrinho.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focaveis.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }
  });

  /* O botão de tema alterna as cores e a escolha fica salva para as próximas visitas. */
  elementos.botaoTema.addEventListener("click", () => aplicarTema(temaAtual === "claro" ? "escuro" : "claro"));
  if (window.matchMedia) {
    const consultaTema = window.matchMedia("(prefers-color-scheme: dark)");
    consultaTema.addEventListener?.("change", evento => {
      let temaSalvo = null;
      try { temaSalvo = localStorage.getItem(CHAVE_TEMA); } catch (erro) { /* Ignora indisponibilidade. */ }
      if (!temaSalvo) aplicarTema(evento.matches ? "escuro" : "claro", false);
    });
  }

  /* Newsletter de demonstração: confere o e-mail e exibe feedback, sem enviar os dados. */
  elementos.formNewsletter.addEventListener("submit", evento => {
    evento.preventDefault();
    const email = elementos.emailNewsletter.value.trim();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
      elementos.feedbackNewsletter.textContent = "Digite um e-mail válido para se cadastrar.";
      elementos.feedbackNewsletter.className = "retorno-formulario is-error";
      elementos.emailNewsletter.setAttribute("aria-invalid", "true");
      elementos.emailNewsletter.focus();
      return;
    }
    elementos.emailNewsletter.removeAttribute("aria-invalid");
    elementos.feedbackNewsletter.textContent = "Cadastro demonstrativo concluído. Obrigado!";
    elementos.feedbackNewsletter.className = "retorno-formulario is-success";
    elementos.formNewsletter.reset();
  });
  elementos.emailNewsletter.addEventListener("input", () => {
    elementos.feedbackNewsletter.textContent = "";
    elementos.feedbackNewsletter.className = "retorno-formulario";
    elementos.emailNewsletter.removeAttribute("aria-invalid");
  });

  renderizarInicio();
})();
