/* ============================================================
   BLOG-SEARCH — Fuzzy search + category filter for blog listing
   ============================================================ */

(function () {
  'use strict';

  var searchInput = null;
  var categoryPills = null;
  var articleCards = null;
  var emptyState = null;
  var activeCategory = 'all';
  var debounceTimer = null;

  /* ---- Simple fuzzy match ---- */
  function fuzzyMatch(query, text) {
    if (!query) return true;
    query = query.toLowerCase();
    text = text.toLowerCase();

    // Direct substring match first
    if (text.indexOf(query) !== -1) return true;

    // Simple fuzzy: all query chars appear in order
    var qi = 0;
    for (var ti = 0; ti < text.length && qi < query.length; ti++) {
      if (text[ti] === query[qi]) qi++;
    }
    return qi === query.length;
  }

  /* ---- Filter articles ---- */
  function filterArticles() {
    var query = searchInput ? searchInput.value.trim() : '';
    var visible = 0;

    for (var i = 0; i < articleCards.length; i++) {
      var card = articleCards[i];
      var category = card.getAttribute('data-category') || '';
      var title = card.getAttribute('data-title') || '';
      var excerpt = card.getAttribute('data-excerpt') || '';

      var matchesCategory = activeCategory === 'all' || category === activeCategory;
      var matchesSearch = fuzzyMatch(query, title + ' ' + excerpt);

      if (matchesCategory && matchesSearch) {
        card.style.display = '';
        card.classList.add('fade-in', 'visible');
        visible++;
      } else {
        card.style.display = 'none';
        card.classList.remove('visible');
      }
    }

    // Empty state
    if (emptyState) {
      emptyState.hidden = visible > 0;
    }
  }

  /* ---- Set active category ---- */
  function setCategory(category) {
    activeCategory = category;

    for (var i = 0; i < categoryPills.length; i++) {
      categoryPills[i].classList.toggle('active', categoryPills[i].getAttribute('data-category') === category);
    }

    // Persist in URL
    if (category === 'all') {
      history.replaceState(null, '', window.location.pathname);
    } else {
      history.replaceState(null, '', '#' + category);
    }

    filterArticles();
  }

  /* ---- Read category from URL hash ---- */
  function readHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash && ['product', 'data', 'career', 'technical'].indexOf(hash) !== -1) {
      return hash;
    }
    return 'all';
  }

  /* ---- Init ---- */
  function init() {
    searchInput = document.getElementById('blog-search-input');
    emptyState = document.getElementById('blog-empty-state');
    categoryPills = document.querySelectorAll('.category-pill[data-category]');
    articleCards = document.querySelectorAll('.article-card[data-category]');

    if (!articleCards.length) return;

    // Category pills
    for (var i = 0; i < categoryPills.length; i++) {
      categoryPills[i].addEventListener('click', function () {
        setCategory(this.getAttribute('data-category'));
      });
    }

    // Search input (debounced)
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(filterArticles, 200);
      });
    }

    // Restore category from URL
    var initialCategory = readHash();
    if (initialCategory !== 'all') {
      setCategory(initialCategory);
    }
  }

  window.DSBlogSearch = { init: init };
})();
