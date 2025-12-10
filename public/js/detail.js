import { fetchCake, fetchWhatsappConfig } from "./api.js";

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

let cakeData = null;
let selectedWeight = "0.5";
let currentImageIndex = 0;

function updatePrice() {
  if (!cakeData) return;
  const prices = cakeData.prices || {};
  const price =
    prices[selectedWeight] || prices["1"] || prices["0.5"] || prices["2"] || 0;
  document.getElementById("price-display").textContent = `₹${price}`;
}

function renderWeights(prices) {
  const row = document.getElementById("weight-row");
  row.innerHTML = "";
  ["0.5", "1", "2"].forEach(w => {
    if (!prices[w]) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "weight-chip" + (w === selectedWeight ? " active" : "");
    btn.textContent = w === "0.5" ? "½ kg" : `${w} kg`;
    btn.addEventListener("click", () => {
      selectedWeight = w;
      document
        .querySelectorAll(".weight-chip")
        .forEach(el => el.classList.remove("active"));
      btn.classList.add("active");
      updatePrice();
    });
    row.appendChild(btn);
  });
}

async function init() {
  document.getElementById("footer-year").textContent =
    new Date().getFullYear().toString();

  const id = getQueryParam("id");
  if (!id) {
    alert("No cake selected.");
    return;
  }

  try {
    cakeData = await fetchCake(id);
  } catch {
    alert("Unable to load this cake.");
    return;
  }

  document.getElementById("cake-name").textContent = cakeData.name;
  document.getElementById("cake-desc").textContent = cakeData.description || "";

  // --- image slider setup ---
  const mainImg = document.getElementById("cake-image");
  const thumbsContainer = document.getElementById("slider-thumbs");

  const images = cakeData.images && cakeData.images.length
    ? cakeData.images
    : cakeData.imageUrl
    ? [cakeData.imageUrl]
    : ["/images/placeholder-cake.jpg"];

  currentImageIndex = 0;
  mainImg.src = images[0];

  thumbsContainer.innerHTML = "";
  images.forEach((src, index) => {
    const thumb = document.createElement("img");
    thumb.src = src;
    thumb.alt = cakeData.name + " " + (index + 1);
    thumb.style.width = "60px";
    thumb.style.height = "48px";
    thumb.style.borderRadius = "10px";
    thumb.style.objectFit = "cover";
    thumb.style.cursor = "pointer";
    thumb.style.border =
      index === 0 ? "2px solid #1b5e20" : "2px solid transparent";
    thumb.style.boxShadow = "0 4px 10px rgba(0,0,0,0.12)";
    thumb.addEventListener("click", () => {
      currentImageIndex = index;
      mainImg.src = src;
      thumbsContainer.querySelectorAll("img").forEach((img, i) => {
        img.style.border =
          i === currentImageIndex ? "2px solid #1b5e20" : "2px solid transparent";
      });
    });
    thumbsContainer.appendChild(thumb);
  });
  // simple manual image slider based on array of URLs [web:176][web:177][web:188]

  // --- options + pricing ---
  const flavourSelect = document.getElementById("flavour-select");
  (cakeData.flavours || ["Chocolate"]).forEach(flavour => {
    const opt = document.createElement("option");
    opt.value = flavour;
    opt.textContent = flavour;
    flavourSelect.appendChild(opt);
  });

  renderWeights(cakeData.prices || {});
  updatePrice();

  const { phone } = await fetchWhatsappConfig();

  document.getElementById("whatsapp-btn").addEventListener("click", () => {
    const flavour = flavourSelect.value;
    const prices = cakeData.prices || {};
    const price =
      prices[selectedWeight] || prices["1"] || prices["0.5"] || prices["2"] || 0;
    const date = document.getElementById("delivery-date").value;
    const address = document.getElementById("delivery-address").value.trim();
    const cakeMessage = document.getElementById("cake-message").value.trim();
    const extraNotes = document.getElementById("extra-notes").value.trim();

    if (!address) {
      alert("Please add a delivery address so the order can be confirmed.");
      return;
    }

    const lines = [
      "Hi, I would like to place this order:",
      `Cake: ${cakeData.name}`,
      `Flavour: ${flavour}`,
      `Weight: ${selectedWeight === "0.5" ? "0.5 kg" : selectedWeight + " kg"}`,
      `Price: ₹${price}`,
      date ? `Preferred delivery date: ${date}` : "",
      "",
      "Delivery address:",
      address,
      cakeMessage ? `\nMessage on cake: "${cakeMessage}"` : "",
      extraNotes ? `\nNotes: ${extraNotes}` : ""
    ].filter(Boolean);

    const message = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/${phone}?text=${message}`; // click-to-chat with encoded message [web:140][web:142][web:153]
    window.open(url, "_blank");
  });
}

init();
