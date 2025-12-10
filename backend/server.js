import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { JSONFilePreset } from "lowdb/node";
import { nanoid } from "nanoid";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";
const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || "911234567890";

// Init lowdb JSON db
const defaultData = { cakes: [] };
const db = await JSONFilePreset(
  path.join(__dirname, "db", "cakes.json"),
  defaultData
);

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

const activeTokens = new Set();

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token || !activeTokens.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// --- Auth ---
app.post("/api/login", (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }
  const token = nanoid();
  activeTokens.add(token);
  res.json({ token });
});

// --- Public cakes API ---

app.get("/api/cakes", async (req, res) => {
  const { category } = req.query;
  await db.read();
  let cakes = db.data.cakes || [];
  if (category) {
    cakes = cakes.filter(c => (c.categories || []).includes(category));
  }
  res.json(cakes);
});

app.get("/api/cakes/:id", async (req, res) => {
  const { id } = req.params;
  await db.read();
  const cake = (db.data.cakes || []).find(c => c.id === id);
  if (!cake) return res.status(404).json({ error: "Cake not found" });
  res.json(cake);
});

app.get("/api/config/whatsapp", (req, res) => {
  res.json({ phone: WHATSAPP_PHONE });
});

// --- Admin write APIs ---

// Create
app.post("/api/cakes", requireAuth, async (req, res) => {
  const cake = req.body;
  await db.read();

  const id = nanoid();
  const imagesArray =
    Array.isArray(cake.images) && cake.images.length
      ? cake.images
      : cake.imageUrl
      ? [cake.imageUrl]
      : ["/images/placeholder-cake.jpg"];

  const newCake = {
    id,
    name: cake.name,
    description: cake.description || "",
    categories: cake.categories || [],
    images: imagesArray,
    prices: cake.prices || { "0.5": 0, "1": 0, "2": 0 },
    flavours: cake.flavours || [],
    rating: cake.rating || 0
  };

  db.data.cakes.push(newCake);
  await db.write();
  res.status(201).json(newCake);
});

// Update
app.put("/api/cakes/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  await db.read();
  const idx = db.data.cakes.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Cake not found" });

  const current = db.data.cakes[idx];

  const imagesArray =
    Array.isArray(body.images) && body.images.length
      ? body.images
      : current.images && current.images.length
      ? current.images
      : current.imageUrl
      ? [current.imageUrl]
      : ["/images/placeholder-cake.jpg"];

  const updated = {
    ...current,
    ...body,
    id,
    images: imagesArray
  };

  db.data.cakes[idx] = updated;
  await db.write();
  res.json(updated);
});

// Delete
app.delete("/api/cakes/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  await db.read();
  const idx = db.data.cakes.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Cake not found" });
  db.data.cakes.splice(idx, 1);
  await db.write();
  res.json({ success: true });
});

// Root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Love & Loaf running on http://localhost:${PORT}`);
});
