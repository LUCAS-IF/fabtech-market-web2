"use strict";

/* Representa um produto do catálogo da FabTech Market. */
class Produto {
  // Recebe os dados do catálogo e prepara os valores usados nas telas.
  constructor({
    id, nome, descricao, detalhes = "", especificacoes = [], indicadoPara = "",
    preco, categoria, avaliacao, imagem, alt, destaque = false, precoAnterior = null
  }) {
    this.id = String(id);
    this.nome = nome;
    this.descricao = descricao;
    this.detalhes = detalhes || descricao;
    this.especificacoes = Array.isArray(especificacoes) ? especificacoes : [];
    this.indicadoPara = indicadoPara || "Projetos criativos e aprendizagem maker.";
    this.preco = Number(preco);
    this.categoria = categoria;
    this.avaliacao = Number(avaliacao);
    this.imagem = imagem;
    this.alt = alt;
    this.destaque = Boolean(destaque);
    this.precoAnterior = precoAnterior === null ? null : Number(precoAnterior);
  }

  // Converte a classe em um objeto simples, útil para salvar dados no navegador.
  // Define quais propriedades entram na representação simples do produto.
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      detalhes: this.detalhes,
      especificacoes: [...this.especificacoes],
      indicadoPara: this.indicadoPara,
      preco: this.preco,
      categoria: this.categoria,
      avaliacao: this.avaliacao,
      imagem: this.imagem,
      alt: this.alt,
      destaque: this.destaque,
      precoAnterior: this.precoAnterior
    };
  }
}
