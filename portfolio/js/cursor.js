/* ============================================================
   CURSOR — Custom cursor with magnetic effect
   ============================================================ */

(function () {
  'use strict';

  // Skip on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
  if (window.matchMedia('(max-width: 767px)').matches) return;

  var dot = document.getElementById('cursor-dot');
  var ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  var mouseX = 0, mouseY = 0;
  var ringX = 0, ringY = 0;
  var isHovering = false;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  // Smooth ring follow
  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Magnetic effect on .magnetic elements
  function initMagnetic() {
    var magnets = document.querySelectorAll('.magnetic');
    magnets.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        dot.classList.add('hovering');
        ring.classList.add('hovering');
        isHovering = true;
      });

      el.addEventListener('mouseleave', function () {
        dot.classList.remove('hovering');
        ring.classList.remove('hovering');
        isHovering = false;
        el.style.transform = '';
      });

      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) * 0.2;
        var dy = (e.clientY - cy) * 0.2;
        el.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
      });
    });
  }

  // Also hover effect on all links and buttons
  document.addEventListener('mouseover', function (e) {
    var target = e.target.closest('a, button, [role="button"], input, textarea, .skill-tag');
    if (target && !isHovering) {
      dot.classList.add('hovering');
      ring.classList.add('hovering');
    }
  });

  document.addEventListener('mouseout', function (e) {
    var target = e.target.closest('a, button, [role="button"], input, textarea, .skill-tag');
    if (target && !isHovering) {
      dot.classList.remove('hovering');
      ring.classList.remove('hovering');
    }
  });

  // Click effect
  document.addEventListener('mousedown', function () {
    ring.style.width = '28px';
    ring.style.height = '28px';
    ring.style.opacity = '0.6';
  });
  document.addEventListener('mouseup', function () {
    ring.style.width = isHovering ? '50px' : '36px';
    ring.style.height = isHovering ? '50px' : '36px';
    ring.style.opacity = isHovering ? '0.2' : '0.4';
  });

  // Expose init for dynamically added elements
  window.DSCursor = { initMagnetic: initMagnetic };

  // Initial setup
  document.addEventListener('DOMContentLoaded', initMagnetic);
})();
