/* ============================================================
   CONTACT-FORM — Validation, mailto construction, FAQ accordion
   ============================================================ */

(function () {
  'use strict';

  var form = null;
  var fields = {};

  /* ---- Email regex (simple, covers most cases) ---- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var MIN_MESSAGE_LENGTH = 20;

  /* ---- Show/hide field error ---- */
  function setFieldError(name, show) {
    var input = fields[name];
    if (!input) return;

    var group = input.closest('.input-group');
    if (!group) return;

    var errorEl = group.querySelector('[data-error="' + name + '"]');

    if (show) {
      input.classList.add('error');
      input.classList.remove('success');
      if (errorEl) errorEl.style.display = 'block';
    } else {
      input.classList.remove('error');
      input.classList.add('success');
      if (errorEl) errorEl.style.display = 'none';
    }
  }

  /* ---- Validate single field ---- */
  function validateField(name) {
    var value = (fields[name].value || '').trim();

    switch (name) {
      case 'name':
        var valid = value.length > 0;
        setFieldError('name', !valid);
        return valid;
      case 'email':
        var validEmail = EMAIL_RE.test(value);
        setFieldError('email', !validEmail);
        return validEmail;
      case 'message':
        var validMsg = value.length >= MIN_MESSAGE_LENGTH;
        setFieldError('message', !validMsg);
        return validMsg;
      default:
        return true;
    }
  }

  /* ---- Validate all fields ---- */
  function validateAll() {
    var nameOk = validateField('name');
    var emailOk = validateField('email');
    var msgOk = validateField('message');
    return nameOk && emailOk && msgOk;
  }

  /* ---- Construct mailto and open ---- */
  function submitForm() {
    var name = fields.name.value.trim();
    var email = fields.email.value.trim();
    var subject = fields.subject ? fields.subject.value : 'General';
    var message = fields.message.value.trim();

    var mailSubject = encodeURIComponent('[Portfolio] ' + subject + ' from ' + name);
    var mailBody = encodeURIComponent(
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Subject: ' + subject + '\n\n' +
      message
    );

    window.location.href = 'mailto:dhruvsinghal6888@gmail.com?subject=' + mailSubject + '&body=' + mailBody;

    // Toast
    if (window.DSToast && window.DSToast.show) {
      window.DSToast.show('Message prepared! Your email client should open shortly.', 'success');
    }

    form.reset();
    // Remove success classes
    ['name', 'email', 'message'].forEach(function (n) {
      if (fields[n]) {
        fields[n].classList.remove('success', 'error');
      }
    });
  }

  /* ---- FAQ Accordion ---- */
  function initFAQ() {
    var accordion = document.getElementById('faq-accordion');
    if (!accordion) return;

    accordion.addEventListener('click', function (e) {
      var btn = e.target.closest('.faq-question');
      if (!btn) return;

      var item = btn.closest('.faq-item');
      if (!item) return;

      var isOpen = item.classList.contains('open');

      // Close all
      var allItems = accordion.querySelectorAll('.faq-item');
      for (var i = 0; i < allItems.length; i++) {
        allItems[i].classList.remove('open');
        var qBtn = allItems[i].querySelector('.faq-question');
        if (qBtn) qBtn.setAttribute('aria-expanded', 'false');
      }

      // Toggle clicked
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  /* ---- Init ---- */
  function init() {
    form = document.getElementById('contact-form');
    if (!form) return;

    fields.name = document.getElementById('contact-name');
    fields.email = document.getElementById('contact-email');
    fields.subject = document.getElementById('contact-subject');
    fields.message = document.getElementById('contact-message');

    // Live validation on blur
    ['name', 'email', 'message'].forEach(function (n) {
      if (fields[n]) {
        fields[n].addEventListener('blur', function () {
          validateField(n);
        });
      }
    });

    // Form submit
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (validateAll()) {
        submitForm();
      }
    });

    // FAQ
    initFAQ();
  }

  window.DSContactForm = { init: init };
})();
