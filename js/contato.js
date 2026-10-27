"use strict";

/* Comportamentos da página de contato, sem envio de dados para servidores. */
(() => {
  const CHAVE_TEMA = "fabtech_market_theme_v1";
  const botaoTema = document.querySelector("#btn-tema-contato");
  const formulario = document.querySelector("#form-contato");
  const campoNome = document.querySelector("#nome-contato");
  const campoEmail = document.querySelector("#email-contato");
  const campoAssunto = document.querySelector("#assunto-contato");
  const campoMensagem = document.querySelector("#mensagem-contato");
  const contadorMensagem = document.querySelector("#contador-mensagem");
  const feedback = document.querySelector("#feedback-contato");
  let temaAtual = "claro";

  // Usa a mesma preferência de tema da página principal.
  function aplicarTema(tema, salvar = true) {
    temaAtual = tema === "escuro" ? "escuro" : "claro";
    document.documentElement.dataset.theme = temaAtual;
    botaoTema.setAttribute("aria-pressed", String(temaAtual === "escuro"));
    botaoTema.setAttribute("aria-label", temaAtual === "escuro" ? "Ativar tema claro" : "Ativar tema escuro");
    botaoTema.title = temaAtual === "escuro" ? "Ativar tema claro" : "Ativar tema escuro";
    if (salvar) {
      try { localStorage.setItem(CHAVE_TEMA, temaAtual); } catch (erro) { /* Tema funciona durante esta sessão. */ }
    }
  }

  // Restaura o tema escolhido na loja ou consulta a preferência visual do dispositivo.
  function carregarTema() {
    let temaSalvo = null;
    try { temaSalvo = localStorage.getItem(CHAVE_TEMA); } catch (erro) { /* Usa a preferência do sistema. */ }
    if (temaSalvo === "claro" || temaSalvo === "escuro") {
      aplicarTema(temaSalvo, false);
    } else {
      const prefereEscuro = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      aplicarTema(prefereEscuro ? "escuro" : "claro", false);
    }
  }

  // Liga a mensagem de erro ao campo para orientar a correção.
  function mostrarErro(campo, idMensagem, mensagem) {
    const elementoMensagem = document.querySelector(`#${idMensagem}`);
    campo.setAttribute("aria-invalid", "true");
    elementoMensagem.textContent = mensagem;
  }

  // Remove o estado de erro quando a pessoa corrige o campo correspondente.
  function limparErro(campo, idMensagem) {
    campo.removeAttribute("aria-invalid");
    document.querySelector(`#${idMensagem}`).textContent = "";
  }

  botaoTema.addEventListener("click", () => aplicarTema(temaAtual === "claro" ? "escuro" : "claro"));
  carregarTema();
  document.querySelector("#ano-contato").textContent = String(new Date().getFullYear());

  // Atualiza o contador enquanto a mensagem é digitada e limpa avisos antigos.
  campoMensagem.addEventListener("input", () => {
    contadorMensagem.textContent = `${campoMensagem.value.length}/1200`;
    limparErro(campoMensagem, "erro-mensagem-contato");
    feedback.textContent = "";
    feedback.className = "retorno-contato";
  });

  // Assim que um campo muda, remove o aviso anterior para permitir uma nova validação.
  campoNome.addEventListener("input", () => limparErro(campoNome, "erro-nome-contato"));
  campoEmail.addEventListener("input", () => limparErro(campoEmail, "erro-email-contato"));
  campoAssunto.addEventListener("change", () => limparErro(campoAssunto, "erro-assunto-contato"));

  // O envio é interceptado: o formulário só é validado, não manda dados a um servidor.
  formulario.addEventListener("submit", evento => {
    evento.preventDefault();
    [
      [campoNome, "erro-nome-contato"],
      [campoEmail, "erro-email-contato"],
      [campoAssunto, "erro-assunto-contato"],
      [campoMensagem, "erro-mensagem-contato"]
    ].forEach(([campo, idErro]) => limparErro(campo, idErro));
    feedback.textContent = "";
    let valido = true;

    if (campoNome.value.trim().length < 2) {
      mostrarErro(campoNome, "erro-nome-contato", "Informe seu nome com pelo menos 2 caracteres.");
      valido = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campoEmail.value.trim())) {
      mostrarErro(campoEmail, "erro-email-contato", "Digite um endereço de e-mail válido.");
      valido = false;
    }
    if (!campoAssunto.value) {
      mostrarErro(campoAssunto, "erro-assunto-contato", "Selecione um assunto.");
      valido = false;
    }
    if (campoMensagem.value.trim().length < 10) {
      mostrarErro(campoMensagem, "erro-mensagem-contato", "Escreva pelo menos 10 caracteres.");
      valido = false;
    }

    if (!valido) {
      feedback.textContent = "Revise os campos destacados antes de continuar.";
      feedback.className = "retorno-contato is-error";
      formulario.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    feedback.textContent = "Formulário validado.";
    feedback.className = "retorno-contato is-success";
    formulario.reset();
    contadorMensagem.textContent = "0/1200";
  });
})();
