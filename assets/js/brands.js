async function loadBrands() {
  const grid = document.getElementById("brandsGrid");
  if (!grid) return;

  try {
    const res = await fetch("data/brands.json");
    const brands = await res.json();

    grid.innerHTML = brands.map(b => {
      const logo = b.logo
        ? `<img src="${b.logo}" alt="${b.name}" class="brand-card__logo-img">`
        : `<span class="brand-card__initial">${b.name.charAt(0)}</span>`;

      return `
        <a href="products.html?brand=${encodeURIComponent(b.name)}" class="brand-card">
          <div class="brand-card__logo">${logo}</div>
          <h3>${b.name}</h3>
          <p>${b.tagline}</p>
        </a>`;
    }).join("");
  } catch (err) {
    console.error("Could not load brands:", err);
    grid.innerHTML = "<p>Brands load nahi ho sakay.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadBrands);