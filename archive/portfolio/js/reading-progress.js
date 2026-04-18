/* ============================================================
   READING-PROGRESS — Progress bar, TOC generation, active heading
   Works on article and case-study pages
   ============================================================ */

(function () {
  'use strict';

  var progressBar = null;
  var articleBody = null;
  var tocNav = null;
  var headingOffsets = [];
  var headingIds = [];
  var tocLinks = [];

  /* ---- Progress bar ---- */
  function updateProgress() {
    if (!articleBody || !progressBar) return;

    var rect = articleBody.getBoundingClientRect();
    var totalHeight = articleBody.offsetHeight;
    var scrolled = -rect.top;
    var progress = Math.max(0, Math.min(1, scrolled / (totalHeight - window.innerHeight)));

    progressBar.style.width = (progress * 100) + '%';
  }

  /* ---- Generate TOC from headings ---- */
  function buildTOC() {
    if (!articleBody || !tocNav) return;

    var headings = articleBody.querySelectorAll('h2, h3');
    if (!headings.length) return;

    var html = '<ul class="toc-list">';

    for (var i = 0; i < headings.length; i++) {
      var heading = headings[i];
      var id = heading.id;
      if (!id) {
        id = heading.textContent
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        heading.id = id;
      }

      var level = heading.tagName === 'H3' ? 'toc-item-sub' : 'toc-item';

      html += '<li class="' + level + '">';
      html += '<a href="#' + id + '" class="toc-link" data-heading="' + id + '">';
      html += heading.textContent;
      html += '</a></li>';

      headingIds.push(id);
    }

    html += '</ul>';
    tocNav.innerHTML = html;
    tocLinks = tocNav.querySelectorAll('.toc-link');
  }

  /* ---- Active heading tracking via IntersectionObserver ---- */
  function trackActiveHeading() {
    if (!articleBody || !tocLinks.length) return;

    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          setActiveHeading(id);
        }
      });
    }, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0
    });

    var headings = articleBody.querySelectorAll('h2, h3');
    for (var i = 0; i < headings.length; i++) {
      observer.observe(headings[i]);
    }
  }

  function setActiveHeading(id) {
    for (var i = 0; i < tocLinks.length; i++) {
      var isActive = tocLinks[i].getAttribute('data-heading') === id;
      tocLinks[i].classList.toggle('active', isActive);
    }
  }

  /* ---- Smooth scroll for TOC clicks ---- */
  function initTOCClicks() {
    if (!tocNav) return;

    tocNav.addEventListener('click', function (e) {
      var link = e.target.closest('.toc-link');
      if (!link) return;

      e.preventDefault();
      var targetId = link.getAttribute('data-heading');
      var target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL without scroll
        history.replaceState(null, '', '#' + targetId);
      }
    });
  }

  /* ---- Init ---- */
  function init() {
    progressBar = document.querySelector('.reading-progress-bar');
    articleBody = document.querySelector('.article-body') || document.querySelector('.cs-content');
    tocNav = document.getElementById('toc-nav');

    if (!articleBody) return;

    // Progress bar
    if (progressBar) {
      window.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();
    }

    // TOC
    if (tocNav) {
      buildTOC();
      trackActiveHeading();
      initTOCClicks();
    }
  }

  window.DSReadingProgress = { init: init };
})();
