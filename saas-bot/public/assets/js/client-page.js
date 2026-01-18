// ===== CLIENT PAGE STATE =====
let clientConfig = null;
let sessionId = null;
let leadData = null;
let chatHistory = [];
let currentStep = 0;
const maxChatSteps = 4;

// ===== DOM ELEMENTS =====
const initialForm = document.getElementById('initial-form');
const chatSection = document.getElementById('chat-section');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const whatsappSection = document.getElementById('whatsapp-section');
const whatsappBtn = document.getElementById('whatsapp-btn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const clientLogo = document.getElementById('client-logo');
const clientTitle = document.getElementById('client-title');
const clientSubtitle = document.getElementById('client-subtitle');
const startChatBtn = document.getElementById('start-chat-btn');
const pageBg = document.querySelector('.page-bg');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  const slug = getSlugFromUrl();
  if (!slug) {
    showError('Slug não encontrado na URL');
    return;
  }

  loadClientConfig(slug);
  setupEventListeners();
});

// ===== GET SLUG FROM URL =====
function getSlugFromUrl() {
  const pathParts = window.location.pathname.split('/');
  return pathParts[pathParts.length - 1] || null;
}

// ===== LOAD CLIENT CONFIG =====
async function loadClientConfig(slug) {
  try {
    loading.style.display = 'block';

    // Em produção, isso seria um GET para /api/config?slug=...
    // Por enquanto, vamos simular carregando do localStorage (do wizard)
    const configData = localStorage.getItem(`bot_${slug}`);

    if (!configData) {
      showError('Configuração do bot não encontrada');
      return;
    }

    clientConfig = JSON.parse(configData);
    clientConfig.slug = slug;

    // Atualizar página com dados do cliente
    clientTitle.textContent = clientConfig.businessName;
    clientSubtitle.textContent = `Olá! Bem-vindo ao atendimento de ${clientConfig.businessName}`;

    // Se tiver logo, exibir
    if (clientConfig.logoUrl) {
      clientLogo.src = clientConfig.logoUrl;
      clientLogo.style.display = 'block';
    }

    // Aplicar cor do cliente
    applyClientColor(clientConfig.color);

    loading.style.display = 'none';
  } catch (error) {
    console.error('Erro ao carregar configuração:', error);
    showError('Erro ao carregar configuração do bot');
  }
}

// ===== APPLY CLIENT COLOR =====
function applyClientColor(color) {
  pageBg.classList.remove('color-cyan', 'color-blue2');

  if (color === '#22D3EE') {
    pageBg.classList.add('color-cyan');
  } else if (color === '#2F8CFF') {
    pageBg.classList.add('color-blue2');
  }

  document.documentElement.style.setProperty('--primary-color', color);
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  startChatBtn.addEventListener('click', handleStartChat);
  sendBtn.addEventListener('click', handleSendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  });
}

// ===== START CHAT =====
async function handleStartChat(e) {
  e.preventDefault();

  // Validar formulário inicial
  const name = document.getElementById('lead-name').value.trim();
  const city = document.getElementById('lead-city').value.trim();
  const message = document.getElementById('lead-message').value.trim();
  const age = document.getElementById('lead-age').value;

  if (!name || !city || !message) {
    showFieldError('lead-name', 'Todos os campos obrigatórios devem ser preenchidos');
    return;
  }

  // Salvar dados do lead
  leadData = {
    name,
    city,
    message,
    age: age ? parseInt(age) : null,
    timestamp: new Date().toISOString()
  };

  // Criar sessão
  try {
    startChatBtn.disabled = true;
    startChatBtn.innerHTML = '<span class="loading"></span> Iniciando...';

    // Em produção, isso seria um POST para /api/session
    sessionId = generateSessionId();

    // Armazenar sessão localmente
    localStorage.setItem(`session_${sessionId}`, JSON.stringify({
      slug: clientConfig.slug,
      leadData: leadData,
      createdAt: new Date().toISOString()
    }));

    // Mostrar chat
    initialForm.style.display = 'none';
    chatSection.style.display = 'block';

    // Adicionar mensagem inicial do bot
    addBotMessage(`Olá ${name}! Obrigado por entrar em contato com ${clientConfig.businessName}. Vou fazer algumas perguntas rápidas para entender melhor sua necessidade. 😊`);

    // Iniciar triagem
    currentStep = 0;
    askTriageQuestion();

    startChatBtn.disabled = false;
    startChatBtn.innerHTML = 'Começar conversa';
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    showFieldError('lead-name', 'Erro ao iniciar chat. Tente novamente.');
    startChatBtn.disabled = false;
    startChatBtn.innerHTML = 'Começar conversa';
  }
}

