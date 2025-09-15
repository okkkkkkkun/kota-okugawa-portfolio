(async function(){
  const grid = document.getElementById('works-grid');
  if(!grid) return;

  // helpers
  const el = (t,a={},c=[])=>{
    const e=document.createElement(t);
    Object.entries(a).forEach(([k,v])=>k==='class'?e.className=v:e.setAttribute(k,v));
    (Array.isArray(c)?c:[c]).forEach(x=>{ if(x==null) return; e.appendChild(typeof x==='string'?document.createTextNode(x):x); });
    return e;
  };
  const imgEl = (src, alt)=>{
    const m = src.match(/(.*)-\d+\.(webp|avif|jpg|jpeg|png)$/i);
    const base = m? m[1] : src.replace(/\.(\w+)$/,'');
    const ext  = (m? m[2] : (src.split('.').pop()||'webp')).toLowerCase();
    const i = document.createElement('img');
    i.alt = alt || '';
    i.loading = 'lazy';
    i.className = 'card__thumb';
    i.src = `${base}-800.${ext}`;
    i.srcset = `${base}-800.${ext} 800w, ${base}-1200.${ext} 1200w, ${base}-1600.${ext} 1600w`;
    i.sizes = '(max-width: 900px) 100vw, 400px';
    return i;
  };

  // load data
  const base = location.pathname.replace(/[^/]*$/, '');
  const items = await fetch(`${base}data/projects.json`, { cache: 'no-store' }).then(r=>r.json());

  const render = (tag='')=>{
    grid.innerHTML = '';
    const lower = tag.trim().toLowerCase();
    const list = items.filter(p=>{
      if(!lower) return true;
      const tags = (p.tags||[]).map(t=>String(t).toLowerCase());
      return tags.includes(lower);
    });
    list.forEach(p=>{
      const a = el('a',{ href:`./project.html?id=${encodeURIComponent(p.slug)}`, class:'card' });
      const sk = el('div',{class:'skel'});
      const box = el('div',{},sk);
      const img = imgEl(p.cover, p.title);
      img.onload = ()=> sk.replaceWith(img);
      const meta = el('div',{class:'card__meta'},[
        el('h3',{class:'card__title'},p.title),
        el('div',{class:'card__sub'},[
          p.year? el('span',{},p.year): null,
          ...(p.tags||[]).slice(0,3).map(t=>el('span',{class:'tag'},t))
        ])
      ]);
      a.appendChild(box); a.appendChild(meta); grid.appendChild(a);
    });
  };

  // filter UI
  const buttons = Array.from(document.querySelectorAll('.filter'));
  const setActive = (btn)=> buttons.forEach(b=>b.classList.toggle('is-active', b===btn));
  buttons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const tag = btn.dataset.filter || '';
      if(tag) location.hash = `tag=${encodeURIComponent(tag)}`; else history.pushState('', document.title, location.pathname);
      setActive(btn); render(tag);
    });
  });

  const h = new URL(location).hash.replace(/^#/, '');
  const qs = new URLSearchParams(h);
  const initTag = (qs.get('tag')||'').toLowerCase();
  const initBtn = buttons.find(b=>(b.dataset.filter||'')===initTag) || buttons[0];
  setActive(initBtn); render(initTag);
})();

