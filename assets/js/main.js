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
                    const target = parseInt(numberElement?.getAttribute('data-tar
