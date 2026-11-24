const ITERATIONS = 310000;
const SESSION_SECONDS = 60 * 60 * 24 * 30;
const encoder = new TextEncoder();

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra } });
}
function b64(bytes) {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function randomBytes(n = 32) { const bytes = new Uint8Array(n); crypto.getRandomValues(bytes); return bytes; }
async function digest(value) { return b64(await crypto.subtle.digest("SHA-256", encoder.encode(value))); }
function decodeB64(value) {
  const raw = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}
async function passwordHash(password, salt, iterations = ITERATIONS) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  return b64(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256));
}
function normalizeNick(value) { return String(value || "").normalize("NFKC").trim().toLowerCase(); }
function validNick(value) { return /^[a-zA-Z0-9_]{3,20}$/.test(value); }
function validPassword(value) { return typeof value === "string" && value.length >= 10 && value.length <= 128; }
function cors(request, env) {
  const origin = request.headers.get("Origin") || "";
  if (origin !== env.ALLOWED_ORIGIN) return null;
  return { "access-control-allow-origin": origin, "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS", "access-control-allow-headers": "content-type, authorization", "vary": "Origin" };
}
async function rateLimit(request, env, bucket, limit) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const ipHash = await digest(ip + ":" + env.RATE_LIMIT_SECRET);
  const now = Math.floor(Date.now() / 1000), windowStart = Math.floor(now / 900) * 900;
  const row = await env.DB.prepare("SELECT attempts FROM rate_limits WHERE bucket=? AND ip_hash=? AND window_start=?").bind(bucket, ipHash, windowStart).first();
  if ((row?.attempts || 0) >= limit) return false;
  await env.DB.prepare("INSERT INTO rate_limits(bucket,ip_hash,window_start,attempts) VALUES(?,?,?,1) ON CONFLICT(bucket,ip_hash,window_start) DO UPDATE SET attempts=attempts+1").bind(bucket, ipHash, windowStart).run();
  return true;
}
async function auth(request, env) {
  const header = request.headers.get("Authorization") || "", token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const row = await env.DB.prepare("SELECT users.id,users.username FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_hash=? AND sessions.expires_at>?").bind(await digest(token), Math.floor(Date.now()/1000)).first();
  return row || null;
}
async function issueSession(env, userId) {
  const token = b64(randomBytes(32)), now = Math.floor(Date.now()/1000);
  await env.DB.prepare("INSERT INTO sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)").bind(await digest(token), userId, now + SESSION_SECONDS, now).run();
  return token;
}
async function handle(request, env) {
  const headers = cors(request, env);
  if (!headers) return json({ error: "Niedozwolone źródło żądania." }, 403);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  const path = new URL(request.url).pathname.replace(/\/+$/, "") || "/";
  if (request.method === "GET" && path === "/health") return json({ ok: true, service: "Literkowo API" }, 200, headers);

  if (request.method === "POST" && path === "/register") {
    if (!await rateLimit(request, env, "register", 8)) return json({ error: "Zbyt wiele prób. Spróbuj ponownie za 15 minut." }, 429, headers);
    let body; try { body = await request.json(); } catch { return json({ error: "Nieprawidłowe dane." }, 400, headers); }
    const username = String(body.username || "").normalize("NFKC").trim(), usernameNorm = normalizeNick(username), password = body.password;
    if (!validNick(username)) return json({ error: "Nick musi mieć 3–20 znaków: litery A–Z, cyfry lub podkreślenie." }, 400, headers);
    if (!validPassword(password)) return json({ error: "Hasło musi mieć od 10 do 128 znaków." }, 400, headers);
    const salt = randomBytes(16), hash = await passwordHash(password, salt), id = crypto.randomUUID(), now = Math.floor(Date.now()/1000);
    try {
      await env.DB.prepare("INSERT INTO users(id,username,username_norm,password_salt,password_hash,password_iterations,created_at) VALUES(?,?,?,?,?,?,?)").bind(id, username, usernameNorm, b64(salt), hash, ITERATIONS, now).run();
    } catch (error) {
      if (/UNIQUE|unique/i.test(String(error))) return json({ error: "Ten nick jest już zajęty. Wybierz inną nazwę." }, 409, headers);
      throw error;
    }
    await env.DB.prepare("INSERT INTO progress(user_id,data_json,updated_at) VALUES(?,?,?)").bind(id, JSON.stringify({completed:[],words:[],stars:0}), now).run();
    return json({ token: await issueSession(env,id), user: {id,username} }, 201, headers);
  }

  if (request.method === "POST" && path === "/login") {
    if (!await rateLimit(request, env, "login", 10)) return json({ error: "Zbyt wiele prób. Spróbuj ponownie za 15 minut." }, 429, headers);
    let body; try { body = await request.json(); } catch { return json({ error: "Nieprawidłowe dane." }, 400, headers); }
    const user = await env.DB.prepare("SELECT id,username,password_salt,password_hash,password_iterations FROM users WHERE username_norm=?").bind(normalizeNick(body.username)).first();
    if (!user || typeof body.password !== "string") return json({error:"Nieprawidłowy nick lub hasło."},401,headers);
    const candidate = await passwordHash(body.password, decodeB64(user.password_salt), user.password_iterations);
    if (candidate !== user.password_hash) return json({error:"Nieprawidłowy nick lub hasło."},401,headers);
    return json({token:await issueSession(env,user.id),user:{id:user.id,username:user.username}},200,headers);
  }

  const user = await auth(request, env);
  if (!user) return json({error:"Sesja wygasła. Zaloguj się ponownie."},401,headers);
  if (request.method === "GET" && path === "/me") return json({user},200,headers);
  if (request.method === "GET" && path === "/progress") {
    const row = await env.DB.prepare("SELECT data_json FROM progress WHERE user_id=?").bind(user.id).first();
    let progress = {completed:[],words:[],stars:0}; try { if(row?.data_json) progress=JSON.parse(row.data_json); } catch {}
    return json({progress},200,headers);
  }
  if (request.method === "PUT" && path === "/progress") {
    let body; try { body=await request.json(); } catch { return json({error:"Nieprawidłowe dane."},400,headers); }
    const completed=Array.isArray(body.completed)?body.completed.filter(x=>typeof x==="string"&&x.length<=2).slice(0,32):[];
    const words=Array.isArray(body.words)?body.words.filter(x=>typeof x==="string"&&x.length<=40).slice(0,500):[];
    const stars=Number.isFinite(body.stars)?Math.max(0,Math.min(100000,Math.floor(body.stars))):0, now=Math.floor(Date.now()/1000);
    await env.DB.prepare("INSERT INTO progress(user_id,data_json,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET data_json=excluded.data_json,updated_at=excluded.updated_at").bind(user.id,JSON.stringify({completed,words,stars}),now).run();
    return json({ok:true},200,headers);
  }
  if (request.method === "POST" && path === "/logout") {
    const token=(request.headers.get("Authorization")||"").slice(7);
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await digest(token)).run();
    return json({ok:true},200,headers);
  }
  if (request.method === "DELETE" && path === "/account") {
    await env.DB.prepare("DELETE FROM users WHERE id=?").bind(user.id).run();
    return json({ok:true},200,headers);
  }
  return json({error:"Nie znaleziono endpointu."},404,headers);
}
export default { async fetch(request,env) {
  try { return await handle(request,env); }
  catch(error) { console.error("Literkowo API error",error); return json({error:"Wystąpił błąd serwera."},500,cors(request,env)||{}); }
}};
