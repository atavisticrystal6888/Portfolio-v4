/* ============================================================
   SCROLL-ANIMATIONS — GSAP ScrollTrigger for all sections
   ============================================================ */

(function () {
  'use strict';

  function init() {
    // GSAP fallback: use IntersectionObserver if GSAP not loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      initFallbackFadeIn();
      initScrollProgress();
      initNavTracking();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Reduced motion: show everything, no animations
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.fade-in').forEach(function (el) {
        el.classList.add('visible');
      });
      initScrollProgress();
      initNavTracking();
      return;
    }

    // --- Animate all .fade-in elements ---
    var fadeEls = document.querySelectorAll('.fade-in');
    fadeEls.forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // --- Section labels slide-in ---
    document.querySelectorAll('.section-label').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%'
          }
        }
      );
    });

    // --- Timeline items stagger ---
    var timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length) {
      gsap.fromTo(timelineItems,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.timeline',
            start: 'top 80%'
          }
        }
      );
    }

    // --- Project cards stagger ---
    var projectCards = document.querySelectorAll('.project-card');
    if (projectCards.length) {
      gsap.fromTo(projectCards,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.projects-grid',
            start: 'top 80%'
          }
        }
      );
    }

    // --- Achievement cards stagger ---
    var achievementCards = document.querySelectorAll('.achievement-card');
    if (achievementCards.length) {
      gsap.fromTo(achievementCards,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.achievements-grid',
            start: 'top 85%'
          }
        }
      );
    }

    // --- Blog cards stagger ---
    var blogCards = document.querySelectorAll('.blog-card');
    if (blogCards.length) {
      gsap.fromTo(blogCards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.blog-grid',
            start: 'top 85%'
          }
        }
      );
    }

    // --- Skill tags wave ---
    var skillTags = document.querySelectorAll('.skill-tag');
    if (skillTags.length) {
      gsap.fromTo(skillTags,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.03,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: '#skills',
            start: 'top 75%'
          }
        }
      );
    }

    initScrollProgress();
    initNavTracking();
  }

  /* --- Scroll Progress Bar --- */
  function initScrollProgress() {
    var fill = document.getElementById('scroll-progress-fill');
    if (!fill) return;

    window.addEventListener('scroll', function () {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      fill.style.width = progress + '%';
    }, { passive: true });
  }

  /* --- Nav Active Link Tracking --- */
  function initNavTracking() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-links a');
    if (!sections.length || !navLinks.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      }, { threshold: 0.15, rootMargin: '-64px 0px -50% 0px' });

      sections.forEach(function (s) { observer.observe(s); });
    }
  }

  /* --- Fallback fade-in without GSAP --- */
  function initFallbackFadeIn() {
    var fadeEls = document.querySelectorAll('.fade-in');
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

      fadeEls.forEach(function (el) { observer.observe(el); });
    } else {
      fadeEls.forEach(function (el) { el.classList.add('visible'); });
    }
  }

  window.DSScrollAnimations = { init: init };
})();
