"use strict";

/* Modelo do carrinho inspirado no projeto Sistema-Restaurante. */
class Carrinho {
  // O carrinho começa vazio; os itens são incluídos pelas ações da interface.
  constructor() {
    this.itens = [];
  }

  // Se o produto já estiver no carrinho, aumenta sua quantidade em vez de duplicar a linha.
  adicionar(produto) {
    if (!(produto instanceof Produto)) throw new TypeError("Produto inválido.");
    const existente = this.itens.find(item => item.produto.id === produto.id);
    if (existente) existente.quantidade += 1;
    else this.itens.push(new ItemCarrinho(produto, 1));
  }

  // Remove somente o item que corresponde ao identificador recebido.
  remover(produtoId) {
    this.itens = this.itens.filter(item => item.produto.id !== String(produtoId));
  }

  // Atualiza a quantidade; um valor inválido ou zero remove o item.
  alterarQuantidade(produtoId, quantidade) {
    const item = this.itens.find(entry => entry.produto.id === String(produtoId));
    if (!item) return;
    const novaQuantidade = Number.parseInt(quantidade, 10);
    if (!Number.isInteger(novaQuantidade) || novaQuantidade <= 0) this.remover(produtoId);
    else item.alterarQuantidade(novaQuantidade);
  }

  // Remove todos os itens, por exemplo quando a pessoa escolhe esvaziar o carrinho.
  limpar() {
    this.itens = [];
  }

  // Soma os subtotais de todos os itens do carrinho.
  get subtotal() {
    return this.itens.reduce((soma, item) => soma + item.subtotal, 0);
  }

  // Soma as unidades de todos os produtos para atualizar o contador.
  get quantidadeTotal() {
    return this.itens.reduce((soma, item) => soma + item.quantidade, 0);
  }

  // Retorna um booleano usado para mostrar o estado vazio ou o resumo da compra.
  get estaVazio() {
    return this.itens.length === 0;
  }

  // Deixa os itens prontos para serem salvos no localStorage.
  toJSON() {
    return this.itens.map(item => item.toJSON());
  }
}
