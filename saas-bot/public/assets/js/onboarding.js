// ===== WIZARD STATE =====
let currentStep = 1;
const totalSteps = 3;
let formData = {
  step1: {},
  step2: {},
  step3: {}
};
let selectedColor = '#0E6BFF';
let logoFile = null;

// ===== DOM ELEMENTS =====
const form = document.getElementById('wizard-form');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const closeModalBtn = document.getElementById('close-modal');
const closeHelpBtn = document.getElementById('close-help-btn');
const successScreen = document.getElementById('success-screen');
const copyUrlBtn = document.getElementById('copy-url-btn');
const openPageBtn = document.getElementById('open-page-btn');
const successUrl = document.getElementById('success-url');
const colorPicker = document.getElementById('color-picker');
const logoUpload = document.getElementById('logo-upload');
const logoInput = document.getElementById('logo');
const logoPreview = document.getElementById('logo-preview');
const logoPreviewImg = document.getElementById('logo-preview-img');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateProgress();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Navigation
  nextBtn.addEventListener('click', handleNext);
  prevBtn.addEventListener('click', handlePrev);

  // Color picker
  colorPicker.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', () => selectColor(option));
  });

  // Logo upload
  logoUpload.addEventListener('click', () => logoInput.click());
  logoUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    logoUpload.classList.add('dragover');
  });
  logoUpload.addEventListener('dragleave', () => {
    logoUpload.classList.remove('dragover');
  });
  logoUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    logoUpload.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleLogoUpload(e.dataTransfer.files[0]);
    }
  });

  logoInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleLogoUpload(e.target.files[0]);
    }
  });

  // Help modal
  helpBtn.addEventListener('click', () => helpModal.classList.add('active'));
  closeModalBtn.addEventListener('click', () => helpModal.classList.remove('active'));
  closeHelpBtn.addEventListener('click', () => helpModal.classList.remove('active'));

  // Success screen
  copyUrlBtn.addEventListener('click', copyUrlToClipboard);
  openPageBtn.addEventListener('click', openPage);

  // Form submission
  form.addEventListener('submit', (e) => e.preventDefault());
}

// ===== NAVIGATION =====
function handleNext(e) {
  e.preventDefault();

  if (!validateStep(currentStep)) {
    return;
  }

  saveStepData();

  if (currentStep < totalSteps) {
    currentStep++;
    updateStep();
  } else {
    submitForm();
  }
}

function handlePrev(e) {
  e.preventDefault();
  if (currentStep > 1) {
    currentStep--;
    updateStep();
  }
}

function updateStep() {
  // Hide all steps
  document.querySelectorAll('.wizard__step').forEach(step => {
    step.classList.remove('active');
  });

  // Show current step
  document.getElementById(`step-${currentStep}`).classList.add('active');

  // Update buttons
  prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
  nextBtn.textContent = currentStep === totalSteps ? 'Publicar minha página' : 'Próximo';

  // Update progress
  updateProgress();

  // Scroll to top
  document.querySelector('.wizard__card').scrollTop = 0;
}

function updateProgress() {
  for (let i = 1; i <= totalSteps; i++) {
    const progressStep = document.getElementById(`progress-${i}`);
    progressStep.classList.remove('active', 'completed');

    if (i < currentStep) {
      progressStep.classList.add('completed');
    } else if (i === currentStep) {
      progressStep.classList.add('active');
    }
  }
}

// ===== VALIDATION =====
function validateStep(step) {
  clearErrors();

  if (step === 1) {
    return validateStep1();
  } else if (step === 2) {
    return validateStep2();
  } else if (step === 3) {
    return validateStep3();
  }

  return true;
}

function validateStep1() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const whatsapp = document.getElementById('whatsapp').value.trim();
  const segment = document.getElementById('segment').value;

  let isValid = true;

  if (!name) {
    showError('name', 'Nome é obrigatório');
    isValid = false;
  }

  if (!email || !isValidEmail(email)) {
    showError('email', 'Email válido é obrigatório');
    isValid = false;
  }

  if (!whatsapp || !isValidPhone(whatsapp)) {
    showError('whatsapp', 'WhatsApp válido é obrigatório');
    isValid = false;
  }

  if (!segment) {
    showError('segment', 'Segmento é obrigatório');
    isValid = false;
  }

  return isValid;
}

function validateStep2() {
  const businessName = document.getElementById('business-name').value.trim();
  const sellerWhatsapp = document.getElementById('seller-whatsapp').value.trim();
  const whatSell = document.getElementById('what-sell').value.trim();
  const targetAudience = document.getElementById('target-audience').value.trim();
  const faq = document.getElementById('faq').value.trim();
  const triageRules = document.getElementById('triage-rules').value.trim();

  let isValid = true;

  if (!businessName) {
    showError('businessName', 'Nome do negócio é obrigatório');
    isValid = false;
  }

  if (!sellerWhatsapp || !isValidPhone(sellerWhatsapp)) {
    showError('sellerWhatsapp', 'WhatsApp válido é obrigatório');
    isValid = false;
  }

  if (!whatSell) {
    showError('whatSell', 'Campo obrigatório');
    isValid = false;
  }

  if (!targetAudience) {
    showError('targetAudience', 'Campo obrigatório');
    isValid = false;
  }

  if (!faq) {
    showError('faq', 'FAQ é obrigatório');
    isValid = false;
  }

  if (!triageRules) {
    showError('triageRules', 'Regras de triagem são obrigatórias');
    isValid = false;
  }

  return isValid;
}

