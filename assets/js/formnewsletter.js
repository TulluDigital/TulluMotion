/**
 * Tullu – Newsletter
 * Arquivo: /assets/js/formnewsletter.js
 * Envia dados para Google Apps Script atualizado
 */

document.addEventListener("DOMContentLoaded", () => {
  const FORM = document.getElementById("newsletterForm");
  const CARD = document.getElementById("newsletterCard");
  const SUCCESS = document.getElementById("successStep");
  const SUBMIT = document.getElementById("submitBtn");

  // SEU NOVO ENDPOINT ATUALIZADO
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbyhwMFCkOP09-iqeERTQvwXLD6WnjBChYY-ylAl79Lq8aVT61YSaOLN3TjthzoIdQLR/exec";

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

    // limpa estados de erro anteriores
    [nome, email, whatsapp, consent].forEach((f) => f && markError(f, false));

    if (!getValue("nome")) { markError(nome, true); ok = false; }
    
    const emailVal = getValue("email");
    if (!emailVal || !emailVal.includes("@")) { markError(email, true); ok = false; }

    if (!getValue("whatsapp")) { markError(whatsapp, true); ok = false; }

    if (!consent || !consent.checked) { markError(consent, true); ok = false; }

    if (!ok) {
      alert("Por favor, preencha os campos obrigatórios para entrar na lista.");
    }
    return ok;
  }

  // -------- Fluxo de Envio --------

  async function sendPayload(payload) {
    const body = JSON.stringify(payload);

    try {
      // Usamos mode: 'no-cors' para evitar problemas de política de origem com o Google
      // Importante: no-cors não permite ler a resposta do servidor (ok: true), 
      // então tratamos o sucesso pela ausência de erro de rede.
      await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        cache: "no-store",
        body: body,
        headers: {
          "Content-Type": "text/plain" // Evita o 'preflight' do CORS
        }
      });
      return true; 
    } catch (error) {
      console.error("Erro na requisição:", error);
      return false;
    }
  }

  // -------- Submit Event --------

  FORM.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Validação
    if (!validate()) return;

    // 2. Preparação dos dados
    const payload = {
      nome: getValue("nome"),
      email: getValue("email"),
      whatsapp: getValue("whatsapp"),
      segmento: getValue("segmento"),
      consent: document.getElementById("consent").checked,
      source_url: window.location.href,
      user_agent: navigator.userAgent
    };

    // 3. UI Status (Enviando...)
    const prevText = SUBMIT ? SUBMIT.textContent : "";
    if (SUBMIT) {
      SUBMIT.disabled = true;
      SUBMIT.textContent = "Enviando...";
    }

    // 4. Execução
    const ok = await sendPayload(payload);

    // 5. Resposta Visual
    if (ok) {
      // Sucesso
      if (CARD) CARD.classList.add("is-success");
      if (SUCCESS) {
        SUCCESS.hidden = false;
        SUCCESS.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Erro
      alert("Houve um erro técnico. Por favor, tente novamente em alguns instantes.");
      if (SUBMIT) {
        SUBMIT.disabled = false;
        SUBMIT.textContent = prevText;
      }
    }
  });
});
