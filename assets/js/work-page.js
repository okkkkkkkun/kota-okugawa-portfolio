(async function(){
  const grid = document.getElementById('works-grid');
  const filterWrap = document.querySelector('[data-filters]');
  if(!grid) return;

  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if(key === 'class') node.className = value;
      else if(value != null) node.setAttribute(key, value);
    });
    (Array.isArray(children) ? children : [children]).forEach(child => {
      if(child == null) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  };

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
    img.srcset = `${base}-800.${ext} 800w, ${base}-1200.${ext} 1200w, ${base}-1600.${ext} 1600w`;
    img.sizes = '(max-width: 900px) 100vw, 420px';
    return img;
  };

  const basePath = location.pathname.replace(/[^/]*$/, '');
  let projects = [];
  try {
    projects = await fetch(`${basePath}data/projects.json`, { cache: 'no-store' }).then(res => res.json());
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<p class="muted">データの読み込みに失敗しました。</p>';
    return;
  }

  projects.sort((a, b) => {
    const ay = parseInt(a.year, 10) || 0;
    const by = parseInt(b.year, 10) || 0;
    if(by !== ay) return by - ay;
    return (a.title || '').localeCompare(b.title || '');
  });

  const renderGrid = (tag = '') => {
    grid.innerHTML = '';
    const lower = tag.trim().toLowerCase();
    const list = projects.filter(project => {
      if(!lower) return true;
      const tags = (project.tags || []).map(t => String(t).toLowerCase());
      return tags.includes(lower);
    });

    if(!list.length){
      grid.appendChild(el('p', { class: 'muted' }, '表示できるプロジェクトがありません。'));
      return;
    }

    list.forEach(project => {
      const link = el('a', { href: `./project.html?id=${encodeURIComponent(project.slug)}`, class: 'card' });
      const skeleton = el('div', { class: 'skel' });
      const mediaBox = el('div', { class: 'card__media' }, skeleton);
      const thumb = makeImg(project.cover, project.title);
      thumb.style.opacity = '0';
      mediaBox.appendChild(thumb);

      const showThumb = () => {
        skeleton.remove();
        thumb.style.opacity = '1';
      };

      if(thumb.complete){
        if(thumb.naturalWidth){
          showThumb();
        } else {
          skeleton.remove();
          thumb.style.opacity = '1';
        }
      } else {
        thumb.addEventListener('load', showThumb, { once: true });
        thumb.addEventListener('error', () => {
          skeleton.remove();
          thumb.style.opacity = '1';
        }, { once: true });
      }

      const meta = el('div', { class: 'card__meta' }, [
        el('h3', { class: 'card__title' }, project.title),
        el('div', { class: 'card__sub' }, [
          project.year ? el('span', { class: 'badge' }, project.year) : null,
          ...(project.tags || []).slice(0, 3).map(tagItem => el('span', { class: 'tag' }, tagItem))
        ]),
        project.description ? el('p', { class: 'card__desc muted' }, project.description) : null
      ]);

      link.appendChild(mediaBox);
      link.appendChild(meta);
      grid.appendChild(link);
    });
  };

  const createFilters = () => {
    if(!filterWrap) return [];
    filterWrap.innerHTML = '';
    const allBtn = el('button', { type: 'button', class: 'filter is-active', 'data-filter': '' }, 'All');
    filterWrap.appendChild(allBtn);

    const tagSet = new Set();
    projects.forEach(project => (project.tags || []).forEach(tag => tagSet.add(tag)));
    Array.from(tagSet)
      .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
      .forEach(tag => {
        const btn = el('button', { type: 'button', class: 'filter', 'data-filter': tag }, tag);
        filterWrap.appendChild(btn);
      });

    return Array.from(filterWrap.querySelectorAll('.filter'));
  };

  const buttons = createFilters();
  const setActive = (target) => {
    buttons.forEach(btn => btn.classList.toggle('is-active', btn === target));
  };

  const applyFilter = (tag, updateHash = true) => {
    renderGrid(tag);
    if(!updateHash) return;
    if(tag){
      location.hash = `tag=${encodeURIComponent(tag)}`;
    } else {
      history.replaceState(null, document.title, location.pathname);
    }
  };

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      setActive(btn);
      applyFilter(btn.dataset.filter || '');
    });
  });

  const initialTag = (() => {
    const hash = new URL(location.href).hash.replace(/^#/, '');
    const params = new URLSearchParams(hash);
    return params.get('tag') || '';
  })();

  const initBtn = buttons.find(btn => (btn.dataset.filter || '').toLowerCase() === initialTag.toLowerCase()) || buttons[0];
  if(initBtn){
    setActive(initBtn);
    applyFilter(initBtn.dataset.filter || '', false);
  } else {
    renderGrid('');
  }
})();
