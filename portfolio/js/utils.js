/* ============================================================
   UTILS — Counters, clipboard, typing, helpers
   ============================================================ */

(function () {
  'use strict';

  /* --- Animated Counters --- */
  function initCounters() {
    var metricNumbers = document.querySelectorAll('.metric-number[data-target]');
    if (!metricNumbers.length) return;

    function animateCounter(el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1600;
      var startTime = null;

      // Reduced motion: show final value immediately
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.textContent = prefix + target + suffix;
        return;
      }

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        var current = Math.round(eased * target);
        el.textContent = prefix + current + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      metricNumbers.forEach(function (el) { observer.observe(el); });
    } else {
      metricNumbers.forEach(animateCounter);
    }
  }

  /* --- Clipboard Copy --- */
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; });
    }
    // Fallback
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return Promise.resolve(true);
    } catch (e) {
      document.body.removeChild(textarea);
      return Promise.resolve(false);
    }
  }

  /* --- Copy Email Button --- */
  function initCopyEmail() {
    var btn = document.getElementById('copy-email');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var email = btn.getAttribute('data-email');
      if (!email) return;
      copyToClipboard(email).then(function (ok) {
        if (ok && window.DSToast) {
          window.DSToast.show('Email copied to clipboard!', 'success');
        }
      });
    });
  }

  /* --- Typed.js Hero --- */
  function initTyped() {
    var el = document.getElementById('typed-role');
    if (!el) return;

    if (typeof Typed !== 'undefined') {
      new Typed('#typed-role', {
        strings: [
          'Product Analyst',
          'Builder',
          'Data-Driven PM',
          'APM Candidate',
          'Zero-to-One Executor'
        ],
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
      });
    } else {
      // Fallback: simple rotation without Typed.js
      var roles = ['Product Analyst', 'Builder', 'Data-Driven PM', 'APM Candidate', 'Zero-to-One Executor'];
      var idx = 0;
      el.textContent = roles[0];
      setInterval(function () {
        idx = (idx + 1) % roles.length;
        el.style.opacity = 0;
        setTimeout(function () {
          el.textContent = roles[idx];
          el.style.opacity = 1;
        }, 300);
      }, 2500);
    }
  }

  /* --- Debounce --- */
  function debounce(fn, delay) {
    var timer;
    return function () {
      var args = arguments;
      var ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
    };
  }

  /* --- Expose --- */
  window.DSUtils = {
    initCounters: initCounters,
    initCopyEmail: initCopyEmail,
    initTyped: initTyped,
    copyToClipboard: copyToClipboard,
    debounce: debounce
  };
})();
