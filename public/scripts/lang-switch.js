(function(){
  const sel = document.getElementById('langSel');
  if (!sel) return;

  // Cartographie : adapter EN selon l’option (A ou B)
  const hasEnDir = !!document.querySelector('link[href="https://documate.work/en/"]');
  const target = hasEnDir
    ? { en:'/en/', fr:'/fr/', de:'/de/', es:'/es/', it:'/it/', pt:'/pt/', zh:'/zh/', hi:'/hi/', ar:'/ar/', ru:'/ru/', bn:'/bn/' }
    : { en:'/',    fr:'/fr/', de:'/de/', es:'/es/', it:'/it/', pt:'/pt/', zh:'/zh/', hi:'/hi/', ar:'/ar/', ru:'/ru/', bn:'/bn/' };

  // Pré-sélection en fonction de <html lang="">
  const pageLang = (document.documentElement.lang || 'en').toLowerCase();
  if (target[pageLang]) sel.value = pageLang;

  sel.addEventListener('change', function(){
    const url = target[this.value] || '/';
    if (location.pathname !== url) location.href = url; // REDIRECTION RÉELLE
  });
})();
