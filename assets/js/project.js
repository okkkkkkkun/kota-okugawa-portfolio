(function(){
  const slug = new URL(location.href).searchParams.get('id');
  const article = document.querySelector('[data-project]');
  const empty = document.getElementById('project-empty');
  if(!slug){
    if(article) article.hidden = true;
    if(empty){ empty.hidden = false; }
    return;
  }

  const basePath = location.pathname.replace(/[^/]*$/, '');
  const makeImg = (src, alt) => {
    const match = src.match(/(.*)-(\d+)\.(webp|avif|jpg|jpeg|png)$/i);
    const base = match ? match[1] : src.replace(/\.(\w+)$/, '');
    const ext = (match ? match[3] : (src.split('.').pop() || 'webp')).toLowerCase();
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.alt = alt || '';
    img.src = `${base}-1200.${ext}`;
    img.srcset = `${base}-800.${ext} 800w, ${base}-1200.${ext} 1200w, ${base}-1600.${ext} 1600w`;
    img.sizes = '(max-width: 900px) 100vw, 900px';
    return img;
  };

  const setMeta = (selector, value) => {
    const node = document.querySelector(selector);
    if(node && value){
      node.setAttribute('content', value);
    }
  };

  fetch(`${basePath}data/projects.json`, { cache: 'no-store' })
    .then(res => res.json())
    .then(list => {
      const project = list.find(item => item.slug === slug);
      if(!project){
        if(article) article.hidden = true;
        if(empty){ empty.hidden = false; }
        return;
      }

      if(article) article.hidden = false;
      if(empty) empty.hidden = true;

      const title = project.title || 'Project';
      const description = project.description || '';
      document.title = `${title} – Kota Okugawa`;
      setMeta('meta[name="description"]', description || `${title} – Kota Okugawa`);
      setMeta('meta[property="og:title"]', `${title} – Kota Okugawa`);
      setMeta('meta[property="og:description"]', description);
      setMeta('meta[property="og:url"]', `${location.origin}${location.pathname}?id=${encodeURIComponent(slug)}`);
      if(project.cover){
        setMeta('meta[property="og:image"]', project.cover);
      }
      const canonical = document.querySelector('link[rel="canonical"]');
      if(canonical){
        canonical.setAttribute('href', `${location.origin}${location.pathname}?id=${encodeURIComponent(slug)}`);
      }

      const titleEl = document.getElementById('title');
      if(titleEl) titleEl.textContent = title;

      const descEl = document.getElementById('desc');
      if(descEl){
        descEl.textContent = description;
        descEl.style.display = description ? '' : 'none';
      }

      const metaEl = document.getElementById('meta');
      if(metaEl){
        const rows = [];
        if(project.year) rows.push(['Year', project.year]);
        if(project.role) rows.push(['Role', project.role]);
        if(project.client) rows.push(['Client', project.client]);
        metaEl.innerHTML = rows.map(([label, value]) => `
          <dt>${label}</dt>
          <dd>${value}</dd>
        `).join('');
        metaEl.hidden = !rows.length;
      }

      const coverEl = document.getElementById('cover');
      if(coverEl){
        coverEl.innerHTML = '';
        if(project.cover){
          const img = makeImg(project.cover, project.title);
          img.loading = 'eager';
          coverEl.appendChild(img);
        }
        coverEl.hidden = !project.cover;
      }

      const galleryEl = document.getElementById('gallery');
      if(galleryEl){
        galleryEl.innerHTML = '';
        (project.images || []).forEach(item => {
          if(!item || !item.src) return;
          const figure = document.createElement('figure');
          const img = makeImg(item.src, item.caption || project.title);
          figure.appendChild(img);
          if(item.caption){
            const cap = document.createElement('figcaption');
            cap.textContent = item.caption;
            figure.appendChild(cap);
          }
          galleryEl.appendChild(figure);
        });
        if(!project.images || !project.images.length){
          const note = document.createElement('p');
          note.className = 'muted';
          note.textContent = '追加の画像は準備中です。';
          galleryEl.appendChild(note);
        }
      }
    })
    .catch(err => {
      console.error(err);
      if(article) article.hidden = true;
      if(empty){
        empty.hidden = false;
        empty.querySelector('p')?.insertAdjacentText('beforeend', '（データの取得に失敗しました）');
      }
    });
})();
