const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { ITEMS: DEFAULT_ITEMS } = require("./items");
const { POOL: DEFAULT_POOL } = require("./events");
const { GLOBAL_EVENTS: DEFAULT_GLOBALS } = require("./globalEvents");
const DEFAULT_PERSONALITIES = require("./personalities");
const DEFAULT_ABILITIES = require("./abilities");

const CONFIG_DIR = path.join(__dirname, "config");
const ITEMS_FILE = path.join(CONFIG_DIR, "items.json");
const EVENTS_FILE = path.join(CONFIG_DIR, "events.json");
const GLOBALS_FILE = path.join(CONFIG_DIR, "globalEvents.json");
const PACKS_FILE = path.join(CONFIG_DIR, "packs.json");
const CONTENT_PACKS_FILE = path.join(CONFIG_DIR, "contentPacks.json");
const PERSONALITIES_FILE = path.join(CONFIG_DIR, "personalities.json");
const ABILITIES_FILE = path.join(CONFIG_DIR, "abilities.json");
const LOCALES_DIR = path.join(CONFIG_DIR, "locales");

const ACTIONS = ["gather", "scout", "build", "fight", "social", "rest"];
const ACTION_CATEGORY = {
  gather: "gather",
  scout: "scout",
  build: "build",
  fight: "fight",
  social: "social",
  rest: "rest"
};

const DEFAULT_ATTRIBUTES = {
  health: 100,
  energy: 100,
  food: 100,
  morale: 100,
  supplies: 20,
  combat: 30,
  survival: 30,
  craft: 30,
  charm: 30,
  stealth: 30
};

const DEFAULT_PROFICIENCIES = { melee: 30, ranged: 30, explosive: 30, tool: 30, medical: 30 };

const DEFAULT_SETTINGS = { sponsorGifts: true, autoPlay: true, showChanges: true, language: "en", logReveal: "off", revealSpeed: "normal", winMode: "hg", endDay: 10, devMode: false, alliances: false };

const WEAPON_CATS = ["melee", "ranged", "explosive"];

const LOOT_TABLE = {
  gather: ["berries", "water", "rations", "meat", "firewood"],
  scout: ["water", "rations", "knife", "bandage", "rope", "shield", "firewood"],
  build: ["rope", "net", "flint", "shovel", "vest", "firewood"],
  fight: ["knife", "axe", "bow", "club", "shield"],
  social: ["bandage", "water", "berries"],
  rest: ["berries", "water"]
};

const BIOMES = {
  forest: { dayHeat: 0, nightCold: 0, gather: 0 },
  tundra: { dayHeat: 0, nightCold: 5, gather: -10 },
  desert: { dayHeat: 6, nightCold: 0, gather: -5 },
  jungle: { dayHeat: 4, nightCold: 0, gather: 5 },
  mountains: { dayHeat: 0, nightCold: 3, gather: -10 },
  plains: { dayHeat: 2, nightCold: 0, gather: 0 }
};

const DEFAULT_MAP = {
  biome: "forest",
  scarcity: { provisions: 0, supplies: 0, weapons: 0, tools: 0, medical: 0, armor: 0 },
  weather: false,
  replenish: true,
  globalEvents: false,
  globalsMin: null,
  globalsMax: null,
  bossMinDay: 3,
  bossCount: 1,
  replenished: false
};

const ITEM_SCARCITY = {
  provisions: "provisions",
  melee: "weapons",
  ranged: "weapons",
  explosive: "weapons",
  tool: "tools",
  medical: "medical",
  armor: "armor"
};

const ACTION_SCARCITY = {
  gather: "provisions",
  scout: "supplies",
  build: "tools",
  fight: "weapons",
  social: "provisions",
  rest: "provisions"
};

const WEATHER_POOL = [
  { tpl: { en: "A violent storm lashes the arena, toppling trees and soaking everyone.", ru: "Жестокий шторм бьёт по арене, валит деревья и заливает всех водой." }, fx: { health: -5, energy: -8, morale: -6 } },
  { tpl: { en: "A searing heat wave rolls across the arena. Shade is nowhere.", ru: "По арене прокатывается испепеляющая жара. Тени нет нигде." }, fx: { health: -4, energy: -7, morale: -3 } },
  { tpl: { en: "A sudden cold snap bites through the arena. Everyone shivers.", ru: "Внезапный мороз пробирает арену до костей. Все дрожат." }, fx: { health: -5, morale: -4, energy: -5 }, cold: true },
  { tpl: { en: "Thick fog swallows the arena. Movement becomes a gamble.", ru: "Густой туман поглощает арену. Каждое движение — как лотерея." }, fx: { energy: -6, morale: -4 } },
  { tpl: { en: "Driving rain turns the ground to mud. Camps become misery.", ru: "Ливень превращает землю в грязь. Лагеря становятся мучением." }, fx: { health: -3, energy: -5, morale: -4 } },
  { tpl: { en: "Gale-force winds scream through the trees all day.", ru: "Шквальный ветер весь день воет в деревьях." }, fx: { energy: -7, morale: -3 } }
];

function spotted(self, victim) {
  if (!victim) return false;
  const chance = clamp(0.5 + (victim.attributes.survival - self.attributes.stealth) / 200, 0.05, 0.95);
  return Math.random() < chance;
}

function applyStealthTheft(state, self, other, evt) {
  const changes = [];
  if (!spotted(self, other)) {
    const s1 = applyFx(state, self, evt.fxSelf || {}, null, "theft");
    if (s1) changes.push(s1);
    const s2 = applyFx(state, other, evt.fxOther || {}, null, "theft");
    if (s2) changes.push(s2);
    if (evt.loot) {
      const pool = evt.loot.map((id) => ITEMS_BY_ID[id]).filter((x) => x && x.enabled !== false);
      if (pool.length) {
        const item = weightedPick(pool, (i) => i.weight);
        grantItem(self, item.id, 1);
        changes.push(tr(state, "found", { name: self.name, item: itemNameLC(item, state) }));
      }
    }
    self.hidden = true;
    if (evt.rel) self.relationships[other.id] = clamp((self.relationships[other.id] || 0) + evt.rel, -100, 100);
    const relRev = evt.relRev != null ? Math.round(evt.relRev / 2) : 0;
    other.relationships[self.id] = clamp((other.relationships[self.id] || 0) + relRev, -100, 100);
    return { text: tr(state, "theftQuiet", { self: self.name, other: other.name }), changes: changes.join(" \u00B7 ") };
  }

  const caught = (self._theftCaught = self._theftCaught || {})[other.id] || 0;
  self._theftCaught[other.id] = caught + 1;

  const aggressive = other.attributes.combat >= 60 || other.personality === "warrior" || other.personality === "paranoid";
  if (aggressive) {
    const thiefBefore = self.attributes.health;
    const s1 = applyFx(state, self, { health: -14, morale: -9, energy: -8 }, null, "fight", other.id);
    if (s1) changes.push(s1);
    const victimBefore = other.attributes.health;
    const s2 = applyFx(state, other, { health: -11, morale: -5 }, null, "fight", self.id);
    if (s2) changes.push(s2);
    other.stats.damage = (other.stats.damage || 0) + (thiefBefore - self.attributes.health);
    self.stats.damage = (self.stats.damage || 0) + (victimBefore - other.attributes.health);
    self.stats.fights += 1;
    other.stats.fights += 1;
    self.relationships[other.id] = clamp((self.relationships[other.id] || 0) - 25, -100, 100);
    other.relationships[self.id] = clamp((other.relationships[self.id] || 0) - 30, -100, 100);
    self.hidden = false;
    return { text: tr(state, "theftFight", { self: self.name, other: other.name }), changes: changes.join(" \u00B7 ") };
  }

  let charmPower = 1.5 * (self.attributes.charm / 100);
  const pers = PERSONALITIES[self.personality];
  if (pers && pers.weights && pers.weights.social > 0) charmPower += 0.35;
  charmPower = clamp(charmPower - caught * 0.3, 0, 1);
  const relDamage = Math.round((1 - charmPower) * 15);
  const relRevDamage = Math.round((1 - charmPower) * 22);
  const s1 = applyFx(state, self, { morale: -10, energy: -6 }, null, "social");
  if (s1) changes.push(s1);
  self.relationships[other.id] = clamp((self.relationships[other.id] || 0) - relDamage, -100, 100);
  other.relationships[self.id] = clamp((other.relationships[self.id] || 0) - relRevDamage, -100, 100);
  self.hidden = false;
  const text = charmPower >= 0.5
    ? tr(state, "theftCharm", { self: self.name, other: other.name })
    : tr(state, "theftConfront", { self: self.name, other: other.name });
  return { text, changes: changes.join(" \u00B7 ") };
}

// ---------- content (items / events / locales) ----------

let ITEMS = [];
let ITEMS_BY_ID = {};
let POOL = [];
let GLOBAL_EVENTS = [];
let PACKS = [];
let CONTENT_PACKS = [];
let ABILITIES = {};
let PERSONALITIES = {};
let LOCALES = {};
let FLAT_LOCALES = {};

function tryReadJSON(file) {
  try {
    const s = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(s) ? s : null;
  } catch (e) {
    return null;
  }
}

function normalizeItem(def) {
  const item = Object.assign({ id: "", name: "Item", emoji: "\u{1F4E6}", cat: "tool", weight: 10, enabled: true }, def || {});
  item.id = String(item.id || String(item.name).toLowerCase().replace(/[^a-z0-9]+/g, "_") || ("item_" + Date.now().toString(36)));
  return item;
}

function normalizeEvent(def) {
  const evt = Object.assign({ id: "", cat: "gather", phase: "day", targets: 1, tpl: "", weight: 10, enabled: true }, def || {});
  evt.id = String(evt.id);
  return evt;
}

function rebuildItems() {
  ITEMS_BY_ID = {};
  for (const item of ITEMS) ITEMS_BY_ID[item.id] = item;
}

function loadLocales() {
  LOCALES = {};
  if (fs.existsSync(LOCALES_DIR)) {
    for (const f of fs.readdirSync(LOCALES_DIR)) {
      if (!f.endsWith(".json")) continue;
      try {
        const loc = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, f), "utf8"));
        if (loc && loc.__meta__ && loc.__meta__.code) LOCALES[loc.__meta__.code] = loc;
      } catch (e) {}
    }
  }
  FLAT_LOCALES = {};
  for (const code of Object.keys(LOCALES)) {
    const loc = LOCALES[code];
    FLAT_LOCALES[code] = Object.assign({}, loc.ui || {}, loc.names || {}, loc.engine || {});
  }
}

function loadContent() {
  ITEMS = tryReadJSON(ITEMS_FILE) || DEFAULT_ITEMS;
  POOL = tryReadJSON(EVENTS_FILE) || DEFAULT_POOL;
  GLOBAL_EVENTS = tryReadJSON(GLOBALS_FILE) || DEFAULT_GLOBALS;
  for (const it of ITEMS) if (it.enabled === undefined) it.enabled = true;
  for (const e of POOL) if (e.enabled === undefined) e.enabled = true;
  for (const g of GLOBAL_EVENTS) if (g.enabled === undefined) g.enabled = true;
  rebuildItems();
  loadPersonalities();
  loadAbilities();
  loadLocales();
  loadPacks();
  loadContentPacks();
}

function activeItems() {
  return ITEMS.filter((i) => i.enabled !== false);
}

// ---------- abilities ----------

function loadAbilities() {
  const list = tryReadJSON(ABILITIES_FILE) || DEFAULT_ABILITIES;
  ABILITIES = {};
  for (const a of list) {
    const id = String(a.id || "");
    if (id) ABILITIES[id] = { id, name: a.name || id, enabled: a.enabled !== false, cond: a.cond || null, script: a.script || null, weights: a.weights || {}, damageDealt: a.damageDealt, damageTaken: a.damageTaken, upkeep: a.upkeep, coldResist: a.coldResist, scavengeChance: a.scavengeChance, targetWeight: a.targetWeight, extraAction: a.extraAction };
  }
}

function saveAbilitiesFile() {
  try {
    fs.writeFileSync(ABILITIES_FILE, JSON.stringify(Object.values(ABILITIES), null, 2));
  } catch (e) {}
}

function getAbilities() {
  return Object.values(ABILITIES);
}

function addAbility(def) {
  const id = String(def && def.id ? def.id : (def && def.name ? String(def.name).toLowerCase().replace(/[^a-z0-9]+/g, "_") : "")).trim();
  if (!id || ABILITIES[id]) throw new Error("Ability id already exists: " + id);
  ABILITIES[id] = { id, name: (def && def.name) || id, enabled: true, cond: (def && def.cond) || null, script: (def && def.script) || null, weights: (def && def.weights) || {}, damageDealt: def && def.damageDealt, damageTaken: def && def.damageTaken, upkeep: def && def.upkeep, coldResist: def && def.coldResist, scavengeChance: def && def.scavengeChance, targetWeight: def && def.targetWeight, extraAction: def && def.extraAction };
  saveAbilitiesFile();
  return ABILITIES[id];
}

function updateAbility(id, patch) {
  const a = ABILITIES[id];
  if (!a) return null;
  if (patch.name) a.name = patch.name;
  if (patch.weights) a.weights = patch.weights;
  if (patch.cond !== undefined) a.cond = patch.cond || null;
  if (patch.script !== undefined) a.script = patch.script || null;
  for (const k of ["damageDealt", "damageTaken", "coldResist", "scavengeChance", "targetWeight"]) {
    if (patch[k] !== undefined) a[k] = patch[k];
  }
  if (patch.upkeep !== undefined) a.upkeep = patch.upkeep || null;
  if (patch.extraAction !== undefined) a.extraAction = patch.extraAction || null;
  saveAbilitiesFile();
  return a;
}

function removeAbility(id) {
  delete ABILITIES[id];
  saveAbilitiesFile();
}

function abilityOf(t) {
  return (t && t.ability && ABILITIES[t.ability]) || null;
}

function activeAbility(t) {
  const a = abilityOf(t);
  if (!a) return null;
  if (a.cond) {
    try {
      const ctx = { self: t, other: null, others: [], memory: {}, isAlive };
      if (!evalMiniCond(a.cond, ctx)) return null;
    } catch (e) {
      return null;
    }
  }
  return a;
}

function abilityMult(t, key) {
  const a = activeAbility(t);
  return a && a[key] != null ? a[key] : 1;
}

function runAbilityHook(state, t, hook, extra) {
  const a = activeAbility(t);
  if (!a) return;
  const script = a.script;
  if (!script) return;
  const src = typeof script === "string" ? (hook === "onDay" ? script : null) : script[hook];
  if (!src) return;
  if (!t.abilityMemory) t.abilityMemory = {};
  const lang = typeof script === "object" ? script.lang : null;
  const ctx = scriptCtx(state, Object.assign({ self: t, other: null, others: [], memory: t.abilityMemory }, extra || {}));
  runHook(src, lang, ctx);
}

function runAbilityEventHooks(state, self, others, evt, hook) {
  const evtInfo = { id: evt.id, cat: evt.cat, phase: evt.phase };
  runAbilityHook(state, self, hook, { event: evtInfo, other: others[0] || null, others });
  for (const o of others) {
    runAbilityHook(state, o, hook, { event: evtInfo, other: self, others: others.filter((x) => x !== o) });
  }
}

// ---------- personalities ----------

function loadPersonalities() {
  let list = tryReadJSON(PERSONALITIES_FILE) || DEFAULT_PERSONALITIES;
  PERSONALITIES = {};
  for (const p of list) {
    const id = String(p.id || "");
    if (id) PERSONALITIES[id] = { id, name: p.name || id, weights: p.weights || {}, default: !!p.default, enabled: p.enabled !== false };
  }
}

function savePersonalitiesFile() {
  try {
    fs.writeFileSync(PERSONALITIES_FILE, JSON.stringify(Object.values(PERSONALITIES), null, 2));
  } catch (e) {}
}

function getPersonalities() {
  return Object.values(PERSONALITIES);
}

