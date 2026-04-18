/* ============================================================
   TOAST — Notification system
   ============================================================ */

(function () {
  'use strict';

  var container = document.getElementById('toast-container');
  var DISMISS_TIME = 3500;

  function show(message, type) {
    type = type || 'info';
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');

    var iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';

    toast.innerHTML =
      '<span class="toast-icon ' + type + '"><i data-lucide="' + iconName + '" style="width:18px;height:18px;"></i></span>' +
      '<span>' + message + '</span>' +
      '<button class="toast-close" aria-label="Dismiss"><i data-lucide="x" style="width:14px;height:14px;"></i></button>';

    container.appendChild(toast);

    // Re-init lucide icons for the new toast
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Close button
    var closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', function () { dismiss(toast); });

    // Auto-dismiss
    setTimeout(function () { dismiss(toast); }, DISMISS_TIME);
  }

  function dismiss(toast) {
    if (toast.classList.contains('toast-exit')) return;
    toast.classList.add('toast-exit');
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }

  window.DSToast = { show: show };
})();
