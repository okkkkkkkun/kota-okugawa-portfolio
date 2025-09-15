// スクロール誘導ボタン
document.addEventListener('click', (e)=>{
  const t = e.target.closest('[data-scroll]');
  if(!t) return;
  e.preventDefault();
  const sel = t.getAttribute('data-scroll');
  const el = document.querySelector(sel);
  if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
});

// 簡易フェードイン（IntersectionObserver）
const reveal = (els)=> {
  els.forEach(el=>{
    el.style.opacity = 0; el.style.transform = 'translateY(8px)';
    const io = new IntersectionObserver(([ent])=>{
      if(ent.isIntersecting){
        el.style.transition = 'opacity .6s ease, transform .6s ease';
        requestAnimationFrame(()=>{
          el.style.opacity = 1; el.style.transform = 'translateY(0)';
        });
        io.disconnect();
      }
    }, {threshold: .15});
    io.observe(el);
  });
};
reveal(document.querySelectorAll('.hero__title, .hero__lead, .hero__cta, .hero__meta, .hero__thumb'));
