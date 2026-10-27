"use strict";

/* Um item associa um Produto à quantidade escolhida pelo cliente. */
class ItemCarrinho {
  // Confere o produto e inicia a quantidade com pelo menos uma unidade.
  constructor(produto, quantidade = 1) {
    if (!(produto instanceof Produto)) {
      throw new TypeError("O item precisa estar associado a um produto válido.");
    }
    this.produto = produto;
    this.quantidade = Math.max(1, Number.parseInt(quantidade, 10) || 1);
  }

  // O subtotal do item considera o preço do produto e a quantidade escolhida.
  get subtotal() {
    return this.produto.preco * this.quantidade;
  }

  // Só aceita quantidades inteiras e positivas.
  alterarQuantidade(novaQuantidade) {
    const valor = Number.parseInt(novaQuantidade, 10);
    if (!Number.isInteger(valor) || valor < 1) return false;
    this.quantidade = valor;
    return true;
  }

  // Guarda o identificador do produto e a quantidade, não uma cópia de todos os dados.
  toJSON() {
    return { produtoId: this.produto.id, quantidade: this.quantidade };
  }
}
