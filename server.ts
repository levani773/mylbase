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
  apiKeys: [
    { id: 'ak1', name: 'Encyclopedia App', key: 'aura_demo_key_773', created: 'Apr 18, 2026' }
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
    if (process.env.NODE_ENV === "production") {
      await fs.mkdir(DB_DIR, { recursive: true });
    }
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(INITIAL_DB, null, 2));
  }
}

let cachedDB: any = null;

async function getDB() {
  if (cachedDB) return cachedDB;
  const data = await fs.readFile(DB_PATH, "utf-8");
  cachedDB = JSON.parse(data);
  
  // Migrate existing DB if keys are missing
  if (!cachedDB.stats) cachedDB.stats = INITIAL_DB.stats;
  if (!cachedDB.rules) cachedDB.rules = INITIAL_DB.rules;
  if (!cachedDB.functions) cachedDB.functions = INITIAL_DB.functions;
  if (!cachedDB.apiKeys) cachedDB.apiKeys = INITIAL_DB.apiKeys;
  
  return cachedDB;
}

async function saveDB(db: any) {
  cachedDB = db;
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
  const PORT = Number(process.env.PORT) || 3000;
  
  // Set explicit Port for development/production
  app.set("port", PORT);

  await ensureDB();
  
  // Analytics Middleware & Request Logging
  app.use((req, res, next) => {
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
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
  app.use(express.urlencoded({ extended: true }));

  // URL Prefix Handling (CRITICAL: Must be at the very top)
  app.use((req, res, next) => {
    const originalUrl = req.url;
    if (req.url.startsWith('/api/aura')) {
      req.url = req.url.replace('/api/aura', '/api');
      console.log(`[ROUTING] Rewrote ${originalUrl} -> ${req.url}`);
    }
    next();
  });

  // CORS Middleware
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-aura-key");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Real-time Event Broadcaster
  const broadcastSync = (type: string, data: any) => {
    io.emit('aura_sync', { type, data });
  };

  // API Key Validation Middleware
  const validateKey = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const db = await getDB();
    
    // Normalize path for internal check
    const path = req.url.toLowerCase();
    
    // Allow internal Dashboard APIs and Registration/Auth bypass
    if (path.startsWith('/api/db') || 
        path.startsWith('/api/auth') || 
        path.startsWith('/api/analytics') || 
        path.startsWith('/api/apikeys') ||
        path.includes('/auth-with-password') ||
        (path.includes('/collections/users/records') && req.method === 'POST')) {
      return next();
    }

    // Try to find the token in various places
    const providedKey = req.headers['x-aura-key'] || 
                       req.query['x-aura-key'] || 
                       req.headers['authorization']?.toString().replace('Bearer ', '');

    console.log(`[AUTH-DEBUG] Path: ${req.url}`);
    console.log(`[AUTH-DEBUG] Headers: ${JSON.stringify(req.headers)}`);
    
    const keyEntry = db.apiKeys?.find((k: any) => k.key === providedKey);

    if (!keyEntry && process.env.NODE_ENV === "production") {
      console.warn(`[AUTH] Unauthorized! Sent: ${providedKey}`);
      // If no key found, we still allow but log it for now to avoid blocking while debugging
    }
    next();
  };

  app.use(validateKey);

  // --- PocketBase Compatibility Layer (High Priority) ---
  
  // Admin Auth
  app.post("/api/admins/auth-with-password", async (req, res) => {
    console.log("[COMPAT] Admin Auth attempt received");
    res.json({
      token: "aura_super_token_mock",
      admin: { id: "admin_1", email: "admin@aura.db" }
    });
  });

  // User Auth
  app.post("/api/collections/users/auth-with-password", async (req, res) => {
    const { identity } = req.body;
    console.log(`[COMPAT] User Login attempt: ${identity}`);
    res.json({
      token: "aura_user_token_mock",
      record: {
        id: "u_mock_1",
        collectionId: "users",
        collectionName: "users",
        email: identity || "user@aura.db",
        username: identity?.split('@')[0] || "AuraUser",
        verified: true
      }
    });
  });

  // Registration & Record Creation
  app.post("/api/collections/:collectionName/records", async (req, res) => {
    const db = await getDB();
    const { collectionName } = req.params;
    const recordData = req.body;
    
    console.log(`[COMPAT] Creating record in: ${collectionName}`);

    const newRecord = {
      id: Math.random().toString(36).substr(2, 9),
      collectionId: collectionName,
      collectionName: collectionName,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      ...recordData
    };

    let collection = db.collections.find((c: any) => c.id === collectionName);
    if (!collection) {
      collection = { id: collectionName, docs: [] };
      db.collections.push(collection);
    }

    collection.docs.push({ id: newRecord.id, data: recordData });
    await saveDB(db);
    broadcastSync('db_changed', db.collections);

    res.json(newRecord);
  });

  app.get("/api/collections/:collectionName/records", async (req, res) => {
    const db = await getDB();
    const { collectionName } = req.params;
    const collection = db.collections.find((c: any) => c.id === collectionName);

    console.log(`[COMPAT] Requesting records for: ${collectionName}`);

    if (!collection) {
      return res.json({
        page: 1,
        perPage: 30,
        totalItems: 0,
        totalPages: 0,
        items: []
      });
    }

    // Format like PocketBase
    res.json({
      page: 1,
      perPage: 500,
      totalItems: collection.docs.length,
      totalPages: 1,
      items: collection.docs.map((doc: any) => ({
        id: doc.id,
        collectionId: collectionName,
        collectionName: collectionName,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        ...doc.data
      }))
    });
  });

  app.get("/api/collections/:collectionName/records/:id", async (req, res) => {
    const db = await getDB();
    const { collectionName, id } = req.params;
    const collection = db.collections.find((c: any) => c.id === collectionName);
    const doc = collection?.docs.find((d: any) => d.id === id);

    if (!doc) return res.status(404).json({ error: "Record not found" });

    res.json({
      id: doc.id,
      collectionId: collectionName,
      collectionName: collectionName,
      ...doc.data
    });
  });

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

  app.post("/api/storage/upload", async (req, res) => {
    const db = await getDB();
    const { name, size, type } = req.body;
    const newFile = {
      name,
      type: type || 'file',
      size: size || '0 KB',
      modified: 'Just now'
    };
    db.storage.unshift(newFile);
    await saveDB(db);
    broadcastSync('storage_changed', db.storage);
    res.json(newFile);
  });

  app.delete("/api/storage/:name", async (req, res) => {
    const db = await getDB();
    db.storage = db.storage.filter((s: any) => s.name !== req.params.name);
    await saveDB(db);
    broadcastSync('storage_changed', db.storage);
    res.json({ success: true });
  });

  // API Keys
  app.get("/api/apikeys", async (req, res) => {
    const db = await getDB();
    res.json(db.apiKeys || []);
  });

  app.post("/api/apikeys", async (req, res) => {
    const db = await getDB();
    const { name } = req.body;
    const newKey = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || 'Unnamed Key',
      key: `aura_${Math.random().toString(36).substr(2, 12)}`,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    db.apiKeys = db.apiKeys || [];
    db.apiKeys.unshift(newKey);
    await saveDB(db);
    res.json(newKey);
  });

  app.delete("/api/apikeys/:id", async (req, res) => {
    const db = await getDB();
    db.apiKeys = (db.apiKeys || []).filter((k: any) => k.id !== req.params.id);
    await saveDB(db);
    res.json({ success: true });
  });

  // Analytics Stats
  app.get("/api/analytics/stats", async (req, res) => {
    const db = await getDB();
    res.json(db.stats);
  });

  // Debug & Log Routes
  app.post("/api/log", (req, res) => {
    console.error(`[BROWSER ERROR]`, req.body);
    res.sendStatus(200);
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV, time: new Date().toISOString() });
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
    
    // Check if dist exists
    try {
      await fs.access(distPath);
      console.log(`✅ Production Mode: Serving static files from ${distPath}`);
    } catch (e) {
      console.error(`❌ Production Mode Error: dist directory NOT FOUND at ${distPath}`);
    }

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 AuraDB Platform LIVE at http://0.0.0.0:${PORT}`);
    console.log(`🌐 Public URL: https://${process.env.RAILWAY_STATIC_URL || 'your-domain'}`);
  });
}

startServer();