function validateStep3() {
  const aiKey = document.getElementById('ai-key').value.trim();
  const terms = document.getElementById('terms').checked;

  let isValid = true;

  if (!logoFile) {
    showError('logo', 'Logo é obrigatória');
    isValid = false;
  }

  if (!aiKey) {
    showError('aiKey', 'Chave da IA é obrigatória');
    isValid = false;
  }

  if (!terms) {
    showError('terms', 'Você deve aceitar os termos');
    isValid = false;
  }

  return isValid;
}

// ===== SAVE DATA =====
function saveStepData() {
  if (currentStep === 1) {
    formData.step1 = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      whatsapp: document.getElementById('whatsapp').value.trim(),
      segment: document.getElementById('segment').value
    };
  } else if (currentStep === 2) {
    formData.step2 = {
      businessName: document.getElementById('business-name').value.trim(),
      sellerWhatsapp: document.getElementById('seller-whatsapp').value.trim(),
      whatSell: document.getElementById('what-sell').value.trim(),
      targetAudience: document.getElementById('target-audience').value.trim(),
      faq: document.getElementById('faq').value.trim(),
      triageRules: document.getElementById('triage-rules').value.trim()
    };
  } else if (currentStep === 3) {
    formData.step3 = {
      color: selectedColor,
      aiKey: document.getElementById('ai-key').value.trim(),
      terms: document.getElementById('terms').checked
    };
  }
}

// ===== COLOR PICKER =====
function selectColor(option) {
  colorPicker.querySelectorAll('.color-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  option.classList.add('selected');
  selectedColor = option.dataset.color;
}

// ===== LOGO UPLOAD =====
function handleLogoUpload(file) {
  if (!file.type.match('image/(png|jpeg)')) {
    showError('logo', 'Apenas PNG ou JPG são aceitos');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showError('logo', 'Arquivo não pode exceder 5MB');
    return;
  }

  logoFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    logoPreviewImg.src = e.target.result;
    logoPreview.style.display = 'block';
    logoUpload.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// ===== FORM SUBMISSION =====
async function submitForm() {
  saveStepData();

  nextBtn.disabled = true;
  nextBtn.innerHTML = '<span class="loading"></span> Publicando...';

  try {
    // Simular envio para API
    // Em produção, isso seria um POST para /api/onboard
    const formDataToSend = new FormData();
    
    // Adicionar dados dos 3 passos
    Object.keys(formData.step1).forEach(key => {
      formDataToSend.append(`step1_${key}`, formData.step1[key]);
    });
    Object.keys(formData.step2).forEach(key => {
      formDataToSend.append(`step2_${key}`, formData.step2[key]);
    });
    Object.keys(formData.step3).forEach(key => {
      formDataToSend.append(`step3_${key}`, formData.step3[key]);
    });
    formDataToSend.append('logo', logoFile);

    // Simular resposta da API
    const slug = generateSlug(formData.step2.businessName);
    const pageUrl = `/c/${slug}`;

    // Armazenar dados localmente (em produção seria no Supabase)
    localStorage.setItem(`bot_${slug}`, JSON.stringify({
      ...formData.step1,
      ...formData.step2,
      color: selectedColor,
      slug: slug
    }));

    // Mostrar tela de sucesso
    form.style.display = 'none';
    successScreen.style.display = 'block';
    successUrl.textContent = window.location.origin + pageUrl;
    successUrl.dataset.url = pageUrl;

    nextBtn.disabled = false;
    nextBtn.innerHTML = 'Publicar minha página';
  } catch (error) {
    console.error('Erro ao publicar:', error);
    showError('form', 'Erro ao publicar. Tente novamente.');
    nextBtn.disabled = false;
    nextBtn.innerHTML = 'Publicar minha página';
  }
}

// ===== SUCCESS ACTIONS =====
function copyUrlToClipboard() {
  const url = successUrl.dataset.url || successUrl.textContent;
  navigator.clipboard.writeText(window.location.origin + url).then(() => {
    const originalText = copyUrlBtn.textContent;
    copyUrlBtn.textContent = '✅ Copiado!';
    setTimeout(() => {
      copyUrlBtn.textContent = originalText;
    }, 2000);
  });
}

function openPage() {
  const url = successUrl.dataset.url || successUrl.textContent;
  window.open(url, '_blank');
}

// ===== UTILITIES =====
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10;
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 30) + '-' + Math.random().toString(36).substr(2, 9);
}

function showError(fieldName, message) {
  const errorElement = document.getElementById(`error-${fieldName}`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(error => {
    error.textContent = '';
    error.style.display = 'none';
  });
}
