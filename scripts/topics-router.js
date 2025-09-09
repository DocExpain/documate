// public/js/topics-router.js (remplacement complet)
//
// Règle la canonical pour:
//  - EN: /explain/:slug/           (slug EN = bill | contract)
//  - FR: /fr/expliquer/:slug/      (slug FR = facture | contrat)
//  - et les équivalents avec ?topic= (bill | contract)
//
// NB: Les "keys" de contenu restent en EN (bill, contract).
(function () {
  const ORIGIN = location.origin;

  // Mapping slug -> key de contenu
  const SLUG_TO_KEY_EN = { bill: 'bill', contract: 'contract' };
  const SLUG_TO_KEY_FR = { facture: 'bill', contrat: 'contract' };

  // Détermine langue à partir du chemin (prioritaire) puis de <html lang>
  function detectLang() {
    if (location.pathname.startsWith('/fr/')) return 'fr';
    const htmlLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    return htmlLang.startsWith('fr') ? 'fr' : 'en';
  }

  // Tente d’extraire le "topic key" depuis query ?topic=...
  function topicFromQuery() {
    const q = new URLSearchParams(location.search);
    const t = (q.get('topic') || '').trim().toLowerCase();
    if (!t) return null;
    return (t === 'bill' || t === 'contract') ? t : null;
  }

  // Tente d’extraire le topic depuis le pathname "pretty URL"
  function topicFromPath() {
    const p = location.pathname.replace(/\/+$/, '/') || '/';
    // EN: /explain/:slug/
    let m = p.match(/^\/explain\/([^/]+)\/$/);
    if (m) {
      const slug = m[1].toLowerCase();
      return SLUG_TO_KEY_EN[slug] || null;
    }
    // FR: /fr/expliquer/:slug/
    m = p.match(/^\/fr\/expliquer\/([^/]+)\/$/);
    if (m) {
      const slug = m[1].toLowerCase();
      return SLUG_TO_KEY_FR[slug] || null;
    }
    return null;
  }

  function computeCanonical(lang, key) {
    // Reconstruit l’URL canonique jolie à partir de la key (bill|contract)
    if (lang === 'fr') {
      const slug = key === 'bill' ? 'facture' : 'contract' === key ? 'contract' : 'contrat';
      // Par sécurité: si key=contract -> 'contrat'
      const frSlug = key === 'contract' ? 'contrat' : (key === 'bill' ? 'facture' : key);
      return ORIGIN + `/fr/expliquer/${frSlug}/`;
    } else {
      const enSlug = key; // bill | contract
      return ORIGIN + `/explain/${enSlug}/`;
    }
  }

  function upsertCanonical(href) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  // — Exécution —
  const lang = detectLang();

  // 1) On lit d’abord ?topic= si présent
  let key = topicFromQuery();

  // 2) Sinon, on déduit depuis le pathname
  if (!key) key = topicFromPath();

  // 3) Si key reste introuvable, on laisse la canonical par défaut (home/lang),
  //    sinon on la fixe immédiatement.
  if (key) {
    const canon = computeCanonical(lang, key);
    upsertCanonical(canon);
    // Optionnel: expose pour d’autres scripts
    window.__DOCUMATE_TOPIC__ = key;
    window.__DOCUMATE_CANONICAL__ = canon;
  }
})();
