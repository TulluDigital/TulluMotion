/**
 * Tullu AI Studio – Teste Grátis
 * Arquivo: /assets/js/testform.js
 * Inclui:
 * - Stepper topo atualiza conforme etapa (is-active, is-done, aria-selected)
 * - Toggle PJ/PF robusto
 * - Validação Step1 determinística (somente PJ ou PF)
 * - Envio sem CORS (sendBeacon + fallback fetch no-cors)
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

  const stepIndicators = Array.from(document.querySelectorAll("[data-step-indicator]"));

  // meta
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
      counter.textContent = `${(el.value || "").length}/${max}`;
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
    pjFields.hidden = !isPJ;
    pfFields.hidden = isPJ;
    setActivePill(isPJ);
  }

  // clique no pill inteiro (mobile friendly)
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

  radioPJ.addEventListener("change", toggleAccountType);
  radioPF.addEventListener("change", toggleAccountType);
  toggleAccountType();

  // ===== Stepper topo =====
  function updateStepper(activeStep) {
    // activeStep: 1,2,3 (não roda para "success")
    stepIndicators.forEach((el) => {
      const s = Number(el.getAttribute("data-step-indicator"));
      const isActive = s === activeStep;
      const isDone = s < activeStep;

      el.classList.toggle("is-active", isActive);
      el.classList.toggle("is-done", isDone);

      el.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  function showStep(step) {
    Object.values(steps).forEach((s) => (s.hidden = true));
    steps[step].hidden = false;

    if (step === 1) progressBar.style.width = "33%";
    if (step === 2) progressBar.style.width = "66%";
    if (step === 3) progressBar.style.width = "100%";

    if (step === 1 || step === 2 || step === 3) updateStepper(step);
  }

  // init
  showStep(1);

  btnNext1.addEventListener("click", () => {
    if (validateStep(1)) showStep(2);
  });

  btnNext2.addEventListener("click", () => {
    if (validateStep(2)) showStep(3);
  });

  btnBack2.addEventListener("click", () => showStep(1));
  btnBack3.addEventListener("click", () => showStep(2));

  // ===== validação determinística Step1 =====
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
    return el ? (el.value || "").trim() : "";
  }

  function markError(id, on) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle("error", !!on);
  }

  function validateStep1() {
    if (!(radioPJ.checked || radioPF.checked)) {
      alert("Por favor, selecione o tipo de conta antes de continuar.");
      return false;
    }

    const isPJ = radioPJ.checked;
    const required = isPJ ? STEP1_REQUIRED_PJ : STEP1_REQUIRED_PF;

    // limpa erros dos dois lados
    [...new Set([...STEP1_REQUIRED_PJ, ...STEP1_REQUIRED_PF])].forEach((id) => markError(id, false));

    let ok = true;
    required.forEach((id) => {
      if (!getValue(id)) {
        markError(id, true);
        ok = false;
      }
    });

    if (!ok) alert("Por favor, preencha todos os campos obrigatórios antes de continuar.");
    return ok;
  }

  function validateStepGeneric(stepEl) {
    const required = Array.from(stepEl.querySelectorAll('[data-required="true"]'));

    // radios por grupo
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

    if (!ok) alert("Por favor, preencha todos os campos obrigatórios antes de continuar.");
    return ok;
  }

  function validateStep(step) {
    if (step === 1) return validateStep1();
    return validateStepGeneric(steps[step]);
  }

  // ===== envio sem CORS =====
  function sendPayloadNoCors(payload) {
    const body = JSON.stringify(payload);

    // 1) sendBeacon (melhor)
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
        const ok = navigator.sendBeacon(ENDPOINT, blob);
        return Promise.resolve(ok);
      } catch (_) {
        // cai pro fallback
      }
    }

    // 2) fetch no-cors (fire-and-forget)
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

  // ===== submit =====
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
    const prevText = submitBtn ? submitBtn.textContent : "";

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";
    }

    const ok = await sendPayloadNoCors(payload);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = prevText || "Enviar";
    }

    if (ok) {
  // sem CORS não dá pra ler resposta, então avançamos para sucesso
  Object.values(steps).forEach((s) => (s.hidden = true));
  steps.success.hidden = false;

  // ativa "modo sucesso": esconde header/stepper/progress via CSS
  document.querySelector(".form-card")?.classList.add("is-success");

  return;
}

    alert("Erro ao enviar. Tente novamente em instantes.");
  });
});
