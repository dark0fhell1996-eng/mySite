/* ============================================
   BLITZ-IT & ELEKTRO — Interactions
   ============================================ */

(function () {
    'use strict';

    /* ===== HEADER SCROLL EFFECT ===== */
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }, { passive: true });

    /* ===== MOBILE MENU ===== */
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    menuToggle.addEventListener('click', function () {
        const isOpen = mobileMenu.classList.toggle('open');
        menuToggle.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            mobileMenu.classList.remove('open');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    /* ===== SCROLL REVEAL ===== */
    const revealElements = document.querySelectorAll(
        '.service-card, .why-card, .step, .faq-item, .area-content, .contact-info, .contact-form-wrap'
    );

    revealElements.forEach(function (el) {
        el.classList.add('reveal');
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry, index) {
                if (entry.isIntersecting) {
                    // Stagger reveal for grid items
                    const delay = entry.target.classList.contains('service-card') ||
                                  entry.target.classList.contains('why-card')
                        ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 80
                        : 0;

                    setTimeout(function () {
                        entry.target.classList.add('visible');
                    }, delay);

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        // Fallback: show all
        revealElements.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    /* ===== FORM SUBMIT FEEDBACK ===== */
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', function () {
            const btn = form.querySelector('button[type="submit"]');
            if (btn) {
                btn.textContent = 'Wird gesendet...';
                btn.disabled = true;
                btn.style.opacity = '0.7';
            }
        });
    }

    /* ===== SMOOTH SCROLL (native, but with offset fix) ===== */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href.length < 2) return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 72; // header height
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

})();
