/**
 * Tullu – Newsletter
 * Arquivo: /assets/js/formnewsletter.js
 * Envia dados para o novo endpoint do Google Apps Script
 */

document.addEventListener("DOMContentLoaded", () => {
  const FORM = document.getElementById("newsletterForm");
  const CARD = document.getElementById("newsletterCard");
  const SUCCESS = document.getElementById("successStep");
  const SUBMIT = document.getElementById("submitBtn");

  // SEU NOVO ENDPOINT ATUALIZADO
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbyH3_RwSQohU3XD80na2geBMMmPVmItQc8gRhuVv69RPEFWqtM8wUgCGerCTHcA3Dmi/exec";

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

    [nome, email, whatsapp, consent].forEach((f) => f && markError(f, false));

    if (!getValue("nome")) { markError(nome, true); ok = false; }
    
    const emailVal = getValue("email");
    if (!emailVal || !emailVal.includes("@")) { markError(email, true); ok = false; }

    if (!getValue("whatsapp")) { markError(whatsapp, true); ok = false; }

    if (!consent || !consent.checked) { markError(consent, true); ok = false; }

    if (!ok) {
      alert("Por favor, preencha os campos obrigatórios.");
    }
    return ok;
  }

  // -------- Envio Robustos (Form Data) --------

  async function sendPayload(payload) {
    // Transformamos o objeto em formato de formulário para garantir recepção no Google
    const searchParams = new URLSearchParams();
    for (const key in payload) {
      searchParams.append(key, payload[key]);
    }

    try {
      await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors", // Necessário para evitar bloqueio de CORS do Google
        body: searchParams,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      // Com no-cors, o fetch não retorna 'ok', então assumimos sucesso se não houver erro de rede
      return true; 
    } catch (error) {
      console.error("Erro no envio:", error);
      return false;
    }
  }

  // -------- Evento de Submit --------

  FORM.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      nome: getValue("nome"),
      email: getValue("email"),
      whatsapp: getValue("whatsapp"),
      segmento: getValue("segmento"),
      consent: document.getElementById("consent").checked,
      source_url: window.location.href,
      user_agent: navigator.userAgent
    };

    const prevText = SUBMIT ? SUBMIT.textContent : "Entrar na newsletter";
    if (SUBMIT) {
      SUBMIT.disabled = true;
      SUBMIT.textContent = "Enviando...";
    }

    const ok = await sendPayload(payload);

    if (ok) {
      if (CARD) CARD.classList.add("is-success");
      if (SUCCESS) {
        SUCCESS.hidden = false;
        SUCCESS.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      alert("Erro ao enviar. Tente novamente em instantes.");
      if (SUBMIT) {
        SUBMIT.disabled = false;
        SUBMIT.textContent = prevText;
      }
    }
  });
});
