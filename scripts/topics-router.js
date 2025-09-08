/*
 * SPDX-FileCopyrightText: 2025 DocExpain
 * SPDX-License-Identifier: LicenseRef-SA-NC-1.0
 */
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

function getTopicFromQuery(){
  const t = new URLSearchParams(location.search).get("topic");
  return (t && TOPICS[t]) ? t : null;
}
function getTopicFromPath(){
  const p = (location.pathname.endsWith("/") ? location.pathname : location.pathname + "/");
  for (const key of Object.keys(TOPICS)) {
    if (p === TOPICS[key].en.path || p === TOPICS[key].fr.path) return key;
  }
  return null;
}
function currentLang(){
  return location.pathname.startsWith("/fr/") ? "fr" : "en";
}
function canonicalFor(topic){
  const p = (location.pathname.endsWith("/") ? location.pathname : location.pathname + "/");
  const conf = TOPICS[topic];
  if (!conf) return p;
  if (p === conf.en.path || p === conf.fr.path) return p;
  return (conf[currentLang()]?.path) || conf.en.path;
}

(function(){
  const origin = location.origin;
  const linkCanonical =
    document.getElementById("link-canonical") ||
    document.querySelector('link[rel="canonical"]');

  function withSlash(p){ return p.endsWith("/") ? p : p + "/"; }

  const qTopic = getTopicFromQuery();
  const pTopic = getTopicFromPath();
  const topic  = qTopic || pTopic;

  if (!topic) {
    if (linkCanonical) linkCanonical.href = origin + withSlash(location.pathname);
    return;
  }

  const canonPath = canonicalFor(topic);
  if (linkCanonical) linkCanonical.href = origin + canonPath;

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute("content", origin + canonPath);
  const twUrl = document.querySelector('meta[name="twitter:url"]');
  if (twUrl) twUrl.setAttribute("content", origin + canonPath);
})();

(function () {
  var lang = (document.documentElement.lang || 'en').toLowerCase();
  var CFG = {
    en: {
      bill: {
        path: '/explain/bill/',
        title: 'Explain a Bill Online — Free & Private | DocuMate',
        desc:  'Upload your bill or paste text. DocuMate explains it in plain English. Free, private, multilingual.',
        h1:    'Explain a bill in plain English',
        faq: [
          ['How do I explain a bill?','Upload the PDF/image or paste text. DocuMate extracts the text and explains charges in plain language.'],
          ['Is it private?','We don\u2019t store your documents; transfer is encrypted. You can save locally if you wish.']
        ],
        alternates: [
          ['en','https://documate.work/explain/bill'],
          ['fr','https://documate.work/fr/expliquer/facture'],
          ['x-default','https://documate.work/explain/bill']
        ]
      },
      contract: {
        path: '/explain/contract/',
        title: 'Explain a Contract — Plain English | DocuMate',
        desc:  'Paste or upload a contract and get a plain-language explanation. Not legal advice.',
        h1:    'Explain a contract in plain English',
        faq: [
          ['Can DocuMate explain clauses?','Yes. Ask about any passage; we\u2019ll summarize and clarify it in plain language.']
        ],
        alternates: [
          ['en','https://documate.work/explain/contract'],
          ['fr','https://documate.work/fr/expliquer/contrat'],
          ['x-default','https://documate.work/explain/contract']
        ]
      }
    },
    fr: {
      facture: {
        path: '/fr/expliquer/facture/',
        title: 'Expliquer une facture — Gratuit & priv\u00e9 | DocuMate',
        desc:  'T\u00e9l\u00e9versez votre facture ou collez le texte. Explications en langage simple. Multi-langue.',
        h1:    'Expliquer une facture en langage simple',
        faq: [
          ['Comment comprendre ma facture ?','Importez le PDF/image ou collez le texte. DocuMate extrait et explique les \u00e9l\u00e9ments cl\u00e9s.'],
          ['Est-ce priv\u00e9 ?','Nous ne stockons pas vos documents ; le transfert est chiffr\u00e9. Vous pouvez enregistrer localement.']
        ],
        alternates: [
          ['en','https://documate.work/explain/bill'],
          ['fr','https://documate.work/fr/expliquer/facture'],
          ['x-default','https://documate.work/fr/expliquer/facture']
        ]
      },
      contrat: {
        path: '/fr/expliquer/contrat/',
        title: 'Expliquer un contrat — Langage simple | DocuMate',
        desc:  'Collez ou importez un contrat et obtenez une explication en langage simple. Pas un conseil juridique.',
        h1:    'Expliquer un contrat en langage simple',
        faq: [
          ['Pouvez-vous expliquer une clause ?','Oui, posez une question sur un passage pr\u00e9cis ; nous le r\u00e9sumons clairement.']
        ],
        alternates: [
          ['en','https://documate.work/explain/contract'],
          ['fr','https://documate.work/fr/expliquer/contrat'],
          ['x-default','https://documate.work/fr/expliquer/contrat']
        ]
      }
    }
  };

  function $(s){ return document.querySelector(s); }
  function setText(sel, txt){ var el=$(sel); if(el && txt) el.textContent=txt; }
  function setMeta(name, content){ var m=document.querySelector('meta[name="'+name+'"]'); if(m && content) m.setAttribute('content', content); }
  function injectFAQ(faq){
    var root=document.getElementById('faq'); if(!root) return;
    root.innerHTML='';
    for(var i=0;i<faq.length;i++){
      var h3=document.createElement('h3'); h3.textContent=faq[i][0];
      var p=document.createElement('p'); p.textContent=faq[i][1];
      root.appendChild(h3); root.appendChild(p);
    }
  }
  function injectFAQJsonLD(faq){
    var ld={'@context':'https://schema.org','@type':'FAQPage','mainEntity':[]};
    for(var i=0;i<faq.length;i++){
      ld.mainEntity.push({'@type':'Question','name':faq[i][0],'acceptedAnswer':{'@type':'Answer','text':faq[i][1]}});
    }
    var old=document.getElementById('ld-faq'); if(old) old.remove();
    var s=document.createElement('script'); s.type='application/ld+json'; s.id='ld-faq';
    try { s.text=JSON.stringify(ld); } catch(e){ return; }
    document.head.appendChild(s);
  }
  function setTopicAlternates(alts){
    var olds=document.querySelectorAll('link[data-topic-alt="1"]');
    for(var i=0;i<olds.length;i++) olds[i].remove();
    for(var j=0;j<alts.length;j++){
      var l=document.createElement('link');
      l.setAttribute('rel','alternate');
      l.setAttribute('hreflang', alts[j][0]);
      l.setAttribute('href', alts[j][1]);
      l.setAttribute('data-topic-alt','1');
      document.head.appendChild(l);
    }
  }

  var q=new URLSearchParams(location.search);
  var key=q.get('topic');
  var conf=(CFG[lang] && CFG[lang][key])? CFG[lang][key] : null;
  if(!conf) return;

  document.title=conf.title;
  setMeta('description', conf.desc);
  setText('.hero h2', conf.h1);
  injectFAQ(conf.faq);
  injectFAQJsonLD(conf.faq);
  setTopicAlternates(conf.alternates);
})();
