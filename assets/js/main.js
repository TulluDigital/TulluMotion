// ===== MAIN JAVASCRIPT FILE =====

// DOM Elements
const header = document.getElementById('header');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav__link');

// ===== HEADER SCROLL EFFECT =====
function handleHeaderScroll() {
    if (window.scrollY >= 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// ===== MOBILE MENU TOGGLE =====
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

// ===== CLOSE MOBILE MENU ON LINK CLICK =====
function closeMobileMenu() {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
function smoothScrollToAnchor(e) {
    const href = e.currentTarget.getAttribute('href');
    if (!href) return;

    if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const headerHeight = header.offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            closeMobileMenu();
        }
    }
}

// ===== ANIMATED COUNTER =====
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        element.textContent = Math.floor(current);
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, 16);
}

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
function createIntersectionObserver() {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');

                // Animate counters when they come into view
                if (entry.target.classList.contains('metric-card')) {
                    const numberElement = entry.target.querySelector('.metric-card__number');
                    const target = parseInt(numberElement?.getAttribute('data-target'));
                    if (target && !numberElement.classList.contains('animated')) {
                        numberElement.classList.add('animated');
                        animateCounter(numberElement, target);
                    }
                }

                // light glow on diagnostic card
                if (entry.target.classList.contains('glow-card')) {
                    entry.target.classList.add('glow-card--active');
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.scroll-animate, .metric-card, .service-card, .process-step, .feature, .glow-card');
    animatedElements.forEach(el => observer.observe(el));
}

// ===== BACKGROUND ANIMATION =====
function createBackgroundAnimation() {
    const heroBackground = document.querySelector('.hero__bg');

    if (heroBackground) {
        let animationFrame;
        let time = 0;

        function animate() {
            time += 0.01;
            const x = Math.sin(time) * 10;
            const y = Math.cos(time * 0.8) * 15;
            heroBackground.style.transform = `translate(${x}px, ${y}px)`;
            animationFrame = requestAnimationFrame(animate);
        }
        animate();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrame);
            } else {
                animate();
            }
        });
    }
}

// ===== PARALLAX EFFECT =====
function handleParallax() {
    const scrolled = window.pageYOffset;
    document.querySelectorAll('.hero__bg').forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
}

// ===== THROTTLE FUNCTION =====
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// ===== DEBOUNCE FUNCTION =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== GENERIC FORM HANDLING (fallback) =====
function handleFormSubmission(e) {
    // se for o formulário do diagnóstico, ele tem seu próprio handler
    if (e.target?.id === 'diagnostic-form') return;

    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const message = `Olá! Gostaria de saber mais sobre a Tullu Motion.%0A%0ANome: ${data.name || 'Não informado'}%0AEmail: ${data.email || 'Não informado'}%0AMensagem: ${data.message || 'Interesse nos serviços'}`;
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
}

// ===== LAZY LOADING IMAGES =====
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    images.forEach(img => imageObserver.observe(img));
}

