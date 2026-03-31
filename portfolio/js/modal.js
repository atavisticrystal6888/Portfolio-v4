/* ============================================================
   MODAL — Project case study modal system
   ============================================================ */

(function () {
  'use strict';

  var overlay = document.getElementById('project-modal-overlay');
  var content = document.getElementById('modal-content');
  var closeBtn = document.getElementById('modal-close');
  if (!overlay || !content) return;

  // Project data
  var projects = {
    aarkid: {
      name: 'Aarkid — Flora Monitoring System',
      stack: ['Gemini Pro Vision', 'Python', 'LangChain', 'FastAPI'],
      problem: 'Plant owners had no personalized, real-time care guidance. Existing solutions were generic and did not account for individual plant conditions, environment, or lifecycle stages.',
      action: 'Built an AI-powered application using Gemini Pro vision + text models to detect plant health issues from photos and recommend specific actions. Implemented task management, lifecycle tracking, and a conversational interface using LangChain for context-aware responses. Deployed with FastAPI for low-latency inference.',
      outcome: 'Delivered a full AI product end-to-end — from problem identification through architecture, development, testing, and deployment. Demonstrated capability to ship a zero-to-one product independently.',
      metricValue: 'End-to-End',
      metricDesc: 'AI product built from zero to one with full lifecycle management'
    },
    churn: {
      name: 'Customer Churn Analysis',
      stack: ['Python', 'SQL', 'Power BI'],
      problem: 'Rising customer churn with no root-cause visibility. The business lacked data-driven insight into which customer segments were at highest risk and what factors predicted churn.',
      action: 'Conducted exploratory data analysis and customer segmentation using Python and SQL. Built interactive Power BI dashboards tracking key KPIs (churn rate by segment, tenure analysis, feature usage correlation). Identified 4 high-risk customer segments with actionable retention triggers.',
      outcome: 'Retention strategies targeting identified segments showed ~15% potential churn reduction. Dashboards adopted by the business team for ongoing monitoring and decision-making.',
      metricValue: '~15%',
      metricDesc: 'Potential churn reduction through data-driven retention strategies'
    },
    marketing: {
      name: 'Marketing Campaign Effectiveness Analysis',
      stack: ['Python', 'SQL', 'Power BI'],
      problem: 'Marketing budget was allocated across channels without ROI visibility. No systematic framework existed to evaluate which campaigns drove conversions vs. which were burning budget.',
      action: 'Evaluated multi-channel campaigns (email, social, paid, content) for conversion rates, customer acquisition cost, ROI, and response rates. Built comparative dashboards in Power BI with drill-down by channel, campaign type, and customer segment.',
      outcome: 'Enabled data-driven budget reallocation, identifying 2 underperforming channels and 1 high-ROI channel that was under-invested. Created a reusable campaign performance framework.',
      metricValue: 'ROI+',
      metricDesc: 'Budget optimization through multi-channel campaign analytics'
    },
    portfolio: {
      name: 'This Portfolio — Enterprise Build',
      stack: ['Three.js', 'GSAP', 'Chart.js', 'tsParticles', 'Typed.js', 'Vanilla JS'],
      problem: 'Standard portfolio websites fail to showcase the depth and intentionality behind product work. Most are either over-designed developer showcases or plain resume pages.',
      action: 'Designed and built an enterprise-grade portfolio using 6+ technologies: Three.js for 3D particle hero, GSAP for scroll-driven animations, Chart.js for skills visualization, tsParticles for ambient effects, plus custom systems for command palette (Ctrl+K), toast notifications, modals, and custom cursor. Multi-file architecture with clean separation of concerns.',
      outcome: 'A portfolio that itself demonstrates product thinking — every feature serves the narrative, every interaction is intentional, and the technical execution speaks to builder capability.',
      metricValue: '6+',
      metricDesc: 'Technologies integrated into a cohesive product experience'
    }
  };

  function open(projectId) {
    var project = projects[projectId];
    if (!project) return;

    var stackChips = project.stack.map(function (s) {
      return '<span class="stack-chip">' + s + '</span>';
    }).join('');

    content.innerHTML =
      '<h3>' + project.name + '</h3>' +
      '<div class="project-stack">' + stackChips + '</div>' +
      '<div class="modal-section">' +
        '<div class="modal-section-title">Problem</div>' +
        '<p>' + project.problem + '</p>' +
      '</div>' +
      '<div class="modal-section">' +
        '<div class="modal-section-title">Action</div>' +
        '<p>' + project.action + '</p>' +
      '</div>' +
      '<div class="modal-section">' +
        '<div class="modal-section-title">Outcome</div>' +
        '<p>' + project.outcome + '</p>' +
      '</div>' +
      '<div class="modal-metric-highlight">' +
        '<span class="metric-value">' + project.metricValue + '</span>' +
        '<span class="metric-desc">' + project.metricDesc + '</span>' +
      '</div>';

    overlay.hidden = false;
    document.body.classList.add('no-scroll');

    // Focus trap
    closeBtn.focus();
  }

  function close() {
    overlay.hidden = true;
    document.body.classList.remove('no-scroll');
  }

  // Close button
  if (closeBtn) closeBtn.addEventListener('click', close);

  // Backdrop click
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  // Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) {
      close();
    }
  });

  // Project card click handlers
  document.addEventListener('click', function (e) {
    var cta = e.target.closest('.project-cta[data-project]');
    if (cta) {
      e.preventDefault();
      open(cta.getAttribute('data-project'));
    }
  });

  window.DSModal = { open: open, close: close };
})();
