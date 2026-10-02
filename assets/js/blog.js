(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const readMins = (html) => Math.max(1, Math.round(String(html).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 200));

  async function loadPosts() {
    const res = await fetch('data/blog.json');
    if (!res.ok) throw new Error('blog.json not found');
    const posts = await res.json();
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function cardHTML(p) {
    const media = p.image
      ? '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy">'
      : '<span>' + esc(p.category) + '</span>';
    return (
      '<a class="blog-card" href="post.html?slug=' + encodeURIComponent(p.slug) + '">' +
        '<div class="blog-card__media">' + media + '</div>' +
        '<div class="blog-card__body">' +
          '<div class="blog-card__meta">' + esc(p.category) + ' &middot; ' + fmtDate(p.date) + ' &middot; ' + readMins(p.content) + ' min read</div>' +
          '<h3 class="blog-card__title">' + esc(p.title) + '</h3>' +
          '<p class="blog-card__excerpt">' + esc(p.excerpt) + '</p>' +
          '<span class="blog-card__more">Read article</span>' +
        '</div>' +
      '</a>'
    );
  }

  /* ---------- Listing page ---------- */
  async function initListing() {
    const grid = $('blogGrid');
    if (!grid) return;
    const count = $('blogCount');
    const chipsEl = $('blogChips');
    const search = $('blogSearch');
    let posts = [];
    try { posts = await loadPosts(); } catch (e) {
      grid.innerHTML = '<p class="blog-empty">Posts could not be loaded. Open the site through a local server (for example VS Code Live Server) or check that data/blog.json exists.</p>';
      count.textContent = '';
      return;
    }

    const state = { q: '', cat: new URLSearchParams(location.search).get('cat') || 'All' };
    const cats = ['All'].concat(Array.from(new Set(posts.map((p) => p.category))));
    if (cats.indexOf(state.cat) === -1) state.cat = 'All';

    function renderChips() {
      chipsEl.innerHTML = cats.map((c) =>
        '<button type="button" class="blog-chip" data-cat="' + esc(c) + '" aria-pressed="' + (c === state.cat) + '">' + esc(c) + '</button>'
      ).join('');
    }

    function render() {
      const q = state.q.trim().toLowerCase();
      const list = posts.filter((p) =>
        (state.cat === 'All' || p.category === state.cat) &&
        (!q || (p.title + ' ' + p.excerpt + ' ' + p.category).toLowerCase().indexOf(q) !== -1)
      );
      count.textContent = list.length + (list.length === 1 ? ' article' : ' articles');
      grid.innerHTML = list.length ? list.map(cardHTML).join('') : '<p class="blog-empty">No articles match your search. Try a different word or clear the filter.</p>';
    }

    chipsEl.addEventListener('click', (e) => {
      const b = e.target.closest('.blog-chip');
      if (!b) return;
      state.cat = b.dataset.cat;
      renderChips();
      render();
    });
    search.addEventListener('input', () => { state.q = search.value; render(); });

    renderChips();
    render();
  }

  /* ---------- Single post page ---------- */
  async function initPost() {
    const root = $('postRoot');
    if (!root) return;
    const slug = new URLSearchParams(location.search).get('slug');
    let posts = [];
    try { posts = await loadPosts(); } catch (e) {
      root.innerHTML = '<p class="blog-empty">This article could not be loaded. <a href="blog.html">Back to the blog</a></p>';
      return;
    }
    const p = posts.find((x) => x.slug === slug);
    if (!p) {
      root.innerHTML = '<p class="blog-empty">Article not found. <a href="blog.html">See all articles</a></p>';
      return;
    }

    document.title = p.title + ' | Secure Hub Pakistan';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', p.excerpt);
    const crumb = $('postCrumb');
    if (crumb) crumb.textContent = p.title;

    const pageUrl = location.origin + location.pathname + '?slug=' + encodeURIComponent(p.slug);
    const waText = encodeURIComponent(p.title + ' - ' + pageUrl);
    const waQuote = encodeURIComponent('Hi Secure Hub, I read your article "' + p.title + '" and want a CCTV quote.');

    root.innerHTML =
      '<p class="post__meta">' + esc(p.category) + ' &middot; ' + fmtDate(p.date) + ' &middot; ' + readMins(p.content) + ' min read</p>' +
      '<h1 class="post__title">' + esc(p.title) + '</h1>' +
      (p.image ? '<img class="post__cover" src="' + esc(p.image) + '" alt="' + esc(p.title) + '">' : '') +
      '<div class="post__content">' + p.content + '</div>' +
      '<div class="post__cta">' +
        '<p><strong>Need help with your CCTV setup?</strong> Send us your area and the number of cameras, and we will suggest a setup.</p>' +
        '<a class="btn btn--primary" href="https://wa.me/923227157072?text=' + waQuote + '" target="_blank" rel="noopener">Get a quote on WhatsApp</a>' +
        '<a class="btn btn--ghost" href="https://wa.me/?text=' + waText + '" target="_blank" rel="noopener">Share this article</a>' +
      '</div>';

    const related = posts.filter((x) => x.slug !== p.slug && x.category === p.category).slice(0, 3);
    const rel = related.length ? related : posts.filter((x) => x.slug !== p.slug).slice(0, 3);
    if (rel.length && $('relatedGrid')) {
      $('relatedGrid').innerHTML = rel.map(cardHTML).join('');
      $('relatedWrap').hidden = false;
    }

    // Article schema for search engines
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: p.title,
      description: p.excerpt,
      datePublished: p.date,
      author: { '@type': 'Organization', name: 'Secure Hub Pakistan' },
      publisher: { '@type': 'Organization', name: 'Secure Hub Pakistan' }
    });
    document.head.appendChild(ld);
  }

  initListing();
  initPost();
})();