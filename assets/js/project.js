(function(){
  const slug = new URL(location).searchParams.get('id');
  const base = location.pathname.replace(/[^/]*$/, '');
  fetch(`${base}data/projects.json`, { cache: 'no-store' })
    .then(r=>r.json())
    .then(list=>{
      const p = list.find(x=>x.slug===slug) || list[0];
      if(!p) return;

      document.title = `${p.title} – Kota Okugawa`;
      document.getElementById('title').textContent = p.title;
      document.getElementById('desc').textContent = p.description || '';

      const rows = [];
      if(p.year)   rows.push(['Year', p.year]);
      if(p.role)   rows.push(['Role', p.role]);
      if(p.client) rows.push(['Client', p.client]);
      if(p.tags && p.tags.length) rows.push(['Tags', p.tags.join(', ')]);
      document.getElementById('meta').innerHTML =
        rows.map(([k,v])=>`<tr><td style="width:110px;border-top:1px solid var(--line);padding:8px 0;color:var(--muted)">${k}</td><td style="border-top:1px solid var(--line);padding:8px 0;color:var(--muted)">${v}</td></tr>`).join('');

      const gallery = document.getElementById('gallery');
      const mk = (src, alt)=>{
        const m = src.match(/(.*)-\d+\.(webp|avif|jpg|jpeg|png)$/i);
        const base = m? m[1] : src.replace(/\.(\w+)$/,'');
        const ext  = (m? m[2] : (src.split('.').pop()||'webp')).toLowerCase();
        const img  = document.createElement('img');
        img.loading = 'lazy'; img.alt = alt || p.title;
        img.src    = `${base}-800.${ext}`;
        img.srcset = `${base}-800.${ext} 800w, ${base}-1200.${ext} 1200w, ${base}-1600.${ext} 1600w`;
        img.sizes  = '(max-width: 900px) 100vw, 800px';
        return img;
      };
      (p.images||[]).forEach(x=>gallery.appendChild(mk(x.src, x.caption)));
    })
    .catch(console.error);
})();
