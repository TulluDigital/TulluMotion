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
    
    if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const headerHeight = header.offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
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
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Animate counters when they come into view
                if (entry.target.classList.contains('metric-card')) {
                    const numberElement = entry.target.querySelector('.metric-card__number');
                    const target = parseInt(numberElement.getAttribute('data-target'));
                    
                    if (target && !numberElement.classList.contains('animated')) {
                        numberElement.classList.add('animated');
                        animateCounter(numberElement, target);
                    }
                }
                
                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.scroll-animate, .metric-card, .service-card, .process-step, .feature');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// ===== BACKGROUND ANIMATION =====
function createBackgroundAnimation() {
    const heroBackground = document.querySelector('.hero__bg');
    const ctaBackground = document.querySelector('.cta-final__bg');
    
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
        
        // Pause animation when tab is not visible
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
    const parallaxElements = document.querySelectorAll('.hero__bg');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
}

// ===== THROTTLE FUNCTION =====
function throttle(func, limit) {
    let inThrottle;
    return function() {
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

// ===== FORM HANDLING (if needed) =====
function handleFormSubmission(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Create WhatsApp message
    const message = `Olá! Gostaria de saber mais sobre a Tullu Motion.%0A%0ANome: ${data.name || 'Não informado'}%0AEmail: ${data.email || 'Não informado'}%0AMensagem: ${data.message || 'Interesse nos serviços'}`;
    
    // Open WhatsApp
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
}

// ===== LAZY LOADING IMAGES =====
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
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
    // Preload critical resources
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
    // Add keyboard navigation for mobile menu
    navToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMobileMenu();
        }
    });
    
    // Add focus management for mobile menu
    navMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
            navToggle.focus();
        }
    });
    
    // Add skip to content link
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
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// ===== ERROR HANDLING =====
function setupErrorHandling() {
    window.addEventListener('error', (e) => {
        console.error('JavaScript Error:', e.error);
        // You could send this to an error tracking service
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled Promise Rejection:', e.reason);
        // You could send this to an error tracking service
    });
}

// ===== ANALYTICS TRACKING =====
function trackEvent(eventName, eventData = {}) {
    // Google Analytics 4 event tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    // You can add other analytics services here
    console.log('Event tracked:', eventName, eventData);
}

// ===== CTA CLICK TRACKING =====
function setupCTATracking() {
    const ctaButtons = document.querySelectorAll('.btn--primary');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const buttonText = button.textContent.trim();
            const section = button.closest('section')?.id || 'unknown';
            
            trackEvent('cta_click', {
                button_text: buttonText,
                section: section,
                url: button.href
            });
        });
    });
}

// ===== SCROLL PROGRESS INDICATOR =====
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
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

// ===== INITIALIZATION =====
function init() {
    // Setup error handling first
    setupErrorHandling();
    
    // Performance optimizations
    optimizePerformance();
    
    // Core functionality
    createIntersectionObserver();
    createBackgroundAnimation();
    enhanceAccessibility();
    setupLazyLoading();
    
    // Analytics and tracking
    setupCTATracking();
    
    // UI enhancements
    createScrollProgress();
    
    // Event listeners
    window.addEventListener('scroll', throttle(() => {
        handleHeaderScroll();
        handleParallax();
    }, 16));
    
    window.addEventListener('resize', debounce(() => {
        // Handle resize events if needed
        console.log('Window resized');
    }, 250));
    
    navToggle.addEventListener('click', toggleMobileMenu);
    
    // Add smooth scroll to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', smoothScrollToAnchor);
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Handle forms if they exist
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmission);
    });
    
    // Add scroll animations to elements
    const elementsToAnimate = document.querySelectorAll('.service-card, .process-step, .feature, .metric-card');
    elementsToAnimate.forEach(el => {
        el.classList.add('scroll-animate');
    });
    
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
        trackEvent
    };
}
