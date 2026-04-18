/* ============================================================
   PAGE-TRANSITIONS — Smooth cross-page navigation transitions
   ============================================================ */

(function () {
  'use strict';

  var TRANSITION_OUT_DURATION = 200;
  var mainEl = null;

  function isInternalLink(link) {
    // Skip anchor-only links, external links, mailto, tel, javascript
    var href = link.getAttribute('href');
    if (!href) return false;
    if (href.charAt(0) === '#') return false;
    if (href.indexOf('mailto:') === 0) return false;
    if (href.indexOf('tel:') === 0) return false;
    if (href.indexOf('javascript:') === 0) return false;

    // Check same origin
    try {
      var resolved = new URL(href, window.location.href);
      if (resolved.origin !== window.location.origin) return false;

      // Must be an HTML page (or no extension = directory)
      var pathname = resolved.pathname;
      var ext = pathname.split('.').pop();
      if (ext && ext !== 'html' && ext !== pathname) return false;

      return true;
    } catch (e) {
      return false;
    }
  }

  function init() {
    mainEl = document.querySelector('main');
    if (!mainEl) return;

    // On page load: play enter animation
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      mainEl.classList.add('page-enter');
      setTimeout(function () {
        mainEl.classList.remove('page-enter');
      }, 300);
    }

    // Intercept internal link clicks for exit animation
    document.addEventListener('click', function (e) {
      // Skip if reduced motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      var link = e.target.closest('a');
      if (!link) return;

      // Skip if modifier keys (open in new tab)
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (link.getAttribute('target') === '_blank') return;

      if (!isInternalLink(link)) return;

      e.preventDefault();
      var href = link.getAttribute('href');

      mainEl.classList.add('page-exit');
      setTimeout(function () {
        window.location.href = href;
      }, TRANSITION_OUT_DURATION);
    });
  }

  window.DSPageTransitions = { init: init };
})();
