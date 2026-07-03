let allProducts = [];
let allCategories = [];
let activeFilters = { category: null, brands: new Set(), search: "" };

function formatPKR(amount) {
  return "Rs. " + amount.toLocaleString("en-PK");
}

async function initShopPage() {
  const [productsRes, categoriesRes] = await Promise.all([
    fetch("data/products.json"),
    fetch("data/categories.json")
  ]);
  allProducts = await productsRes.json();
  allCategories = await categoriesRes.json();

  // Read ?cat= from URL
  const params = new URLSearchParams(window.location.search);
  const catFromUrl = params.get("cat");
  if (catFromUrl) activeFilters.category = catFromUrl;

  const brandFromUrl = params.get("brand");
  if (brandFromUrl) activeFilters.brands.add(brandFromUrl);

  renderCategoryFilters();
  renderBrandFilters();
  renderProducts();

  document.getElementById("searchInput").addEventListener("input", e => {
    activeFilters.search = e.target.value.toLowerCase();
    renderProducts();
  });

  document.getElementById("clearFilters").addEventListener("click", () => {
    activeFilters = { category: null, brands: new Set(), search: "" };
    document.getElementById("searchInput").value = "";
    renderCategoryFilters();
    renderBrandFilters();
    renderProducts();
    history.replaceState(null, "", "products.html");
  });
}

function renderCategoryFilters() {
  const box = document.getElementById("categoryFilters");
  box.innerHTML = allCategories.map(cat => `
    <label class="filter-item">
      <input type="radio" name="category" value="${cat.id}" ${activeFilters.category === cat.id ? "checked" : ""}>
      ${cat.name}
    </label>
  `).join("") + `
    <label class="filter-item">
      <input type="radio" name="category" value="" ${!activeFilters.category ? "checked" : ""}>
      All Categories
    </label>
  `;

  box.querySelectorAll('input[name="category"]').forEach(input => {
    input.addEventListener("change", e => {
      activeFilters.category = e.target.value || null;
      renderProducts();
    });
  });
}

function renderBrandFilters() {
  const brands = [...new Set(allProducts.map(p => p.brand))].sort();
  const box = document.getElementById("brandFilters");
  box.innerHTML = brands.map(brand => `
    <label class="filter-item">
      <input type="checkbox" value="${brand}" ${activeFilters.brands.has(brand) ? "checked" : ""}>
      ${brand}
    </label>
  `).join("");

  box.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener("change", e => {
      if (e.target.checked) activeFilters.brands.add(e.target.value);
      else activeFilters.brands.delete(e.target.value);
      renderProducts();
    });
  });
}

function renderProducts() {
  let results = allProducts.filter(p => {
    if (activeFilters.category && p.category !== activeFilters.category) return false;
    if (activeFilters.brands.size > 0 && !activeFilters.brands.has(p.brand)) return false;
    if (activeFilters.search && !(p.name + p.brand + p.model).toLowerCase().includes(activeFilters.search)) return false;
    return true;
  });

  document.getElementById("resultsCount").textContent = `${results.length} product${results.length !== 1 ? "s" : ""} found`;

  const grid = document.getElementById("shopGrid");
  if (results.length === 0) {
    grid.innerHTML = `<p class="shop__empty">Koi product nahi mila in filters ke saath.</p>`;
    return;
  }

  grid.innerHTML = results.map(p => {
    const img = p.image
      ? `<img src="${p.image}" alt="${p.name}" class="product-card__img">`
      : `<div class="product-card__img product-card__img--placeholder">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
             <rect x="3" y="7" width="13" height="10" rx="2"/><path d="M16 10.5 21 8v8l-5-2.5z"/>
           </svg>
         </div>`;

    const message = encodeURIComponent(`Assalam o Alaikum, mujhe ${p.name} (${p.model}) ke baare mein maloomat chahiye.`);

    return `
      <div class="product-card">
        ${img}
        <div class="product-card__body">
          <span class="product-card__brand">${p.brand}</span>
          <h3>${p.name}</h3>
          <span class="product-card__model">${p.model}</span>
          <div class="product-card__footer">
            <span class="product-card__price">${formatPKR(p.price)}</span>
            <a href="https://wa.me/923178412757?text=${message}" target="_blank" class="product-card__whatsapp" aria-label="Inquire on WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.87.5 3.63 1.38 5.15L2 22l4.98-1.35A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.6 0-3.13-.42-4.47-1.22l-.32-.19-3.14.85.85-3.06-.2-.32A7.94 7.94 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/></svg>
            </a>
          </div>
        </div>
      </div>`;
  }).join("");
}

document.addEventListener("DOMContentLoaded", initShopPage);
