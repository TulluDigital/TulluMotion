/**
 * Tullu AI Studio – Teste Grátis
 * Arquivo: /assets/js/testform.js
 * Correções principais:
 * - Step 1 valida apenas campos do tipo selecionado (PJ ou PF), sem depender de hidden
 * - Toggle PJ/PF robusto (clique no pill e change no radio)
 * - Step 2 e Step 3 validam apenas o que está no step
 * - Envio para Google Apps Script e tela final
 */

document.addEventListener("DOMContentLoaded", () => {
  const FORM = document.getElementById("trialForm");

  const ENDPOINT =
    "https://script.google.com/macros/s/AKfycbw0tCfd1hwZdYfsi-iIONxY559l7jvyrMMFcCNUKx7jwlmr4NW3byractu3da8tuA0/exec";

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

  const pillPJ = document.getElementById("pillPJ");
  const pillPF = document.getElementById("pillPF");

  const radioPJ = document.getElementById("accountTypePJ");
  const radioPF = document.getElementById("accountTypePF");

  // hidden metadata
  const sourceUrl = document.getElementById("source_url");
  const userAgent = document.getElementById("user_agent");
  if (sourceUrl) sourceUrl.value = window.location.href;
  if (userAgent) userAgent.value = navigator.userAgent;

  // contadores
  setupCounter("observacoes", "obsCounter", 800);
  setupCounter("briefing_geral", "briefCounter", 3000);
  setupCounter("briefing_agente", "agentCounter", 2000);
  setupCounter("integracoes_ativos", "assetsCounter", 1500);

  function setupCounter(textareaId, counterId, max) {
    const el = document.getElementById(textareaId);
    const counter = document.getElementById(counterId);
    if (!el || !counter) return;

    const update = () => {
      const len = (el.value || "").length;
      counter.textContent = `${len}/${max}`;
    };

    el.addEventListener("input", update);
    update();
  }

  function setActivePill(isPJ) {
    if (!pillPJ || !pillPF) return;
    pillPJ.classList.toggle("is-active", isPJ);
    pillPF.classList.toggle("is-active", !isPJ);
  }

  function toggleAccountType() {
    const isPJ = radioPJ.checked;

    // troca campos
    pjFields.hidden = !isPJ;
    pfFields.hidden = isPJ;

    // troca visual pill
    setActivePill(isPJ);
  }

  // clique no pill inteiro, garante toggle em mobile
  if (pillPJ) {
    pillPJ.addEventListener("click", () => {
      radioPJ.checked = true;
      radioPF.checked = false;
      toggleAccountType();
    });
  }

  if (pillPF) {
    pillPF.addEventListener("click", () => {
      radioPF.checked = true;
      radioPJ.checked = false;
      toggleAccountType();
    });
  }

  // change no radio
  radioPJ.addEventListener("change", toggleAccountType);
  radioPF.addEventListener("change", toggleAccountType);

  toggleAccountType();

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

  // =========================
  // VALIDAÇÃO ROBUSTA
  // =========================

  // Campos obrigatórios Step 1 por tipo
  const STEP1_REQUIRED_PJ = [
    "pj_razao_social",
    "pj_email",
    "pj_cnpj",
    "pj_segmento",
    "pj_telefone",
    "pj_max_users",
    "observacoes",
  ];

  const STEP1_REQUIRED_PF = [
    "pf_nome",
    "pf_cpf",
    "pf_email",
    "pf_segmento",
    "pf_telefone",
    "pf_max_users",
    "observacoes",
  ];

  function getValue(id) {
    const el = document.getElementById(id);
    if (!el) return "";
    return (el.value || "").trim();
  }

  function markError(id, hasError) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle("error", !!hasError);
  }

  function validateStep1() {
    // valida se algum tipo está selecionado
    const typeOk = radioPJ.checked || radioPF.checked;
    if (!typeOk) {
      alert("Por favor, selecione o tipo de conta antes de continuar.");
      return false;
    }

    const isPJ = radioPJ.checked;
    const required = isPJ ? STEP1_REQUIRED_PJ : STEP1_REQUIRED_PF;

    let ok = true;

    // limpa erros nos dois conjuntos (pra não ficar sujo ao alternar)
    [...new Set([...STEP1_REQUIRED_PJ, ...STEP1_REQUIRED_PF])].forEach((id) => {
      markError(id, false);
    });

    required.forEach((id) => {
      const v = getValue(id);
      if (!v) {
        markError(id, true);
        ok = false;
      }
    });

    if (!ok) {
      alert("Por favor, preencha todos os campos obrigatórios antes de continuar.");
    }

    return ok;
  }

  function validateStepGeneric(stepEl) {
    // valida apenas fields required dentro do step (checkbox e inputs/textarea)
    const required = Array.from(stepEl.querySelectorAll('[data-required="true"]'));

    // radio: valida por grupo name, uma vez só
    const radioNames = new Set();
    const toValidate = [];

    for (const f of required) {
      const type = (f.type || "").toLowerCase();
      if (type === "radio") {
        if (!radioNames.has(f.name)) {
          radioNames.add(f.name);
          toValidate.push(f);
        }
      } else {
        toValidate.push(f);
      }
    }

    let ok = true;

    toValidate.forEach((field) => {
      field.classList.remove("error");
      const type = (field.type || "").toLowerCase();

      if (type === "checkbox") {
        if (!field.checked) {
          field.classList.add("error");
          ok = false;
        }
        return;
      }

      if (type === "radio") {
        const group = FORM.querySelectorAll(`input[type="radio"][name="${CSS.escape(field.name)}"]`);
        const anyChecked = Array.from(group).some((r) => r.checked);
        if (!anyChecked) {
          field.classList.add("error");
          ok = false;
        }
        return;
      }

      const v = (field.value || "").trim();
      if (!v) {
        field.classList.add("error");
        ok = false;
      }
    });

    if (!ok) {
      alert("Por favor, preencha todos os campos obrigatórios antes de continuar.");
    }

    return ok;
  }

  function validateStep(step) {
    if (step === 1) return validateStep1();
    return validateStepGeneric(steps[step]);
  }

  // =========================
  // SUBMIT FINAL
  // =========================
  FORM.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateStep(1)) return;
    if (!validateStep(2)) return;
    if (!validateStep(3)) return;

    const payload = {};
    new FormData(FORM).forEach((value, key) => {
      payload[key] = value;
    });

    payload.account_type = radioPJ.checked ? "PJ" : "PF";
    payload.accept_terms = document.getElementById("accept_terms").checked;

    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";
    }

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data || data.ok !== true) {
        console.error("Resposta do endpoint:", data);
        alert("Erro ao enviar o formulário. Verifique os campos e tente novamente.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Enviar";
        }
        return;
      }

      showStep("success");
    } catch (err) {
      console.error(err);
      alert("Erro de conexão. Tente novamente em instantes.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar";
      }
    }
  });
});
