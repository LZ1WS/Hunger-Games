const http = require("http");
const fs = require("fs");
const path = require("path");
const engine = require("./engine");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const STATE_FILE = path.join(DATA_DIR, "game.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
let state = engine.loadState(STATE_FILE);

const STREAM_LOGS = process.env.STREAM_LOGS !== "0";
const USE_COLOR = !!process.stdout.isTTY;
const RESET = USE_COLOR ? "\x1b[0m" : "";
const CAT_COLORS = {
  death: "\x1b[31m",
  win: "\x1b[33m",
  start: "\x1b[36m",
  fight: "\x1b[91m",
  gather: "\x1b[32m",
  build: "\x1b[33m",
  social: "\x1b[35m",
  rest: "\x1b[36m",
  night: "\x1b[34m",
  survive: "\x1b[90m",
  loot: "\x1b[32m",
  scout: "\x1b[34m",
  theft: "\x1b[36m",
  alliance: "\x1b[33m",
  global: "\x1b[35m",
  boss: "\x1b[91m",
  weather: "\x1b[34m",
  script: "\x1b[90m"
};
let logCursor = state.log ? state.log.length : 0;

function flushLog() {
  if (!STREAM_LOGS || !state || !Array.isArray(state.log)) return;
  if (state.log.length < logCursor) logCursor = 0;
  while (logCursor < state.log.length) {
    const e = state.log[logCursor++];
    if (!e || !e.text) continue;
    const tag = e.cat || "log";
    const color = USE_COLOR ? (CAT_COLORS[tag] || "\x1b[90m") : "";
    const day = String(e.day == null ? "" : e.day).padStart(2, " ");
    const changes = e.changes ? "  (" + String(e.changes).slice(0, 100) + (String(e.changes).length > 100 ? "\u2026" : "") + ")" : "";
    console.log(color + "[" + day + " " + tag + "]" + RESET + " " + e.text + changes);
  }
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

function save() {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function safeDecode(s) {
  try {
    return decodeURIComponent(s);
  } catch (e) {
    return s;
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    let tooBig = false;
    req.on("data", (c) => {
      if (tooBig) return;
      data += c;
      if (data.length > 1e6) {
        tooBig = true;
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      if (tooBig) return;
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function serveStatic(res, filePath) {
  const full = path.normalize(filePath);
  if (!full.startsWith(PUBLIC_DIR + path.sep) && full !== PUBLIC_DIR) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.readFile(full, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }
    const ext = path.extname(full).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    res.end(data);
  });
}

function mutate(req, res, fn) {
  try {
    fn();
    flushLog();
    save();
    sendJSON(res, 200, state);
  } catch (e) {
    sendJSON(res, 500, { error: String(e && e.message ? e.message : e) });
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const p = url.pathname;

  try {
    if (p === "/api/state" && req.method === "GET") {
      return sendJSON(res, 200, state);
    }

    if (p === "/api/catalog" && req.method === "GET") {
      return sendJSON(res, 200, {
        items: engine.getItems(),
        personalities: engine.getPersonalities(),
        biomes: Object.keys(engine.BIOMES),
        genders: ["female", "male", "non-binary", "unspecified"],
        proficiencies: ["melee", "ranged", "explosive", "tool", "medical"]
      });
    }

    if (p === "/api/map" && req.method === "POST") {
      return readBody(req).then((b) => {
        engine.updateMap(state, b);
        save();
        sendJSON(res, 200, state);
      }).catch((e) => sendJSON(res, 400, { error: e.message }));
    }

    if (p === "/api/content" && req.method === "GET") {
      return sendJSON(res, 200, {
        items: engine.getItems(),
        events: engine.getEvents(),
        globalEvents: engine.getGlobalEvents(),
        personalities: engine.getPersonalities(),
        abilities: engine.getAbilities(),
        languages: engine.getLanguages()
      });
    }

    if (p === "/api/content/reload" && req.method === "POST") {
      engine.loadContent();
      return sendJSON(res, 200, {
        items: engine.getItems(),
        events: engine.getEvents(),
        globalEvents: engine.getGlobalEvents(),
        personalities: engine.getPersonalities(),
        abilities: engine.getAbilities(),
        languages: engine.getLanguages()
      });
    }

    if (p === "/api/items" && req.method === "POST") {
      return readBody(req).then((b) => {
        const item = engine.addItem(b);
        engine.saveContent();
        save();
        sendJSON(res, 200, item);
      }).catch((e) => sendJSON(res, 400, { error: e.message }));
    }

    const im = p.match(/^\/api\/items\/([\w-]+)$/);
    if (im) {
      if (req.method === "PUT") {
        return readBody(req).then((b) => {
          const item = engine.updateItem(im[1], b);
          engine.saveContent();
          save();
          sendJSON(res, 200, item || { error: "not found" });
        }).catch((e) => sendJSON(res, 400, { error: e.message }));
      }
      if (req.method === "DELETE") {
        engine.removeItem(im[1]);
        engine.saveContent();
        save();
        return sendJSON(res, 200, { ok: true });
      }
    }

    if (p === "/api/events" && req.method === "POST") {
      return readBody(req).then((b) => {
        const evt = engine.addEvent(b);
        engine.saveContent();
        save();
        sendJSON(res, 200, evt);
      }).catch((e) => sendJSON(res, 400, { error: e.message }));
    }

    const em = p.match(/^\/api\/events\/([\w-]+)$/);
    if (em) {
      if (req.method === "PUT") {
        return readBody(req).then((b) => {
          const evt = engine.updateEvent(em[1], b);
          engine.saveContent();
          save();
          sendJSON(res, 200, evt || { error: "not found" });
        }).catch((e) => sendJSON(res, 400, { error: e.message }));
      }
      if (req.method === "DELETE") {
        engine.removeEvent(em[1]);
        engine.saveContent();
        save();
        return sendJSON(res, 200, { ok: true });
      }
    }

    if (p === "/api/globals" && req.method === "POST") {
      return readBody(req).then((b) => {
        const g = engine.addGlobalEvent(b);
        engine.saveContent();
        save();
        sendJSON(res, 200, g);
      }).catch((e) => sendJSON(res, 400, { error: e.message }));
    }

    const gm = p.match(/^\/api\/globals\/([\w-]+)$/);
    if (gm) {
      if (req.method === "PUT") {
        return readBody(req).then((b) => {
          const g = engine.updateGlobalEvent(gm[1], b);
          engine.saveContent();
          save();
          sendJSON(res, 200, g || { error: "not found" });
        }).catch((e) => sendJSON(res, 400, { error: e.message }));
      }
      if (req.method === "DELETE") {
        engine.removeGlobalEvent(gm[1]);
        engine.saveContent();
        save();
        return sendJSON(res, 200, { ok: true });
      }
    }

    if (p === "/api/packs" && req.method === "GET") {
      return sendJSON(res, 200, { packs: engine.getPacks() });
    }

    if (p === "/api/packs" && req.method === "POST") {
      return readBody(req).then((b) => {
        const name = String(b.name || "").trim();
        if (!name) return sendJSON(res, 400, { error: "Pack name required" });
        engine.savePack(state, name);
        sendJSON(res, 200, { packs: engine.getPacks() });
      }).catch((e) => sendJSON(res, 400, { error: e.message }));
    }

    const plm = p.match(/^\/api\/packs\/([^/]+)\/load$/);
    if (plm && req.method === "POST") {
      const name = safeDecode(plm[1]);
      engine.loadPack(state, name);
      flushLog();
      save();
      return sendJSON(res, 200, state);
    }

    const pm = p.match(/^\/api\/packs\/([^/]+)$/);
    if (pm && req.method === "DELETE") {
      const name = safeDecode(pm[1]);
      engine.removePack(name);
      return sendJSON(res, 200, { packs: engine.getPacks() });
    }

    if (p === "/api/contentpacks" && req.method === "GET") {
      return sendJSON(res, 200, { packs: engine.getContentPacks() });
    }

    if (p === "/api/contentpacks" && req.method === "POST") {
      return readBody(req).then((b) => {
        const name = String(b.name || "").trim();
        if (!name) return sendJSON(res, 400, { error: "Pack name required" });
        engine.saveContentPack(state, name);
        return sendJSON(res, 200, { packs: engine.getContentPacks() });
      }).catch((e) => sendJSON(res, 400, { error: e.message }));
    }

    const cplm = p.match(/^\/api\/contentpacks\/([^/]+)\/load$/);
    if (cplm && req.method === "POST") {
      const name = safeDecode(cplm[1]);
      engine.loadContentPack(state, name);
      return sendJSON(res, 200, { packs: engine.getContentPacks() });
    }

    const cpm = p.match(/^\/api\/contentpacks\/([^/]+)$/);
    if (cpm && req.method === "DELETE") {
      const name = safeDecode(cpm[1]);
      engine.removeContentPack(name);
      return sendJSON(res, 200, { packs: engine.getContentPacks() });
    }

    if (p === "/api/content/enabled" && req.method === "POST") {
      return readBody(req).then((b) => {
        if (!engine.setContentEnabled(b.type, b.id, b.enabled)) return sendJSON(res, 400, { error: "Bad content type/id" });
        return sendJSON(res, 200, {
          items: engine.getItems(),
          events: engine.getEvents(),
          globalEvents: engine.getGlobalEvents(),
          personalities: engine.getPersonalities(),
          abilities: engine.getAbilities(),
          languages: engine.getLanguages()
        });
      }).catch((e) => sendJSON(res, 400, { error: e.message }));
    }

    if (p === "/api/personalities" && req.method === "POST") {
      return readBody(req).then((b) => {
        const ps = engine.addPersonality(b);
        sendJSON(res, 200, ps);
      }).catch((e) => sendJSON(res, 400, { error: e.message }));
    }

    const psm = p.match(/^\/api\/personalities\/([\w-]+)$/);
    if (psm) {
      if (req.method === "PUT") {
        return readBody(req).then((b) => {
          const ps = engine.updatePersonality(psm[1], b);
          sendJSON(res, 200, ps || { error: "not found" });
        }).catch((e) => sendJSON(res, 400, { error: e.message }));
      }
      if (req.method === "DELETE") {
        const ok = engine.removePersonality(psm[1]);
        return sendJSON(res, ok ? 200 : 400, { ok, error: ok ? undefined : "Default personalities cannot be removed" });
      }
    }

    if (p === "/api/abilities" && req.method === "POST") {
      return readBody(req).then((b) => {
        const a = engine.addAbility(b);
        sendJSON(res, 200, a);
      }).catch((e) => sendJSON(res, 400, { error: e.message }));
    }

    const am = p.match(/^\/api\/abilities\/([\w-]+)$/);
    if (am) {
      if (req.method === "PUT") {
        return readBody(req).then((b) => {
          const a = engine.updateAbility(am[1], b);
          sendJSON(res, 200, a || { error: "not found" });
        }).catch((e) => sendJSON(res, 400, { error: e.message }));
      }
      if (req.method === "DELETE") {
        const ok = engine.removeAbility(am[1]);
        return sendJSON(res, ok ? 200 : 400, { ok });
      }
    }

    const lm = p.match(/^\/api\/locale\/([\w-]+)$/);
    if (lm) {
      if (req.method === "GET") {
        const loc = engine.getLocale(lm[1]);
        return loc ? sendJSON(res, 200, loc) : sendJSON(res, 404, { error: "Locale not found" });
      }
      if (req.method === "POST") {
        return readBody(req).then((b) => {
          const ok = engine.saveLocale(lm[1], b);
          return ok ? sendJSON(res, 200, { ok: true }) : sendJSON(res, 400, { error: "Invalid locale" });
        }).catch((e) => sendJSON(res, 400, { error: e.message }));
      }
    }

    if (p === "/api/settings" && req.method === "POST") {
      return readBody(req).then((b) => {
        engine.updateSettings(state, b);
        save();
        sendJSON(res, 200, state);
      }).catch((e) => sendJSON(res, 400, { error: e.message }));
    }

    const dev = p === "/api/dev/global" || p === "/api/dev/event" || p === "/api/dev/weather" || p === "/api/dev/item";
    if (dev && req.method === "POST") {
      if (!state.settings.devMode) return sendJSON(res, 403, { error: "Dev mode is off" });
      return readBody(req).then((b) => {
        if (p === "/api/dev/global") {
          if (!engine.triggerGlobalEvent(state, b.id)) return sendJSON(res, 400, { error: "Global event not found" });
        } else if (p === "/api/dev/event") {
          if (!engine.triggerEvent(state, b.cat, b.tributeId || null)) return sendJSON(res, 400, { error: "No matching event or tribute" });
        } else if (p === "/api/dev/weather") {
          engine.forceWeather(state);
        } else if (p === "/api/dev/item") {
          if (!engine.devGrantItem(state, b.tributeId, b.itemId, !!b.remove)) return sendJSON(res, 400, { error: "Bad tribute/item" });
        }
        save();
        sendJSON(res, 200, state);
      }).catch((e) => sendJSON(res, 400, { error: e.message }));
    }

    if (p === "/api/tributes" && req.method === "POST") {
      return readBody(req).then((b) => {
        if (state.phase !== "setup") return sendJSON(res, 400, { error: "Tributes can only be added during setup" });
        const name = String(b.name || "Tribute").trim() || "Tribute";
        const t = engine.addTribute(state, name);
        engine.updateTribute(state, t.id, {
          emoji: b.emoji,
          img: b.img,
          gender: b.gender,
          personality: b.personality,
          alliance: b.alliance,
          ability: b.ability,
          attributes: b.attributes,
          proficiencies: b.proficiencies,
          items: b.items
        });
        save();
        sendJSON(res, 200, state);
      }).catch((e) => sendJSON(res, 400, { error: e.message }));
    }

    const m = p.match(/^\/api\/tributes\/([\w-]+)$/);
    if (m) {
      const id = m[1];
      if (req.method === "PUT") {
        return readBody(req).then((b) => {
          engine.updateTribute(state, id, b);
          save();
          sendJSON(res, 200, state);
        }).catch((e) => sendJSON(res, 400, { error: e.message }));
      }
      if (req.method === "DELETE") {
        if (state.phase !== "setup") return sendJSON(res, 400, { error: "Tributes can only be removed during setup" });
        engine.removeTribute(state, id);
        save();
        return sendJSON(res, 200, state);
      }
    }

    if (p === "/api/start" && req.method === "POST") return mutate(req, res, () => engine.startGames(state));
    if (p === "/api/advance" && req.method === "POST") return mutate(req, res, () => engine.advance(state));
    if (p === "/api/reset" && req.method === "POST") return mutate(req, res, () => engine.reset(state));
    if (p === "/api/example" && req.method === "POST") {
      return mutate(req, res, () => {
        if (state.phase === "setup") engine.loadExamples(state);
      });
    }

    if (req.method === "GET") {
      const target = p === "/" ? "index.html" : p.slice(1);
      return serveStatic(res, path.join(PUBLIC_DIR, target));
    }

    sendJSON(res, 404, { error: "Not found" });
  } catch (e) {
    sendJSON(res, 500, { error: String(e && e.message ? e.message : e) });
  }
});

server.listen(PORT, HOST, () => {
  console.log("Hunger Games simulator running at http://" + HOST + ":" + PORT);
  console.log("  State: " + state.tributes.length + " tributes, phase: " + state.phase);
  if (STREAM_LOGS) console.log("  Live arena log streaming to console (STREAM_LOGS=0 to disable)");
});