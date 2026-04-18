/* ============================================================
   SCROLL-ANIMATIONS — GSAP ScrollTrigger, page-aware (v3)
   ============================================================ */

(function () {
  'use strict';

  function init(page) {
    page = page || (document.body.getAttribute('data-page') || 'home');

    // GSAP fallback: use IntersectionObserver if GSAP not loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      initFallbackFadeIn();
      initScrollProgress();
      initNavActiveByPage(page);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Reduced motion: show everything, no animations
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.fade-in, .gsap-fade-up, .gsap-fade-left, .gsap-fade-right').forEach(function (el) {
        el.classList.add('visible');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      initScrollProgress();
      initNavActiveByPage(page);
      return;
    }

    // --- Generic: animate all .fade-in elements (all pages) ---
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

    // --- Section labels slide-in (all pages) ---
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

    // --- Page-specific animations ---
    if (page === 'home') {
      initHomeAnimations();
    } else if (page === 'about') {
      initAboutAnimations();
    } else if (page === 'projects') {
      initProjectsAnimations();
    } else if (page === 'case-study') {
      initCaseStudyAnimations();
    } else if (page === 'blog' || page === 'article') {
      initBlogAnimations();
    }

    initScrollProgress();
    initNavActiveByPage(page);
  }

  /* --- Home page animations --- */
  function initHomeAnimations() {
    // Metrics stagger
    var metricItems = document.querySelectorAll('.metric-item');
    if (metricItems.length) {
      gsap.fromTo(metricItems,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.metrics',
            start: 'top 85%'
          }
        }
      );
    }

    // Featured project cards stagger
    var featuredCards = document.querySelectorAll('.featured-projects-grid .project-card, .featured-projects-grid .glass-card');
    if (featuredCards.length) {
      gsap.fromTo(featuredCards,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.featured-projects-grid',
            start: 'top 80%'
          }
        }
      );
    }

    // Blog teaser cards stagger
    var blogTeaserCards = document.querySelectorAll('.blog-teaser-grid .blog-card');
    if (blogTeaserCards.length) {
      gsap.fromTo(blogTeaserCards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.blog-teaser-grid',
            start: 'top 85%'
          }
        }
      );
    }
  }

  /* --- About page animations --- */
  function initAboutAnimations() {
    // Timeline items left-slide
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

    // Skill tags wave
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
            trigger: '.skills-section',
            start: 'top 75%'
          }
        }
      );
    }

    // Achievement cards stagger
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

    // Philosophy cards
    var philosophyCards = document.querySelectorAll('.philosophy-card');
    if (philosophyCards.length) {
      gsap.fromTo(philosophyCards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.philosophy-grid',
            start: 'top 85%'
          }
        }
      );
    }
  }

  /* --- Projects page animations --- */
  function initProjectsAnimations() {
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
  }

  /* --- Case study animations --- */
  function initCaseStudyAnimations() {
    // Process step reveals
    var processSteps = document.querySelectorAll('.cs-process-step');
    if (processSteps.length) {
      gsap.fromTo(processSteps,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.cs-process',
            start: 'top 80%'
          },
          onComplete: function () {
            processSteps.forEach(function (s) { s.classList.add('visible'); });
          }
        }
      );
    }

    // Metric cards
    var metricCards = document.querySelectorAll('.cs-metric-card');
    if (metricCards.length) {
      gsap.fromTo(metricCards,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.cs-metrics-grid',
            start: 'top 85%'
          }
        }
      );
    }
  }

  /* --- Blog & article animations --- */
  function initBlogAnimations() {
    var blogCards = document.querySelectorAll('.blog-article-card');
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
            trigger: '.blog-listing-grid',
            start: 'top 85%'
          }
        }
      );
    }
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

  /* --- Nav active by page (multi-page replaces section tracking) --- */
  function initNavActiveByPage(page) {
    // Multi-page active state is handled by app.js initNavActiveState()
    // This function keeps section-based tracking for single-page anchors if needed
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
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
