const API_BASE = "/api";

export async function fetchCakes(category) {
  const url = category
    ? `${API_BASE}/cakes?category=${encodeURIComponent(category)}`
    : `${API_BASE}/cakes`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchCake(id) {
  const res = await fetch(`${API_BASE}/cakes/${id}`);
  if (!res.ok) throw new Error("Cake not found");
  return res.json();
}

export async function fetchWhatsappConfig() {
  const res = await fetch(`${API_BASE}/config/whatsapp`);
  return res.json();
}

export async function loginAdmin(password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });
  if (!res.ok) throw new Error("Invalid password");
  return res.json();
}

export async function createCake(cake, token) {
  const res = await fetch(`${API_BASE}/cakes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(cake)
  });
  if (!res.ok) throw new Error("Error creating cake");
  return res.json();
}

export async function updateCake(id, cake, token) {
  const res = await fetch(`${API_BASE}/cakes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(cake)
  });
  if (!res.ok) throw new Error("Error updating cake");
  return res.json();
}

export async function deleteCake(id, token) {
  const res = await fetch(`${API_BASE}/cakes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Error deleting cake");
  return res.json();
}
