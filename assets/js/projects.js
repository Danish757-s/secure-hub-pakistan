let allProjects = [];
let activeType = "all";

async function initProjectsPage() {
  const res = await fetch("data/projects.json");
  allProjects = await res.json();
  renderProjects();

  document.querySelectorAll(".project-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".project-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeType = tab.dataset.type;
      renderProjects();
    });
  });
}

function renderProjects() {
  const grid = document.getElementById("projectsGrid");
  const filtered = activeType === "all"
    ? allProjects
    : allProjects.filter(p => p.type === activeType);

  grid.innerHTML = filtered.map(p => {
    const img = p.image
      ? `<img src="${p.image}" alt="${p.title}" class="project-card__img">`
      : `<div class="project-card__img project-card__img--placeholder">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
             <circle cx="12" cy="12" r="3.5"/><path d="M3 8.5a2 2 0 0 1 2-2h2l1.5-2h7L17 6.5h2a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
           </svg>
         </div>`;

    return `
      <div class="project-card">
        ${img}
        <div class="project-card__body">
          <span class="project-card__type">${p.type}</span>
          <h3>${p.title}</h3>
          <p class="project-card__location">${p.location} &middot; ${p.date}</p>
          <p class="project-card__desc">${p.description}</p>
        </div>
      </div>`;
  }).join("");
}

document.addEventListener("DOMContentLoaded", initProjectsPage);