/* ============================================================
   THEME — Dark/Light toggle with localStorage persistence
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'ds-portfolio-theme';
  const themeToggle = document.getElementById('theme-toggle');

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function setTheme(theme) {
    // Add transition class
    document.documentElement.classList.add('theme-transitioning');
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update toggle icon
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', theme === 'dark' ? 'moon' : 'sun');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
      themeToggle.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }

    // Dispatch custom event for other modules
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));

    // Remove transition class after animations complete
    setTimeout(function () {
      document.documentElement.classList.remove('theme-transitioning');
    }, 350);
  }

  // Initialize theme on load (before DOMContentLoaded to prevent flash)
  setTheme(getPreferredTheme());

  // Toggle on click
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Listen for OS preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Expose for command palette
  window.DSTheme = { toggle: function () {
    var current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  }};
})();
