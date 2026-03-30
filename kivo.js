/* ==========================================================
   KIVO SHARED JS  —  kivo.js
   Drop this at the bottom of every page's <body>.
========================================================== */

(function () {
  'use strict';

  // ── 1. Header scroll state ─────────────────────────────
  const header = document.getElementById('header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── 2. Mobile menu ─────────────────────────────────────
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.style.display = 'block';
    requestAnimationFrame(() => mobileMenu.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOpen = false;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    // Hide after transition
    mobileMenu.addEventListener('transitionend', () => {
      if (!menuOpen) mobileMenu.style.display = 'none';
    }, { once: true });
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
    mobileMenu.querySelectorAll('a').forEach(link =>
      link.addEventListener('click', closeMenu)
    );
    // Close on ESC
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) closeMenu(); });
  }

  // ── 3. Scroll-reveal animations ────────────────────────
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => io.observe(el));
  } else {
    // Fallback: just show everything
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // ── 4. Cookie banner ───────────────────────────────────
  const cookieBanner  = document.getElementById('cookieBanner');
  const cookieAccept  = document.getElementById('cookieAccept');
  const cookieDecline = document.getElementById('cookieDecline');

  if (cookieBanner) {
    if (!localStorage.getItem('kivo_cookie')) {
      setTimeout(() => cookieBanner.classList.remove('hidden'), 1400);
    }
    if (cookieAccept) cookieAccept.addEventListener('click', () => {
      localStorage.setItem('kivo_cookie', 'accepted');
      cookieBanner.classList.add('hidden');
      // Enable Vercel Analytics when accepted
      if (typeof window.va === 'function') window.va('event', 'cookie_accepted');
    });
    if (cookieDecline) cookieDecline.addEventListener('click', () => {
      localStorage.setItem('kivo_cookie', 'declined');
      cookieBanner.classList.add('hidden');
      // Disable Vercel Analytics when declined — set opt-out flag
      localStorage.setItem('va-disable', '1');
      // Remove any existing va cookies
      document.cookie.split(';').forEach(c => {
        if (c.trim().startsWith('va_')) {
          document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
        }
      });
    });
  }

  // ── 5. Active nav link ─────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === currentPage) link.classList.add('active');
  });

  // ── 6. Form helpers ────────────────────────────────────
  // Auto-format currency inputs
  document.querySelectorAll('[data-format="currency"]').forEach(input => {
    input.addEventListener('blur', () => {
      const val = parseFloat(input.value.replace(/[^0-9.]/g, ''));
      if (!isNaN(val)) input.value = '£' + val.toLocaleString('en-GB');
    });
    input.addEventListener('focus', () => {
      input.value = input.value.replace(/[^0-9.]/g, '');
    });
  });

  // Range slider live value display
  document.querySelectorAll('.range-slider').forEach(slider => {
    const display = document.getElementById(slider.dataset.display);
    const prefix  = slider.dataset.prefix || '';
    const suffix  = slider.dataset.suffix || '';
    const updateDisplay = () => {
      if (display) {
        const val = parseInt(slider.value);
        display.textContent = prefix + val.toLocaleString('en-GB') + suffix;
      }
    };
    slider.addEventListener('input', updateDisplay);
    updateDisplay();
  });

  // ── 7. Smooth anchor scroll (for in-page links) ────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // header height
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Dynamic copyright year ────────────────────────────────
  document.querySelectorAll('.footer__copy').forEach(el => {
    el.innerHTML = el.innerHTML.replace(/© \d{4}/, '© ' + new Date().getFullYear());
  });

  // ── Score history ─────────────────────────────────────────
  // Expose globally so kivo-check.html can call it after scoring
  window.kivoSaveScoreHistory = function(score, band, bandEmoji) {
    try {
      const history = JSON.parse(localStorage.getItem('kivoScoreHistory') || '[]');
      history.unshift({ score, band, bandEmoji, date: new Date().toISOString() });
      // Keep last 3 only
      localStorage.setItem('kivoScoreHistory', JSON.stringify(history.slice(0, 3)));
    } catch(e) {}
  };


})();