// ===== ASK TRIAGE QUESTION =====
function askTriageQuestion() {
  if (currentStep >= maxChatSteps) {
    // Fim da triagem
    showWhatsappButton();
    return;
  }

  // Simular perguntas baseadas nas regras de triagem
  const questions = [
    'Qual é seu orçamento aproximado para este projeto?',
    'Qual é sua urgência? (Baixa, Média ou Alta)',
    'Você já trabalhou com algo similar antes?',
    'Qual é o melhor horário para você ser contatado?'
  ];

  const question = questions[currentStep] || 'Há mais algo que você gostaria de compartilhar?';
  addBotMessage(question);
  currentStep++;
}

// ===== HANDLE SEND MESSAGE =====
async function handleSendMessage() {
  const text = chatInput.value.trim();

  if (!text) return;

  // Adicionar mensagem do usuário
  addUserMessage(text);
  chatInput.value = '';
  sendBtn.disabled = true;
  sendBtn.innerHTML = '<span class="loading"></span>';

  try {
    // Em produção, isso seria um POST para /api/chat
    // Por enquanto, simular resposta
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Armazenar resposta
    chatHistory.push({
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    });

    // Se ainda há perguntas, fazer a próxima
    if (currentStep < maxChatSteps) {
      askTriageQuestion();
    } else {
      // Fim da triagem
      showWhatsappButton();
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    addBotMessage('Desculpe, houve um erro. Tente novamente.');
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerHTML = 'Enviar';
  }
}

// ===== CHAT MESSAGES =====
function addBotMessage(text) {
  const message = document.createElement('div');
  message.className = 'chat-message bot';
  message.innerHTML = `
    <div class="chat-message__avatar">🤖</div>
    <div class="chat-message__content">${escapeHtml(text)}</div>
  `;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  chatHistory.push({
    role: 'bot',
    content: text,
    timestamp: new Date().toISOString()
  });
}

function addUserMessage(text) {
  const message = document.createElement('div');
  message.className = 'chat-message user';
  message.innerHTML = `
    <div class="chat-message__avatar">👤</div>
    <div class="chat-message__content">${escapeHtml(text)}</div>
  `;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===== SHOW WHATSAPP BUTTON =====
function showWhatsappButton() {
  addBotMessage('Perfeito! Vou conectar você com nosso time. Clique no botão abaixo para continuar no WhatsApp! 👇');

  // Gerar mensagem resumida
  const summary = generateWhatsappMessage();

  // Configurar botão WhatsApp
  const whatsappNumber = clientConfig.sellerWhatsapp.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(summary)}`;

  whatsappBtn.href = whatsappUrl;
  whatsappSection.style.display = 'block';

  // Desabilitar input de chat
  chatInput.disabled = true;
  sendBtn.disabled = true;
}

// ===== GENERATE WHATSAPP MESSAGE =====
function generateWhatsappMessage() {
  const responses = chatHistory
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content)
    .join(' | ');

  const intenção = currentStep >= 3 ? 'Alta' : currentStep >= 2 ? 'Média' : 'Baixa';

  return `Olá! Meu nome é ${leadData.name}, tenho ${leadData.age || '?'} anos, sou de ${leadData.city}. ${leadData.message}. Respostas: ${responses}. Intenção: ${intenção}`;
}

// ===== UTILITIES =====
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showError(message) {
  errorText.textContent = message;
  errorMessage.style.display = 'block';
  loading.style.display = 'none';
  initialForm.style.display = 'none';
}

function showFieldError(fieldId, message) {
  const errorElement = document.getElementById(`error-${fieldId}`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}
