(async function(){
  const container = document.getElementById('home-works');
  if(!container) return;

  const basePath = location.pathname.replace(/[^/]*$/, '');
  let projects = [];
  try {
    projects = await fetch(`${basePath}data/projects.json`, { cache: 'no-store' }).then(res => res.json());
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="muted">作品を読み込めませんでした。</p>';
    return;
  }

  projects.sort((a, b) => {
    const ay = parseInt(a.year, 10) || 0;
    const by = parseInt(b.year, 10) || 0;
    if(by !== ay) return by - ay;
    return (a.title || '').localeCompare(b.title || '');
  });

  const selected = projects.slice(0, 6);
  container.innerHTML = '';

  const makeImg = (src, alt) => {
    const match = src.match(/(.*)-(\d+)\.(webp|avif|jpg|jpeg|png)$/i);
    const base = match ? match[1] : src.replace(/\.(\w+)$/, '');
    const ext = (match ? match[3] : (src.split('.').pop() || 'webp')).toLowerCase();
    const img = document.createElement('img');
    img.className = 'card__thumb';
    img.alt = alt || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = `${base}-800.${ext}`;
    img.srcset = `${base}-800.${ext} 800w, ${base}-1200.${ext} 1200w`;
    img.sizes = '(max-width: 900px) 100vw, 360px';
    return img;
  };

  if(!selected.length){
    container.innerHTML = '<p class="muted">まだ作品が登録されていません。</p>';
    return;
  }

  selected.forEach(project => {
    const card = document.createElement('a');
    card.href = `./project.html?id=${encodeURIComponent(project.slug)}`;
    card.className = 'card card--compact';

    const media = document.createElement('div');
    media.className = 'card__media';
    const skel = document.createElement('div');
    skel.className = 'skel';
    media.appendChild(skel);

    const thumb = makeImg(project.cover, project.title);
    thumb.style.opacity = '0';
    media.appendChild(thumb);

    const showThumb = () => {
      skel.remove();
      thumb.style.opacity = '1';
    };

    if(thumb.complete){
      if(thumb.naturalWidth){
        showThumb();
      } else {
        skel.remove();
        thumb.style.opacity = '1';
      }
    } else {
      thumb.addEventListener('load', showThumb, { once: true });
      thumb.addEventListener('error', () => {
        skel.remove();
        thumb.style.opacity = '1';
      }, { once: true });
    }

    const meta = document.createElement('div');
    meta.className = 'card__meta';
    const title = document.createElement('h3');
    title.className = 'card__title';
    title.textContent = project.title;
    const sub = document.createElement('div');
    sub.className = 'card__sub';
    if(project.year) {
      const year = document.createElement('span');
      year.className = 'badge';
      year.textContent = project.year;
      sub.appendChild(year);
    }
    (project.tags || []).slice(0, 2).forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = tag;
      sub.appendChild(span);
    });

    meta.appendChild(title);
    meta.appendChild(sub);

    card.appendChild(media);
    card.appendChild(meta);
    container.appendChild(card);
  });
})();
