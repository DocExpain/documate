/* SPDX-FileCopyrightText: 2025 DocExpain
 * SPDX-License-Identifier: LicenseRef-SA-NC-1.0
 */
(function () {
  var sel = document.getElementById('langSel');
  if (!sel) return;

  // Mapping par défaut (si hreflang absent)
  var target = {
    en: '/', fr: '/fr/', de: '/de/', es: '/es/', it: '/it/',
    pt: '/pt/', zh: '/zh/', hi: '/hi/', ar: '/ar/', ru: '/ru/', bn: '/bn/'
  };

  // Surcharge avec ce qui est DÉJÀ déclaré en <link rel="alternate" hreflang="..">
  // -> évite toute hypothèse (ex: /en/ qui n'existe pas).
  var links = document.querySelectorAll('link[rel="alternate"][hreflang]');
  links.forEach(function (ln) {
    var lang = (ln.getAttribute('hreflang') || '').toLowerCase();
    if (!lang || lang === 'x-default') return;
    var href = ln.getAttribute('href') || '/';
    try {
      // Normalise en chemin absolu de l'hôte courant
      var path = new URL(href, location.origin).pathname;
      if (!path.startsWith('/')) path = '/' + path;
      if (!path.endsWith('/')) path += '/';
      target[lang] = path;
    } catch (e) { /* ignore */ }
  });

  // Pré-sélection selon <html lang="…">
  var pageLang = (document.documentElement.lang || 'en').toLowerCase();
  if (target[pageLang]) sel.value = pageLang;

  // Redirection RÉELLE vers le chemin de la langue choisie
  sel.addEventListener('change', function () {
    var lang = (this.value || 'en').toLowerCase();
    var url = target[lang] || '/';
    // pas de redirection si on est déjà sur la bonne page
    var here = location.pathname;
    if (!here.endsWith('/')) here += '/';
    if (url !== here) location.assign(url);
  });
})();