function addPersonality(def) {
  const id = String(def && def.id ? def.id : (def && def.name ? String(def.name).toLowerCase().replace(/[^a-z0-9]+/g, "_") : "")).trim();
  if (!id || PERSONALITIES[id]) throw new Error("Personality id already exists: " + id);
  PERSONALITIES[id] = {
    id,
    name: def && def.name ? def.name : id,
    weights: (def && def.weights) || {},
    default: false,
    enabled: true
  };
  savePersonalitiesFile();
  return PERSONALITIES[id];
}

function updatePersonality(id, patch) {
  const p = PERSONALITIES[id];
  if (!p) return null;
  if (patch.name) p.name = patch.name;
  if (patch.weights) p.weights = patch.weights;
  savePersonalitiesFile();
  return p;
}

function removePersonality(id) {
  const p = PERSONALITIES[id];
  if (!p) return false;
  if (p.default) return false;
  delete PERSONALITIES[id];
  savePersonalitiesFile();
  return true;
}

// ---------- tribute packs ----------

function loadPacks() {
  try {
    const p = JSON.parse(fs.readFileSync(PACKS_FILE, "utf8"));
    PACKS = Array.isArray(p) ? p : [];
  } catch (e) {
    PACKS = [];
  }
}

function savePacksFile() {
  try {
    fs.writeFileSync(PACKS_FILE, JSON.stringify(PACKS, null, 2));
  } catch (e) {}
}

function getPacks() {
  return PACKS;
}

function savePack(state, name) {
  const pack = {
    name,
    savedAt: new Date().toISOString(),
    tributes: state.tributes.map((t) => {
      const rel = {};
      for (const k of Object.keys(t.relationships || {})) {
        const idx = state.tributes.findIndex((o) => o.id === k);
        if (idx > -1) rel[idx] = t.relationships[k];
      }
      return {
        name: t.name,
        emoji: t.emoji,
        gender: t.gender,
        personality: t.personality,
        alliance: t.alliance,
        attributes: { ...t.attributes },
        proficiencies: { ...t.proficiencies },
        relationships: rel,
        items: { ...t.items }
      };
    })
  };
  const existing = PACKS.find((p) => p.name === name);
  if (existing) Object.assign(existing, pack);
  else PACKS.push(pack);
  savePacksFile();
  return pack;
}

function loadPack(state, name) {
  const pack = PACKS.find((p) => p.name === name);
  if (!pack) return null;
  state.tributes = [];
  state.log = [];
  state.day = 1;
  state.phase = "setup";
  state.winner = null;
  state.activeGlobals = [];
  state.globalsTriggered = {};
  for (const ex of pack.tributes) {
    const t = addTribute(state, ex.name);
    t.emoji = ex.emoji || t.emoji;
    t.gender = ex.gender || t.gender;
    t.personality = ex.personality || t.personality;
    t.alliance = ex.alliance || null;
    for (const k in ex.attributes || {}) t.attributes[k] = ex.attributes[k];
    for (const k in ex.proficiencies || {}) t.proficiencies[k] = ex.proficiencies[k];
    t.items = Object.assign({}, ex.items || {});
  }
  state.tributes.forEach((t, i) => {
    const ex = pack.tributes[i];
    if (ex && ex.relationships) {
      for (const k of Object.keys(ex.relationships)) {
        const other = state.tributes[Number(k)];
        if (other) t.relationships[other.id] = ex.relationships[k];
      }
    }
  });
  linkRelationships(state.tributes);
  return pack;
}

function removePack(name) {
  PACKS = PACKS.filter((p) => p.name !== name);
  savePacksFile();
}

// ---------- content packs (Items / Events / Global Events / Personalities) ----------

function loadContentPacks() {
  try {
    const p = JSON.parse(fs.readFileSync(CONTENT_PACKS_FILE, "utf8"));
    CONTENT_PACKS = Array.isArray(p) ? p : [];
  } catch (e) {
    CONTENT_PACKS = [];
  }
}

function saveContentPacksFile() {
  try {
    fs.writeFileSync(CONTENT_PACKS_FILE, JSON.stringify(CONTENT_PACKS, null, 2));
  } catch (e) {}
}

function getContentPacks() {
  return CONTENT_PACKS;
}

function saveContentPack(state, name) {
  const pack = {
    name,
    savedAt: new Date().toISOString(),
    items: ITEMS.filter((i) => i.enabled !== false).map((i) => i.id),
    events: POOL.filter((e) => e.enabled !== false).map((e) => e.id),
    globals: GLOBAL_EVENTS.filter((g) => g.enabled !== false).map((g) => g.id),
    personalities: Object.values(PERSONALITIES).filter((p) => p.enabled !== false).map((p) => p.id),
    abilities: Object.values(ABILITIES).filter((a) => a.enabled !== false).map((a) => a.id)
  };
  const existing = CONTENT_PACKS.find((p) => p.name === name);
  if (existing) Object.assign(existing, pack);
  else CONTENT_PACKS.push(pack);
  saveContentPacksFile();
  return pack;
}

function loadContentPack(state, name) {
  const pack = CONTENT_PACKS.find((p) => p.name === name);
  if (!pack) return null;
  setEnabledSet(ITEMS, pack.items);
  setEnabledSet(POOL, pack.events);
  setEnabledSet(GLOBAL_EVENTS, pack.globals);
  setEnabledSet(Object.values(PERSONALITIES), pack.personalities);
  setEnabledSet(Object.values(ABILITIES), pack.abilities);
  saveContent();
  savePersonalitiesFile();
  saveAbilitiesFile();
  return pack;
}

function removeContentPack(name) {
  CONTENT_PACKS = CONTENT_PACKS.filter((p) => p.name !== name);
  saveContentPacksFile();
}

function setEnabledSet(list, ids) {
  const set = new Set(ids || []);
  for (const obj of list) obj.enabled = set.has(obj.id);
}

function setContentEnabled(type, id, enabled) {
  const on = enabled !== false;
  if (type === "items") {
    const it = ITEMS.find((i) => i.id === id);
    if (!it) return false;
    it.enabled = on;
    saveContent();
  } else if (type === "events") {
    const e = POOL.find((x) => x.id === id);
    if (!e) return false;
    e.enabled = on;
    saveContent();
  } else if (type === "globals") {
    const g = GLOBAL_EVENTS.find((x) => x.id === id);
    if (!g) return false;
    g.enabled = on;
    saveContent();
  } else if (type === "personalities") {
    const p = PERSONALITIES[id];
    if (!p) return false;
    p.enabled = on;
    savePersonalitiesFile();
  } else if (type === "abilities") {
    const a = ABILITIES[id];
    if (!a) return false;
    a.enabled = on;
    saveAbilitiesFile();
  } else {
    return false;
  }
  return true;
}

function saveContent() {
  try {
    fs.writeFileSync(ITEMS_FILE, JSON.stringify(ITEMS, null, 2));
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(POOL, null, 2));
    fs.writeFileSync(GLOBALS_FILE, JSON.stringify(GLOBAL_EVENTS, null, 2));
  } catch (e) {}
}

function getItems() {
  return ITEMS;
}

function getEvents() {
  return POOL;
}

function getGlobalEvents() {
  return GLOBAL_EVENTS;
}

function getLanguages() {
  return Object.keys(LOCALES).map((code) => ({
    code,
    name: LOCALES[code].__meta__.name,
    native: LOCALES[code].__meta__.native
  }));
}

function getLocale(code) {
  return LOCALES[code] || null;
}

function saveLocale(code, locale) {
  if (!locale || typeof locale !== "object" || !locale.__meta__) return false;
  LOCALES[code] = locale;
  FLAT_LOCALES[code] = Object.assign({}, locale.ui || {}, locale.names || {}, locale.engine || {});
  try {
    fs.writeFileSync(path.join(LOCALES_DIR, code + ".json"), JSON.stringify(locale, null, 2));
    return true;
  } catch (e) {
    return false;
  }
}

function addItem(def) {
  const item = normalizeItem(def);
  if (!item.id || ITEMS.some((i) => i.id === item.id)) throw new Error("Item id already exists: " + item.id);
  ITEMS.push(item);
  rebuildItems();
  return item;
}

function updateItem(id, patch) {
  const item = ITEMS.find((i) => i.id === id);
  if (!item) return null;
  const merged = normalizeItem(Object.assign({}, item, patch));
  if (merged.id !== id && ITEMS.some((i) => i.id === merged.id)) throw new Error("Item id already exists: " + merged.id);
  Object.assign(item, merged);
  rebuildItems();
  return item;
}

function removeItem(id) {
  ITEMS = ITEMS.filter((i) => i.id !== id);
  rebuildItems();
}

function addEvent(def) {
  const evt = normalizeEvent(def);
  if (!evt.id || POOL.some((e) => e.id === evt.id)) throw new Error("Event id already exists: " + evt.id);
  POOL.push(evt);
  return evt;
}

function updateEvent(id, patch) {
  const evt = POOL.find((e) => e.id === id);
  if (!evt) return null;
  const merged = normalizeEvent(Object.assign({}, evt, patch));
  if (merged.id !== id && POOL.some((e) => e.id === merged.id)) throw new Error("Event id already exists: " + merged.id);
  Object.assign(evt, merged);
  return evt;
}

function removeEvent(id) {
  POOL = POOL.filter((e) => e.id !== id);
}

function normalizeGlobal(def) {
  const g = Object.assign({ id: "", mode: "influence", chance: 0.1, weight: 10, duration: { type: "full_days", value: 1 }, tpl: "" }, def || {});
  g.id = String(g.id);
  return g;
}

function addGlobalEvent(def) {
  const g = normalizeGlobal(def);
  if (!g.id || GLOBAL_EVENTS.some((x) => x.id === g.id)) throw new Error("Global event id already exists: " + g.id);
  GLOBAL_EVENTS.push(g);
  return g;
}

function updateGlobalEvent(id, patch) {
  const g = GLOBAL_EVENTS.find((x) => x.id === id);
  if (!g) return null;
  const merged = normalizeGlobal(Object.assign({}, g, patch));
  if (merged.id !== id && GLOBAL_EVENTS.some((x) => x.id === merged.id)) throw new Error("Global event id already exists: " + merged.id);
  Object.assign(g, merged);
  return g;
}

function removeGlobalEvent(id) {
  GLOBAL_EVENTS = GLOBAL_EVENTS.filter((x) => x.id !== id);
}

// ---------- i18n ----------

function tr(state, key, vars) {
  const lang = state && state.settings ? state.settings.language : "en";
  const loc = FLAT_LOCALES[lang] || FLAT_LOCALES.en || {};
  let s = loc[key] || (FLAT_LOCALES.en && FLAT_LOCALES.en[key]) || key;
  if (vars) {
    for (const k of Object.keys(vars)) {
      s = s.split("{" + k + "}").join(String(vars[k]));
    }
  }
  return s;
}

function statName(state, key) {
  return tr(state, "stat." + key);
}

function profName(state, key) {
  return tr(state, "prof." + key);
}

function itemName(def, state) {
  if (!def) return "?";
  const n = def.name;
  if (n && typeof n === "object") {
    const lang = state.settings.language;
    return n[lang] || n.en || Object.values(n)[0] || "?";
  }
  return n;
}

function itemNameLC(def, state) {
  const lang = state.settings.language || "en";
  return String(itemName(def, state)).toLocaleLowerCase(lang);
}

function resolveTplVariant(v, state) {
  if (v && typeof v === "object") {
    const lang = state.settings.language;
    return v[lang] || v.en || Object.values(v)[0] || "";
  }
  return typeof v === "string" ? v : "";
}

function resolveTplValue(tpl, state) {
  if (Array.isArray(tpl)) {
    if (!tpl.length) return "";
    return resolveTplVariant(tpl[randInt(tpl.length)], state);
  }
  return resolveTplVariant(tpl, state);
}

function eventText(evt, state) {
  return resolveTplValue(evt.tpl, state);
}

// ---------- helpers ----------

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function randInt(n) {
  return Math.floor(Math.random() * n);
}

