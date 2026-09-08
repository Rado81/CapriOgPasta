/* Capri&Pasta: language toggle, attribute translation, footer year. Loaded with defer. */
(function () {
  'use strict';

  var KEY = 'capripasta-lang';
  var root = document.documentElement;

  // Sets <html lang> and copies the matching data-da / data-en value into each translated attribute.
  function applyLang(lang) {
    root.lang = lang;
    var nodes = document.querySelectorAll('[data-da][data-en]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var value = el.getAttribute('data-' + lang);
      var attr = el.getAttribute('data-i18n-attr');
      if (attr) {
        el.setAttribute(attr, value);
      } else {
        el.textContent = value;
      }
    }
  }

  function save(lang) {
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {
      // Storage blocked (private mode or strict settings): the choice lasts for this page load only.
    }
  }

  // The inline script in <head> already chose the language; sync the translated attributes to it.
  var current = root.lang === 'en' ? 'en' : 'da';
  applyLang(current);

  var toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      current = current === 'da' ? 'en' : 'da';
      applyLang(current);
      save(current);
    });
  }

  var year = document.getElementById('year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
