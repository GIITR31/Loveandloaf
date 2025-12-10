import { fetchCakes } from "./api.js";

const FEATURED_LIMIT = 8;



async function init() {
  document.getElementById("footer-year").textContent = new Date().getFullYear().toString();

  const featuredRow = document.getElementById("featured-row");
  try {
    const cakes = await fetchCakes();
    cakes.slice(0, FEATURED_LIMIT).forEach(cake => {
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
    <div style="font-weight:600;font-size:.9rem">${cake.name}</div>
    <div class="cake-meta">
      <span class="price-text">From ₹${cake.prices?.["0.5"] || cake.prices?.["1"] || 0}</span>
      <span>⭐ ${(cake.rating || 0).toFixed(1)}</span>
    </div>
    <div class="helper-text">Earliest delivery: Today</div>
  </div>
`;

      featuredRow.appendChild(card);
    });
  } catch (e) {
    featuredRow.innerHTML = "<p>Unable to load cakes right now.</p>";
  }

  const catGrid = document.getElementById("category-grid");
  CATEGORY_DEFS.forEach(cat => {
    const link = document.createElement("a");
    link.href = `/cakes.html?category=${encodeURIComponent(cat)}`;
    link.className = "category-pill";
    link.innerHTML = `
      <div class="category-icon">${emojiForCategory(cat)}</div>
      <div class="category-label">${cat}</div>
    `;
    catGrid.appendChild(link);
  });
}

init();
