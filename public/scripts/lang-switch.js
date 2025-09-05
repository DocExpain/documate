/* SPDX-FileCopyrightText: 2025 DocExpain
 * SPDX-License-Identifier: LicenseRef-SA-NC-1.0
 */
(function () {
  var sel = document.getElementById('langSel');
  if (!sel) return;

  // Détecte si la version EN est servie depuis /en/ via le bloc hreflang
  var hasEnDir = !!document.querySelector('link[rel="alternate"][hreflang="en"][href$="/en/"]');

  var target = hasEnDir
    ? { en: '/en/', fr: '/fr/', de: '/de/', es: '/es/', it: '/it/', pt: '/pt/', zh: '/zh/', hi: '/hi/', ar: '/ar/', ru: '/ru/', bn: '/bn/' }
    : { en: '/',    fr: '/fr/', de: '/de/', es: '/es/', it: '/it/', pt: '/pt/', zh: '/zh/', hi: '/hi/', ar: '/ar/', ru: '/ru/', bn: '/bn/' };

  // Pré-sélection selon <html lang="…">
  var pageLang = (document.documentElement.lang || 'en').toLowerCase();
  if (target[pageLang]) sel.value = pageLang;

  // Redirection réelle (recharge la bonne URL de langue)
  sel.addEventListener('change', function () {
    var url = target[this.value] || '/';
    if (location.pathname !== url) location.href = url;
  });
})();