// ===== PERFORMANCE OPTIMIZATION =====
function optimizePerformance() {
    const criticalImages = [
        'assets/img/tullu.png',
        'assets/img/cobra.png.png',
        'assets/img/weblab.png.png',
        'assets/img/growth.png.png',
        'assets/img/aistudio.png.png'
    ];
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
function enhanceAccessibility() {
    navToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMobileMenu();
        }
    });

    navMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
            navToggle.focus();
        }
    });

    const skipLink = document.createElement('a');
    skipLink.href = '#hero';
    skipLink.textContent = 'Pular para o conteúdo principal';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1001;
        transition: top 0.3s;
    `;
    skipLink.addEventListener('focus', () => skipLink.style.top = '6px');
    skipLink.addEventListener('blur', () => skipLink.style.top = '-40px');
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// ===== ERROR HANDLING =====
function setupErrorHandling() {
    window.addEventListener('error', (e) => {
        console.error('JavaScript Error:', e.error);
    });
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled Promise Rejection:', e.reason);
    });
}

// ===== ANALYTICS TRACKING =====
function trackEvent(eventName, eventData = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    console.log('Event tracked:', eventName, eventData);
}

// ===== CTA CLICK TRACKING =====
function setupCTATracking() {
    const ctaButtons = document.querySelectorAll('.btn--primary');
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent.trim();
            const section = button.closest('section')?.id || 'unknown';
            trackEvent('cta_click', { button_text: buttonText, section, url: button.href });
        });
    });
}

// ===== SCROLL PROGRESS INDICATOR =====
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 0%; height: 3px;
        background: var(--gradient-primary);
        z-index: 1002;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    function updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    }
    window.addEventListener('scroll', throttle(updateScrollProgress, 10));
}

/* =========================================================================
   DIAGNÓSTICO RÁPIDO — interação embutida
   Estrutura HTML já está em #diagnostico
   =======================================================================*/

// mapeamento de planos (data-driven)
const PLANOS = {
    weblab: {
        nome: 'WebLab',
        why: 'Entrega rápida com base em sua prioridade por site e prazos curtos.',
        bullets: [
            'Landing page/mini-site em 5–10 dias',
            'SEO técnico + velocidade elevada',
            'Integração WhatsApp e Analytics'
        ],
        cta: 'Quero meu site em 10 dias'
    },
    growth: {
        nome: 'Growth',
        why: 'Foco em captação de leads e otimização de conversão.',
        bullets: [
            'Meta Ads e Google Ads orientados por dados',
            'CRO: testes rápidos e melhoria contínua',
            'Relatórios com métricas que importam'
        ],
        cta: 'Quero mais leads/vendas'
    },
    cobra: {
        nome: 'Cobra (Ops & IA)',
        why: 'Automatiza atendimento e processos para escalar com eficiência.',
        bullets: [
            'Automação de WhatsApp, CRM e e-mail',
            'Playbooks e bots com IA',
            'Orquestração de dados e relatórios'
        ],
        cta: 'Quero automatizar com IA'
    },
    aistudio: {
        nome: 'AI Studio',
        why: 'Soluções setoriais prontas para usar (ex.: saúde).',
        bullets: [
            'Bots prontos por segmento',
            'Integrações nativas',
            'Onboarding guiado'
        ],
        cta: 'Quero um bot para meu setor'
    }
};

// regra simples de pontuação por resposta
function sugerirPlano(respostas) {
    const score = { weblab: 0, growth: 0, cobra: 0, aistudio: 0 };

    // prioridade
    switch (respostas.prioridade) {
        case 'site_rapido': score.weblab += 3; break;
        case 'mais_leads': score.growth += 3; break;
        case 'automatizar':
        case 'estrategia_ia': score.cobra += 3; break;
        default: break;
    }

    // prazo
    if (respostas.prazo === 'semana') score.weblab += 1;
    if (respostas.prazo === '30d') score.growth += 1;
    if (respostas.prazo === '60_90d' || respostas.prazo === 'sem_pressa') score.cobra += 1;

    // estágio (multi)
    const estagios = respostas.estagio || [];
    if (estagios.includes('sem_site') || estagios.includes('site_antigo')) score.weblab += 1;
    if (estagios.includes('rodo_ads')) score.growth += 1;
    if (estagios.includes('nunca_ads')) score.growth += 1;
    if (estagios.includes('uso_whatsapp') || estagios.includes('quero_automatizar_whatsapp') || estagios.includes('tenho_crm') || estagios.includes('sem_crm')) score.cobra += 1;

    // escolhe o maior
    const plano = Object.entries(score).sort((a,b) => b[1]-a[1])[0][0];
    return plano;
}

// estado do fluxo
const diagState = {
    step: 1,
    respostas: {
        prioridade: null,
        prioridade_outro: '',
        prazo: null,
        estagio: []
    }
};

function qsDiag(sel, root = document) {
    return root.querySelector(sel);
}
function qsaDiag(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
}

function initDiagnostico() {
    const section = document.getElementById('diagnostico');
    if (!section) return;

    const form = qsDiag('#diagnostic-form', section);
    const steps = qsaDiag('.diag-step', form);
    const progressBar = qsDiag('.diagnostic__progress-bar', section);
    const resultBox = qsDiag('#diag-result', section);
    const planBox = qsDiag('#diag-plan', section);
    const whyBox = qsDiag('#diag-why', section);
    const ctaWhats = qsDiag('#diag-primary-cta', section);

    // chips (single/multi)
    qsaDiag('.chip', form).forEach(chip => {
        chip.addEventListener('click', () => {
            const name = chip.dataset.name;
            const value = chip.dataset.value;

            // se grupo for multi (estágio tem duplicatas permitidas), apenas alternar
            if (name === 'estagio') {
                chip.classList.toggle('chip--selected');
                const set = new Set(diagState.respostas.estagio);
                if (chip.classList.contains('chip--selected')) set.add(value);
                else set.delete(value);
                diagState.respostas.estagio = Array.from(set);
            } else {
                // single selection: desmarca outros do mesmo grupo
                qsaDiag(`.chip[data-name="${name}"]`, form).forEach(c => c.classList.remove('chip--selected'));
                chip.classList.add('chip--selected');
                diagState.respostas[name] = value;

                // campo "outro"
                const inputWrap = qsDiag(`.diag-input[data-input-for="outro"]`, form);
                if (name === 'prioridade') {
                    if (value === 'outro') {
                        inputWrap?.classList.remove('diag-input--hidden');
                        qsDiag('#prioridade_outro', inputWrap)?.focus();
                    } else {
                        inputWrap?.classList.add('diag-input--hidden');
                    }
                }
            }

            trackEvent('diagnostic_chip_select', { name, value });
            updateNextButtonsState(form); // habilita próximo quando tiver escolha
        });
    });

    // controla botões Próximo/Voltar
    qsaDiag('[data-next]', form).forEach(btn => {
        btn.addEventListener('click', () => {
            if (!canAdvance(diagState.step)) return;
            goToStep(diagState.step + 1);
        });
    });
    qsaDiag('[data-prev]', form).forEach(btn => {
        btn.addEventListener('click', () => {
            goToStep(diagState.step - 1);
        });
    });

    // submit => mostra recomendação
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!canAdvance(diagState.step)) return;

        const outroText = qsDiag('#prioridade_outro', form)?.value?.trim();
        if (diagState.respostas.prioridade === 'outro') {
            diagState.respostas.prioridade_outro = outroText || '';
        }

        const planoKey = sugerirPlano(diagState.respostas);
        const plano = PLANOS[planoKey];

        // render cards
        whyBox.textContent = plano.why;
        planBox.innerHTML = `
            <h4 class="diag-plan__name">${plano.nome}</h4>
            <ul class="diag-plan__bullets">
                ${plano.bullets.map(b => `<li>${b}</li>`).join('')}
            </ul>
        `;

        // CTA dinâmica com mensagem WhatsApp contendo respostas
        const msg = buildWhatsAppMessage(plano.nome, diagState.respostas);
        const waUrl = `https://wa.me/5511959029428?text=${encodeURIComponent(msg)}`;
        ctaWhats.href = waUrl;
        ctaWhats.textContent = plano.cta;

        resultBox.hidden = false;
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

        trackEvent('diagnostic_submit', { plano: plano.nome, respostas: diagState.respostas });
    });

    // helpers locais
    function goToStep(step) {
        if (step < 1 || step > steps.length) return;
        steps.forEach(s => s.hidden = true);
        const target = steps[step - 1];
        target.hidden = false;
        diagState.step = step;
        updateProgress(step);
        updateNextButtonsState(form);
        target.querySelector('.chip, .diag-text')?.focus();
        trackEvent('diagnostic_step_change', { step });
    }

    function updateProgress(step) {
        const total = steps.length;
        const pct = Math.round((step - 1) / total * 100);
        if (progressBar) {
            progressBar.style.width = `${pct}%`;
            progressBar.setAttribute('data-progress', String(pct));
        }
    }

    function valueSelected(name) {
        if (name === 'estagio') return (diagState.respostas.estagio || []).length > 0;
        return !!diagState.respostas[name];
    }

    function canAdvance(step) {
        if (step === 1) return valueSelected('prioridade');
        if (step === 2) return valueSelected('prazo');
        if (step === 3) return valueSelected('estagio');
        return true;
    }

    function updateNextButtonsState(root) {
        qsaDiag('.diag-step', root).forEach(fs => {
            const step = Number(fs.dataset.step);
            const nextBtn = qsDiag('[data-next]', fs);
            if (nextBtn) nextBtn.disabled = !canAdvance(step);
        });
    }

    // inicia no passo 1
    goToStep(1);
}

