/* ============================================================
   PROJECT-FILTERS — Filter & sort project cards
   ============================================================ */

(function () {
  'use strict';

  function init() {
    var grid = document.getElementById('projects-grid');
    var emptyState = document.getElementById('projects-empty');
    var countBadge = document.getElementById('project-count');
    var filterPills = document.querySelectorAll('[data-filter]');
    if (!grid || !filterPills.length) return;

    var cards = grid.querySelectorAll('.project-card');
    var currentFilter = 'all';

    // Read initial filter from URL hash
    var hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash && document.querySelector('[data-filter="' + hash + '"]')) {
      currentFilter = hash;
    }

    function applyFilter(filter) {
      currentFilter = filter;
      var visibleCount = 0;

      cards.forEach(function (card) {
        var categories = (card.getAttribute('data-category') || '').toLowerCase();
        var match = filter === 'all' || categories.indexOf(filter) !== -1;
        card.style.display = match ? '' : 'none';

        if (match) {
          visibleCount++;
          // Re-animate visible cards
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(function () {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, visibleCount * 60);
        }
      });

      // Update count badge
      if (countBadge) {
        countBadge.textContent = visibleCount + ' Project' + (visibleCount !== 1 ? 's' : '');
      }

      // Show/hide empty state
      if (emptyState) {
        emptyState.classList.toggle('visible', visibleCount === 0);
      }

      // Update active pill
      filterPills.forEach(function (pill) {
        pill.classList.toggle('active', pill.getAttribute('data-filter') === filter);
      });

      // Update URL hash
      if (filter === 'all') {
        history.replaceState(null, '', window.location.pathname);
      } else {
        history.replaceState(null, '', '#' + filter);
      }
    }

    // Attach click handlers
    filterPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        applyFilter(pill.getAttribute('data-filter'));
      });
    });

    // Apply initial filter
    applyFilter(currentFilter);
  }

  window.DSProjectFilters = { init: init };
})();
