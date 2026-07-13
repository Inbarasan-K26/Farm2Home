// ===========================================================
// FARM2HOME — shared interactivity
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- vine divider draw-in on scroll ---------- */
  const vines = document.querySelectorAll('.vine-divider');
  if (vines.length) {
    const vineIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          vineIO.unobserve(entry.target);
        }
      });
    }, { threshold: .4 });
    vines.forEach(v => vineIO.observe(v));
  }

  /* ---------- hero background parallax ---------- */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroBg.style.transform = `translateY(${y * 0.18}px) scale(1.05)`;
    }, { passive: true });
  }

  /* ---------- mouse-tilt on hero crate ---------- */
  const crateWrap = document.querySelector('.crate-wrap');
  const crate = document.querySelector('.crate');
  if (crateWrap && crate) {
    crateWrap.addEventListener('mousemove', (e) => {
      const rect = crateWrap.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      crate.style.transform = `rotateY(${px * 16}deg) rotateX(${py * -16}deg) translateY(-4px)`;
    });
    crateWrap.addEventListener('mouseleave', () => {
      crate.style.transform = 'rotateY(0deg) rotateX(0deg) translateY(0)';
    });
  }

  /* ---------- falling seeds / leaves generator ---------- */
  const seedEmojis = ['🍃', '🌿', '🍂'];
  document.querySelectorAll('.seed-field').forEach(field => {
    const count = parseInt(field.dataset.count || '10', 10);
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'seed';
      s.textContent = seedEmojis[i % seedEmojis.length];
      s.style.left = Math.random() * 100 + '%';
      s.style.fontSize = 14 + Math.random() * 14 + 'px';
      const duration = 9 + Math.random() * 8;
      s.style.animationDuration = duration + 's';
      s.style.animationDelay = (Math.random() * duration) + 's';
      field.appendChild(s);
    }
  });

  /* ---------- dashboard: animated stat counters ---------- */
  document.querySelectorAll('.stat-value[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    let current = 0;
    const duration = 1100;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      current = target * eased;
      el.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(tick);
  });

  /* ---------- dashboard: animated bar chart ---------- */
  document.querySelectorAll('.bar-chart .bar[data-height]').forEach((bar, i) => {
    setTimeout(() => { bar.style.height = bar.dataset.height + '%'; }, 150 + i * 90);
  });

  /* ---------- dashboard: mobile sidebar toggle ---------- */
  const dashToggle = document.querySelector('.mobile-dash-toggle');
  const dashSidebar = document.querySelector('.dash-sidebar');
  if (dashToggle && dashSidebar) {
    dashToggle.addEventListener('click', () => dashSidebar.classList.toggle('open'));
  }

  /* ---------- dashboard: modal open/close ---------- */
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = document.getElementById(btn.dataset.modalOpen);
      if (modal) modal.classList.add('open');
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay').classList.remove('open');
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  /* ---------- helper: build a product card ---------- */
  function buildProductCard(p) {
    const card = document.createElement('div');
    card.className = 'p-card';
    card.dataset.category = p.category || '';
    card.innerHTML = `
      <span class="fresh-badge">${p.badge || 'Fresh'}</span>
      <a href="${p.id ? 'product.html?id=' + p.id : '#'}">
        <div class="img-wrap"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
      </a>
      <div class="p-body">
        <a href="${p.id ? 'product.html?id=' + p.id : '#'}"><h4>${p.name}</h4></a>
        <p>${p.farm || ''} ${p.distance ? '· ' + p.distance : ''}</p>
        <div class="p-price"><span class="tag">₹${p.price}/${p.unit}</span><button class="p-add">+</button></div>
      </div>`;
    return card;
  }

  /* ---------- customer dashboard: recommended products ---------- */
  const recommendGrid = document.getElementById('recommendGrid');
  if (recommendGrid && typeof PRODUCTS !== 'undefined') {
    PRODUCTS.slice(0, 8).forEach(p => recommendGrid.appendChild(buildProductCard(p)));
  }

  /* ---------- customer dashboard: wishlist ---------- */
  const wishlistGrid = document.getElementById('wishlistGrid');
  if (wishlistGrid && typeof PRODUCTS !== 'undefined') {
    const wishlistIds = ['alphonso-mangoes', 'strawberries', 'farm-paneer', 'heirloom-tomatoes'];
    wishlistIds.forEach(id => {
      const p = PRODUCTS.find(x => x.id === id);
      if (!p) return;
      const card = buildProductCard(p);
      const actions = document.createElement('div');
      actions.className = 'row-actions';
      actions.innerHTML = `<button title="Remove from wishlist">✕</button>`;
      card.appendChild(actions);
      actions.querySelector('button').addEventListener('click', () => {
        card.classList.add('removing');
        setTimeout(() => card.remove(), 350);
      });
      wishlistGrid.appendChild(card);
    });
  }

  /* ---------- farmer dashboard: product management ---------- */
  const manageGrid = document.getElementById('manageGrid');
  if (manageGrid && typeof PRODUCTS !== 'undefined') {
    const myProductIds = ['heirloom-tomatoes', 'bell-peppers', 'purple-brinjal', 'garden-carrots', 'sweet-corn'];
    myProductIds.forEach(id => {
      const p = PRODUCTS.find(x => x.id === id);
      if (!p) return;
      addFarmerCard(p);
    });
  }
  function addFarmerCard(p) {
    if (!manageGrid) return;
    const card = buildProductCard(p);
    const actions = document.createElement('div');
    actions.className = 'row-actions';
    actions.innerHTML = `<button title="Edit">✎</button><button title="Delete">🗑</button>`;
    card.appendChild(actions);
    actions.querySelectorAll('button')[1].addEventListener('click', () => {
      card.style.transition = 'opacity .35s, transform .35s';
      card.style.opacity = '0';
      card.style.transform = 'scale(.9)';
      setTimeout(() => card.remove(), 350);
    });
    const addCard = document.getElementById('addProductCard');
    if (addCard) manageGrid.insertBefore(card, addCard);
    else manageGrid.appendChild(card);
  }

  const addProductForm = document.getElementById('addProductForm');
  if (addProductForm) {
    addProductForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newProduct = {
        name: document.getElementById('newProdName').value || 'New Produce',
        category: document.getElementById('newProdCategory').value,
        price: document.getElementById('newProdPrice').value || '0',
        unit: document.getElementById('newProdUnit').value || 'kg',
        img: document.getElementById('newProdImage').value || 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=500&q=80',
        farm: 'Your Farm',
        distance: 'Listed by you',
        badge: 'New listing'
      };
      addFarmerCard(newProduct);
      addProductForm.reset();
      document.getElementById('addProductModal').classList.remove('open');
    });
  }

  /* ---------- shop grid render (products.html) ---------- */
  const shopGridEl = document.getElementById('shopGrid');
  if (shopGridEl && typeof PRODUCTS !== 'undefined') {
    PRODUCTS.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'p-card';
      card.style.animationDelay = (i % 4) * 0.06 + 's';
      card.dataset.category = p.category;
      card.dataset.name = p.name;
      card.innerHTML = `
        <span class="fresh-badge">${p.badge}</span>
        <a href="product.html?id=${p.id}">
          <div class="img-wrap"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
        </a>
        <div class="p-body">
          <a href="product.html?id=${p.id}"><h4>${p.name}</h4></a>
          <p>${p.farm} · ${p.distance}</p>
          <div class="p-price"><span class="tag">₹${p.price}/${p.unit}</span><button class="p-add">+</button></div>
        </div>`;
      shopGridEl.appendChild(card);
    });
  }

  /* ---------- product detail page ---------- */
  const detailNameEl = document.getElementById('detailName');
  if (detailNameEl && typeof PRODUCTS !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];

    document.title = product.name + ' — Farm2Home';
    document.getElementById('crumbCategory').textContent = product.categoryLabel;
    document.getElementById('crumbName').textContent = product.name;
    document.getElementById('detailCategory').textContent = product.categoryLabel;
    detailNameEl.textContent = product.name;
    document.getElementById('detailFarm').textContent = product.farm;
    document.getElementById('detailDistance').textContent = product.distance;
    document.getElementById('detailBadge').textContent = product.badge;
    document.getElementById('detailPrice').textContent = '₹' + product.price;
    document.getElementById('detailUnit').textContent = product.unit;
    document.getElementById('detailDesc').textContent = product.desc;
    document.getElementById('relatedHeading').textContent = 'More ' + product.categoryLabel.toLowerCase();

    const tagRow = document.getElementById('tagRow');
    product.tags.forEach(t => {
      const span = document.createElement('span');
      span.className = 'pill-tag';
      span.textContent = t;
      tagRow.appendChild(span);
    });

    /* gallery */
    const images = [product.img, ...(typeof GALLERY_EXTRAS !== 'undefined' ? GALLERY_EXTRAS : [])];
    const mainImage = document.getElementById('mainImage');
    mainImage.src = images[0];
    mainImage.alt = product.name;
    const thumbRow = document.getElementById('thumbRow');
    images.forEach((src, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'thumb' + (i === 0 ? ' active' : '');
      thumb.innerHTML = `<img src="${src}" alt="${product.name} view ${i + 1}">`;
      thumb.addEventListener('click', () => {
        mainImage.src = src;
        thumbRow.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
      thumbRow.appendChild(thumb);
    });

    /* quantity stepper */
    let qty = 1;
    const qtyValue = document.getElementById('qtyValue');
    document.getElementById('qtyMinus').addEventListener('click', () => {
      qty = Math.max(1, qty - 1);
      qtyValue.textContent = qty;
    });
    document.getElementById('qtyPlus').addEventListener('click', () => {
      qty = Math.min(20, qty + 1);
      qtyValue.textContent = qty;
    });

    /* add to basket */
    const addBtn = document.getElementById('addToBasketBtn');
    const detailCartCount = document.getElementById('cartCount');
    let basketQty = 0;
    addBtn.addEventListener('click', () => {
      basketQty += qty;
      if (detailCartCount) {
        detailCartCount.textContent = basketQty;
        detailCartCount.classList.add('bump');
        setTimeout(() => detailCartCount.classList.remove('bump'), 300);
      }
      addBtn.textContent = 'Added ✓';
      setTimeout(() => { addBtn.textContent = 'Add to basket'; }, 1300);
    });

    /* related products */
    const relatedGrid = document.getElementById('relatedGrid');
    const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    related.forEach(p => {
      const card = document.createElement('div');
      card.className = 'p-card reveal in';
      card.innerHTML = `
        <span class="fresh-badge">${p.badge}</span>
        <a href="product.html?id=${p.id}">
          <div class="img-wrap"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
        </a>
        <div class="p-body">
          <a href="product.html?id=${p.id}"><h4>${p.name}</h4></a>
          <p>${p.farm} · ${p.distance}</p>
          <div class="p-price"><span class="tag">₹${p.price}/${p.unit}</span><button class="p-add">+</button></div>
        </div>`;
      relatedGrid.appendChild(card);
    });
  }

  /* ---------- graceful image fallback ---------- */
  const fallbackSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23F1EAD6"/><text x="50%" y="50%" font-size="64" text-anchor="middle" dominant-baseline="middle">🌿</text></svg>'
  );
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function onErr() {
      this.removeEventListener('error', onErr);
      this.src = fallbackSvg;
    });
  });

  /* ---------- shop page: category filter + search + cart ---------- */
  const catTabs = document.querySelectorAll('.cat-tab');
  const shopCards = document.querySelectorAll('.shop-grid .p-card');
  const searchInput = document.getElementById('shopSearch');
  const emptyState = document.getElementById('emptyState');
  let activeCat = 'all';

  function applyFilters() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    let visibleCount = 0;
    shopCards.forEach(card => {
      const cat = card.dataset.category;
      const name = (card.dataset.name || '').toLowerCase();
      const matchesCat = activeCat === 'all' || cat === activeCat;
      const matchesQuery = !query || name.includes(query);
      const show = matchesCat && matchesQuery;
      card.classList.toggle('hidden', !show);
      if (show) visibleCount++;
    });
    if (emptyState) emptyState.classList.toggle('show', visibleCount === 0);
  }

  if (catTabs.length) {
    catTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        catTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCat = tab.dataset.cat;
        applyFilters();
      });
    });
  }
  if (searchInput) searchInput.addEventListener('input', applyFilters);

  /* ---------- cart counter (shop page) ---------- */
  const cartCount = document.getElementById('cartCount');
  let cartTotal = 0;
  document.querySelectorAll('.shop-grid .p-add').forEach(btn => {
    btn.addEventListener('click', () => {
      cartTotal++;
      if (cartCount) {
        cartCount.textContent = cartTotal;
        cartCount.classList.add('bump');
        setTimeout(() => cartCount.classList.remove('bump'), 300);
      }
    });
  });

  /* ---------- seamless marquee duplication ---------- */
  ['ticker', 't-track'].forEach(id => {
    const track = document.getElementById(id);
    if (track) track.innerHTML += track.innerHTML; // duplicate content for infinite loop
  });

  /* ---------- password show/hide ---------- */
  document.querySelectorAll('.pass-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isPass = target.type === 'password';
      target.type = isPass ? 'text' : 'password';
      btn.textContent = isPass ? '🙈' : '👁️';
    });
  });

  /* ---------- password strength meter (signup page) ---------- */
  const signupPass = document.getElementById('signupPassword');
  const strengthBars = document.querySelectorAll('#strength i');
  const strengthHint = document.getElementById('strengthHint');
  if (signupPass && strengthBars.length) {
    signupPass.addEventListener('input', () => {
      const val = signupPass.value;
      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/\d/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      const colors = ['#D64933', '#E8B923', '#74A57F', '#2D6A4F'];
      const labels = ['Weak — try adding a number', 'Okay — add a symbol for extra strength', 'Good password', 'Strong password 🌱'];

      strengthBars.forEach((bar, i) => {
        bar.style.background = i < score ? colors[Math.max(score - 1, 0)] : '';
      });
      strengthHint.textContent = val.length === 0
        ? 'Use 6+ characters with a number for a stronger password'
        : labels[Math.max(score - 1, 0)] || labels[0];
    });
  }

  /* ---------- toast helper ---------- */
  function showToast() {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  /* ---------- login form ---------- */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!loginForm.checkValidity()) {
        loginForm.reportValidity();
        return;
      }
      showToast();
      setTimeout(() => { window.location.href = 'customer-dashboard.html'; }, 1400);
    });
  }

  /* ---------- signup form ---------- */
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = document.getElementById('signupPassword').value;
      const confirm = document.getElementById('confirmPassword').value;

      if (!signupForm.checkValidity()) {
        signupForm.reportValidity();
        return;
      }
      if (pass !== confirm) {
        const confirmField = document.getElementById('confirmPassword');
        confirmField.style.borderColor = '#D64933';
        confirmField.setCustomValidity('Passwords do not match');
        confirmField.reportValidity();
        confirmField.addEventListener('input', () => {
          confirmField.setCustomValidity('');
          confirmField.style.borderColor = '';
        }, { once: true });
        return;
      }
      showToast();
      const isFarmer = document.getElementById('roleFarmer') && document.getElementById('roleFarmer').checked;
      setTimeout(() => { window.location.href = isFarmer ? 'farmer-dashboard.html' : 'customer-dashboard.html'; }, 1400);
    });
  }

  /* ---------- add-to-basket micro interaction ---------- */
  document.querySelectorAll('.p-add').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = '✓';
      btn.style.background = '#2D6A4F';
      btn.style.borderColor = '#2D6A4F';
      btn.style.color = '#fff';
      setTimeout(() => {
        btn.textContent = '+';
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 1200);
    });
  });

});
