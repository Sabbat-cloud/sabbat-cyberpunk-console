// static/js/csrf-init.js
(function () {
  'use strict';
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  // Conservamos compatibilidad con código existente que espera window.CSRF_TOKEN
  window.CSRF_TOKEN = token;
})();

