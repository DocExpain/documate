(function(){
  var lang = (document.documentElement.lang || 'en').toLowerCase();
  var CFG = {
    en: {
      bill: {
        path: "/explain/bill",
        title: "Explain a Bill Online — Free & Private | DocuMate",
        desc: "Upload your bill or paste text. DocuMate explains it in plain English. Free, private, multilingual.",
        h1: "Explain a bill in plain English",
        faq: [
          ["How do I explain a bill?","Upload the PDF/image or paste text. DocuMate extracts the text and explains charges in plain language."],
          ["Is it private?","We don’t store your documents; transfer is encrypted. You can save locally if you wish."]
        ],
        alternates: [
          ["en","https://documate.work/explain/bill"],
          ["fr","https://documate.work/fr/expliquer/facture"],
          ["x-default","https://documate.work/explain/bill"]
        ]
      },
      contract: {
        path: "/explain/contract",
        title: "Explain a Contract — Plain English | DocuMate",
        desc: "Paste or upload a contract and get a plain-language explanation. Not legal advice.",
        h1: "Explain a contract in plain English",
        faq: [
          ["Can DocuMate explain clauses?","Yes. Ask about any passage; we’ll summarize and clarify it in plain language."]
        ],
        alternates: [
          ["en","https://documate.work/explain/contract"],
          ["fr","https://documate.work/fr/expliquer/contrat"],
          ["x-default","https://documate.work/explain/contract"]
        ]
      }
    },
    fr: {
      facture: {
        path: "/fr/expliquer/facture",
        title: "Expliquer une facture — Gratuit & privé | DocuMate",
        desc: "Téléversez votre facture ou collez le texte. Explications en langage simple. Multi-langue.",
        h1: "Expliquer une facture en langage simple",
        faq: [
          ["Comment comprendre ma facture ?","Importez le PDF/image ou collez le texte. DocuMate extrait et explique les éléments clés."],
          ["Est-ce privé ?","Nous ne stockons pas vos documents ; le transfert est chiffré. Vous pouvez enregistrer localement."]
        ],
        alternates: [
          ["en","https://documate.work/explain/bill"],
          ["fr","https://documate.work/fr/expliquer/facture"],
          ["x-default","https://documate.work/fr/expliquer/facture"]
        ]
      },
      contrat: {
        path: "/fr/expliquer/contrat",
        title: "Expliquer un contrat — Langage simple | DocuMate",
        desc: "Collez ou importez un contrat et obtenez une explication en langage simple. Pas un conseil juridique.",
        h1: "Expliquer un contrat en langage simple",
        faq: [
          ["Pouvez-vous expliquer une clause ?","Oui, posez une question sur un passage précis ; nous le résumons clairement."]
        ],
        alternates: [
          ["en","https://documate.work/explain/contract"],
          ["fr","https://documate.work/fr/expliquer/contrat"],
          ["x-default","https://documate.work/fr/expliquer/contrat"]
        ]
      }
    }
  };

  function $(s){ return document.querySelector(s); }
  function setText(sel, txt){ var el=$(sel); if(el && txt) el.textContent=txt; }
  function setMeta(name, content){ var m=document.querySelector('meta[name="'+name+'"]'); if(m && content) m.setAttribute('content', content); }
  function setCanonical(url){ var l=document.querySelector('link[rel="canonical"]'); if(l && url) l.setAttribute('href', url); }

  function injectFAQ(faq){
    var root=document.getElementById('faq'); if(!root || !faq) return;
    root.innerHTML="";
    for (var i=0;i<faq.length;i++){
      var h3=document.createElement('h3'); h3.textContent=faq[i][0];
      var p=document.createElement('p'); p.textContent=faq[i][1];
      root.appendChild(h3); root.appendChild(p);
    }
  }
  function injectFAQJsonLD(faq){
    if(!faq) return;
    var ld={"@context":"https://schema.org","@type":"FAQPage","mainEntity":[]};
    for (var i=0;i<faq.length;i++){
      ld.mainEntity.push({"@type":"Question","name":faq[i][0],"acceptedAnswer":{"@type":"Answer","text":faq[i][1]}});
    }
    var old=document.getElementById('ld-faq'); if(old) old.remove();
    var s=document.createElement('script'); s.type="application/ld+json"; s.id="ld-faq";
    try { s.text=JSON.stringify(ld); } catch(e){ return; }
    document.head.appendChild(s);
  }
  function setTopicAlternates(alts){
    if(!alts) return;
    var olds=document.querySelectorAll('link[data-topic-alt="1"]');
    for (var i=0;i<olds.length;i++) olds[i].remove();
    for (var j=0;j<alts.length;j++){
      var l=document.createElement('link');
      l.setAttribute('rel','alternate');
      l.setAttribute('hreflang', alts[j][0]);
      l.setAttribute('href', alts[j][1]);
      l.setAttribute('data-topic-alt','1');
      document.head.appendChild(l);
    }
  }

  var key=new URLSearchParams(location.search).get('topic');
  if(!key) return;
  var conf=(CFG[lang] && CFG[lang][key]) || (CFG.en && CFG.en[key]);
  if(!conf) return;

  document.title=conf.title;
  setMeta('description', conf.desc);
  setCanonical(location.origin + conf.path);
  setText('.hero h2', conf.h1);
  injectFAQ(conf.faq);
  injectFAQJsonLD(conf.faq);
  setTopicAlternates(conf.alternates);
})();
