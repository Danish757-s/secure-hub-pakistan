// Icon shapes used when a category has no image yet
const CATEGORY_ICONS = {
  "ip-camera": '<circle cx="12" cy="12" r="3.5"/><path d="M3 8.5a2 2 0 0 1 2-2h2l1.5-2h7L17 6.5h2a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  "analog-camera": '<rect x="3" y="7" width="13" height="10" rx="2"/><path d="M16 10.5 21 8v8l-5-2.5z"/>',
  "ptz-camera": '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  "nvr": '<rect x="2" y="5" width="20" height="13" rx="2"/><path d="M8 21h8M12 18v3"/>',
  "dvr": '<rect x="2" y="5" width="20" height="13" rx="2"/><circle cx="12" cy="11.5" r="3"/>',
  "poe-switch": '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8V6M11 8V6M15 8V6M7 16v2M11 16v2M15 16v2"/>',
  "access-control": '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  "door-phone": '<rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="7" r="1.6"/><path d="M9 12h6M9 16h6"/>'
};

async function loadCategories() {
  const grid = document.getElementById("categoriesGrid");
  if (!grid) return;

  try {
    const res = await fetch("data/categories.json");
    const categories = await res.json();

    grid.innerHTML = categories.map(cat => {
      const visual = cat.image
        ? `<img src="${cat.image}" alt="${cat.name}" class="cat-card__img">`
        : `<div class="cat-card__icon">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
               ${CATEGORY_ICONS[cat.icon] || ""}
             </svg>
           </div>`;

      return `
        <a href="products.html?cat=${cat.id}" class="cat-card">
          ${visual}
          <h3>${cat.name}</h3>
          <p>${cat.description}</p>
        </a>`;
    }).join("");
  } catch (err) {
    console.error("Could not load categories:", err);
    grid.innerHTML = "<p>Categories load nahi ho sakin.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadCategories);