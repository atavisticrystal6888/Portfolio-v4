/* ============================================================
   SKILLS-CHART — Chart.js radar chart
   ============================================================ */

(function () {
  'use strict';

  var chartInstance = null;

  function getColors() {
    var theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'light') {
      return {
        accent: 'rgba(45, 138, 156, 0.7)',
        accentBg: 'rgba(45, 138, 156, 0.1)',
        metric: 'rgba(184, 137, 26, 0.7)',
        metricBg: 'rgba(184, 137, 26, 0.1)',
        grid: 'rgba(0, 0, 0, 0.06)',
        labels: '#71717a'
      };
    }
    return {
      accent: 'rgba(91, 164, 181, 0.8)',
      accentBg: 'rgba(91, 164, 181, 0.1)',
      metric: 'rgba(234, 177, 68, 0.8)',
      metricBg: 'rgba(234, 177, 68, 0.1)',
      grid: 'rgba(255, 255, 255, 0.06)',
      labels: '#6e6e77'
    };
  }

  function init() {
    var canvas = document.getElementById('skills-radar');
    if (!canvas || typeof Chart === 'undefined') return;

    var colors = getColors();

    chartInstance = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: [
          'Product Strategy',
          'Data Analytics',
          'Technical',
          'Communication',
          'Leadership',
          'Execution Speed'
        ],
        datasets: [
          {
            label: 'PM & Analytics',
            data: [90, 88, 70, 85, 82, 92],
            borderColor: colors.accent,
            backgroundColor: colors.accentBg,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: colors.accent
          },
          {
            label: 'Technical',
            data: [65, 75, 85, 72, 70, 88],
            borderColor: colors.metric,
            backgroundColor: colors.metricBg,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: colors.metric
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: colors.labels,
              font: { family: "'Satoshi', sans-serif", size: 12 },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { family: "'Satoshi', sans-serif" },
            bodyFont: { family: "'Satoshi', sans-serif" },
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              display: false
            },
            grid: {
              color: colors.grid
            },
            angleLines: {
              color: colors.grid
            },
            pointLabels: {
              color: colors.labels,
              font: { family: "'Satoshi', sans-serif", size: 11, weight: 500 }
            }
          }
        },
        animation: {
          duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1200,
          easing: 'easeOutQuart'
        }
      }
    });

    // Theme change: update colors
    window.addEventListener('themechange', function () {
      if (!chartInstance) return;
      var c = getColors();
      chartInstance.data.datasets[0].borderColor = c.accent;
      chartInstance.data.datasets[0].backgroundColor = c.accentBg;
      chartInstance.data.datasets[0].pointBackgroundColor = c.accent;
      chartInstance.data.datasets[1].borderColor = c.metric;
      chartInstance.data.datasets[1].backgroundColor = c.metricBg;
      chartInstance.data.datasets[1].pointBackgroundColor = c.metric;
      chartInstance.options.scales.r.grid.color = c.grid;
      chartInstance.options.scales.r.angleLines.color = c.grid;
      chartInstance.options.scales.r.pointLabels.color = c.labels;
      chartInstance.options.plugins.legend.labels.color = c.labels;
      chartInstance.update('none');
    });
  }

  window.DSSkillsChart = { init: init };
})();
