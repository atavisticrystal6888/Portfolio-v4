/* ============================================================
   CASE-STUDY-CHARTS — Initialize Chart.js from data attributes
   Reads [data-chart] canvases with data-chart-type & data-chart-config
   ============================================================ */

(function () {
  'use strict';

  var instances = [];

  /* ---- Theme-aware palette ---- */
  var palettes = {
    dark: [
      'rgba(91, 164, 181, 0.8)',
      'rgba(234, 177, 68, 0.8)',
      'rgba(139, 92, 246, 0.7)',
      'rgba(236, 72, 153, 0.7)'
    ],
    light: [
      'rgba(45, 138, 156, 0.8)',
      'rgba(184, 137, 26, 0.8)',
      'rgba(109, 40, 217, 0.7)',
      'rgba(219, 39, 119, 0.7)'
    ]
  };

  var bgPalettes = {
    dark: [
      'rgba(91, 164, 181, 0.15)',
      'rgba(234, 177, 68, 0.15)',
      'rgba(139, 92, 246, 0.12)',
      'rgba(236, 72, 153, 0.12)'
    ],
    light: [
      'rgba(45, 138, 156, 0.15)',
      'rgba(184, 137, 26, 0.15)',
      'rgba(109, 40, 217, 0.12)',
      'rgba(219, 39, 119, 0.12)'
    ]
  };

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function getGridColor() {
    return getTheme() === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
  }

  function getLabelColor() {
    return getTheme() === 'light' ? '#71717a' : '#a1a1aa';
  }

  /* ---- Build Chart.js config from data attributes ---- */
  function buildConfig(canvas) {
    var type = canvas.getAttribute('data-chart-type') || 'bar';
    var rawConfig = canvas.getAttribute('data-chart-config');
    if (!rawConfig) return null;

    var parsed;
    try {
      parsed = JSON.parse(rawConfig);
    } catch (e) {
      console.warn('DSCaseStudyCharts: Invalid JSON in data-chart-config', e);
      return null;
    }

    var theme = getTheme();
    var colors = palettes[theme];
    var bgColors = bgPalettes[theme];
    var gridColor = getGridColor();
    var labelColor = getLabelColor();

    // Apply colors to datasets
    var datasets = (parsed.datasets || []).map(function (ds, i) {
      var ci = i % colors.length;
      var styled = {
        label: ds.label || 'Dataset ' + (i + 1),
        data: ds.data || [],
        borderColor: ds.borderColor || colors[ci],
        backgroundColor: ds.backgroundColor || bgColors[ci],
        borderWidth: ds.borderWidth || 2,
        borderRadius: type === 'bar' ? 6 : 0,
        tension: type === 'line' ? 0.4 : 0,
        fill: type === 'line' ? true : undefined,
        pointRadius: type === 'line' ? 4 : undefined,
        pointHoverRadius: type === 'line' ? 6 : undefined,
        pointBackgroundColor: type === 'line' ? colors[ci] : undefined
      };
      return styled;
    });

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return {
      type: type,
      data: {
        labels: parsed.labels || [],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: labelColor,
              font: { family: "'Satoshi', sans-serif", size: 12 },
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.85)',
            titleFont: { family: "'Satoshi', sans-serif" },
            bodyFont: { family: "'Satoshi', sans-serif" },
            padding: 12,
            cornerRadius: 8,
            displayColors: true
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: {
              color: labelColor,
              font: { family: "'Satoshi', sans-serif", size: 11 }
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: {
              color: labelColor,
              font: { family: "'Satoshi', sans-serif", size: 11 }
            }
          }
        },
        animation: {
          duration: reducedMotion ? 0 : 1000,
          easing: 'easeOutQuart'
        }
      }
    };
  }

  /* ---- Initialize all charts on the page ---- */
  function init() {
    if (typeof Chart === 'undefined') return;

    var canvases = document.querySelectorAll('[data-chart]');
    if (!canvases.length) return;

    for (var i = 0; i < canvases.length; i++) {
      var canvas = canvases[i];
      var config = buildConfig(canvas);
      if (!config) continue;

      var chart = new Chart(canvas, config);
      instances.push(chart);
    }
  }

  /* ---- Theme reactivity ---- */
  function updateTheme() {
    var theme = getTheme();
    var colors = palettes[theme];
    var bgColors = bgPalettes[theme];
    var gridColor = getGridColor();
    var labelColor = getLabelColor();

    instances.forEach(function (chart) {
      // Update datasets
      chart.data.datasets.forEach(function (ds, i) {
        var ci = i % colors.length;
        ds.borderColor = colors[ci];
        ds.backgroundColor = bgColors[ci];
        if (ds.pointBackgroundColor) {
          ds.pointBackgroundColor = colors[ci];
        }
      });

      // Update scales
      if (chart.options.scales) {
        if (chart.options.scales.x) {
          chart.options.scales.x.grid.color = gridColor;
          chart.options.scales.x.ticks.color = labelColor;
        }
        if (chart.options.scales.y) {
          chart.options.scales.y.grid.color = gridColor;
          chart.options.scales.y.ticks.color = labelColor;
        }
      }

      // Update legend
      chart.options.plugins.legend.labels.color = labelColor;

      chart.update('none');
    });
  }

  window.addEventListener('themechange', updateTheme);

  /* ---- Cleanup ---- */
  function destroy() {
    instances.forEach(function (chart) {
      chart.destroy();
    });
    instances = [];
  }

  window.DSCaseStudyCharts = {
    init: init,
    destroy: destroy
  };
})();