function weightedPick(items, weightFn) {
  const total = items.reduce((s, it) => s + weightFn(it), 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= weightFn(it);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

function profFactor(prof) {
  return 0.5 + (prof || 0) / 200;
}

function newState() {
  return {
    phase: "setup",
    day: 1,
    tributes: [],
    log: [],
    winner: null,
    winners: [],
    settings: { ...DEFAULT_SETTINGS },
    map: JSON.parse(JSON.stringify(DEFAULT_MAP)),
    activeGlobals: [],
    globalsTriggered: {},
    bossSpawned: false,
    bossSlayers: []
  };
}

function normalizeMap(m) {
  const base = JSON.parse(JSON.stringify(DEFAULT_MAP));
  const map = Object.assign(base, m || {});
  map.scarcity = Object.assign({}, base.scarcity, (m && m.scarcity) || {});
  return map;
}

function normalizeTribute(t) {
  t.attributes = Object.assign({}, DEFAULT_ATTRIBUTES, t.attributes || {});
  t.proficiencies = Object.assign({}, DEFAULT_PROFICIENCIES, t.proficiencies || {});
  t.items = t.items || {};
  t.gender = t.gender || "unspecified";
  t.personality = t.personality || "survivor";
  t.stats = Object.assign({}, freshStats(), t.stats || {});
  t.alive = t.alive !== false;
}

function loadState(file) {
  if (file && fs.existsSync(file)) {
    try {
      const s = JSON.parse(fs.readFileSync(file, "utf8"));
      if (s && Array.isArray(s.tributes)) {
        linkRelationships(s.tributes);
        delete s.actions;
        s.settings = Object.assign({}, DEFAULT_SETTINGS, s.settings || {});
        s.map = normalizeMap(s.map);
        s.activeGlobals = Array.isArray(s.activeGlobals) ? s.activeGlobals : [];
        s.globalsTriggered = s.globalsTriggered && typeof s.globalsTriggered === "object" ? s.globalsTriggered : {};
        for (const t of s.tributes) normalizeTribute(t);
        return s;
      }
    } catch (e) {}
  }
  return newState();
}

function linkRelationships(tributes) {
  const ids = new Set(tributes.map((t) => t.id));
  for (const t of tributes) {
    if (!t.relationships) t.relationships = {};
    for (const o of tributes) {
      if (o.id !== t.id && t.relationships[o.id] === undefined) t.relationships[o.id] = 0;
    }
    for (const k of Object.keys(t.relationships)) {
      if (!ids.has(k)) delete t.relationships[k];
    }
  }
}

function byId(state, id) {
  return state.tributes.find((t) => t.id === id);
}

function isAlive(t) {
  return t.alive && t.attributes.health > 0;
}

function addTribute(state, name) {
  const t = {
    id: uid(),
    name,
    emoji: "\u{1F3AD}",
    gender: "unspecified",
    personality: "survivor",
    alliance: null,
    ability: null,
    alive: true,
    attributes: { ...DEFAULT_ATTRIBUTES },
    proficiencies: { ...DEFAULT_PROFICIENCIES },
    relationships: {},
    items: {},
    stats: freshStats()
  };
  state.tributes.push(t);
  linkRelationships(state.tributes);
  return t;
}

function freshStats() {
  return { kills: 0, fights: 0, thefts: 0, gathers: 0, scavenges: 0, socials: 0, gifts: 0, damage: 0, experience: 0 };
}

function removeTribute(state, id) {
  state.tributes = state.tributes.filter((t) => t.id !== id);
  linkRelationships(state.tributes);
}

function updateTribute(state, id, patch) {
  const t = byId(state, id);
  if (!t) return null;
  if (typeof patch.name === "string" && patch.name.trim()) t.name = patch.name.trim();
  if (typeof patch.emoji === "string" && patch.emoji) t.emoji = patch.emoji;
  if (typeof patch.img === "string") t.img = patch.img || null;
  if (typeof patch.gender === "string" && patch.gender) t.gender = patch.gender;
  if (typeof patch.personality === "string" && patch.personality) t.personality = patch.personality;
  if (typeof patch.alliance === "string") t.alliance = patch.alliance.trim() ? patch.alliance.trim() : null;
  if (typeof patch.ability === "string") t.ability = patch.ability.trim() ? patch.ability.trim() : null;
  if (patch.attributes) {
    for (const k of Object.keys(patch.attributes)) {
      if (k in t.attributes && typeof patch.attributes[k] === "number") {
        t.attributes[k] = clamp(patch.attributes[k], 0, 100);
      }
    }
  }
  if (patch.proficiencies) {
    for (const k of Object.keys(patch.proficiencies)) {
      if (k in t.proficiencies && typeof patch.proficiencies[k] === "number") {
        t.proficiencies[k] = clamp(patch.proficiencies[k], 0, 100);
      }
    }
  }
  if (patch.relationships) {
    for (const k of Object.keys(patch.relationships)) {
      if (k in t.relationships && typeof patch.relationships[k] === "number") {
        t.relationships[k] = clamp(patch.relationships[k], -100, 100);
      }
    }
  }
  if (patch.items !== undefined) {
    if (Array.isArray(patch.items)) {
      t.items = {};
      for (const id of patch.items) if (ITEMS_BY_ID[id]) grantItem(t, id, 1);
    } else if (patch.items && typeof patch.items === "object") {
      t.items = {};
      for (const id of Object.keys(patch.items)) {
        const st = patch.items[id];
        t.items[id] = { qty: (st && st.qty) || 1, dur: (st && st.dur) || (ITEMS_BY_ID[id] ? ITEMS_BY_ID[id].dur || 0 : 0) };
      }
    }
  }
  return t;
}

function updateSettings(state, patch) {
  state.settings = Object.assign({}, DEFAULT_SETTINGS, state.settings || {});
  for (const k of Object.keys(DEFAULT_SETTINGS)) {
    if (k === "language") {
      if (typeof patch[k] === "string" && LOCALES[patch[k]]) state.settings[k] = patch[k];
    } else if (k === "logReveal") {
      if (["off", "lines", "type"].includes(patch[k])) state.settings[k] = patch[k];
    } else if (k === "revealSpeed") {
      if (["slow", "normal", "fast"].includes(patch[k])) state.settings[k] = patch[k];
    } else if (k === "winMode") {
      if (["hg", "survivors", "boss_slayer", "hg_plus"].includes(patch[k])) state.settings[k] = patch[k];
    } else if (k === "endDay") {
      if (typeof patch[k] === "number" && patch[k] >= 1) state.settings[k] = Math.floor(patch[k]);
    } else if (typeof patch[k] === "boolean") {
      state.settings[k] = patch[k];
    }
  }
}

function updateMap(state, patch) {
  state.map = normalizeMap(state.map);
  if (patch && typeof patch === "object") {
    if (BIOMES[patch.biome]) state.map.biome = patch.biome;
    if (typeof patch.weather === "boolean") state.map.weather = patch.weather;
    if (typeof patch.replenish === "boolean") state.map.replenish = patch.replenish;
    if (typeof patch.globalEvents === "boolean") state.map.globalEvents = patch.globalEvents;
    if (patch.globalsMin === null || patch.globalsMin === undefined || patch.globalsMin === "") {
      state.map.globalsMin = null;
    } else if (typeof patch.globalsMin === "number") {
      state.map.globalsMin = Math.max(0, Math.floor(patch.globalsMin));
    }
    if (patch.globalsMax === null || patch.globalsMax === undefined || patch.globalsMax === "") {
      state.map.globalsMax = null;
    } else if (typeof patch.globalsMax === "number") {
      state.map.globalsMax = Math.max(0, Math.floor(patch.globalsMax));
    }
    if (patch.bossMinDay === null || patch.bossMinDay === undefined || patch.bossMinDay === "") {
      state.map.bossMinDay = null;
    } else if (typeof patch.bossMinDay === "number") {
      state.map.bossMinDay = Math.max(1, Math.floor(patch.bossMinDay));
    }
    if (patch.bossCount === null || patch.bossCount === undefined || patch.bossCount === "") {
      state.map.bossCount = null;
    } else if (typeof patch.bossCount === "number") {
      state.map.bossCount = Math.max(1, Math.floor(patch.bossCount));
    }
    if (patch.scarcity) {
      for (const k of Object.keys(patch.scarcity)) {
        if (k in state.map.scarcity && typeof patch.scarcity[k] === "number") {
          state.map.scarcity[k] = clamp(patch.scarcity[k], 0, 100);
        }
      }
    }
  }
}

function log(state, cat, text, changes) {
  const entry = { day: state.day, phase: state.phase, cat, text };
  if (changes) entry.changes = changes;
  state.log.push(entry);
  if (state.log.length > 600) state.log = state.log.slice(-600);
}

function inRange(v, { min = -Infinity, max = Infinity }) {
  return v >= min && v <= max;
}

function tributeMatches(t, cond) {
  if (!cond) return true;
  const attrs = t.attributes;
  if (cond.skill) {
    const v = attrs[cond.skill.name];
    if (v === undefined || !inRange(v, cond.skill)) return false;
  }
  if (cond.stat) {
    const v = attrs[cond.stat.name];
    if (v === undefined || !inRange(v, cond.stat)) return false;
  }
  if (cond.proficiency) {
    const v = t.proficiencies[cond.proficiency.name];
    if (v === undefined || !inRange(v, cond.proficiency)) return false;
  }
  if (cond.personality && t.personality !== cond.personality) return false;
  if (cond.gender && t.gender !== cond.gender) return false;
  if (cond.hasItem) {
    const st = t.items[cond.hasItem];
    if (!st || st.qty <= 0) return false;
  }
  if (cond.hasCat) {
    let found = false;
    for (const id of Object.keys(t.items)) {
      const def = ITEMS_BY_ID[id];
      const st = t.items[id];
      if (def && def.cat === cond.hasCat && st.qty > 0) {
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}

function meetsCond(evt, self, other) {
  const c = evt.cond;
  if (!c) return true;
  if (!tributeMatches(self, c)) return false;
  if (c.relSelf) {
    if (!other) return false;
    const v = self.relationships[other.id] || 0;
    if (!inRange(v, c.relSelf)) return false;
  }
  return true;
}

function pickTributeByTarget(state, spec, excludeId) {
  let pool = state.tributes.filter(isAlive);
  if (spec && typeof spec === "object") {
    if (spec.excludeSelf && excludeId) pool = pool.filter((t) => t.id !== excludeId);
    if (spec.cond) pool = pool.filter((t) => tributeMatches(t, spec.cond));
  }
  if (!pool.length) return null;
  return pool[randInt(pool.length)];
}

// ---------- script hooks ----------

const SCRIPT_TIMEOUT = 1000;

function runScript(src, ctx) {
  if (typeof src !== "string" || !src.trim()) return;
  try {
    const sandbox = Object.assign({}, ctx);
    const context = vm.createContext(sandbox);
    vm.runInContext(src, context, { timeout: SCRIPT_TIMEOUT, filename: "script.js" });
  } catch (e) {
    if (ctx && ctx.state && ctx.state.log) log(ctx.state, "script", "Script error: " + e.message);
    console.warn("Script error:", e && e.message);
  }
}

function scriptCtx(state, opts) {
  const ctx = {
    state,
    day: state.day,
    phase: state.phase,
    rand: (min, max) => min + randInt(Math.max(1, max - min + 1)),
    choose: (arr) => arr[randInt(arr.length)],
    byId: (id) => byId(state, id),
    isAlive,
    get: (t, k) => t.attributes[k],
    set: (t, k, v) => { t.attributes[k] = clamp(v, 0, 100); },
    add: (t, k, d) => { t.attributes[k] = clamp(t.attributes[k] + (d || 0), 0, 100); },
    setRel: (a, b, v) => { if (a && b) a.relationships[b.id] = clamp(v, -100, 100); },
    addRel: (a, b, d) => { if (a && b) a.relationships[b.id] = clamp((a.relationships[b.id] || 0) + (d || 0), -100, 100); },
    grant: (t, id) => { if (t) grantItem(t, id, 1); },
    grantLoot: (t, ids) => {
      if (!t) return null;
      const pool = (ids || []).map((i) => ITEMS_BY_ID[i]).filter((x) => x && x.enabled !== false);
      if (!pool.length) return null;
      const item = weightedPick(pool, (i) => i.weight);
      grantItem(t, item.id, 1);
      return item;
    },
    matches: (t, cond) => tributeMatches(t, cond),
    hasItem: (t, id) => !!(t && t.items[id] && t.items[id].qty > 0),
    tr: (key, vars) => tr(state, key, vars),
    hasCat: (t, cat) => {
      if (!t) return false;
      for (const id of Object.keys(t.items)) {
        const def = ITEMS_BY_ID[id];
        const st = t.items[id];
        if (def && def.cat === cat && st.qty > 0) return true;
      }
      return false;
    },
    pickTribute: (spec) => {
      if (typeof spec === "string") return pickTributeByTarget(state, spec);
      if (spec && spec.cond) return pickTributeByTarget(state, spec);
      if (spec && typeof spec === "object") return pickTributeByTarget(state, { cond: spec });
      return pickTributeByTarget(state, null);
    },
    any: (cond) => state.tributes.some((t) => isAlive(t) && tributeMatches(t, cond)),
    triggerEvent: (cat, tributeId) => {
      if (eventTriggerDepth > 3) return false;
      eventTriggerDepth++;
      try {
        return triggerEvent(state, cat, tributeId || null);
      } finally {
        eventTriggerDepth--;
      }
    },
    triggerGlobal: (id) => {
      if (eventTriggerDepth > 3) return false;
      eventTriggerDepth++;
      try {
        return triggerGlobalEvent(state, id);
      } finally {
        eventTriggerDepth--;
      }
    },
    fight: (a, b) => {
      if (eventTriggerDepth > 3) return false;
      eventTriggerDepth++;
      try {
        return triggerFight(state, a, b);
      } finally {
        eventTriggerDepth--;
      }
    },
    boss: () => {
      for (const g of state.activeGlobals) {
        if (g.boss && g.boss.health > 0) return g.boss;
      }
      return null;
    },
    bossName: () => {
      for (const g of state.activeGlobals) {
        if (g.boss && g.boss.health > 0) return bossNameOf(g.boss, state);
      }
      return "";
    },
    ally: (t, o) => { if (t && o) { const id = t.name + " & " + o.name; t.alliance = id; o.alliance = id; } },
    leaveAlliance: (t) => { if (t) t.alliance = null; },
    log: (text, changes) => log(state, "script", String(text), changes)
  };
  Object.assign(ctx, opts || {});
  return ctx;
}

function runGlobalHook(state, g, hook, extra) {
  const src = g.def.script && g.def.script[hook];
  if (!src) return;
  const ctx = scriptCtx(state, Object.assign({ g, memory: g.memory }, extra || {}));
  runHook(src, g.def.script.lang, ctx);
}

let damageHookDepth = 0;
let eventTriggerDepth = 0;

function runAbilityDamageHook(state, target, amount, attacker, cause) {
  if (target && !target.maxHealth && isAlive(target)) {
    runAbilityHook(state, target, "onDamage", { damage: { target, amount, attacker: attacker || null, cause: cause || null }, death: { tribute: target, killer: attacker || null } });
  }
}

function runDamageHooks(state, target, amount, attacker, cause) {
  if (!state.activeGlobals && !(target && target.ability)) return;
  if (damageHookDepth > 4) return;
  damageHookDepth++;
  try {
    runAbilityDamageHook(state, target, amount, attacker, cause);
    if (state.activeGlobals && state.activeGlobals.length) {
      for (const g of state.activeGlobals) {
        const src = g.def.script && g.def.script.onDamage;
        if (!src) continue;
        const isBoss = !!(target && target.maxHealth);
        const damage = { target, amount, attacker: attacker || null, cause: cause || null };
        if (isBoss) damage.remainingCount = target.remainingCount;
        const ctx = scriptCtx(state, { g, memory: g.memory, damage, death: { tribute: target, killer: attacker || null } });
        runHook(src, g.def.script.lang, ctx);
      }
    }
  } finally {
    damageHookDepth--;
  }
}

// ---------- mini-language ----------

function compileMini(src) {
  const lines = String(src).split("\n");
  let js = "";
  const depth = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;
    if (line === "end") {
      if (depth.length) { depth.pop(); js += "}\n"; }
      continue;
    }
    if (line === "else") {
      js += "} else {\n";
      continue;
    }
    let m;
    if ((m = line.match(/^if\s+(.+)$/))) {
      js += "if (" + compileMiniCond(m[1]) + ") {\n";
      depth.push("if");
      continue;
    }
    if ((m = line.match(/^set\s+([\w.]+)\s+to\s+(.+)$/))) {
      js += "memory." + m[1] + " = " + compileMiniValue(m[2]) + ";\n";
      continue;
    }
    if ((m = line.match(/^log\s+(.+)$/))) {
      js += compileMiniLog(m[1]) + "\n";
      continue;
    }
    if ((m = line.match(/^grant\s+(\S+)\s+(.+)$/))) {
      const ref = compileMiniRef(m[1]);
      for (const it of m[2].split(/[\s,]+/).filter(Boolean)) js += "grant(" + ref + ", \"" + it + "\");\n";
      continue;
    }
    if ((m = line.match(/^reward\s+(\S+)\s+(.+)$/))) {
      const ref = compileMiniRef(m[1]);
      const items = m[2].split(/[\s,]+/).filter(Boolean);
      if (items.length) js += "grantLoot(" + ref + ", [\"" + items.join("\",\"") + "\"]);\n";
      continue;
    }
    if ((m = line.match(/^ally\s+(\S+)\s+(\S+)$/))) {
      js += "ally(" + compileMiniRef(m[1]) + ", " + compileMiniRef(m[2]) + ");\n";
      continue;
    }
    if ((m = line.match(/^leave\s+(\S+)$/))) {
      js += "leaveAlliance(" + compileMiniRef(m[1]) + ");\n";
      continue;
    }
    if ((m = line.match(/^trigger\s+(\S+)$/))) {
      js += "triggerEvent(\"" + m[1] + "\");\n";
      continue;
    }
    if ((m = line.match(/^spawn\s+(\S+)$/))) {
      js += "triggerGlobal(\"" + m[1] + "\");\n";
      continue;
    }
    if ((m = line.match(/^fight\s+(\S+)\s+(\S+)$/))) {
      js += "fight(" + compileMiniRef(m[1]) + ", " + compileMiniRef(m[2]) + ");\n";
      continue;
    }
  }
  while (depth.length) { depth.pop(); js += "}\n"; }
  return js;
}

function compileMiniRef(w) {
  const om = w.match(/^others\[(\d+)\]$/);
  if (om) return "others[" + om[1] + "]";
  if (w === "self") return "self";
  if (w === "other") return "other";
  if (w === "others") return "others";
  if (w === "killer") return "(death.killer)";
  if (w === "victim") return "(death.tribute)";
  if (w === "target") return "(memory.target)";
  if (w === "random") return "pickTribute({})";
  if (w === "randomOther") return "pickTribute({excludeSelf:true})";
  return "(memory." + w + ")";
}

function compileMiniValue(v) {
  if (v === "true" || v === "false") return v;
  if (v === "random") return "pickTribute({})";
  if (v === "randomOther") return "pickTribute({excludeSelf:true})";
  return compileMiniRef(v);
}

function compileMiniCond(cond) {
  const t = cond.trim();
  if (t === "true" || t === "false") return t;
  let m;
  if ((m = t.match(/^(\S+)\s+is not\s+(\S+)$/))) {
    const a = compileMiniRef(m[1]);
    const b = m[2];
    if (b === "true" || b === "false") return "(" + a + " !== " + b + ")";
    if (b === "none" || b === "null") return "(!!(" + a + "))";
    const br = compileMiniRef(b);
    return "(!(" + a + ") || !(" + br + ") || " + a + ".id !== " + br + ".id)";
  }
  if ((m = t.match(/^(\S+)\s+is\s+(\S+)$/))) {
    const a = compileMiniRef(m[1]);
    const b = m[2];
    if (b === "true" || b === "false") return "(" + a + " === " + b + ")";
    if (b === "none" || b === "null") return "(!(" + a + "))";
    const br = compileMiniRef(b);
    return "(!!(" + a + ") && !!(" + br + ") && " + a + ".id === " + br + ".id)";
  }
  if ((m = t.match(/^(\S+)\.(alive|dead)$/))) {
    const ref = compileMiniRef(m[1]);
    return m[2] === "alive" ? "(!!(" + ref + ") && isAlive(" + ref + "))" : "(!!(" + ref + ") && !isAlive(" + ref + "))";
  }
  if ((m = t.match(/^(\S+)\s+(alive|dead)$/))) {
    const ref = compileMiniRef(m[1]);
    return m[2] === "alive" ? "(!!(" + ref + ") && isAlive(" + ref + "))" : "(!!(" + ref + ") && !isAlive(" + ref + "))";
  }
  if ((m = t.match(/^(\S+)\s+rel\s+(\S+)\s*(<=|>=|<|>|==|!=|=)\s*(-?\d+)$/))) {
    const a = compileMiniRef(m[1]);
    const b = compileMiniRef(m[2]);
    const op = m[3] === "=" ? "===" : m[3];
    return "(!!(" + a + ") && !!(" + b + ") && ((" + a + ".relationships[" + b + ".id] || 0) " + op + " " + m[4] + "))";
  }
  if ((m = t.match(/^(hasItem|hasCat)\s+(\S+)\s+(\S+)$/))) {
    return m[1] + "(" + compileMiniRef(m[2]) + ", \"" + m[3] + "\")";
  }
  if ((m = t.match(/^(\S+)\.(\w+)\s*(<=|>=|<|>|==|!=|=)\s*(-?\d+)$/))) {
    const ref = compileMiniRef(m[1]);
    const op = m[3] === "=" ? "===" : m[3];
    return "(" + ref + " && " + ref + ".attributes." + m[2] + " " + op + " " + m[4] + ")";
  }
  if ((m = t.match(/^(\S+)\s+(\S+)$/))) {
    const ref = compileMiniRef(m[1]);
    const word = m[2];
    if (["female", "male", "non-binary"].includes(word)) return "(" + ref + " && " + ref + ".gender === \"" + word + "\")";
    if (PERSONALITIES[word]) return "(" + ref + " && " + ref + ".personality === \"" + word + "\")";
  }
  return "(false)";
}

function compileMiniLog(text) {
  let t = String(text).trim();
  if ((t.startsWith("\"") && t.endsWith("\"")) || (t.startsWith("'") && t.endsWith("'"))) t = t.slice(1, -1);
  let js = "log(\"";
  let i = 0;
  while (i < t.length) {
    const ch = t[i];
    if (ch === "{") {
      const end = t.indexOf("}", i);
      if (end > -1) {
        const expr = miniNameExpr(t.slice(i + 1, end));
        if (expr) {
          js += "\" + " + expr + " + \"";
          i = end + 1;
          continue;
        }
      }
    }
    if (ch === "\"") js += "\\\"";
    else js += ch;
    i++;
  }
  return js + "\");";
}

function miniNameExpr(key) {
  const om = key.match(/^others\[(\d+)\]$/);
  if (om) return "(others && others[" + om[1] + "] ? others[" + om[1] + "].name : \"?\")";
  if (key === "self") return "self.name";
  if (key === "other") return "(other ? other.name : \"?\")";
  if (key === "killer") return "(death && death.killer ? death.killer.name : \"?\")";
  if (key === "victim") return "(death ? death.tribute.name : \"?\")";
  if (key === "target") return "(memory.target ? memory.target.name : \"?\")";
  if (key === "name") return "(self ? self.name : \"?\")";
  if (key === "boss") return "(bossName())";
  return null;
}

function runHook(src, lang, ctx) {
  const code = lang === "mini" ? compileMini(src) : src;
  runScript(code, ctx);
}

function evalMiniCond(cond, ctx) {
  if (typeof cond !== "string" || !cond.trim()) return false;
  try {
    const code = compileMiniCond(cond.trim());
    const sandbox = Object.assign({}, ctx);
    const context = vm.createContext(sandbox);
    return !!vm.runInContext("(" + code + ")", context, { timeout: SCRIPT_TIMEOUT, filename: "miniCond.js" });
  } catch (e) {
    return false;
  }
}

function outcomeText(state, evt, self, primary) {
  const outs = evt.outcome;
  if (!outs || !outs.length) return null;
  const ctx = scriptCtx(state, { self, other: primary, others: [], memory: {} });
  for (const o of outs) {
    if (!o.when || evalMiniCond(o.when, ctx)) return resolveTplVariant(o.tpl, state);
  }
  return null;
}

function pickOthersFrom(self, pool, count, cat) {
  const friendly = cat === "social" || cat === "night";
  let candidates = [...pool];
  if (cat === "fight" && self.alliance) candidates = candidates.filter((o) => o.alliance !== self.alliance);
  const picked = [];
  while (picked.length < count && candidates.length) {
    const chosen = weightedPick(candidates, (o) => {
      let w = friendly ? 60 + (self.relationships[o.id] || 0) : 60 - (self.relationships[o.id] || 0);
      if (friendly && self.alliance && o.alliance === self.alliance) w += 40;
      return Math.max(4, w) * (o.hidden ? 0.3 : 1) * abilityMult(o, "targetWeight");
    });
    picked.push(chosen);
    candidates.splice(candidates.indexOf(chosen), 1);
  }
  return picked;
}

function pickOthers(state, self, count, cat) {
  return pickOthersFrom(self, state.tributes.filter((t) => t.id !== self.id && isAlive(t)), count, cat);
}

function targetsToCount(targets) {
  if (Array.isArray(targets)) {
    const min = targets[0];
    const max = targets[1];
    return min + randInt(Math.max(1, max - min + 1));
  }
  return targets;
}

function adjustOthersToTargets(state, self, others, targets, cat) {
  if (targets === undefined || targets === null) return others;
  const wantOthers = Math.max(0, targetsToCount(targets) - 1);
  if (others.length >= wantOthers) return others.slice(0, wantOthers);
  const pool = state.tributes.filter((o) => isAlive(o) && o.id !== self.id && !others.some((x) => x.id === o.id));
  return others.concat(pickOthersFrom(self, pool, wantOthers - others.length, cat));
}

function pickSubEvent(state, evt, self, primary) {
  const subs = evt.subs;
  if (!subs || !subs.length) return null;
  const parentAny = evt.phase === "any";
  const phase = state.phase;
  let pool = subs.filter((s) => {
    if (parentAny) {
      const sp = s.phase;
      if (sp && sp !== "any" && sp !== phase) return false;
    }
    return true;
  });
  if (!pool.length) return null;
  const passing = pool.filter((s) => meetsCond(s, self, primary));
  if (passing.length) pool = passing;
  return weightedPick(pool, (s) => s.weight || evt.weight || 10);
}

function targetsMatch(targets, size) {
  if (targets === 1) return size === 1;
  if (Array.isArray(targets)) return size >= targets[0] && size <= targets[1];
  return targets === size;
}

function pickEvent(state, cat, phase, selfId, groupSize) {
  const self = byId(state, selfId);
  if (!self) return null;
  const others = pickOthers(state, self, Math.max(0, groupSize - 1), cat);
  const effectiveSize = others.length + 1;
  const primary = others[0] || null;
  let pool = POOL.filter(
    (e) => e.enabled !== false && e.cat === cat && (e.phase === phase || e.phase === "any") && targetsMatch(e.targets, effectiveSize) && !isEventDisabled(state, e)
  );
  const passing = pool.filter((e) => meetsCond(e, self, primary));
  if (passing.length) pool = passing;
  if (!pool.length) return null;
  return { evt: weightedPick(pool, (e) => e.weight), others };
}

function resolveEvent(state, self, cat, phase, preferredSize) {
  let size = preferredSize;
  while (size >= 1) {
    const r = pickEvent(state, cat, phase, self.id, size);
    if (r) return r;
    size -= 1;
  }
  return null;
}

function rollGroupSize() {
  const r = Math.random();
  if (r < 0.55) return 2;
  if (r < 0.85) return 3;
  return 4;
}

function formatOthers(list) {
  if (!list.length) return "...";
  const names = list.map((o) => o.name);
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
}

function formatOthersTpl(text, others) {
  let t = String(text);
  t = t.replace(/\{others\[(\d+)\]\}/g, (m, i) => {
    const o = others[Number(i)];
    return o ? o.name : "...";
  });
  t = t.replace(/\{others\}/g, formatOthers(others));
  return t;
}

function warmthValue(t) {
  let w = t.shelter ? 2 : 0;
  for (const id of Object.keys(t.items)) {
    const def = ITEMS_BY_ID[id];
    const st = t.items[id];
    if (def && def.warm && st.qty > 0) w += def.warm;
  }
  return w;
}

function computeGoal(state, t) {
  const a = t.attributes;
  const mods = BIOMES[state.map.biome] || BIOMES.forest;
  const coldThreat = mods.nightCold > 0 && warmthValue(t) === 0;
  if (a.food < 20 || (a.food < 40 && scarcityOf(state, "provisions") >= 60)) {
    return { key: "find_food" };
  }
  if (coldThreat) return { key: "stay_warm" };
  const boss = activeBoss(state);
  if (boss && isBossSlayerCandidate(state, t)) {
    return { key: "slay_boss", name: bossNameOf(boss, state) };
  }
  const others = state.tributes.filter((o) => o.id !== t.id && isAlive(o));
  const threats = others.filter((o) => (t.relationships[o.id] || 0) <= -20 && o.attributes.combat >= a.combat - 10);
  if (threats.length) {
    const strongest = threats.reduce((x, y) => (y.attributes.combat > x.attributes.combat ? y : x));
    return { key: "deal_with_enemy", name: strongest.name };
  }
  if (a.health < 40 || a.energy < 35) return { key: "recover" };
  const allies = others.filter((o) => (t.relationships[o.id] || 0) >= 40);
  if (allies.length && a.morale < 60) {
    const closest = allies.reduce((x, y) => ((t.relationships[y.id] || 0) > (t.relationships[x.id] || 0) ? y : x));
    return { key: "strengthen_bonds", name: closest.name };
  }
  if (a.supplies < 25) return { key: "stock_up" };
  return null;
}

function applyGoalWeights(w, goal) {
  switch (goal.key) {
    case "find_food": w.gather += 14; break;
    case "stay_warm": w.build += 12; w.gather += 8; break;
    case "deal_with_enemy": w.fight += 10; w.scout += 6; break;
    case "slay_boss": w.fight += 14; w.scout += 4; break;
    case "recover": w.rest += 14; break;
    case "strengthen_bonds": w.social += 12; break;
    case "stock_up": w.scout += 8; w.gather += 4; break;
  }
}

function actionWeights(state, t) {
  const w = { gather: 10, scout: 10, build: 10, fight: 10, social: 10, rest: 10 };
  const adj = PERSONALITIES[t.personality];
  if (adj && adj.weights) {
    for (const k of Object.keys(adj.weights)) w[k] = Math.max(1, w[k] + adj.weights[k]);
  }
  const ab = activeAbility(t);
  if (ab && ab.weights) {
    for (const k of Object.keys(ab.weights)) w[k] = Math.max(1, w[k] + ab.weights[k]);
  }
  const a = t.attributes;
  if (a.food < 40) w.gather += 8;
  if (a.food < 20) w.gather += 8;
  if (a.energy < 35) w.rest += 12;
  if (a.health < 40) w.rest += 8;
  if (a.supplies < 25) {
    w.gather += 4;
    w.scout += 4;
  }
  if (a.combat >= 70) w.fight += 8;
  if (a.morale < 30) {
    w.social += 5;
    w.rest += 3;
  }
  const alive = state.tributes.filter((o) => o.alive && o.id !== t.id);
  if (alive.some((o) => (t.relationships[o.id] || 0) <= -40)) w.fight += 8;
  if (alive.some((o) => (t.relationships[o.id] || 0) >= 40)) w.social += 8;
  if (alive.length <= 3) w.fight += 8;
  const goal = computeGoal(state, t);
  t.goal = goal || null;
  if (goal) applyGoalWeights(w, goal);
  return w;
}

function pickAction(state, t) {
  const w = actionWeights(state, t);
  return weightedPick(ACTIONS, (a) => w[a]);
}

// ---------- inventory helpers ----------

function grantItem(t, id, qty) {
  if (!t) return;
  const def = ITEMS_BY_ID[id];
  if (!def) return;
  const st = t.items[id] || { qty: 0, dur: def.dur || 0 };
  st.qty += qty;
  if (def.dur) st.dur = def.dur;
  t.items[id] = st;
}

function consumeItem(t, id, qty) {
  const st = t.items[id];
  if (!st) return;
  st.qty -= qty;
  if (st.qty <= 0) delete t.items[id];
}

function degradeItem(t, id, amount) {
  const def = ITEMS_BY_ID[id];
  const st = t.items[id];
  if (!def || !st || !def.dur) return;
  st.dur -= amount || 12;
  if (st.dur <= 0) {
    st.qty -= 1;
    if (st.qty <= 0) delete t.items[id];
    else st.dur = def.dur;
  }
}

function weaponStrikes(w) {
  return w && w.spd != null ? Math.max(1, Math.round(Number(w.spd)) || 1) : 1;
}

function weaponDmg(def, roll) {
  const raw = def && def.dmg != null ? def.dmg : 4;
  const v = roll ? rollRange(raw) : (Array.isArray(raw) ? Math.round((raw[0] + raw[1]) / 2) : raw);
  return Math.max(1, Number(v) || 4);
}

function bestWeapon(t) {
  let best = null;
  let bestVal = 0;
  for (const id of Object.keys(t.items)) {
    const st = t.items[id];
    if (st.qty <= 0) continue;
    const def = ITEMS_BY_ID[id];
    if (!def || !WEAPON_CATS.includes(def.cat)) continue;
    if (def.dur && st.dur <= 0) continue;
    const val = weaponDmg(def, false) * weaponStrikes(def) * profFactor(t.proficiencies[def.cat]);
    if (val > bestVal) {
      bestVal = val;
      best = def;
    }
  }
  return best;
}

function bestItem(t, cats, key) {
  let best = null;
  let bestVal = -1;
  for (const id of Object.keys(t.items)) {
    const st = t.items[id];
    if (st.qty <= 0) continue;
    const def = ITEMS_BY_ID[id];
    if (!def || !cats.includes(def.cat)) continue;
    if (def.dur && st.dur <= 0) continue;
    const rawVal = def[key] || def.feed || def.heal || def.dmg || 1;
    const val = Array.isArray(rawVal) ? Math.round((rawVal[0] + rawVal[1]) / 2) : rawVal;
    if (val > bestVal) {
      bestVal = val;
      best = def;
    }
  }
  return best;
}

function hasTool(t) {
  for (const id of Object.keys(t.items)) {
    const def = ITEMS_BY_ID[id];
    const st = t.items[id];
    if (def && def.cat === "tool" && st.qty > 0 && st.dur > 0) return true;
  }
  return false;
}

function bumpProf(t, cat, n) {
  if (cat in t.proficiencies) t.proficiencies[cat] = clamp(t.proficiencies[cat] + n, 0, 100);
}

function scavenge(state, t, action) {
  const table = LOOT_TABLE[action];
  if (!table) return;
  const pool = table.map((id) => ITEMS_BY_ID[id]).filter((x) => x && x.enabled !== false);
  if (!pool.length) return;
  const item = weightedPick(pool, (i) => i.weight);
  grantItem(t, item.id, 1);
  t.stats.scavenges += 1;
  log(state, "loot", tr(state, "scavenge", { name: t.name, item: itemNameLC(item, state) }), tr(state, "found", { name: t.name, item: itemNameLC(item, state) }));
}

function sponsorGift(state) {
  const alive = state.tributes.filter(isAlive);
  if (!alive.length) return;
  const t = alive[randInt(alive.length)];
  const pool = activeItems();
  if (!pool.length) return;
  const item = weightedPick(pool, (i) => i.weight);
  grantItem(t, item.id, 1);
  t.stats.gifts += 1;
  log(state, "gift", tr(state, "gift", { name: t.name, item: itemNameLC(item, state) }));
}

function autoEat(state, t) {
  if (t.attributes.food >= 50) return;
  const item = bestItem(t, ["provisions"], "feed");
  if (!item) return;
  const gain = Math.max(1, Math.round(item.feed * profFactor(t.attributes.survival)));
  t.attributes.food = clamp(t.attributes.food + gain, 0, 100);
  consumeItem(t, item.id, 1);
  log(state, "eat", tr(state, "eat", { name: t.name, item: itemNameLC(item, state) }), t.name + ": +" + gain + " " + statName(state, "food"));
}

function autoTreat(state, t) {
  if (t.attributes.health >= 45) return;
  const item = bestItem(t, ["medical"], "heal");
  if (!item) return;
  const gain = Math.max(1, Math.round(item.heal * profFactor(t.proficiencies.medical)));
  t.attributes.health = clamp(t.attributes.health + gain, 0, 100);
  consumeItem(t, item.id, 1);
  bumpProf(t, "medical", 1);
  log(state, "med", tr(state, "treat", { name: t.name, item: itemNameLC(item, state) }), t.name + ": +" + gain + " " + statName(state, "health"));
}

// ---------- events ----------

function rollRange(v) {
  if (Array.isArray(v)) return v[0] + randInt(Math.max(1, v[1] - v[0] + 1));
  return v;
}

function applyFx(state, t, fx, scale, cause, attacker) {
  const scaleFactor = (skill) => 0.75 + skill / 400;
  const parts = [];
  for (const key of Object.keys(fx)) {
    if (!(key in t.attributes)) continue;
    let d = rollRange(fx[key]);
    if (scale && scale[key]) d = Math.round(d * scaleFactor(t.attributes[scale[key]] || 0));
    const gm = globalModsFor(state, key);
    if (d > 0) {
      d += gm.buff;
      d -= gm.nerf;
      if (d < 0) d = 0;
    } else if (d < 0) {
      d -= gm.nerf;
    }
    if (key === "health" && d < 0) {
      const before = t.attributes.health;
      const armor = bestItem(t, ["armor"], "prot");
      if (armor) {
        const reduced = Math.round(d + armor.prot);
        d = Math.min(0, reduced);
        degradeItem(t, armor.id);
      }
      if (d < 0 && cause) t._cause = cause;
      if (attacker && t.attributes.health + d <= 0) t._killer = attacker;
      t.attributes[key] = clamp(t.attributes[key] + d, 0, 100);
      const dealt = before - t.attributes[key];
      if (dealt > 0) runDamageHooks(state, t, dealt, attacker, cause);
    } else {
      t.attributes[key] = clamp(t.attributes[key] + d, 0, 100);
    }
    parts.push((d >= 0 ? "+" : "") + d + " " + statName(state, key));
  }
  return parts.length ? t.name + ": " + parts.join(", ") : "";
}

function bestArmor(t) {
  return bestItem(t, ["armor"], "prot");
}

function endureCold(state, t, cold) {
  let warmth = 0;
  const resist = activeAbility(t) && activeAbility(t).coldResist ? activeAbility(t).coldResist : 0;
  cold = Math.max(0, cold - resist);
  const fuel = bestItem(t, ["fuel"], "warm");
  if (fuel) {
    warmth += fuel.warm || 0;
    consumeItem(t, fuel.id, 1);
  }
  const flint = bestItem(t, ["tool"], "warm");
  if (flint && flint.warm) warmth += flint.warm;
  const gear = bestItem(t, ["armor"], "warm");
  if (gear && gear.warm) warmth += gear.warm;
  if (t.shelter) warmth += 2;
  const remaining = Math.max(0, cold - warmth);
  let healthDamage = 0;
  if (remaining > 0) {
    const cost = remaining * 6;
    const paid = Math.min(t.attributes.energy, cost);
    t.attributes.energy = clamp(t.attributes.energy - paid, 0, 100);
    const shortfall = cost - paid;
    if (shortfall > 0) {
      healthDamage = Math.ceil(shortfall / 6);
      t.attributes.morale = clamp(t.attributes.morale - 2, 0, 100);
    } else {
      t.attributes.morale = clamp(t.attributes.morale - 1, 0, 100);
    }
  }
  return healthDamage;
}

function nightlyCold(state, t, cold) {
  const damage = endureCold(state, t, cold);
  if (damage > 0) {
    t._cause = "cold";
    t.attributes.health = clamp(t.attributes.health - damage, 0, 100);
  }
}

function scarcityOf(state, key) {
  const m = state.map && state.map.scarcity;
  return m && m[key] ? m[key] : 0;
}

function scarcityChance(state, key) {
  return Math.max(0.1, 1 - scarcityOf(state, key) / 100);
}

function applyWeather(state) {
  const alive = state.tributes.filter(isAlive);
  if (!alive.length) return;
  const w = WEATHER_POOL[randInt(WEATHER_POOL.length)];
  const main = alive[randInt(alive.length)];
  const victims = alive.length > 1 && Math.random() < 0.5
    ? pickOthers(state, main, 1, "survive").filter((v) => v && v.id !== main.id)
    : [];
  const targets = [main].concat(victims);
  const changes = [];
  for (const t of targets) {
    const fx = Object.assign({}, w.fx);
    if (w.cold && fx.health < 0) {
      const cold = -fx.health;
      const warmth = endureCold(state, t, cold);
      fx.health = -Math.max(0, cold - warmth);
    }
    const s = applyFx(state, t, fx, null, "survive");
    if (s) changes.push(s);
  }
  log(state, "weather", resolveTplVariant(w.tpl, state), changes.join(" \u00B7 "));
}

function maybeReplenish(state) {
  if (!state.map.replenish || state.map.replenished) return;
  if (Math.random() >= 0.12) return;
  state.map.replenished = true;
  for (const k of Object.keys(state.map.scarcity)) state.map.scarcity[k] = 0;
  const alive = state.tributes.filter(isAlive);
  const grants = [];
  const pool = activeItems();
  if (!pool.length) return;
  for (const t of alive) {
    const n = 1 + randInt(2);
    for (let i = 0; i < n; i++) {
      const item = weightedPick(pool, (it) => it.weight);
      grantItem(t, item.id, 1);
      grants.push(t.name + ": " + itemNameLC(item, state));
    }
  }
  log(state, "replenish", tr(state, "replenish"), grants.join(" \u00B7 "));
}

// ---------- global events ----------

function durationRemaining(d) {
  const type = d ? d.type : "full_days";
  if (type === "endless") return { days: Infinity, nights: Infinity };
  const value = Math.max(1, d && d.value ? d.value : 1);
  if (type === "days") return { days: value, nights: 0 };
  if (type === "nights") return { days: 0, nights: value };
  return { days: value, nights: value };
}

function triggeredGlobalCount(state) {
  return Object.keys(state.globalsTriggered).reduce((s, k) => s + state.globalsTriggered[k], 0);
}

function triggeredBossCount(state) {
  let n = 0;
  for (const id of Object.keys(state.globalsTriggered)) {
    if (GLOBAL_EVENTS.some((g) => g.id === id && g.boss)) n += state.globalsTriggered[id];
  }
  return n;
}

function spawnGlobal(state, candidate) {
  state.globalsTriggered[candidate.id] = (state.globalsTriggered[candidate.id] || 0) + 1;
  if (candidate.boss) state.bossSpawned = true;
  const g = {
    id: candidate.id,
    def: JSON.parse(JSON.stringify(candidate)),
    remaining: durationRemaining(candidate.duration),
    memory: {}
  };
  state.activeGlobals.push(g);
  if (candidate.boss) {
    const b = candidate.boss;
    const count = Math.max(1, b.count || 1);
    const hp = (b.attributes && b.attributes.health) || 100;
    g.boss = {
      name: b.name,
      emoji: b.emoji || "\u{1F479}",
      count: count,
      maxHealth: hp * count,
      health: hp * count,
      morale: (b.attributes && b.attributes.morale) != null ? b.attributes.morale : 80,
      combat: (b.attributes && b.attributes.combat) != null ? b.attributes.combat : 60,
      stealth: (b.attributes && b.attributes.stealth) != null ? b.attributes.stealth : 30,
      defense: (b.attributes && b.attributes.defense) != null ? clamp(b.attributes.defense, 0, 100) : 0,
      weapons: normalizeBossWeapons(b),
      weapon: normalizeBossWeapons(b)[0],
      damageMult: b.damageMult != null ? clamp(Number(b.damageMult) || 0, 0, 5) : 1,
      retaliate: b.retaliate !== false,
      behaviors: b.behaviors || [],
      explosion: b.explosion != null ? Math.max(0, Number(b.explosion) || 0) : 0,
      remainingCount: count,
      participants: {}
    };
  }
  log(state, "global", resolveTplVariant(candidate.tpl, state));
  runGlobalHook(state, g, "onStart");
}

function maybeTriggerGlobal(state) {
  if (!GLOBAL_EVENTS.length) return;
  const mode = state.settings.winMode || "hg";
  const bossMin = state.map.bossMinDay;
  if (mode === "boss_slayer" && bossMin != null && state.day >= bossMin && triggeredBossCount(state) < Math.max(1, state.map.bossCount != null ? state.map.bossCount : 1)) {
    const bossPool = GLOBAL_EVENTS.filter((g) => g.enabled !== false && g.boss && (!g.maxTriggers || (state.globalsTriggered[g.id] || 0) < g.maxTriggers));
    if (bossPool.length) spawnGlobal(state, weightedPick(bossPool, (g) => g.weight || 10));
    return;
  }
  if (!state.map.globalEvents) return;
  if (state.activeGlobals.length) return;
  const count = triggeredGlobalCount(state);
  if (state.map.globalsMax != null && count >= state.map.globalsMax) return;
  const pool = GLOBAL_EVENTS.filter((g) => {
    if (g.enabled === false) return false;
    if (!g.maxTriggers) return true;
    return (state.globalsTriggered[g.id] || 0) < g.maxTriggers;
  });
  if (!pool.length) return;
  const candidate = weightedPick(pool, (g) => g.weight || 10);
  const chance = candidate.chance != null ? candidate.chance : 0.1;
  const force = state.map.globalsMin != null && count < state.map.globalsMin;
  if (!force && Math.random() >= chance) return;
  spawnGlobal(state, candidate);
}

// ---------- dev/debug helpers (used by /api/dev/*, guarded by settings.devMode) ----------

function triggerGlobalEvent(state, id) {
  const candidate = GLOBAL_EVENTS.find((g) => g.id === id);
  if (!candidate) return false;
  spawnGlobal(state, candidate);
  return true;
}

function triggerEvent(state, cat, tributeId) {
  const alive = state.tributes.filter(isAlive);
  const self = tributeId ? byId(state, tributeId) : (alive.length ? alive[randInt(alive.length)] : null);
  if (!self || !isAlive(self)) return false;
  const phase = state.phase === "night" ? "night" : "day";
  const r = resolveEvent(state, self, cat, phase, rollGroupSize());
  if (!r) return false;
  const applied = applyEvent(state, r.evt, self.id, r.others);
  if (applied) log(state, applied.cat, applied.text, applied.changes);
  checkDeaths(state);
  return true;
}

function triggerFight(state, a, b) {
  if (!a || !b || a.id === b.id || !isAlive(a) || !isAlive(b)) return false;
  const phase = state.phase === "night" ? "night" : "day";
  const pool = POOL.filter((e) => e.enabled !== false && e.cat === "fight" && !e.target && (e.phase === phase || e.phase === "any") && targetsMatch(e.targets, 2) && !isEventDisabled(state, e));
  if (!pool.length) return false;
  const evt = weightedPick(pool, (e) => e.weight);
  const applied = applyEvent(state, evt, a.id, [b]);
  if (applied) log(state, applied.cat, applied.text, applied.changes);
  checkDeaths(state);
  return true;
}

function forceWeather(state) {
  if (!state.map.weather) state.map.weather = true;
  applyWeather(state);
  return true;
}

function devGrantItem(state, tributeId, itemId, remove) {
  const t = byId(state, tributeId);
  if (!t || !ITEMS_BY_ID[itemId]) return false;
  if (remove) consumeItem(t, itemId, 1);
  else grantItem(t, itemId, 1);
  return true;
}

function globalRunsInPhase(state, g) {
  const key = state.phase === "night" ? "nights" : "days";
  return (g.remaining && g.remaining[key] || 0) > 0;
}

function isEventDisabled(state, e) {
  for (const g of state.activeGlobals) {
    if (!globalRunsInPhase(state, g)) continue;
    const dis = g.def.disable || [];
    for (const d of dis) {
      if (d === e.id) return true;
      if (typeof d === "string" && d.startsWith("cat:") && d.slice(4) === e.cat) return true;
    }
  }
  return false;
}

function globalModsFor(state, key) {
  let buff = 0;
  let nerf = 0;
  for (const g of state.activeGlobals) {
    if (!globalRunsInPhase(state, g)) continue;
    const m = g.def.mods || {};
    if (m.buff && m.buff[key]) buff += m.buff[key];
    if (m.nerf && m.nerf[key]) nerf += m.nerf[key];
  }
  return { buff, nerf };
}

function applyGlobalReplace(state, t, list) {
  const pool = list.filter(Boolean);
  if (!pool.length) return;
  const base = weightedPick(pool, (e) => e.weight || 10);
  const evt = Object.assign({ cat: "global", targets: 1, weight: 10 }, base);
  const count = targetsToCount(evt.targets) - 1;
  const others = pickOthers(state, t, Math.max(0, count), evt.cat);
  const applied = applyEvent(state, evt, t.id, others);
  if (applied) log(state, applied.cat, applied.text, applied.changes);
}

function applyAddons(state, addons) {
  const pool = addons.filter(Boolean);
  if (!pool.length) return;
  const targeted = pool.filter((a) => a.target);
  const normal = pool.filter((a) => !a.target);
  const finishText = (tpl, self, others) => {
    let text = resolveTplVariant(tpl, state);
    text = text.replace(/\{self\}/g, self.name);
    text = text.replace(/\{other\}/g, others.length ? others[0].name : "...");
    text = formatOthersTpl(text, others);
    text = text.replace(/\{group\}/g, formatOthers([self, ...others]));
    return text;
  };
  for (const a of targeted) {
    const subject = pickTributeByTarget(state, a.target);
    if (!subject) continue;
    if (a.script) {
      const src = typeof a.script === "string" ? a.script : a.script.onEvent;
      if (src) {
        const lang = a.script && typeof a.script === "object" ? a.script.lang : null;
        runHook(src, lang, scriptCtx(state, { self: subject, other: null, others: [], event: a, memory: {} }));
      }
    }
    const changes = [];
    const s1 = applyFx(state, subject, a.fx || {}, null, "global");
    if (s1) changes.push(s1);
    const s2 = applyFx(state, subject, a.fxBoth || {}, null, "global");
    if (s2) changes.push(s2);
    if (a.loot && a.loot.length) {
      const itemPool = a.loot.map((id) => ITEMS_BY_ID[id]).filter((x) => x && x.enabled !== false);
      if (itemPool.length) {
        const item = weightedPick(itemPool, (i) => i.weight);
        grantItem(subject, item.id, 1);
        changes.push(tr(state, "found", { name: subject.name, item: itemNameLC(item, state) }));
      }
    }
    log(state, "global", finishText(a.tpl, subject, []), changes.join(" \u00B7 "));
  }
  const alive = state.tributes.filter(isAlive);
  for (const t of alive) {
    if (!normal.length) break;
    const addon = weightedPick(normal, (a) => a.weight || 10);
    const wantOthers = Math.max(0, targetsToCount(addon.targets) - 1);
    const others = wantOthers > 0 ? pickOthers(state, t, wantOthers, "social") : [];
    if (addon.script) {
      const src = typeof addon.script === "string" ? addon.script : addon.script.onEvent;
      if (src) {
        const lang = addon.script && typeof addon.script === "object" ? addon.script.lang : null;
        runHook(src, lang, scriptCtx(state, { self: t, other: others[0] || null, others, event: addon, memory: {} }));
      }
    }
    const changes = [];
    const s1 = applyFx(state, t, addon.fx || {}, null, "global");
    if (s1) changes.push(s1);
    if (addon.loot && addon.loot.length) {
      const itemPool = addon.loot.map((id) => ITEMS_BY_ID[id]).filter((x) => x && x.enabled !== false);
      if (itemPool.length) {
        const item = weightedPick(itemPool, (i) => i.weight);
        grantItem(t, item.id, 1);
        changes.push(tr(state, "found", { name: t.name, item: itemNameLC(item, state) }));
      }
    }
    if (addon.fxBoth) {
      const s = applyFx(state, t, addon.fxBoth, null, "global");
      if (s) changes.push(s);
      for (const o of others) {
        const so = applyFx(state, o, addon.fxBoth, null, "global");
        if (so) changes.push(so);
      }
    }
    if (addon.fxOther) {
      for (const o of others) {
        const so = applyFx(state, o, addon.fxOther, null, "global");
        if (so) changes.push(so);
      }
    }
    if (addon.rel) {
      for (const o of others) t.relationships[o.id] = clamp((t.relationships[o.id] || 0) + addon.rel, -100, 100);
    }
    if (addon.relRev) {
      for (const o of others) o.relationships[t.id] = clamp((o.relationships[t.id] || 0) + (addon.relRev != null ? addon.relRev : addon.rel), -100, 100);
    }
    log(state, "global", finishText(addon.tpl, t, others), changes.join(" \u00B7 "));
  }
}

function tickGlobals(state, phaseType) {
  for (const g of state.activeGlobals) {
    if (phaseType === "day") g.remaining.days = Math.max(0, g.remaining.days - 1);
    else g.remaining.nights = Math.max(0, g.remaining.nights - 1);
  }
  const ended = state.activeGlobals.filter((g) => g.remaining.days === 0 && g.remaining.nights === 0);
  for (const g of ended) endGlobal(state, g);
}

function globalPhase(state, phaseType) {
  const key = phaseType + "s";
  return state.activeGlobals.filter((g) => g.remaining[key] > 0);
}

function bossNameOf(boss, state) {
  return resolveTplVariant(boss.name, state) || "boss";
}

const BOSS_WEAPON_MULT = { melee: 1, ranged: 1.2, explosive: 1.4 };

function normalizeBossDmg(d) {
  if (Array.isArray(d)) {
    const a = Math.max(1, Number(d[0]) || 8);
    const b = Math.max(a, Number(d[1]) || a);
    return [a, b];
  }
  return Math.max(1, Number(d) || 8);
}

function normalizeBossWeapons(b) {
  const defs = Array.isArray(b.weapons) ? b.weapons : (b.weapon ? [b.weapon] : [null]);
  const list = defs.filter((w) => w && typeof w === "object").map((w) => ({
    cat: ["melee", "ranged", "explosive"].includes(w.cat) ? w.cat : "melee",
    dmg: normalizeBossDmg(w.dmg),
    spd: weaponStrikes(w)
  }));
  return list.length ? list : [{ cat: "melee", dmg: 8, spd: 1 }];
}

function pickBossWeapon(b) {
  const list = (b && b.weapons && b.weapons.length) ? b.weapons : [{ cat: "melee", dmg: 8 }];
  return list[randInt(list.length)];
}

function bossPower(b, weapon) {
  const w = weapon || pickBossWeapon(b);
  return (b.combat * 0.3 + weaponDmg(w, true) * (0.5 + b.combat / 200)) * (BOSS_WEAPON_MULT[w.cat] || 1);
}

function activeBoss(state) {
  for (const g of state.activeGlobals) {
    if (g.boss && g.boss.health > 0) return g.boss;
  }
  return null;
}

function anyLivingBoss(state) {
  return state.activeGlobals.some((g) => g.boss && g.boss.health > 0);
}

function bossReadiness(t) {
  const weapon = bestWeapon(t);
  const wBonus = weapon ? weaponDmg(weapon, false) * weaponStrikes(weapon) * profFactor(t.proficiencies[weapon.cat]) : 0;
  const a = t.attributes;
  const state = (a.health / 100) * (a.morale / 100) * (0.5 + 0.5 * (a.energy / 100));
  return Math.round((a.combat * 0.6 + wBonus) * (0.4 + 0.6 * state));
}

function isBossSlayerCandidate(state, t) {
  const bold = ["warrior", "hunter", "strategist"].includes(t.personality);
  const a = t.attributes;
  if (bold && bossReadiness(t) >= 20) return true;
  if (a.combat >= 55 && a.morale >= 40 && a.health >= 40) return true;
  return bossReadiness(t) >= 45;
}

function endGlobal(state, g) {
  runGlobalHook(state, g, "onEnd");
  state.activeGlobals = state.activeGlobals.filter((x) => x !== g);
  if (g.def.endTpl) log(state, "global", resolveTplVariant(g.def.endTpl, state));
  if ((state.settings.winMode || "hg") === "boss_slayer" && g.boss && g.boss.health > 0 && state.phase !== "finished" && !anyLivingBoss(state)) {
    finishGame(state, []);
  }
}

function resolveBoss(state, g) {
  const b = g.boss;
  if (!b || b.health <= 0) return true;
  const alive = state.tributes.filter(isAlive);
  if (!alive.length) return false;
  const bname = bossNameOf(b, state);
  const btpl = (key, vars) => tr(state, key, Object.assign({ boss: bname }, vars || {}));

  if (b.behaviors.includes("drain")) {
    const hits = [];
    for (const t of alive) {
      t.attributes.food = clamp(t.attributes.food - 4, 0, 100);
      t.attributes.supplies = clamp(t.attributes.supplies - 3, 0, 100);
      hits.push(t.name + " food/supplies");
    }
    log(state, "boss", btpl("bossDrain"), hits.join(", "));
  }

  if (b.behaviors.includes("steal")) {
    const victim = alive[randInt(alive.length)];
    const ids = Object.keys(victim.items).filter((id) => ITEMS_BY_ID[id] && victim.items[id].qty > 0);
    if (ids.length) {
      const id = ids[randInt(ids.length)];
      consumeItem(victim, id, 1);
      log(state, "boss", btpl("bossSteal", { victim: victim.name }), victim.name + ": " + itemNameLC(ITEMS_BY_ID[id], state));
    }
  }

  if (b.behaviors.includes("patrol")) {
    let pool = state.tributes.filter((t) => isAlive(t) && t.attributes.health > 0);
    let attacks = Math.min(
      Math.max(1, b.remainingCount || (b.count || 1)) + (b.morale >= 70 ? 1 : 0),
      pool.length
    );
    while (attacks-- > 0 && pool.length) {
      const idx = randInt(pool.length);
      const victim = pool[idx];
      pool.splice(idx, 1);
      const surprise = b.stealth > victim.attributes.stealth;
      const weapon = pickBossWeapon(b);
      const power = bossPower(b, weapon);
      const strikes = weaponStrikes(weapon);
      const before = victim.attributes.health;
      for (let s = 0; s < strikes; s++) {
        if (victim.attributes.health <= 0) break;
        const dmg = Math.round(power * (b.damageMult != null ? b.damageMult : 1) * (0.45 + (surprise ? 0.25 : 0)) * (0.5 + b.morale / 200));
        applyFx(state, victim, { health: -dmg }, null, "boss");
      }
      const dealt = before - victim.attributes.health;
      pool = pool.filter((t) => t.attributes.health > 0);
      if (dealt > 0) log(state, "boss", btpl(surprise ? "bossAmbush" : "bossPatrol", { victim: victim.name }), victim.name + ": -" + dealt + " " + statName(state, "health"));
    }
  }

  const hunters = alive.filter((t) => t.goal && t.goal.key === "slay_boss");
  if (hunters.length) {
    const squad = hunters.length > 1;
    const changes = [];
    for (const hunter of hunters) {
      const weapon = bestWeapon(hunter);
      const wBonus = weapon ? Math.round(weaponDmg(weapon, true) * weaponStrikes(weapon) * profFactor(hunter.proficiencies[weapon.cat])) : 0;
      const def = b.defense != null ? clamp(b.defense, 0, 100) : 0;
      const squadDef = Math.min(200, def * (0.5 + 0.5 * (b.count || 1)));
      const mitigation = Math.max(0.1, 1 - squadDef / 200);
      const dmgToBoss = Math.round((hunter.attributes.combat * 0.6 + wBonus) * mitigation * veteranMult(hunter) * abilityMult(hunter, "damageDealt"));
      b.health = Math.max(0, b.health - dmgToBoss);
      b.remainingCount = Math.ceil((b.health * (b.count || 1)) / b.maxHealth);
      b.participants[hunter.id] = true;
      hunter.stats.damage = (hunter.stats.damage || 0) + dmgToBoss;
      if (dmgToBoss > 0) runDamageHooks(state, b, dmgToBoss, hunter, "fight");
      runAbilityHook(state, hunter, "onDeal", { damage: { target: b, amount: dmgToBoss, cause: "boss" } });
      const unitStrength = 0.75 + 0.25 * (b.remainingCount || 1);
      let dmgToHunter = 0;
      if (b.retaliate !== false) {
        const bossWeapon = pickBossWeapon(b);
        const bossPowerVal = bossPower(b, bossWeapon);
        const bossStrikes = weaponStrikes(bossWeapon);
        const hunterBefore = hunter.attributes.health;
        for (let s = 0; s < bossStrikes; s++) {
          if (hunter.attributes.health <= 0) break;
          const strike = Math.round(bossPowerVal * (b.damageMult != null ? b.damageMult : 1) * (0.5 + b.morale / 200) * unitStrength * (squad ? 0.55 : 1) * veteranTakenMult(hunter) * abilityMult(hunter, "damageTaken"));
          applyFx(state, hunter, { health: -strike }, null, "boss");
        }
        dmgToHunter = hunterBefore - hunter.attributes.health;
      }
      hunter.stats.fights += 1;
      hunter.stats.experience = (hunter.stats.experience || 0) + 1;
      b.morale = clamp(b.morale - 6, 0, 100);
      if (dmgToBoss > 0) changes.push(bname + ": -" + dmgToBoss + " " + tr(state, "stat.health"));
      if (dmgToHunter > 0) changes.push(hunter.name + ": -" + dmgToHunter + " " + statName(state, "health"));
    }
    if (squad) {
      log(state, "boss", btpl("bossSquad", { squad: hunters.map((t) => t.name).join(", ") }), changes.join(" \u00B7 "));
    } else {
      const weapon = bestWeapon(hunters[0]);
      const text = weapon
        ? btpl("bossHuntWeapon", { hunter: hunters[0].name, weapon: itemNameLC(weapon, state) })
        : btpl("bossHunt", { hunter: hunters[0].name });
      log(state, "boss", text, changes.join(" \u00B7 "));
    }
  }

  if (b.health <= 0) {
    b.health = 0;
    runGlobalHook(state, g, "onSlay");
    const survivors = state.tributes.filter(isAlive);
    const blast = b.explosion || 0;
    if (blast > 0) {
      const victims = survivors.filter((t) => b.participants && b.participants[t.id]);
      const changes = [];
      for (const v of victims) {
        const before = v.attributes.health;
        const s1 = applyFx(state, v, { health: -blast }, null, "boss");
        if (s1) changes.push(s1);
        if (v.attributes.health <= 0 && before > 0) v._cause = "boss";
      }
      if (changes.length) log(state, "boss", btpl("bossBlast", { victims: victims.map((t) => t.name).join(", ") }), changes.join(" \u00B7 "));
    }
    for (const t of survivors) {
      const pool = activeItems().filter((i) => i.weight);
      if (!pool.length) break;
      const item = weightedPick(pool, (i) => i.weight);
      grantItem(t, item.id, 1);
    }
    log(state, "boss", btpl("bossSlain"), survivors.map((t) => t.name).join(", "));
    if ((state.settings.winMode || "hg") === "boss_slayer") {
      if (!Array.isArray(state.bossSlayers)) state.bossSlayers = [];
      for (const id of Object.keys(b.participants || {})) {
        if (!state.bossSlayers.includes(id)) state.bossSlayers.push(id);
      }
      if (!anyLivingBoss(state)) {
        const winners = state.bossSlayers.filter((id) => {
          const t = byId(state, id);
          return t && t.alive && t.attributes.health > 0;
        });
        finishGame(state, winners);
      }
    }
    return true;
  }
  return false;
}

function applyEvent(state, evt, selfId, othersArr) {
  let self = byId(state, selfId);
  if (!self || !self.alive) return null;
  let others = (othersArr || []).filter((o) => o && isAlive(o));
  const sub = pickSubEvent(state, evt, self, others[0] || null);
  if (sub) {
    others = adjustOthersToTargets(state, self, others, sub.targets, evt.cat);
    const cat = evt.cat;
    evt = Object.assign({}, evt, sub);
    evt.cat = cat;
  }
  let targeted = false;
  if (evt.target) {
    const subject = pickTributeByTarget(state, evt.target, self.id);
    if (!subject) return null;
    self = subject;
    others = [];
    targeted = true;
  }
  const primary = others[0] || null;
  if (!targeted && evt.targets !== 1 && !primary) return null;
  const scale = evt.scale || {};
  const changes = [];
  let usedWeapon = null;

  if (evt.cat === "fight") {
    self.stats.fights += 1;
    self.stats.experience = (self.stats.experience || 0) + 1;
    for (const o of others) {
      o.stats.fights += 1;
      o.stats.experience = (o.stats.experience || 0) + 1;
    }
  } else if (evt.cat === "gather") {
    self.stats.gathers += 1;
  } else if (evt.cat === "social") {
    self.stats.socials += 1;
  }
  if (evt.stat && self.stats[evt.stat] != null) self.stats[evt.stat] += 1;

  if (self.hidden && ["fight", "gather", "build", "social"].includes(evt.cat)) self.hidden = false;

  if (evt.script) {
    const src = typeof evt.script === "string" ? evt.script : evt.script.onEvent;
    if (src) {
      const lang = evt.script && typeof evt.script === "object" ? evt.script.lang : null;
      const ctx = scriptCtx(state, { self, other: primary, others, event: evt, memory: {} });
      runHook(src, lang, ctx);
    }
  }
  runAbilityEventHooks(state, self, others, evt, "onEvent");

  if (evt.stealth === "theft" && primary) {
    const out = applyStealthTheft(state, self, primary, evt);
    return { cat: "theft", text: out.text, changes: out.changes };
  }

  if (evt.flag) self[evt.flag] = true;

  if (evt.cold && evt.fxSelf && evt.fxSelf.health < 0) {
    const cold = -evt.fxSelf.health;
    const warmth = endureCold(state, self, cold);
    const damage = Math.max(0, cold - warmth);
    evt.fxSelf = Object.assign({}, evt.fxSelf, { health: -damage });
  }

  const apply = (t, fx) => {
    const s = applyFx(state, t, fx, scale, evt.cat, t === self ? null : self.id);
    if (s) changes.push(s);
  };

  apply(self, evt.fxSelf || {});
  if (primary && evt.fxBoth) {
    apply(self, evt.fxBoth);
    for (const o of others) apply(o, evt.fxBoth);
  }
  if (evt.fxOther) {
    for (const o of others) apply(o, evt.fxOther);
  }

  if (evt.rel) {
    for (const o of others) self.relationships[o.id] = clamp((self.relationships[o.id] || 0) + evt.rel, -100, 100);
  }
  if (evt.relRev) {
    for (const o of others) o.relationships[self.id] = clamp((o.relationships[self.id] || 0) + evt.relRev, -100, 100);
  }

  if (self.alliance) maybeBreakAlliance(state, self);
  for (const o of others) {
    maybeBreakAlliance(state, o);
    maybeForgeAlliance(state, self, o);
  }
  refreshAlliances(state);

  if (evt.fxProf) {
    const parts = [];
    for (const k of Object.keys(evt.fxProf)) {
      if (k in self.proficiencies) {
        self.proficiencies[k] = clamp(self.proficiencies[k] + evt.fxProf[k], 0, 100);
        const d = evt.fxProf[k];
        parts.push((d >= 0 ? "+" : "") + d + " " + profName(state, k));
      }
    }
    if (parts.length) changes.push(tr(state, "profChange", { name: self.name, delta: "", prof: parts.join(", ") }));
  }

  if (evt.loot) {
    const pool = evt.loot.map((id) => ITEMS_BY_ID[id]).filter((x) => x && x.enabled !== false);
    if (pool.length) {
      const item = weightedPick(pool, (i) => i.weight);
      const scarKey = ITEM_SCARCITY[item.cat];
      if (!scarKey || Math.random() < scarcityChance(state, scarKey)) {
        grantItem(self, item.id, 1);
        changes.push(tr(state, "found", { name: self.name, item: itemNameLC(item, state) }));
      }
    }
  }

  if (evt.cat === "fight" && primary) {
    const selfW = bestWeapon(self);
    const otherW = bestWeapon(primary);
    if (selfW) usedWeapon = selfW;
    const selfArmor = bestArmor(self);
    const otherArmor = bestArmor(primary);
    const selfPower = selfW ? weaponDmg(selfW, true) * profFactor(self.proficiencies[selfW.cat]) : 0;
    const otherPower = otherW ? weaponDmg(otherW, true) * profFactor(primary.proficiencies[otherW.cat]) : 0;
    const primDefense = Math.round(0.5 * otherPower) + (otherArmor ? otherArmor.prot : 0);
    const selfDefense = Math.round(0.5 * selfPower) + (selfArmor ? selfArmor.prot : 0);

    if (selfW) {
      const strikes = selfW.single ? 1 : weaponStrikes(selfW);
      let dealtTotal = 0;
      for (let s = 0; s < strikes; s++) {
        if (primary.attributes.health <= 0) break;
        let bonus = Math.max(1, Math.round(selfPower - primDefense));
        bonus = Math.max(1, Math.round(bonus * veteranMult(self) * veteranTakenMult(primary) * abilityMult(self, "damageDealt") * abilityMult(primary, "damageTaken")));
        if (s === 0 && self.hidden) {
          bonus = Math.round(bonus * 1.8);
          self.hidden = false;
        }
        const before = primary.attributes.health;
        primary.attributes.health = clamp(primary.attributes.health - bonus, 0, 100);
        const dealt = before - primary.attributes.health;
        dealtTotal += dealt;
        if (dealt > 0) {
          primary._cause = "fight";
          if (otherArmor) degradeItem(primary, otherArmor.id);
        }
        if (selfW.single) consumeItem(self, selfW.id, 1);
        else degradeItem(self, selfW.id, Math.max(1, Math.round(12 / strikes)));
        bumpProf(self, selfW.cat, 1);
      }
      if (dealtTotal > 0) {
        self.stats.damage = (self.stats.damage || 0) + dealtTotal;
        if (primary.attributes.health <= 0) primary._killer = self.id;
        runDamageHooks(state, primary, dealtTotal, self, "fight");
        runAbilityHook(state, self, "onDeal", { damage: { target: primary, amount: dealtTotal, cause: "fight" } });
        changes.push(tr(state, "weapon", {
          name: primary.name,
          dmg: dealtTotal,
          stat: statName(state, "health"),
          item: itemNameLC(selfW, state)
        }));
      }
    }

    if (otherW) {
      const strikes = otherW.single ? 1 : weaponStrikes(otherW);
      let dealtTotal = 0;
      for (let s = 0; s < strikes; s++) {
        if (self.attributes.health <= 0) break;
        const retal = Math.max(1, Math.round((otherPower - selfDefense) * veteranMult(primary) * veteranTakenMult(self) * abilityMult(primary, "damageDealt") * abilityMult(self, "damageTaken")));
        const before = self.attributes.health;
        self.attributes.health = clamp(self.attributes.health - retal, 0, 100);
        const dealt = before - self.attributes.health;
        dealtTotal += dealt;
        if (dealt > 0) {
          self._cause = "fight";
          if (selfArmor) degradeItem(self, selfArmor.id);
        }
        if (otherW.single) consumeItem(primary, otherW.id, 1);
        else degradeItem(primary, otherW.id, Math.max(1, Math.round(12 / strikes)));
        bumpProf(primary, otherW.cat, 1);
      }
      if (dealtTotal > 0) {
        primary.stats.damage = (primary.stats.damage || 0) + dealtTotal;
        if (self.attributes.health <= 0) self._killer = primary.id;
        runDamageHooks(state, self, dealtTotal, primary, "fight");
        changes.push(tr(state, "weapon", {
          name: self.name,
          dmg: dealtTotal,
          stat: statName(state, "health"),
          item: itemNameLC(otherW, state)
        }));
      }
    }
  }

  if ((evt.cat === "gather" || evt.cat === "build" || evt.cat === "scout") && !primary && hasTool(self)) {
    const tool = bestItem(self, ["tool"]);
    if (tool) {
      const gain = 2 + randInt(4);
      const stat = evt.cat === "gather" ? "food" : evt.cat === "build" ? "supplies" : "morale";
      self.attributes[stat] = clamp(self.attributes[stat] + gain, 0, 100);
      changes.push(tr(state, "toolBonus", {
        name: self.name,
        gain,
        stat: statName(state, stat),
        item: itemNameLC(tool, state)
      }));
      degradeItem(self, tool.id);
      bumpProf(self, "tool", 1);
    }
  }

  let text = outcomeText(state, evt, self, primary);
  if (text == null) {
    const wt = evt.weaponTpls && usedWeapon && evt.weaponTpls[usedWeapon.cat] ? evt.weaponTpls[usedWeapon.cat] : null;
    text = wt ? resolveTplValue(wt, state) : eventText(evt, state);
  }
  text = text
    .replace(/\{self\}/g, self.name)
    .replace(/\{other\}/g, primary ? primary.name : "...")
    .replace(/\{weapon\}/g, usedWeapon ? itemNameLC(usedWeapon, state) : "their weapon");
  text = formatOthersTpl(text, others);
  text = text.replace(/\{group\}/g, formatOthers([self, ...others]));
  const post = evt.script && typeof evt.script === "object" ? evt.script.postEvent : null;
  if (post) runHook(post, evt.script.lang, scriptCtx(state, { self, other: primary, others, event: evt, memory: {} }));
  runAbilityEventHooks(state, self, others, evt, "postEvent");
  return { cat: evt.cat, text, changes: changes.join(" \u00B7 ") };
}

function deathReason(state, t) {
  switch (t._cause) {
    case "starvation": return tr(state, "deathStarve");
    case "fight": return tr(state, "deathFight");
    case "night": return tr(state, "deathNight");
    case "start": return tr(state, "deathBloodbath");
    case "survive": return tr(state, "deathArena");
    case "cold": return tr(state, "deathCold");
    case "boss": return tr(state, "deathBoss");
    default: return tr(state, "deathWounds");
  }
}

function allianceMembers(state, t) {
  if (!t || !t.alliance) return [];
  return state.tributes.filter((o) => o.alive && o.id !== t.id && o.alliance === t.alliance);
}

function maybeForgeAlliance(state, a, b) {
  if (!a || !b || a.id === b.id || !isAlive(a) || !isAlive(b)) return;
  if (state.settings.winMode !== "hg_plus" && !state.settings.alliances) return;
  if (Math.random() > 0.4) return;
  if ((a.relationships[b.id] || 0) < 55 || (b.relationships[a.id] || 0) < 55) return;
  if (a.alliance && b.alliance) return;
  if (a.alliance && !b.alliance) {
    b.alliance = a.alliance;
    log(state, "alliance", tr(state, "allianceJoin", { name: b.name, alliance: a.alliance }));
  } else if (b.alliance && !a.alliance) {
    a.alliance = b.alliance;
    log(state, "alliance", tr(state, "allianceJoin", { name: a.name, alliance: b.alliance }));
  } else {
    const id = a.name + " & " + b.name;
    a.alliance = id;
    b.alliance = id;
    log(state, "alliance", tr(state, "allianceForge", { a: a.name, b: b.name, alliance: id }));
  }
}

function maybeBreakAlliance(state, t) {
  if (!t || !t.alliance) return;
  if (state.settings.winMode !== "hg_plus" && !state.settings.alliances) return;
  const members = allianceMembers(state, t);
  if (!members.length) return;
  const hostile = members.some((o) => (t.relationships[o.id] || 0) <= -30 || (o.relationships[t.id] || 0) <= -30);
  if (hostile) {
    t.alliance = null;
    log(state, "alliance", tr(state, "allianceBreak", { name: t.name }));
  }
}

function refreshAlliances(state) {
  if (state.phase === "setup") return;
  const alive = state.tributes.filter(isAlive);
  if (alive.length > 1 && state.settings.winMode !== "hg_plus") {
    const names = [...new Set(alive.map((t) => t.alliance).filter(Boolean))];
    if (names.length === 1 && alive.every((t) => t.alliance === names[0])) {
      const name = names[0];
      for (const t of alive) t.alliance = null;
      log(state, "alliance", tr(state, "allianceDisband", { name: alive[0].name, alliance: name }));
    }
  }
  const groups = {};
  for (const t of state.tributes) {
    if (t.alive && t.alliance) (groups[t.alliance] = groups[t.alliance] || []).push(t);
  }
  for (const name of Object.keys(groups)) {
    const members = groups[name];
    if (members.length < 2) {
      const lone = members[0];
      if (lone && lone.alliance) {
        lone.alliance = null;
        log(state, "alliance", tr(state, "allianceDisband", { name: lone.name, alliance: name }));
      }
    } else if (name.includes(" & ")) {
      const newName = members.map((m) => m.name).join(" & ");
      if (newName !== name) {
        for (const m of members) m.alliance = newName;
        log(state, "alliance", tr(state, "allianceRename", { old: name, alliance: newName }));
      }
    }
  }
}

function veteranFactor(t) {
  const exp = (t && t.stats && t.stats.experience) || 0;
  return clamp(exp * 0.01, 0, 0.5);
}

function veteranMult(t) {
  return 1 + veteranFactor(t);
}

function veteranTakenMult(t) {
  return 1 - veteranFactor(t) * 0.5;
}

function generosityOf(t) {
  const adj = PERSONALITIES[t.personality];
  const w = adj && adj.weights ? adj.weights.social || 0 : 0;
  return clamp(w > 0 ? 0.65 : w < 0 ? 0.15 : 0.4, 0, 1);
}

function isNeedy(t) {
  const a = t.attributes;
  return a.health < 40 || a.food < 35 || a.supplies < 25 || a.morale < 30;
}

const SHARE_CATS = ["provisions", "medical", "tool", "fuel"];

function shareItem(state, from, to) {
  const ids = Object.keys(from.items || {}).filter((id) => {
    const def = ITEMS_BY_ID[id];
    return def && from.items[id].qty > 0 && SHARE_CATS.includes(def.cat);
  });
  let item = null;
  if (ids.length) {
    const id = ids[randInt(ids.length)];
    item = ITEMS_BY_ID[id];
    consumeItem(from, id, 1);
    grantItem(to, id, 1);
  } else {
    const pool = activeItems().filter((i) => SHARE_CATS.includes(i.cat));
    if (pool.length) {
      item = weightedPick(pool, (i) => i.weight);
      grantItem(to, item.id, 1);
    }
  }
  return item;
}

function resolveSupport(state) {
  const alive = state.tributes.filter(isAlive);
  if (alive.length < 2) return;
  const groups = {};
  for (const t of alive) if (t.alliance) (groups[t.alliance] = groups[t.alliance] || []).push(t);

  for (const members of Object.values(groups)) {
    if (members.length < 2) continue;
    const needy = members.filter(isNeedy);
    if (!needy.length) continue;
    const target = needy[randInt(needy.length)];
    const helpers = members.filter((m) => m.id !== target.id && !isNeedy(m) && m.attributes.supplies >= 15);
    if (!helpers.length) continue;
    const helper = helpers[randInt(helpers.length)];
    const rel = (helper.relationships[target.id] || 0) / 100;
    if (Math.random() >= clamp(generosityOf(helper) + rel * 0.3, 0, 0.9)) continue;
    const give = {};
    if (target.attributes.food < 40) give.food = 8;
    if (target.attributes.supplies < 30) give.supplies = 6;
    if (target.attributes.morale < 40) give.morale = 8;
    const changes = [];
    const s1 = applyFx(state, target, give, null, "alliance");
    if (s1) changes.push(s1);
    const s2 = applyFx(state, helper, { morale: 4, supplies: -2 }, null, "alliance");
    if (s2) changes.push(s2);
    const shared = shareItem(state, helper, target);
    if (shared) changes.push(tr(state, "shareGive", { name: helper.name, item: itemNameLC(shared, state), to: target.name }));
    helper.relationships[target.id] = clamp((helper.relationships[target.id] || 0) + 4, -100, 100);
    target.relationships[helper.id] = clamp((target.relationships[helper.id] || 0) + 4, -100, 100);
    log(state, "alliance", tr(state, "allySupport", { helper: helper.name, needy: target.name }), changes.join(" \u00B7 "));
  }

  const loners = alive.filter((t) => !t.alliance);
  if (loners.length < 2) return;
  const a = loners[randInt(loners.length)];
  const pool = loners.filter((o) => o.id !== a.id && (a.relationships[o.id] || 0) >= 0 && (o.relationships[a.id] || 0) >= 0);
  if (!pool.length) return;
  const b = pool[randInt(pool.length)];
  const rel = ((a.relationships[b.id] || 0) + (b.relationships[a.id] || 0)) / 200;
  if (Math.random() >= clamp(generosityOf(a) + rel * 0.3, 0, 0.6)) return;
  const giver = Math.random() < 0.5 ? a : b;
  const receiver = giver === a ? b : a;
  if (giver.attributes.supplies < 15 || receiver.attributes.supplies >= giver.attributes.supplies - 10) return;
  const changes = [];
  const s1 = applyFx(state, receiver, { supplies: 6, morale: 5 }, null, "alliance");
  if (s1) changes.push(s1);
  const s2 = applyFx(state, giver, { morale: 4, supplies: -3 }, null, "alliance");
  if (s2) changes.push(s2);
  const shared = shareItem(state, giver, receiver);
  if (shared) changes.push(tr(state, "shareGive", { name: giver.name, item: itemNameLC(shared, state), to: receiver.name }));
  giver.relationships[receiver.id] = clamp((giver.relationships[receiver.id] || 0) + 3, -100, 100);
  receiver.relationships[giver.id] = clamp((receiver.relationships[giver.id] || 0) + 3, -100, 100);
  log(state, "alliance", tr(state, "lonerTrade", { giver: giver.name, receiver: receiver.name }), changes.join(" \u00B7 "));
}

function finishGame(state, winners) {
  state.winners = (winners || []).filter(Boolean);
  state.winner = state.winners.length ? state.winners[0] : null;
  state.phase = "finished";
  if (state.winners.length > 1) {
    log(state, "win", tr(state, "winGroup", { names: state.winners.map((id) => byId(state, id) ? byId(state, id).name : id).join(", ") }));
  } else if (state.winners.length === 1) {
    const w = byId(state, state.winners[0]);
    log(state, "win", tr(state, "win", { name: w ? w.name : state.winners[0] }));
  } else {
    log(state, "win", tr(state, "winNone"));
  }
}

function canTriggerBoss(state) {
  if (triggeredBossCount(state) < Math.max(1, state.map && state.map.bossCount != null ? state.map.bossCount : 1)) return true;
  if (!state.map || !state.map.globalEvents) return false;
  const count = triggeredGlobalCount(state);
  if (state.map.globalsMax != null && count >= state.map.globalsMax) return false;
  return GLOBAL_EVENTS.some((g) => g.boss && (!g.maxTriggers || (state.globalsTriggered[g.id] || 0) < g.maxTriggers));
}

function maybeFinish(state) {
  if (state.phase === "finished") return;
  const alive = state.tributes.filter(isAlive);
  if (alive.length === 0) {
    if (state.tributes.length) finishGame(state, []);
    return;
  }
  const mode = state.settings.winMode || "hg";
  if (mode === "hg" || mode === "survivors") {
    if (alive.length === 1) finishGame(state, [alive[0].id]);
    else if (mode === "survivors" && state.day > (state.settings.endDay || 10)) {
      finishGame(state, alive.map((t) => t.id));
    }
  } else if (mode === "boss_slayer") {
    if (alive.length === 1 && !activeBoss(state) && !canTriggerBoss(state)) {
      finishGame(state, [alive[0].id]);
    }
  } else if (mode === "hg_plus") {
    const factions = new Map();
    for (const t of alive) {
      const key = t.alliance || "__solo_" + t.id;
      if (!factions.has(key)) factions.set(key, []);
      factions.get(key).push(t.id);
    }
    if (factions.size === 1) finishGame(state, [...factions.values()][0]);
  }
}

function checkDeaths(state) {
  const deaths = state.tributes.filter((t) => t.alive && t.attributes.health <= 0);
  for (const t of deaths) {
    t.alive = false;
    t.attributes.health = 0;
    log(state, "death", tr(state, "death", { name: t.name, reason: deathReason(state, t) }));
    const killer = t._killer ? byId(state, t._killer) : null;
    if (killer) {
      killer.stats.kills += 1;
      killer.stats.experience = (killer.stats.experience || 0) + 4;
      runAbilityHook(state, killer, "onKill", { death: { tribute: t, killer } });
    }
    for (const g of state.activeGlobals) {
      runGlobalHook(state, g, "onDeath", { death: { tribute: t, killer } });
    }
  }
  refreshAlliances(state);
  maybeFinish(state);
}

function startGames(state) {
  if (state.tributes.length < 2) return;
  state.phase = "start";
  state.day = 1;
  state.winner = null;
  state.winners = [];
  state.log = [];
  state.activeGlobals = [];
  state.globalsTriggered = {};
  state.bossSpawned = false;
  state.bossSlayers = [];
  for (const t of state.tributes) {
    t.base = {
      attributes: { ...t.attributes },
      relationships: { ...t.relationships },
      proficiencies: { ...t.proficiencies },
      items: Object.fromEntries(Object.entries(t.items || {}).map(([k, v]) => [k, Object.assign({}, v)]))
    };
    t.abilityMemory = {};
    t.stats = freshStats();
  }
  log(state, "start", tr(state, "startIntro"));

  const used = new Set();
  const living = state.tributes.filter(isAlive);
  for (const t of living) {
    if (!isAlive(t) || used.has(t.id)) continue;
    const r = resolveEvent(state, t, "start", "start", rollGroupSize());
    if (r) {
      const applied = applyEvent(state, r.evt, t.id, r.others);
      if (applied) log(state, applied.cat, applied.text, applied.changes);
      checkDeaths(state);
      if (state.phase === "finished") break;
    }
    used.add(t.id);
    for (const o of r ? r.others : []) used.add(o.id);
  }

  if (state.phase !== "finished") {
    for (const t of state.tributes) {
      if (isAlive(t)) {
        t.attributes.energy = clamp(t.attributes.energy - 10, 0, 100);
        t.attributes.food = clamp(t.attributes.food - 5, 0, 100);
      }
    }
    checkDeaths(state);
  }
  if (state.phase !== "finished") {
    state.phase = "day";
    for (const t of state.tributes) {
      if (isAlive(t)) actionWeights(state, t);
    }
  }
}

function upkeep(state, alive) {
  for (const t of alive) {
    if (!isAlive(t)) continue;
    autoEat(state, t);
    autoTreat(state, t);
  }
}

function resolveDay(state) {
  maybeFinish(state);
  if (state.phase === "finished") return;
  maybeTriggerGlobal(state);
  const dayGlobals = globalPhase(state, "day");
  for (const g of dayGlobals) runGlobalHook(state, g, "onDay");
  for (const t of state.tributes) if (isAlive(t)) runAbilityHook(state, t, "onDay");
  const replacing = dayGlobals.find((g) => g.def.replace && g.def.replace.day);

  if (replacing) {
    for (const t of state.tributes.filter(isAlive)) {
      applyGlobalReplace(state, t, replacing.def.replace.day);
      checkDeaths(state);
      if (state.phase === "finished") break;
    }
  } else {
    const queue = state.tributes.filter(isAlive);
    for (const t of queue) {
      if (!isAlive(t)) continue;
      const action = pickAction(state, t);
      const cat = ACTION_CATEGORY[action];
      const preferred = cat === "fight" || cat === "social" ? rollGroupSize() : 1;
      const r = resolveEvent(state, t, cat, "day", preferred);
      if (r) {
        const applied = applyEvent(state, r.evt, t.id, r.others);
        if (applied) log(state, applied.cat, applied.text, applied.changes);
        checkDeaths(state);
        if (state.phase === "finished") break;
      }
      if (isAlive(t) && action !== "rest") {
        const scarKey = ACTION_SCARCITY[action];
        const chance = (0.3 + (hasTool(t) ? 0.15 : 0)) * (scarKey ? scarcityChance(state, scarKey) : 1) + ((activeAbility(t) && activeAbility(t).scavengeChance) || 0);
        if (Math.random() < chance) {
          scavenge(state, t, action);
          checkDeaths(state);
          if (state.phase === "finished") break;
        }
      }
      const xa = activeAbility(t) && activeAbility(t).extraAction;
      if (isAlive(t) && xa && xa.stat && t.attributes[xa.stat] != null && t.attributes[xa.stat] < (xa.below != null ? xa.below : 30)) {
        const cat2 = ACTION_CATEGORY[pickAction(state, t)];
        const r2 = resolveEvent(state, t, cat2, "day", cat2 === "fight" || cat2 === "social" ? rollGroupSize() : 1);
        if (r2) {
          const applied = applyEvent(state, r2.evt, t.id, r2.others);
          if (applied) log(state, applied.cat, applied.text, applied.changes);
          checkDeaths(state);
          if (state.phase === "finished") break;
        }
      }
    }
  }

  if (state.phase === "finished") return;

  for (const g of dayGlobals) {
    if (g.def.addon && g.def.addon.day) applyAddons(state, g.def.addon.day);
  }
  for (const g of dayGlobals) {
    if (g.def.boss && g.boss && resolveBoss(state, g)) endGlobal(state, g);
  }

  resolveSupport(state);

  if (state.settings.sponsorGifts && Math.random() < 0.3) sponsorGift(state);
  if (state.map.weather && Math.random() < 0.35) applyWeather(state);
  maybeReplenish(state);

  const alive = state.tributes.filter(isAlive);
  if (alive.length) {
    const victim = alive[randInt(alive.length)];
    const r = resolveEvent(state, victim, "survive", "day", 1);
    if (r) {
      const applied = applyEvent(state, r.evt, victim.id, r.others);
      if (applied) log(state, applied.cat, applied.text, applied.changes);
      checkDeaths(state);
      if (state.phase === "finished") return;
    }
  }

  for (const t of alive) {
    if (!isAlive(t)) continue;
    const mods = BIOMES[state.map.biome] || BIOMES.forest;
    const up = activeAbility(t) && activeAbility(t).upkeep ? activeAbility(t).upkeep : {};
    const foodCost = 8 + Math.round(-mods.gather / 4) + (up.food || 0);
    const energyCost = 5 + mods.dayHeat + (up.energy || 0);
    t.attributes.food = clamp(t.attributes.food - foodCost, 0, 100);
    t.attributes.energy = clamp(t.attributes.energy - energyCost, 0, 100);
    if (t.attributes.food <= 0) {
      t._cause = "starvation";
      t.attributes.health = clamp(t.attributes.health - 15, 0, 100);
    }
    if (t.attributes.food >= 50 && t.attributes.energy >= 50) t.attributes.health = clamp(t.attributes.health + 2, 0, 100);
  }
  upkeep(state, alive);
  checkDeaths(state);
  tickGlobals(state, "day");
  if (state.phase !== "finished") state.phase = "night";
}

function resolveNight(state) {
  const nightGlobals = globalPhase(state, "night");
  for (const g of nightGlobals) runGlobalHook(state, g, "onNight");
  for (const t of state.tributes) if (isAlive(t)) runAbilityHook(state, t, "onNight");
  const replacing = nightGlobals.find((g) => g.def.replace && g.def.replace.night);

  if (replacing) {
    for (const t of state.tributes.filter(isAlive)) {
      applyGlobalReplace(state, t, replacing.def.replace.night);
      checkDeaths(state);
      if (state.phase === "finished") break;
    }
  } else {
    const queue = state.tributes.filter(isAlive);
    for (const t of queue) {
      if (!isAlive(t)) continue;
      const pr = Math.random();
      const preferred = pr < 0.25 ? 3 : pr < 0.55 ? 2 : 1;
      const r = resolveEvent(state, t, "night", "night", preferred);
      if (r) {
        const applied = applyEvent(state, r.evt, t.id, r.others);
        if (applied) log(state, applied.cat, applied.text, applied.changes);
        checkDeaths(state);
        if (state.phase === "finished") break;
      }
    }
  }

  if (state.phase === "finished") return;

  for (const g of nightGlobals) {
    if (g.def.addon && g.def.addon.night) applyAddons(state, g.def.addon.night);
  }
  for (const g of nightGlobals) {
    if (g.def.boss && g.boss && resolveBoss(state, g)) endGlobal(state, g);
  }

  if (state.settings.sponsorGifts && Math.random() < 0.2) sponsorGift(state);

  const alive = state.tributes.filter(isAlive);
  for (const t of alive) {
    t.attributes.energy = clamp(t.attributes.energy + 20, 0, 100);
    if (t.attributes.food < 30) {
      t._cause = "starvation";
      t.attributes.health = clamp(t.attributes.health - 3, 0, 100);
      t.attributes.morale = clamp(t.attributes.morale - 2, 0, 100);
    }
    const mods = BIOMES[state.map.biome] || BIOMES.forest;
    if (mods.nightCold > 0) nightlyCold(state, t, mods.nightCold);
  }
  upkeep(state, alive);
  checkDeaths(state);
  tickGlobals(state, "night");
  if (state.phase !== "finished") {
    state.day += 1;
    state.phase = "day";
  }
}

function advance(state) {
  if (state.phase === "day") resolveDay(state);
  else if (state.phase === "night") resolveNight(state);
}

function reset(state) {
  for (const t of state.tributes) {
    t.alive = true;
    if (t.base) {
      t.attributes = { ...t.base.attributes };
      t.relationships = { ...t.base.relationships };
      t.proficiencies = { ...t.base.proficiencies };
      t.items = { ...t.base.items };
      delete t.base;
    } else {
      t.attributes = { ...DEFAULT_ATTRIBUTES };
      t.proficiencies = { ...DEFAULT_PROFICIENCIES };
    }
    t.shelter = false;
    t.hidden = false;
    delete t._theftCaught;
    t.goal = null;
    t.stats = freshStats();
  }
  state.phase = "setup";
  state.day = 1;
  state.winner = null;
  state.winners = [];
  state.log = [];
  state.activeGlobals = [];
  state.globalsTriggered = {};
  state.bossSpawned = false;
  if (state.map) state.map.replenished = false;
}

const EXAMPLES = [
  { name: "Katniss", emoji: "\u{1F3F9}", gender: "female", personality: "hunter", attributes: { combat: 70, survival: 85, craft: 50, charm: 45, supplies: 30 }, items: ["bow", "knife"] },
  { name: "Peeta", emoji: "\u{1F35E}", gender: "male", personality: "charmer", attributes: { combat: 40, survival: 55, craft: 40, charm: 75, supplies: 20 }, items: ["rations"] },
  { name: "Gale", emoji: "\u{1FA93}", gender: "male", personality: "hunter", attributes: { combat: 75, survival: 80, craft: 60, charm: 40, supplies: 25 }, items: ["axe"] },
  { name: "Rue", emoji: "\u{1F33F}", gender: "female", personality: "survivor", attributes: { combat: 30, survival: 85, craft: 45, charm: 70, supplies: 15 }, items: ["berries", "rope"] },
  { name: "Thresh", emoji: "\u{1F33E}", gender: "male", personality: "warrior", attributes: { combat: 80, survival: 70, craft: 40, charm: 35, supplies: 20 }, items: ["club"] },
  { name: "Clove", emoji: "\u{1F52A}", gender: "female", personality: "warrior", attributes: { combat: 82, survival: 60, craft: 40, charm: 25, supplies: 35 }, items: ["knife", "grenade"] },
  { name: "Cato", emoji: "\u2694\uFE0F", gender: "male", personality: "warrior", attributes: { combat: 90, survival: 55, craft: 35, charm: 20, supplies: 40 }, items: ["axe", "medkit"] },
  { name: "Foxface", emoji: "\u{1F98A}", gender: "non-binary", personality: "strategist", attributes: { combat: 25, survival: 75, craft: 65, charm: 50, supplies: 30 }, items: ["bandage", "water"] }
];

function loadExamples(state) {
  state.tributes = [];
  state.log = [];
  state.day = 1;
  state.phase = "setup";
  state.winner = null;
  for (const ex of EXAMPLES) {
    const t = addTribute(state, ex.name);
    t.emoji = ex.emoji;
    t.gender = ex.gender;
    t.personality = ex.personality;
    for (const k in ex.attributes) t.attributes[k] = ex.attributes[k];
    for (const id of ex.items) grantItem(t, id, 1);
  }
  const rel = (a, b, ab, ba) => {
    const A = state.tributes.find((t) => t.name === a);
    const B = state.tributes.find((t) => t.name === b);
    if (A && B) {
      A.relationships[B.id] = ab;
      B.relationships[A.id] = ba;
    }
  };
  rel("Katniss", "Rue", 45, 50);
  rel("Katniss", "Peeta", 35, 40);
  rel("Rue", "Thresh", 25, 20);
  rel("Cato", "Clove", 50, 45);
  rel("Cato", "Thresh", -55, -60);
  rel("Clove", "Katniss", -40, -35);
  rel("Cato", "Katniss", -45, -40);
  rel("Foxface", "Clove", -25, -30);
  rel("Peeta", "Cato", -35, -30);
}

loadContent();

module.exports = {  ITEMS,
  PERSONALITIES,
  BIOMES,
  DEFAULT_ATTRIBUTES,
  clamp,
  newState,
  loadState,
  addTribute,
  removeTribute,
  updateTribute,
  updateSettings,
  updateMap,
  startGames,
  advance,
  reset,
  loadExamples,
  loadContent,
  saveContent,
  getItems,
  getEvents,
  getGlobalEvents,
  getPacks,
  getPersonalities,
  addPersonality,
  updatePersonality,
  removePersonality,
  getAbilities,
  addAbility,
  updateAbility,
  removeAbility,
  savePack,
  loadPack,
  removePack,
  addItem,
  updateItem,
  removeItem,
  addEvent,
  updateEvent,
  removeEvent,
  addGlobalEvent,
  updateGlobalEvent,
  removeGlobalEvent,
  getLanguages,
  getLocale,
  saveLocale,
  tr,
  triggerGlobalEvent,
  triggerEvent,
  triggerFight,
  forceWeather,
  devGrantItem,
  getContentPacks,
  saveContentPack,
  loadContentPack,
  removeContentPack,
  setContentEnabled
};