/*
 * SPDX-FileCopyrightText: 2025 DocExpain
 * SPDX-License-Identifier: LicenseRef-SA-NC-1.0
 */
(function () {
  var TOPICS = {
    bill: {
      en: { path: "/explain/bill/" },
      fr: { path: "/fr/expliquer/facture/" }
    },
    contract: {
      en: { path: "/explain/contract/" },
      fr: { path: "/fr/expliquer/contrat/" }
    }
  };

  function withSlash(p){ return p.endsWith("/") ? p : p + "/"; }
  function lang(){ return location.pathname.startsWith("/fr/") ? "fr" : "en"; }
  function getTopicFromQuery(){
    var t = new URLSearchParams(location.search).get("topic");
    return (t && TOPICS[t]) ? t : null;
  }
  function getTopicFromPath(){
    var p = withSlash(location.pathname);
    for (var k in TOPICS){
      if (p === TOPICS[k].en.path || p === TOPICS[k].fr.path) return k;
    }
    return null;
  }
  function canonicalFor(topic){
    var p = withSlash(location.pathname);
    var conf = TOPICS[topic];
    if (!conf) return p;
    if (p === conf.en.path || p === conf.fr.path) return p;
    return (conf[lang()] && conf[lang()].path) || conf.en.path;
  }

  var origin = location.origin;
  var topic = getTopicFromQuery() || getTopicFromPath();

  var canonPath = topic ? canonicalFor(topic) : withSlash(location.pathname);
  var canonicalAbs = origin + canonPath;

  var link = document.getElementById("link-canonical") || document.querySelector('link[rel="canonical"]');
  if (link) link.href = canonicalAbs;

  var og = document.querySelector('meta[property="og:url"]');
  if (og) og.setAttribute("content", canonicalAbs);
  var tw = document.querySelector('meta[name="twitter:url"]');
  if (tw) tw.setAttribute("content", canonicalAbs);

  // Minimal FAQ for LH structured-data audit (only on topic pages)
  if (topic && !document.getElementById("ld-faq")) {
    var FAQ = {
      "@context":"https://schema.org",
      "@type":"FAQPage",
      "mainEntity":[
        {"@type":"Question","name": (lang()==="fr" ? "Comment ça marche ?" : "How does it work?"),
         "acceptedAnswer":{"@type":"Answer","text": (lang()==="fr" ? "Importez ou collez le document, puis posez vos questions." : "Upload or paste your document, then ask questions.")}}
      ]
    };
    var s = document.createElement("script");
    s.type = "application/ld+json"; s.id = "ld-faq";
    try { s.text = JSON.stringify(FAQ); } catch(e) {}
    document.head.appendChild(s);
  }
})();