function buildWhatsAppMessage(planoNome, respostas) {
    const est = (respostas.estagio || []).join(', ') || 'Não informado';
    const outro = respostas.prioridade === 'outro' && respostas.prioridade_outro ? ` (${respostas.prioridade_outro})` : '';
    return [
        'Olá! Vim pelo site da Tullu Motion.',
        `Plano sugerido: ${planoNome}.`,
        `Prioridade: ${respostas.prioridade}${outro}.`,
        `Prazo: ${respostas.prazo || 'Não informado'}.`,
        `Estágio atual: ${est}.`,
        'Quero avançar com esta recomendação.'
    ].join(' ');
}

/* =========================================================================
   FIM DIAGNÓSTICO
   =======================================================================*/

// ===== INITIALIZATION =====
function init() {
    setupErrorHandling();
    optimizePerformance();

    createIntersectionObserver();
    createBackgroundAnimation();
    enhanceAccessibility();
    setupLazyLoading();

    setupCTATracking();
    createScrollProgress();

    // Event listeners
    window.addEventListener('scroll', throttle(() => {
        handleHeaderScroll();
        handleParallax();
    }, 16));

    window.addEventListener('resize', debounce(() => {
        console.log('Window resized');
    }, 250));

    navToggle.addEventListener('click', toggleMobileMenu);

    // smooth scroll para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', smoothScrollToAnchor);
    });

    // fechar menu mobile clicando fora
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // forms genéricos
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.addEventListener('submit', handleFormSubmission));

    // animações base
    const elementsToAnimate = document.querySelectorAll('.service-card, .process-step, .feature, .metric-card');
    elementsToAnimate.forEach(el => el.classList.add('scroll-animate'));

    // inicia Diagnóstico
    initDiagnostico();

    console.log('Tullu Motion website initialized successfully! 🚀');
}

// ===== LOAD EVENT =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleHeaderScroll,
        toggleMobileMenu,
        smoothScrollToAnchor,
        animateCounter,
        trackEvent,
        sugerirPlano,
        buildWhatsAppMessage
    };
}
