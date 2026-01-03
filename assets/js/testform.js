/**
 * Tullu AI Studio – Teste Grátis
 * Arquivo: /assets/js/testform.js
 * Envia dados para Google Sheets via Apps Script
 */

document.addEventListener("DOMContentLoaded", () => {
  const FORM = document.getElementById("trialForm");
  const ENDPOINT =
    "https://script.google.com/macros/s/AKfycbw0tCfd1hwZdYfsi-iIONxY559l7jvyrMMFcCNUKx7jwlmr4NW3byractu3da8tuA0/exec";

  /* =====================
     ELEMENTOS PRINCIPAIS
  ====================== */
  const steps = {
    1: document.getElementById("step1"),
    2: document.getElementById("step2"),
    3: document.getElementById("step3"),
    success: document.getElementById("successStep"),
  };

  const progressBar = document.getElementById("progressBar");

  const btnNext1 = document.getElementById("nextBtn1");
  const btnNext2 = document.getElementById("nextBtn2");
  const btnBack2 = document.getElementById("backBtn2");
  const btnBack3 = document.getElementById("backBtn3");

  const pjFields = document.getElementById("pjFields");
  const pfFields = document.getElementById("pfFields");

  const radioPJ = document.getElementById("accountTypePJ");
  const radioPF = document.getElementById("accountTypePF");

  /* =====================
     META AUTOMÁTICA
  ====================== */
  document.getElementById("source_url").value = window.location.href;
  document.getElementById("user_agent").value = navigator.userAgent;

  /* =====================
     CONTADORES
  ====================== */
  setupCounter("observacoes", "obsCounter", 800);
  setupCounter("briefing_geral", "briefCounter", 3000);
  setupCounter("briefing_agente", "agentCounter", 2000);
  setupCounter("integracoes_ativos", "assetsCounter", 1500);

  function setupCounter(textareaId, counterId, max) {
    const el = document.getElementById(textareaId);
    const counter = document.getElementById(counterId);
    if (!el || !counter) return;

    el.addEventListener("input", () => {
      counter.textContent = `${el.value.length}/${max}`;
    });
  }

  /* =====================
     TOGGLE PJ / PF
  ====================== */
  function toggleAccountType() {
    if (radioPJ.checked) {
      pjFields.hidden = false;
      pfFields.hidden = true;
    } else {
      pjFields.hidden = true;
      pfFields.hidden = false;
    }
  }

  radioPJ.addEventListener("change", toggleAccountType);
  radioPF.addEventListener("change", toggleAccountType);
  toggleAccountType();

  /* =====================
     STEP CONTROL
  ====================== */
  function showStep(step) {
    Object.values(steps).forEach((s) => (s.hidden = true));
    steps[step].hidden = false;

    if (step === 1) progressBar.style.width = "33%";
    if (step === 2) progressBar.style.width = "66%";
    if (step === 3) progressBar.style.width = "100%";
  }

  btnNext1.addEventListener("click", () => {
    if (validateStep(1)) showStep(2);
  });

  btnNext2.addEventListener("click", () => {
    if (validateStep(2)) showStep(3);
  });

  btnBack2.addEventListener("click", () => showStep(1));
  btnBack3.addEventListener("click", () => showStep(2));

  /* =====================
     VALIDAÇÃO
  ====================== */
  function validateStep(step) {
    let valid = true;
    const scope = steps[step];

    const requiredFields = scope.querySelectorAll("[data-required='true']");

    requiredFields.forEach((field) => {
      field.classList.remove("error");

      if (
        field.type === "radio" ||
        field.type === "checkbox"
      ) {
        if (!field.checked) {
          valid = false;
          field.classList.add("error");
        }
      } else if (!field.value || field.value.trim() === "") {
        valid = false;
        field.classList.add("error");
      }
    });

    // regra PJ / PF
    if (step === 1) {
      if (radioPJ.checked && pjFields.hidden) valid = false;
      if (radioPF.checked && pfFields.hidden) valid = false;
    }

    if (!valid) {
      alert("Por favor, preencha todos os campos obrigatórios antes de continuar.");
    }

    return valid;
  }

  /* =====================
     SUBMIT FINAL
  ====================== */
  FORM.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    const payload = {};

    new FormData(FORM).forEach((value, key) => {
      payload[key] = value;
    });

    // normalização
    payload.account_type = radioPJ.checked ? "PJ" : "PF";
    payload.accept_terms = document.getElementById("accept_terms").checked;

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.ok) {
        console.error(data);
        alert("Erro ao enviar o formulário. Verifique os campos e tente novamente.");
        return;
      }

      showStep("success");
    } catch (err) {
      console.error(err);
      alert("Erro de conexão. Tente novamente em instantes.");
    }
  });
});
