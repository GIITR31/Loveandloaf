import {
  loginAdmin,
  fetchCakes,
  createCake,
  updateCake,
  deleteCake
} from "./api.js";

let token = localStorage.getItem("ll_admin_token") || null;
let allCakes = [];

const loginCard = document.getElementById("login-card");
const dashboard = document.getElementById("dashboard");

const loginButton = document.getElementById("login-button");
const loginError = document.getElementById("login-error");
const passwordInput = document.getElementById("admin-password");

const form = document.getElementById("cake-form");
const idInput = document.getElementById("cake-id");
const nameInput = document.getElementById("cake-name-input");
const descInput = document.getElementById("cake-desc-input");
const catInput = document.getElementById("cake-category-input");
const extraCatsInput = document.getElementById("cake-extra-cats-input");
const flavoursInput = document.getElementById("cake-flavours-input");
const price05Input = document.getElementById("price-05-input");
const price1Input = document.getElementById("price-1-input");
const price2Input = document.getElementById("price-2-input");
const ratingInput = document.getElementById("cake-rating-input");

// NEW multi-image elements
const imagesInput = document.getElementById("cake-images-input");
const imagesPreview = document.getElementById("cake-images-preview");

const resetButton = document.getElementById("reset-button");
const tableBody = document.getElementById("cakes-table-body");

// stored as data URLs
let imagesDataUrls = ["/images/placeholder-cake.jpg"];

function showDashboard() {
  loginCard.style.display = "none";
  dashboard.style.display = "block";
  loadCakes();
}

async function handleLogin() {
  loginError.textContent = "";
  const pw = passwordInput.value.trim();
  if (!pw) {
    loginError.textContent = "Please enter the password.";
    return;
  }
  try {
    const { token: t } = await loginAdmin(pw);
    token = t;
    localStorage.setItem("ll_admin_token", token);
    showDashboard();
  } catch {
    loginError.textContent = "Wrong password. Please try again.";
  }
}

loginButton.addEventListener("click", handleLogin);

if (token) {
  showDashboard();
}

// multi-image preview
imagesInput.addEventListener("change", () => {
  const files = Array.from(imagesInput.files || []);
  if (!files.length) return;

  imagesDataUrls = [];
  imagesPreview.innerHTML = "";

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target.result;
      imagesDataUrls.push(src);

      const img = document.createElement("img");
      img.src = src;
      img.alt = "Preview";
      img.style.width = "90px";
      img.style.height = "70px";
      img.style.borderRadius = "10px";
      img.style.objectFit = "cover";
      img.style.background = "#fff4f0";
      imagesPreview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

function clearForm() {
  idInput.value = "";
  form.reset();
  imagesDataUrls = ["/images/placeholder-cake.jpg"];
  imagesPreview.innerHTML = `
    <img src="/images/placeholder-cake.jpg" alt="Preview"
      style="width:90px;height:70px;border-radius:10px;object-fit:cover;background:#fff4f0;" />
  `;
}

resetButton.addEventListener("click", clearForm);

function renderTable() {
  tableBody.innerHTML = "";
  allCakes.forEach(cake => {
    const tr = document.createElement("tr");
    const fromPrice = cake.prices?.["0.5"] || cake.prices?.["1"] || cake.prices?.["2"] || 0;
    tr.innerHTML = `
      <td>${cake.name}</td>
      <td><span class="badge-pill">${(cake.categories || [])[0] || "—"}</span></td>
      <td>₹${fromPrice}</td>
      <td>${(cake.rating || 0).toFixed(1)}</td>
      <td>
        <button data-id="${cake.id}" class="btn-outline"
          style="font-size:.75rem;padding:.25rem .5rem">Edit</button>
        <button data-del="${cake.id}" class="btn-outline"
          style="font-size:.75rem;padding:.25rem .5rem;color:#d14a4a">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  tableBody.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const cake = allCakes.find(c => c.id === id);
      if (!cake) return;

      idInput.value = cake.id;
      nameInput.value = cake.name;
      descInput.value = cake.description || "";
      catInput.value = (cake.categories || [])[0] || "Gen Z Cakes";
      extraCatsInput.value = (cake.categories || []).slice(1).join(", ");
      flavoursInput.value = (cake.flavours || []).join(", ");
      price05Input.value = cake.prices?.["0.5"] || "";
      price1Input.value = cake.prices?.["1"] || "";
      price2Input.value = cake.prices?.["2"] || "";
      ratingInput.value = cake.rating || "";

      imagesDataUrls =
        cake.images && cake.images.length
          ? cake.images
          : cake.imageUrl
          ? [cake.imageUrl]
          : ["/images/placeholder-cake.jpg"];

      imagesPreview.innerHTML = "";
      imagesDataUrls.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "Preview";
        img.style.width = "90px";
        img.style.height = "70px";
        img.style.borderRadius = "10px";
        img.style.objectFit = "cover";
        img.style.background = "#fff4f0";
        imagesPreview.appendChild(img);
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  tableBody.querySelectorAll("button[data-del]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-del");
      const cake = allCakes.find(c => c.id === id);
      if (!cake) return;
      if (!confirm(`Delete "${cake.name}"? This cannot be undone.`)) return;
      try {
        await deleteCake(id, token);
        allCakes = allCakes.filter(c => c.id !== id);
        renderTable();
        clearForm();
        alert("Cake deleted.");
      } catch {
        alert("Unable to delete cake.");
      }
    });
  });
}

async function loadCakes() {
  try {
    allCakes = await fetchCakes();
    renderTable();
  } catch {
    alert("Unable to load cakes.");
  }
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const baseCat = catInput.value;
  const extraCats = extraCatsInput.value
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const flavours = flavoursInput.value
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const prices = {
    "0.5": Number(price05Input.value) || 0,
    "1": Number(price1Input.value) || 0,
    "2": Number(price2Input.value) || 0
  };

  const payload = {
    name: nameInput.value.trim(),
    description: descInput.value.trim(),
    categories: [baseCat, ...extraCats],
    flavours,
    prices,
    rating: Number(ratingInput.value) || 0,
    images: imagesDataUrls
  };

  try {
    if (idInput.value) {
      const updated = await updateCake(idInput.value, payload, token);
      const idx = allCakes.findIndex(c => c.id === updated.id);
      if (idx !== -1) allCakes[idx] = updated;
      alert("Cake updated.");
    } else {
      const created = await createCake(payload, token);
      allCakes.push(created);
      alert("Cake added.");
    }
    renderTable();
    clearForm();
  } catch {
    alert("Unable to save cake. Please try again.");
  }
});
