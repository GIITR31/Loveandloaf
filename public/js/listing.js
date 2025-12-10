import { fetchCakes } from "./api.js";

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name); // reads ?q=... or ?category=... [web:112]
}

let allCakes = [];

function renderCakes(list) {
  const grid = document.getElementById("cakes-grid");
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = "<p>No cakes match your search.</p>";
    return;
  }

  list.forEach(cake => {
    const card = document.createElement("a");
    card.href = `/cake.html?id=${encodeURIComponent(cake.id)}`;
    card.className = "cake-card";
const mainImage =
  (cake.images && cake.images.length && cake.images[0]) ||
  cake.imageUrl ||
  "/images/placeholder-cake.jpg";

card.innerHTML = `
  <div class="cake-image-wrap">
    <img src="${mainImage}" alt="${cake.name}" />
  </div>
  <div>
    <div style="font-weight:600;font-size:.95rem;margin-bottom:0.15rem">
      ${cake.name}
    </div>
    <div style="font-size:.85rem;color:#8a7670;margin-bottom:0.25rem;">
      ${(cake.description || "").slice(0, 80)}${(cake.description || "").length > 80 ? "…" : ""}
    </div>
    <div class="cake-meta">
      <span class="price-text">
        From ₹${cake.prices?.["0.5"] || cake.prices?.["1"] || 0}
      </span>
      <span>⭐ ${(cake.rating || 0).toFixed(1)}</span>
    </div>
    <div class="helper-text">Earliest delivery: Today</div>
  </div>
`;

    grid.appendChild(card);
  });
}

function filterByQuery(q) {
  const term = (q || "").trim().toLowerCase();
  if (!term) return allCakes;

  return allCakes.filter(cake => {
    const name = (cake.name || "").toLowerCase();
    const desc = (cake.description || "").toLowerCase();
    const flavours = (cake.flavours || []).join(" ").toLowerCase();
    return name.includes(term) || desc.includes(term) || flavours.includes(term);
  }); // client-side filter based on search term [web:88]
}

async function init() {
  document.getElementById("footer-year").textContent = new Date().getFullYear().toString();

  const category = getQueryParam("category");
  const q = getQueryParam("q") || "";

  const titleEl = document.getElementById("listing-title");
  const subtitleEl = document.getElementById("listing-subtitle");

  if (category) {
    titleEl.textContent = category;
    subtitleEl.textContent = `Handpicked cakes under “${category}” from Love & Loaf.`;
  } else if (q) {
    titleEl.textContent = `Results for “${q}”`;
    subtitleEl.textContent = "Showing cakes that match your search.";
  }

  try {
    allCakes = await fetchCakes(category || undefined);
    const filtered = filterByQuery(q);
    renderCakes(filtered);
  } catch {
    document.getElementById("cakes-grid").innerHTML =
      "<p>Unable to load cakes right now.</p>";
  }
}

init();
