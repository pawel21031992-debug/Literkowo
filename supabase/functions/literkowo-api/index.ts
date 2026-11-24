const ITERATIONS = 310_000;
const SESSION_SECONDS = 60 * 60 * 24 * 30;
const encoder = new TextEncoder();
const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });

function b64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromB64(value: string): Uint8Array {
  const raw = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}
function randomBytes(length = 32): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}
async function sha256(value: string): Promise<string> {
  return b64(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}
async function passwordHash(password: string, salt: Uint8Array, iterations = ITERATIONS): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  return b64(new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256)));
}
function normalizeNick(value: unknown): string {
  return String(value ?? "").normalize("NFKC").trim().toLowerCase();
}
function validNick(value: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(value);
}
function validPassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= 10 && value.length <= 128;
}
function corsHeaders(origin: string): HeadersInit {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
    "access-control-max-age": "86400",
    "vary": "Origin"
  };
}
function supabaseHeaders(env: Record<string, string>, extra: HeadersInit = {}): HeadersInit {
  return { apikey: env.SUPABASE_SERVICE_ROLE_KEY, authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY, "content-type": "application/json", ...extra };
}
async function db(env: Record<string, string>, path: string, init: RequestInit = {}): Promise<any> {
  const response = await fetch(env.SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1/" + path, {
    ...init, headers: supabaseHeaders(env, init.headers as HeadersInit)
  });
  const body = await response.text();
  if (!response.ok) throw new Error("DB " + response.status + ": " + body.slice(0, 500));
  return body ? JSON.parse(body) : null;
}
async function rateLimit(request: Request, env: Record<string, string>, bucket: string, limit: number): Promise<boolean> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = await sha256(ip + ":" + env.RATE_LIMIT_SECRET);
  const windowStart = Math.floor(Date.now() / 1000 / 900) * 900;
  const rows = await db(env, "rpc/literkowo_consume_rate_limit", {
    method: "POST",
    body: JSON.stringify({ p_bucket: bucket, p_ip_hash: ipHash, p_window_start: windowStart, p_limit: limit })
  });
  return rows === true;
}
async function getUser(request: Request, env: Record<string, string>): Promise<any | null> {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const tokenHash = await sha256(token);
  const sessions = await db(env, "literkowo_sessions?token_hash=eq." + encodeURIComponent(tokenHash) + "&expires_at=gt." + encodeURIComponent(new Date().toISOString()) + "&select=user_id");
  if (!sessions?.length) return null;
  const users = await db(env, "literkowo_users?id=eq." + encodeURIComponent(sessions[0].user_id) + "&select=id,username");
  return users?.[0] || null;
}
async function issueSession(env: Record<string, string>, userId: string): Promise<string> {
  const token = b64(randomBytes(32));
  await db(env, "literkowo_sessions", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ token_hash: await sha256(token), user_id: userId, expires_at: new Date(Date.now() + SESSION_SECONDS * 1000).toISOString() })
  });
  return token;
}
async function handle(request: Request, env: Record<string, string>): Promise<Response> {
  const origin = request.headers.get("origin") || "";
  const allowedOrigin = env.ALLOWED_ORIGIN || "https://pawel21031992-debug.github.io";
  if (origin !== allowedOrigin) return json({ error: "Niedozwolone źródło żądania." }, 403);
  const cors = corsHeaders(origin);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.RATE_LIMIT_SECRET || env.RATE_LIMIT_SECRET.length < 32) {
    return json({ error: "Backend nie został jeszcze skonfigurowany przez administratora." }, 503, cors);
  }
  const url = new URL(request.url);
  const marker = "/functions/v1/literkowo-api";
  const path = url.pathname.includes(marker) ? url.pathname.slice(url.pathname.indexOf(marker) + marker.length) || "/" : url.pathname;
  if (request.method === "GET" && path === "/health") return json({ ok: true, service: "Literkowo API" }, 200, cors);

  if (request.method === "POST" && path === "/register") {
    if (!await rateLimit(request, env, "register", 8)) return json({ error: "Zbyt wiele prób. Spróbuj ponownie za 15 minut." }, 429, cors);
    let body: any;
    try { body = await request.json(); } catch { return json({ error: "Nieprawidłowe dane." }, 400, cors); }
    const username = String(body.username || "").normalize("NFKC").trim();
    const usernameNorm = normalizeNick(username);
    if (!validNick(username)) return json({ error: "Nick musi mieć 3–20 znaków: litery A–Z, cyfry lub podkreślenie." }, 400, cors);
    if (!validPassword(body.password)) return json({ error: "Hasło musi mieć od 10 do 128 znaków." }, 400, cors);
    const salt = randomBytes(16);
    const hash = await passwordHash(body.password, salt);
    try {
      const userId = await db(env, "rpc/literkowo_create_account", {
        method: "POST",
        body: JSON.stringify({ p_username: username, p_username_norm: usernameNorm, p_salt: b64(salt), p_hash: hash, p_iterations: ITERATIONS })
      });
      const token = await issueSession(env, userId);
      return json({ token, user: { id: userId, username } }, 201, cors);
    } catch (error) {
      if (String(error).includes("23505") || String(error).toLowerCase().includes("duplicate key")) return json({ error: "Ten nick jest już zajęty. Wybierz inną nazwę." }, 409, cors);
      throw error;
    }
  }

  if (request.method === "POST" && path === "/login") {
    if (!await rateLimit(request, env, "login", 10)) return json({ error: "Zbyt wiele prób. Spróbuj ponownie za 15 minut." }, 429, cors);
    let body: any;
    try { body = await request.json(); } catch { return json({ error: "Nieprawidłowe dane." }, 400, cors); }
    if (!validPassword(body.password)) return json({ error: "Nieprawidłowy nick lub hasło." }, 401, cors);
    const usernameNorm = normalizeNick(body.username);
    const users = await db(env, "literkowo_users?username_norm=eq." + encodeURIComponent(usernameNorm) + "&select=id,username,password_salt,password_hash,password_iterations");
    const user = users?.[0];
    if (!user) return json({ error: "Nieprawidłowy nick lub hasło." }, 401, cors);
    const candidate = await passwordHash(body.password, fromB64(user.password_salt), user.password_iterations);
    if (candidate !== user.password_hash) return json({ error: "Nieprawidłowy nick lub hasło." }, 401, cors);
    return json({ token: await issueSession(env, user.id), user: { id: user.id, username: user.username } }, 200, cors);
  }

  const user = await getUser(request, env);
  if (!user) return json({ error: "Sesja wygasła. Zaloguj się ponownie." }, 401, cors);
  if (request.method === "GET" && path === "/me") return json({ user }, 200, cors);
  if (request.method === "GET" && path === "/progress") {
    const rows = await db(env, "literkowo_progress?user_id=eq." + encodeURIComponent(user.id) + "&select=data_json");
    return json({ progress: rows?.[0]?.data_json || { completed: [], words: [], stars: 0 } }, 200, cors);
  }
  if (request.method === "PUT" && path === "/progress") {
    let body: any;
    try { body = await request.json(); } catch { return json({ error: "Nieprawidłowe dane." }, 400, cors); }
    const completed = Array.isArray(body.completed) ? body.completed.filter((x: unknown) => typeof x === "string" && x.length <= 2).slice(0, 32) : [];
    const words = Array.isArray(body.words) ? body.words.filter((x: unknown) => typeof x === "string" && x.length <= 40).slice(0, 500) : [];
    const stars = Number.isFinite(body.stars) ? Math.max(0, Math.min(100000, Math.floor(body.stars))) : 0;
    await db(env, "literkowo_progress?on_conflict=user_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ user_id: user.id, data_json: { completed, words, stars }, updated_at: new Date().toISOString() })
    });
    return json({ ok: true }, 200, cors);
  }
  if (request.method === "POST" && path === "/logout") {
    const token = (request.headers.get("authorization") || "").slice(7);
    await db(env, "literkowo_sessions?token_hash=eq." + encodeURIComponent(await sha256(token)), { method: "DELETE", headers: { Prefer: "return=minimal" } });
    return json({ ok: true }, 200, cors);
  }
  if (request.method === "DELETE" && path === "/account") {
    await db(env, "literkowo_users?id=eq." + encodeURIComponent(user.id), { method: "DELETE", headers: { Prefer: "return=minimal" } });
    return json({ ok: true }, 200, cors);
  }
  return json({ error: "Nie znaleziono endpointu." }, 404, cors);
}

Deno.serve(async (request: Request) => {
  try {
    return await handle(request, Deno.env.toObject());
  } catch (error) {
    console.error("Literkowo API error:", error);
    const origin = request.headers.get("origin") || "";
    const allowed = origin === (Deno.env.get("ALLOWED_ORIGIN") || "https://pawel21031992-debug.github.io");
    return json({ error: "Wystąpił błąd serwera." }, 500, allowed ? corsHeaders(origin) : {});
  }
});
