/**
 * Tullu AI Studio – Teste Grátis
 * Arquivo: /assets/js/testform.js
 * Fix principal:
 * - Envia POST como text/plain (sem header application/json) para evitar preflight/CORS no iOS Safari
 * - Parse robusto da resposta (JSON ou texto)
 * - Step 1 valida só PJ ou só PF (determinístico)
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

  // ===== validação determinística =====
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
    [...new Set([...STEP1_REQUIRED_PJ, ...STEP1_REQUIRED_PF])].forEach((id) => {
      markError(id, false);
    });

    let ok = true;
    required.forEach((id) => {
      const v = getValue(id);
      if (!v) {
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
        const group = FORM.querySelectorAll(
          `input[type="radio"][name="${CSS.escape(field.name)}"]`
        );
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

    try {
      // IMPORTANTÍSSIMO: sem headers -> vira text/plain, evita preflight no iOS
      const res = await fetch(ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload),
        redirect: "follow",
        cache: "no-store",
      });

      const raw = await res.text();
      let data = null;

      try {
        data = JSON.parse(raw);
      } catch (_) {
        // se não veio JSON, ainda assim tentamos detectar sucesso
        // muitos Apps Scripts devolvem HTML ou texto em alguns cenários
        data = { ok: false, raw };
      }

      if (data && data.ok === true) {
        showStep("success");
        return;
      }

      console.error("Resposta do endpoint (raw):", raw);
      alert("Erro ao enviar o formulário. Tente novamente em instantes.");
    } catch (err) {
      console.error("Fetch falhou:", err);
      alert("Erro de conexão. Tente novamente em instantes.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = prevText || "Enviar";
      }
    }
  });
});
