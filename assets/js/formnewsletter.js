/**
 * Tullu – Newsletter
 * Arquivo: /assets/js/formnewsletter.js
 * Envia dados para Google Apps Script (Web App)
 * - Validação básica
 * - Envio sem CORS (sendBeacon + fetch no-cors)
 * - Tela de sucesso
 */

document.addEventListener("DOMContentLoaded", () => {
  const FORM = document.getElementById("newsletterForm");
  const CARD = document.getElementById("newsletterCard");
  const SUCCESS = document.getElementById("successStep");
  const SUBMIT = document.getElementById("submitBtn");

  const ENDPOINT =
    "https://script.google.com/macros/s/AKfycby6BUzHO9BFrNFtsJAmin4u9KNWHuNv1a-3Blaok4xEREO19hohd-HL_FigLkDkZ5Yq/exec";

  // meta
  const sourceUrl = document.getElementById("source_url");
  const userAgent = document.getElementById("user_agent");
  if (sourceUrl) sourceUrl.value = window.location.href;
  if (userAgent) userAgent.value = navigator.userAgent;

  // -------- Helpers --------

  function getValue(id) {
    const el = document.getElementById(id);
    return el ? (el.value || "").trim() : "";
  }

  function markError(el, on) {
    if (!el) return;
    el.classList.toggle("error", !!on);
  }

  function validate() {
    let ok = true;

    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    const whatsapp = document.getElementById("whatsapp");
    const consent = document.getElementById("consent");

    // limpa estados
    [nome, email, whatsapp, consent].forEach((f) => f && markError(f, false));

    if (!getValue("nome")) {
      markError(nome, true);
      ok = false;
    }

    const emailVal = getValue("email");
    if (!emailVal || !emailVal.includes("@")) {
      markError(email, true);
      ok = false;
    }

    if (!getValue("whatsapp")) {
      markError(whatsapp, true);
      ok = false;
    }

    if (!consent || !consent.checked) {
      markError(consent, true);
      ok = false;
    }

    if (!ok) {
      alert("Por favor, preencha os campos obrigatórios para entrar na lista.");
    }

    return ok;
  }

  // envio sem CORS
  function sendPayloadNoCors(payload) {
    const body = JSON.stringify(payload);

    // 1) sendBeacon
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
        const ok = navigator.sendBeacon(ENDPOINT, blob);
        return Promise.resolve(ok);
      } catch (_) {}
    }

    // 2) fetch no-cors
    return fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      body,
      cache: "no-store",
      redirect: "follow",
    })
      .then(() => true)
      .catch(() => false);
  }

  // -------- Submit --------

  FORM.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      nome: getValue("nome"),
      email: getValue("email"),
      whatsapp: getValue("whatsapp"),
      segmento: getValue("segmento"),
      consent: document.getElementById("consent").checked,
      source_url: getValue("source_url"),
      user_agent: getValue("user_agent"),
    };

    const prevText = SUBMIT ? SUBMIT.textContent : "";
    if (SUBMIT) {
      SUBMIT.disabled = true;
      SUBMIT.textContent = "Enviando...";
    }

    const ok = await sendPayloadNoCors(payload);

    if (SUBMIT) {
      SUBMIT.disabled = false;
      SUBMIT.textContent = prevText || "Entrar na newsletter";
    }

    if (ok) {
      // mostra sucesso
      if (CARD) CARD.classList.add("is-success");
      if (SUCCESS) SUCCESS.hidden = false;
      return;
    }

    alert("Erro ao enviar. Tente novamente em instantes.");
  });
});
