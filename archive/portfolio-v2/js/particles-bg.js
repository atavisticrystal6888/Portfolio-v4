/* ============================================================
   PARTICLES-BG — tsParticles ambient background
   ============================================================ */

(function () {
  'use strict';

  function init() {
    if (typeof tsParticles === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var theme = document.documentElement.getAttribute('data-theme');
    var color = theme === 'light' ? '#2d8a9c' : '#5ba4b5';

    tsParticles.load('particles-bg', {
      fullScreen: false,
      fpsLimit: 60,
      particles: {
        number: {
          value: 30,
          density: { enable: true, area: 1000 }
        },
        color: { value: color },
        shape: { type: 'circle' },
        opacity: {
          value: 0.15,
          random: { enable: true, minimumValue: 0.05 }
        },
        size: {
          value: 2,
          random: { enable: true, minimumValue: 0.5 }
        },
        move: {
          enable: true,
          speed: 0.3,
          direction: 'none',
          random: true,
          straight: false,
          outModes: { default: 'out' }
        },
        links: {
          enable: true,
          distance: 150,
          color: color,
          opacity: 0.06,
          width: 1
        }
      },
      interactivity: {
        events: {
          onHover: { enable: false },
          onClick: { enable: false }
        }
      },
      detectRetina: true
    });

    // Theme change: update particle colors
    window.addEventListener('themechange', function (e) {
      var newColor = e.detail.theme === 'light' ? '#2d8a9c' : '#5ba4b5';
      var container = tsParticles.domItem(0);
      if (container) {
        container.options.particles.color.value = newColor;
        container.options.particles.links.color = newColor;
        container.refresh();
      }
    });
  }

  window.DSParticles = { init: init };
})();
