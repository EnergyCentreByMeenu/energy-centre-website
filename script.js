/* =========================================================
   Energy Centre — script.js
   Vanilla JS only. No frameworks, no dependencies.
   ========================================================= */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* -------------------------------------------------------
     1. Sticky header — add shadow/background once scrolled
     ------------------------------------------------------- */
  var header = document.getElementById('siteHeader');

  function updateHeaderState() {
    if (window.scrollY > 8) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  /* -------------------------------------------------------
     2. Mobile menu toggle
     ------------------------------------------------------- */
  var menuToggle = document.getElementById('menuToggle');
  var mainNav = document.getElementById('mainNav');

  function closeMenu() {
    mainNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    var isOpen = mainNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', toggleMenu);

    // Close the mobile menu whenever a nav link is tapped
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape for keyboard users
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* -------------------------------------------------------
     3. Scroll-reveal animations via IntersectionObserver
     ------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    // Show everything immediately — no motion needed
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // animate once, then stop watching
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* -------------------------------------------------------
     4. Animated statistic counters
     ------------------------------------------------------- */
  var statNumbers = document.querySelectorAll('.stat-number');

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';

    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString() + suffix;
      return;
    }

    var duration = 1600; // ms
    var startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic for a natural deceleration
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);

      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);
  }

  if (statNumbers.length && 'IntersectionObserver' in window) {
    var statObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach(function (el) { statObserver.observe(el); });
  } else {
    statNumbers.forEach(function (el) { animateCount(el); });
  }

})();