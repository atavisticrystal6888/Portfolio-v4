/* ============================================================
   COMMAND-PALETTE — Ctrl+K fuzzy search navigation
   ============================================================ */

(function () {
  'use strict';

  var overlay = document.getElementById('command-palette-overlay');
  var input = document.getElementById('command-palette-input');
  var resultsContainer = document.getElementById('command-palette-results');
  if (!overlay || !input) return;

  var allItems = [];
  var activeIndex = -1;
  var isOpen = false;

  function open() {
    overlay.hidden = false;
    isOpen = true;
    input.value = '';
    input.focus();
    filterItems('');
    activeIndex = -1;
    document.body.classList.add('no-scroll');

    // Re-init lucide for palette icons
    if (typeof lucide !== 'undefined') {
      setTimeout(function () { lucide.createIcons(); }, 50);
    }
  }

  function close() {
    overlay.hidden = true;
    isOpen = false;
    document.body.classList.remove('no-scroll');
  }

  function collectItems() {
    allItems = [];
    var buttons = resultsContainer.querySelectorAll('.command-palette-item');
    buttons.forEach(function (btn) {
      allItems.push({
        el: btn,
        text: (btn.querySelector('span') || btn).textContent.toLowerCase(),
        action: btn.getAttribute('data-action'),
        target: btn.getAttribute('data-target'),
        url: btn.getAttribute('data-url'),
        value: btn.getAttribute('data-value')
      });
    });
  }

  function filterItems(query) {
    var q = query.toLowerCase().trim();
    var visibleCount = 0;

    allItems.forEach(function (item) {
      var match = !q || item.text.indexOf(q) !== -1;
      item.el.style.display = match ? 'flex' : 'none';
      if (match) visibleCount++;
    });

    // Show/hide group titles
    var groups = resultsContainer.querySelectorAll('.command-palette-group');
    groups.forEach(function (group) {
      var hasVisible = group.querySelectorAll('.command-palette-item[style*="flex"], .command-palette-item:not([style])');
      var anyVisible = false;
      group.querySelectorAll('.command-palette-item').forEach(function (item) {
        if (item.style.display !== 'none') anyVisible = true;
      });
      group.style.display = anyVisible ? 'block' : 'none';
    });

    activeIndex = -1;
    clearActive();
  }

  function executeItem(item) {
    close();

    if (item.action === 'navigate' && item.target) {
      var el = document.querySelector(item.target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (item.action === 'theme') {
      if (window.DSTheme) window.DSTheme.toggle();
    } else if (item.action === 'link' && item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else if (item.action === 'copy' && item.value) {
      if (window.DSUtils) {
        window.DSUtils.copyToClipboard(item.value).then(function () {
          if (window.DSToast) window.DSToast.show('Copied to clipboard!', 'success');
        });
      }
    }
  }

  function clearActive() {
    allItems.forEach(function (item) { item.el.classList.remove('active'); });
  }

  function setActive(index) {
    clearActive();
    var visibleItems = allItems.filter(function (item) { return item.el.style.display !== 'none'; });
    if (index >= 0 && index < visibleItems.length) {
      activeIndex = index;
      visibleItems[index].el.classList.add('active');
      visibleItems[index].el.scrollIntoView({ block: 'nearest' });
    }
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    // Open: Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (isOpen) close();
      else open();
      return;
    }

    if (!isOpen) return;

    var visibleItems = allItems.filter(function (item) { return item.el.style.display !== 'none'; });

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      var next = activeIndex + 1;
      if (next >= visibleItems.length) next = 0;
      setActive(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      var prev = activeIndex - 1;
      if (prev < 0) prev = visibleItems.length - 1;
      setActive(prev);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < visibleItems.length) {
        var item = visibleItems[activeIndex];
        executeItem(item);
      }
    }
  });

  // Input filtering
  input.addEventListener('input', function () {
    filterItems(input.value);
  });

  // Click on item
  resultsContainer.addEventListener('click', function (e) {
    var btn = e.target.closest('.command-palette-item');
    if (!btn) return;
    var item = allItems.find(function (i) { return i.el === btn; });
    if (item) executeItem(item);
  });

  // Click overlay to close
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  // Trigger buttons
  var triggerBtn = document.getElementById('command-palette-trigger');
  if (triggerBtn) triggerBtn.addEventListener('click', open);

  var heroTrigger = document.getElementById('hero-cmd-trigger');
  if (heroTrigger) heroTrigger.addEventListener('click', open);

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    collectItems();
  });

  window.DSCommandPalette = { open: open, close: close };
})();
