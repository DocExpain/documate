/* SPDX-FileCopyrightText: 2025 DocExpain
 * SPDX-License-Identifier: LicenseRef-SA-NC-1.0
 */

(function () {
  const TOPICS = {
    bill: {
      en: { path: "/explain/bill/" },
      fr: { path: "/fr/expliquer/facture/" }
    },
    contract: {
      en: { path: "/explain/contract/" },
      fr: { path: "/fr/expliquer/contrat/" }
    }
  };

  const origin = location.origin;

  function withSlash(p){ return p.endsWith("/") ? p : p + "/"; }
  function currentLang(){ return location.pathname.startsWith("/fr/") ? "fr" : "en"; }

  function getTopicFromQuery() {
    const t = new URLSearchParams(location.search).get("topic");
    return (t && TOPICS[t]) ? t : null;
  }

  function getTopicFromPath() {
    const p = withSlash(location.pathname);
    for (const key of Object.keys(TOPICS)) {
      if (p === TOPICS[key].en.path || p === TOPICS[key].fr.path) return key;
    }
    return null;
  }

  function canonicalFor(topic){
    const p = withSlash(location.pathname);
    const conf = TOPICS[topic];
    if (!conf) return p;
    if (p === conf.en.path || p === conf.fr.path) return p;
    return (conf[currentLang()]?.path) || conf.en.path;
  }

  const qTopic = getTopicFromQuery();
  const pTopic = getTopicFromPath();
  const topic  = qTopic || pTopic;

  const linkCanonical =
    document.getElementById("link-canonical") ||
    document.querySelector('link[rel="canonical"]');

  let canonPath;

  if (!topic) {
    canonPath = withSlash(location.pathname);
  } else {
    canonPath = canonicalFor(topic);
  }

  if (linkCanonical) linkCanonical.href = origin + canonPath;

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute("content", origin + canonPath);
  const twUrl = document.querySelector('meta[name="twitter:url"]');
  if (twUrl) twUrl.setAttribute("content", origin + canonPath);
})();

