/* SPDX-FileCopyrightText: 2025 DocExpain
 * SPDX-License-Identifier: LicenseRef-SA-NC-1.0
 */
(function () {
  function t(key, fallback) {
    try {
      var lang = (document.documentElement.lang || 'en').toLowerCase();
      var T = (window.I18N && window.I18N[lang]) || {};
      return (T && T[key]) || fallback;
    } catch (e) { return fallback; }
  }

  function applyState(open) {
    // hide/show panel and fab
    if (panel) {
      // si on est sur <details>, on laisse open=true pendant l’affichage puis on cache totalement quand fermé
      if (isDetails) {
        if (open) {
          panel.open = true;
          panel.style.display = '';
        } else {
          panel.open = false;
          // on cache entièrement le bloc pour libérer l’espace (et masquer le <summary>)
          panel.style.display = 'none';
        }
      } else {
        panel.classList.toggle('privacy-collapsed', !open);
        panel.style.display = open ? '' : 'none';
      }
    }
    if (fab) {
      fab.hidden = !!open;
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
      fab.setAttribute('title', open ? hideLbl : showLbl);
    }
    try { localStorage.setItem('privacy-open', open ? '1' : '0'); } catch (e) {}
  }

  function restore() {
    var saved = null;
    try { saved = localStorage.getItem('privacy-open'); } catch (e) {}
    return saved !== '0'; // défaut: ouvert
  }

  // 1) Détection du panneau : supporte <details id="privacyBox"> ou <div id="privacy-panel"> / .card.legal
  var panel = document.getElementById('privacyBox')
          || document.getElementById('privacy-panel')
          || document.querySelector('.card.legal,#privacyBox');
  if (!panel) return;

  var isDetails = panel.tagName === 'DETAILS';

  // 2) Créer la puce flottante
  var showLbl = t('showPrivacy', 'Afficher');
  var hideLbl = t('hidePrivacy', 'Masquer');

  var fab = document.getElementById('privacy-fab');
  if (!fab) {
    fab = document.createElement('button');
    fab.id = 'privacy-fab';
    fab.type = 'button';
    fab.className = 'privacy-fab';
    fab.setAttribute('aria-controls', panel.id || 'privacyBox');
    fab.setAttribute('aria-expanded', 'false');
    fab.hidden = true;
    fab.textContent = showLbl;
    document.body.appendChild(fab);
  }

  // 3) Raccorder tes contrôles existants (si présents)
  var btnLegacy = document.getElementById('privacy-toggle');     // ancienne implémentation
  var sum = isDetails ? panel.querySelector('summary') : null;   // <summary> si <details>

  function minimize(e) {
    if (e) e.preventDefault();
    applyState(false);
  }
  function reopen(e) {
    if (e) e.preventDefault();
    applyState(true);
    try { panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e2) {}
  }

  // 4) Écouteurs : clic sur la puce pour ré-ouvrir
  fab.addEventListener('click', reopen);

  // 5) Si on a un bouton existant “Masquer”, on le branche sur minimize
  if (btnLegacy) btnLegacy.addEventListener('click', function (e) {
    e.preventDefault(); minimize();
  });

  // 6) Si <details>, on intercepte le toggle
  if (isDetails && sum) {
    panel.addEventListener('toggle', function () {
      // Si l’utilisateur “ferme” le details, on passe en mode fab (panel hidden)
      if (!panel.open) { applyState(false); }
      else { applyState(true); }
    });
  }

  // 7) État initial depuis localStorage
  applyState(restore());
})();
