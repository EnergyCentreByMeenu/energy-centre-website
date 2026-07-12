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

/* =========================================================
   Book Your Free Trial — booking form
   Self-contained module. No dependencies on the code above.
   ========================================================= */
(function () {
  'use strict';

  var form = document.getElementById('bookingForm');
  if (!form) return; // contact section not present on this page

  var submitBtn = document.getElementById('submitBtn');
  var statusEl = document.getElementById('formStatus');

  var fields = {
    fullName: document.getElementById('fullName'),
    mobile: document.getElementById('mobile'),
    email: document.getElementById('email'),
    age: document.getElementById('age')
  };
  var errors = {
    fullName: document.getElementById('fullNameError'),
    mobile: document.getElementById('mobileError'),
    email: document.getElementById('emailError'),
    age: document.getElementById('ageError')
  };

  // Google Apps Script Web App URL (deployed with "Anyone" access)
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUQK6Vc1Rky2TqRNuOpDC0b342YrNKkYalHXmVhH1BfluaeGyrh_iZAIp7ctbIwYCK/exec';

  /**
   * Sends the booking data to the Google Apps Script backend.
   * Uses text/plain as the content type to avoid triggering a
   * CORS preflight (OPTIONS) request, which Apps Script web apps
   * cannot answer. The script on the other end still parses the
   * body as JSON via e.postData.contents.
   */
  function submitBooking(data) {
    return fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(data)
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Network response was not OK');
        }
        return response.json();
      })
      .then(function (result) {
        if (!result || result.success !== true) {
          throw new Error('Booking was not saved successfully');
        }
        return result;
      });
  }

  function setFieldError(key, message) {
    if (fields[key]) fields[key].classList.toggle('has-error', Boolean(message));
    if (errors[key]) errors[key].textContent = message || '';
  }

  function clearAllErrors() {
    Object.keys(fields).forEach(function (key) { setFieldError(key, ''); });
  }

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.classList.remove('is-success', 'is-error');
    statusEl.classList.add('is-visible', type === 'success' ? 'is-success' : 'is-error');
  }

  function hideStatus() {
    statusEl.classList.remove('is-visible', 'is-success', 'is-error');
    statusEl.textContent = '';
  }

  function setLoading(isLoading) {
    submitBtn.classList.toggle('is-loading', isLoading);
    submitBtn.disabled = isLoading;
    submitBtn.querySelector('.btn-text').textContent = isLoading ? 'Booking…' : 'Book Free Trial';
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isValidMobile(value) {
    var digitsOnly = value.replace(/[\s-]/g, '');
    return /^\+?\d{7,15}$/.test(digitsOnly);
  }

  function validate(data) {
    var isValid = true;
    var firstInvalidField = null;

    if (!data.fullName || data.fullName.trim().length < 2) {
      setFieldError('fullName', 'Please enter your full name.');
      isValid = false;
      firstInvalidField = firstInvalidField || fields.fullName;
    }

    if (!data.mobile || !isValidMobile(data.mobile)) {
      setFieldError('mobile', 'Please enter a valid mobile number.');
      isValid = false;
      firstInvalidField = firstInvalidField || fields.mobile;
    }

    if (data.email && !isValidEmail(data.email)) {
      setFieldError('email', 'Please enter a valid email address.');
      isValid = false;
      firstInvalidField = firstInvalidField || fields.email;
    }

    if (data.age && (Number(data.age) < 5 || Number(data.age) > 100)) {
      setFieldError('age', 'Please enter an age between 5 and 100.');
      isValid = false;
      firstInvalidField = firstInvalidField || fields.age;
    }

    if (firstInvalidField) firstInvalidField.focus();
    return isValid;
  }

  // Clear a field's error as soon as the visitor starts fixing it
  Object.keys(fields).forEach(function (key) {
    if (!fields[key]) return;
    fields[key].addEventListener('input', function () { setFieldError(key, ''); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideStatus();

    var formData = new FormData(form);
    var data = {
      fullName: (formData.get('fullName') || '').toString().trim(),
      mobile: (formData.get('mobile') || '').toString().trim(),
      email: (formData.get('email') || '').toString().trim(),
      age: (formData.get('age') || '').toString().trim(),
      gender: (formData.get('gender') || '').toString(),
      yogaClass: (formData.get('yogaClass') || '').toString(),
      goal: (formData.get('goal') || '').toString().trim(),
      preferredTime: (formData.get('preferredTime') || '').toString(),
      experience: (formData.get('experience') || '').toString(),
      medicalNotes: (formData.get('medicalNotes') || '').toString().trim()
    };

    clearAllErrors();
    if (!validate(data)) {
      showStatus('Please fix the highlighted fields and try again.', 'error');
      return;
    }

    setLoading(true);

    submitBooking(data)
      .then(function () {
        showStatus("You're all set! Meenu's team will reach out shortly to confirm your free trial.", 'success');
        form.reset();
      })
      .catch(function () {
        showStatus('Something went wrong while booking your trial. Please try again.', 'error');
      })
      .finally(function () {
        setLoading(false);
      });
  });

})();
