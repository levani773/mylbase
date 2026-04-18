import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = process.env.NODE_ENV === "production" ? "/data" : __dirname;
const DB_PATH = path.join(DB_DIR, "aura_db.json");

// Initial DB Structure
const INITIAL_DB = {
  users: [
    { uid: 'u1', email: 'admin@aura.db', provider: 'google.com', created: 'Apr 10, 2026', lastLogin: 'Apr 18, 2026' },
  ],
  collections: [
    {
      id: 'users',
      docs: [
        { id: 'u1', data: { name: 'Admin User', role: 'owner' } },
      ]
    }
  ],
  storage: [
    { name: 'system_logs.txt', type: 'file', size: '12 KB', modified: 'Just now' }
  ],
  rules: `service aura.db {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}`,
  functions: [
    { name: 'helloWorld', code: 'async (db, auth) => {\n  return { message: "Hello from AuraDB Cloud!" };\n}' }
  ],
  stats: {
    history: [], // [{ timestamp, requests, errors, latency }]
    totalRequests: 0,
    totalErrors: 0
  }
};

async function ensureDB() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(INITIAL_DB, null, 2));
  }
}

async function getDB() {
  const data = await fs.readFile(DB_PATH, "utf-8");
  const db = JSON.parse(data);
  // Migrate existing DB if keys are missing
  if (!db.stats) db.stats = INITIAL_DB.stats;
  if (!db.rules) db.rules = INITIAL_DB.rules;
  if (!db.functions) db.functions = INITIAL_DB.functions;
  return db;
}

async function saveDB(db: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

// Stats tracking global
let currentStats = {
  requests: 0,
  errors: 0,
  latencySum: 0
};

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });
  const PORT = process.env.PORT || 3000;

  await ensureDB();
  
  // Analytics Middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      currentStats.requests++;
      currentStats.latencySum += duration;
      if (res.statusCode >= 400) currentStats.errors++;
    });
    next();
  });

  // Record stats every 5 seconds
  setInterval(async () => {
    const db = await getDB();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const latency = currentStats.requests ? Math.round(currentStats.latencySum / currentStats.requests) : 0;
    
    db.stats.history.push({
      timestamp,
      requests: currentStats.requests,
      errors: currentStats.errors,
      latency
    });
    
    // Keep only last 20 records
    if (db.stats.history.length > 20) db.stats.history.shift();
    
    db.stats.totalRequests += currentStats.requests;
    db.stats.totalErrors += currentStats.errors;
    
    await saveDB(db);
    
    // Reset window
    currentStats = { requests: 0, errors: 0, latencySum: 0 };
    
    io.emit('aura_sync', { type: 'stats_changed', data: db.stats });
  }, 5000);

  app.use(express.json());

  // Real-time Event Broadcaster
  const broadcastSync = (type: string, data: any) => {
    io.emit('aura_sync', { type, data });
  };

  // --- AuraDB Engine API ---

  // Auth
  app.get("/api/auth/users", async (req, res) => {
    const db = await getDB();
    res.json(db.users);
  });

  app.post("/api/auth/users", async (req, res) => {
    const db = await getDB();
    const newUser = req.body;
    db.users.unshift(newUser);
    await saveDB(db);
    broadcastSync('auth_changed', db.users);
    res.json(newUser);
  });

  app.delete("/api/auth/users/:uid", async (req, res) => {
    const db = await getDB();
    db.users = db.users.filter((u: any) => u.uid !== req.params.uid);
    await saveDB(db);
    broadcastSync('auth_changed', db.users);
    res.json({ success: true });
  });

  // Firestore
  app.get("/api/db/collections", async (req, res) => {
    const db = await getDB();
    res.json(db.collections);
  });

  app.post("/api/db/save", async (req, res) => {
    const db = await getDB();
    const { collections } = req.body;
    db.collections = collections;
    await saveDB(db);
    broadcastSync('db_changed', db.collections);
    res.json({ success: true });
  });

  // Security Rules
  app.get("/api/rules", async (req, res) => {
    const db = await getDB();
    res.json({ rules: db.rules });
  });

  app.post("/api/rules", async (req, res) => {
    const db = await getDB();
    db.rules = req.body.rules;
    await saveDB(db);
    res.json({ success: true });
  });

  // Functions
  app.get("/api/functions", async (req, res) => {
    const db = await getDB();
    res.json(db.functions);
  });

  app.post("/api/functions/deploy", async (req, res) => {
    const db = await getDB();
    const { name, code } = req.body;
    const index = db.functions.findIndex((f: any) => f.name === name);
    if (index > -1) db.functions[index].code = code;
    else db.functions.push({ name, code });
    await saveDB(db);
    res.json({ success: true });
  });

  // Function Execution Engine
  app.post("/api/functions/call/:name", async (req, res) => {
    const dbData = await getDB();
    const func = dbData.functions.find((f: any) => f.name === req.params.name);
    
    if (!func) return res.status(404).json({ error: "Function not found" });

    try {
      // Security warning: In production use a worker or vm2
      const runner = new Function(`return ${func.code}`)();
      const result = await runner(dbData.collections, { uid: 'system' });
      res.json({ result, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Storage
  app.get("/api/storage", async (req, res) => {
    const db = await getDB();
    res.json(db.storage);
  });

  // Analytics Stats
  app.get("/api/analytics/stats", async (req, res) => {
    const db = await getDB();
    res.json(db.stats);
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`AuraDB Multi-Engine running on http://localhost:${PORT}`);
  });
}

startServer();
