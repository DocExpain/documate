/* SPDX-FileCopyrightText: 2025 DocExpain
 * SPDX-License-Identifier: LicenseRef-SA-NC-1.0
 */
(function () {
  var sel = document.getElementById('langSel');
  if (!sel) return;

  // Map: EN = root "/", others = "/xx/"
  var target = {
    en: '/', fr: '/fr/', de: '/de/', es: '/es/', it: '/it/', pt: '/pt/',
    zh: '/zh/', hi: '/hi/', ar: '/ar/', ru: '/ru/', bn: '/bn/'
  };

  // Preselect according to <html lang="...">
  var pageLang = (document.documentElement.lang || 'en').toLowerCase();
  if (target[pageLang]) sel.value = pageLang;

  // Real redirect (normalize trailing slash, avoid reloading same URL)
  sel.addEventListener('change', function () {
    var url = target[this.value] || '/';
    var here = location.pathname;
    if (!here.endsWith('/')) here += '/';
    if (url !== here) location.assign(url);
  });
})();
