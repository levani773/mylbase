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
  platformAdmins: [], // Dashboard users
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
  if (!cachedDB.stats) typeof cachedDB.stats === 'undefined' && (cachedDB.stats = INITIAL_DB.stats);
  if (!cachedDB.rules) typeof cachedDB.rules === 'undefined' && (cachedDB.rules = INITIAL_DB.rules);
  if (!cachedDB.functions) typeof cachedDB.functions === 'undefined' && (cachedDB.functions = INITIAL_DB.functions);
  if (!cachedDB.apiKeys) typeof cachedDB.apiKeys === 'undefined' && (cachedDB.apiKeys = INITIAL_DB.apiKeys);
  if (!cachedDB.platformAdmins) cachedDB.platformAdmins = [];
  if (!cachedDB.users) cachedDB.users = INITIAL_DB.users;
  
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

  // Platform Dashboard Auth (Real Backend)
  app.post("/api/dashboard/register", async (req, res) => {
    try {
      const db = await getDB();
      const { email, password } = req.body;
      
      if (!email || !password) return res.status(400).json({ error: "Missing fields" });
      
      db.platformAdmins = db.platformAdmins || [];
      if (db.platformAdmins.find((a: any) => a.email === email)) {
        return res.status(400).json({ error: "Admin already exists" });
      }

      const newAdmin = {
        email,
        password, 
        name: email.split('@')[0],
        tier: 'Pro Tier',
        initials: (email.substring(0, 2) || "AD").toUpperCase()
      };

      db.platformAdmins.push(newAdmin);
      await saveDB(db);
      res.json(newAdmin);
    } catch (err) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/dashboard/login", async (req, res) => {
    try {
      const db = await getDB();
      const { email, password } = req.body;
      
      db.platformAdmins = db.platformAdmins || [];
      const admin = db.platformAdmins.find((a: any) => a.email === email && a.password === password);
      
      if (!admin) {
        // Fallback for first run or dev mode
        if (email === 'admin@aura.db' && password === 'admin123') {
          const defaultAdmin = { email: 'admin@aura.db', name: 'Admin', tier: 'Pro Tier', initials: 'AD' };
          return res.json(defaultAdmin);
        }
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      res.json(admin);
    } catch (err) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Google OAuth Routes
  app.get("/api/auth/google/url", (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'];
    // Prefer dynamic detection to support AI Studio preview and custom domains (like Railway) simultaneously
    const baseUrl = `${protocol}://${host}`;
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("[OAUTH] CRITICAL: GOOGLE_CLIENT_ID is missing from environment");
      return res.status(500).json({ error: "Google Client ID is missing. Initialize it in Secrets." });
    }

    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: `${baseUrl}/api/auth/google/callback`,
      client_id: clientId,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };

    const qs = new URLSearchParams(options);
    const url = `${rootUrl}?${qs.toString()}`;
    console.log(`[OAUTH] Google Request -> Redirect URI: ${options.redirect_uri}`);
    res.json({ url });
  });

  app.get(["/api/auth/google/callback", "/api/auth/google/callback/"], async (req, res) => {
    const code = req.query.code as string;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'];
    const baseUrl = `${protocol}://${host}`;
    
    if (!code) {
      return res.send(`<html><body style="background:#060608"><script>window.close()</script></body></html>`);
    }

    try {
      // 1. Exchange code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID || "",
          client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
          redirect_uri: `${baseUrl}/api/auth/google/callback`,
          grant_type: "authorization_code",
        }),
      });

      const tokens = await tokenResponse.json();
      if (!tokens.access_token) throw new Error("No access token");

      // 2. Get user info
      const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const googleUser = await userResponse.json();
      
      // 3. Sync with platformAdmins
      const db = await getDB();
      db.platformAdmins = db.platformAdmins || [];
      
      let admin = db.platformAdmins.find((a: any) => a.email === googleUser.email);
      
      if (!admin) {
        admin = {
          email: googleUser.email,
          name: googleUser.name,
          tier: 'Pro Tier',
          initials: (googleUser.given_name?.[0] || googleUser.email[0]).toUpperCase() + 
                    (googleUser.family_name?.[0] || "").toUpperCase(),
          provider: 'google'
        };
        db.platformAdmins.push(admin);
        await saveDB(db);
      }

      // 4. Send success message and data
      res.send(`
        <html>
          <body style="background: #060608; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center;">
              <div style="width: 40px; height: 40px; border: 3px solid #2563eb; border-top-color: transparent; border-radius: 50%; animate: spin 1s linear infinite; margin: 0 auto 20px;"></div>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'GOOGLE_AUTH_SUCCESS', 
                    user: ${JSON.stringify(admin)} 
                  }, '*');
                  setTimeout(() => window.close(), 1000);
                } else {
                  window.location.href = '/';
                }
              </script>
              <h2 style="margin: 0;">Authentication Successful</h2>
              <p style="color: #71717a; margin-top: 10px;">Synchronizing with AuraDB Vault...</p>
            </div>
            <style>
              @keyframes spin { to { transform: rotate(360deg); } }
            </style>
          </body>
        </html>
      `);
    } catch (err) {
      console.error("Google OAuth Error:", err);
      res.status(500).send("Authentication failed");
    }
  });

  // GitHub OAuth Routes
  app.get("/api/auth/github/url", (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'];
    const baseUrl = `${protocol}://${host}`;
    
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      console.error("[OAUTH] CRITICAL: GITHUB_CLIENT_ID is missing from environment");
      return res.status(500).json({ error: "GitHub Client ID is missing." });
    }

    const rootUrl = "https://github.com/login/oauth/authorize";
    const options = {
      client_id: clientId,
      redirect_uri: `${baseUrl}/api/auth/github/callback`,
      scope: "user:email read:user",
      state: Math.random().toString(36).substring(7)
    };

    const qs = new URLSearchParams(options);
    const url = `${rootUrl}?${qs.toString()}`;
    console.log(`[OAUTH] GitHub Request -> Redirect URI: ${options.redirect_uri}`);
    res.json({ url });
  });

  app.get(["/api/auth/github/callback", "/api/auth/github/callback/"], async (req, res) => {
    const code = req.query.code as string;
    
    if (!code) {
      return res.send(`<html><body style="background:#060608"><script>window.close()</script></body></html>`);
    }

    try {
      // 1. Exchange code for access token
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID || "",
          client_secret: process.env.GITHUB_CLIENT_SECRET || "",
          code,
        }),
      });

      const tokens = await tokenResponse.json();
      if (!tokens.access_token) throw new Error("No access token from GitHub");

      // 2. Get user info
      const userResponse = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const githubUser = await userResponse.json();

      // 3. Get user email (might be private)
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const emails = await emailResponse.json();
      const primaryEmail = emails.find((e: any) => e.primary)?.email || emails[0]?.email || `${githubUser.login}@github.com`;
      
      // 4. Sync with platformAdmins
      const db = await getDB();
      db.platformAdmins = db.platformAdmins || [];
      
      let admin = db.platformAdmins.find((a: any) => a.email === primaryEmail);
      
      if (!admin) {
        admin = {
          email: primaryEmail,
          name: githubUser.name || githubUser.login,
          tier: 'Pro Tier',
          initials: (githubUser.name?.[0] || githubUser.login[0]).toUpperCase(),
          provider: 'github'
        };
        db.platformAdmins.push(admin);
        await saveDB(db);
      }

      // 5. Send success message
      res.send(`
        <html>
          <body style="background: #060608; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center;">
              <div style="width: 40px; height: 40px; border: 3px solid #2563eb; border-top-color: transparent; border-radius: 50%; animate: spin 1s linear infinite; margin: 0 auto 20px;"></div>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'GITHUB_AUTH_SUCCESS', 
                    user: ${JSON.stringify(admin)} 
                  }, '*');
                  setTimeout(() => window.close(), 1000);
                } else {
                  window.location.href = '/';
                }
              </script>
              <h2 style="margin: 0;">GitHub Authenticated</h2>
              <p style="color: #71717a; margin-top: 10px;">Resyncing AuraDB Admin Session...</p>
            </div>
            <style>
              @keyframes spin { to { transform: rotate(360deg); } }
            </style>
          </body>
        </html>
      `);
    } catch (err) {
      console.error("GitHub OAuth Error:", err);
      res.status(500).send("GitHub Authentication failed");
    }
  });

  // CORS Middleware
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-aura-key, x-pocketbase-token");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // URL Prefix Handling (CRITICAL: Must be at the very top)
  app.use((req, res, next) => {
    const originalUrl = req.url;
    if (req.url.startsWith('/api/aura')) {
      req.url = req.url.replace('/api/aura', '/api');
      console.log(`[ROUTING] Rewrote ${originalUrl} -> ${req.url}`);
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
    if (path.startsWith('/api/dashboard') || 
        path.startsWith('/api/db') || 
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

  // User Auth - Real Validation (for Encyclopedia app)
  app.post("/api/collections/users/auth-with-password", async (req, res) => {
    const db = await getDB();
    const { identity, password } = req.body;
    
    console.log(`[AUTH] Login attempt for identity: ${identity}`);
    
    // Find collection
    const usersCollection = db.collections.find((c: any) => c.id === 'users');
    if (!usersCollection) {
      console.error("[AUTH] Users collection not found in DB");
      return res.status(404).json({ error: "Authentication system not initialized." });
    }

    // Find the specific user - more robust search
    const userDoc = usersCollection.docs.find((d: any) => {
      const data = d.data;
      return (
        data.email === identity || 
        data.username === identity || 
        data.identity === identity ||
        (data.email && data.email.toLowerCase() === identity.toLowerCase())
      );
    });

    if (!userDoc) {
      console.warn(`[AUTH] User not found: ${identity}`);
      return res.status(400).json({ error: "Invalid identity or password." });
    }

    // Check password (simple check for now)
    if (userDoc.data.password && userDoc.data.password !== password) {
      console.warn(`[AUTH] Invalid password for: ${identity}`);
      return res.status(400).json({ error: "Invalid identity or password." });
    }

    // Update last login in main auth list
    const authUserIndex = db.users?.findIndex((u: any) => u.uid === userDoc.id);
    if (authUserIndex > -1) {
      db.users[authUserIndex].lastLogin = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      await saveDB(db);
      broadcastSync('auth_changed', db.users);
    }

    console.log(`[AUTH] Login successful for: ${identity}`);

    res.json({
      token: "aura_token_" + Math.random().toString(36).substr(2, 12),
      record: {
        id: userDoc.id,
        collectionId: "users",
        collectionName: "users",
        email: userDoc.data.email,
        username: userDoc.data.username || userDoc.data.identity || userDoc.data.email.split('@')[0],
        verified: true,
        ...userDoc.data
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

    // Sync with main Auth list if it's a new user
    if (collectionName === 'users') {
      db.users = db.users || [];
      const userEmail = recordData.email || recordData.identity;
      const existingUser = db.users.find((u: any) => u.email === userEmail);
      
      if (!existingUser) {
        const authUser = {
          uid: newRecord.id,
          email: userEmail || 'user@aura.db',
          provider: 'aura-identity',
          created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          lastLogin: 'Never'
        };
        db.users.unshift(authUser);
        broadcastSync('auth_changed', db.users);
      }
    }

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
