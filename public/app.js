const STAT_META = [
  ["health", "stat.health"],
  ["energy", "stat.energy"],
  ["food", "stat.food"],
  ["morale", "stat.morale"],
  ["supplies", "stat.supplies"],
  ["combat", "stat.combat"],
  ["survival", "stat.survival"],
  ["craft", "stat.craft"],
  ["charm", "stat.charm"],
  ["stealth", "stat.stealth"]
];

const PROF_META = [
  ["melee", "prof.melee"],
  ["ranged", "prof.ranged"],
  ["explosive", "prof.explosive"],
  ["tool", "prof.tool"],
  ["medical", "prof.medical"]
];

const EVCATS = ["gather", "scout", "build", "fight", "social", "rest", "survive", "night", "start"];
const ITEMCATS = ["melee", "ranged", "explosive", "tool", "medical", "provisions", "armor", "fuel"];
const PHASES = ["day", "night", "start", "any"];

const SCARCITY_META = [
  ["provisions", "scar.provisions"],
  ["supplies", "scar.supplies"],
  ["weapons", "scar.weapons"],
  ["tools", "scar.tools"],
  ["medical", "scar.medical"],
  ["armor", "scar.armor"]
];

const STAT_KEYS = [
  ["kills", "stat.kills"],
  ["damage", "stat.damage"],
  ["fights", "stat.fights"],
  ["experience", "stat.experience"],
  ["thefts", "stat.thefts"],
  ["gathers", "stat.gathers"],
  ["scavenges", "stat.scavenges"],
  ["socials", "stat.socials"],
  ["gifts", "stat.gifts"]
];

const EMOJIS = ["\u{1F3AD}", "\u{1F3F9}", "\u{1F52A}", "\u2694\uFE0F", "\u{1F35E}", "\u{1F525}", "\u{1FA93}", "\u{1F98B}", "\u{1F3EC}", "\u{1F372}", "\u{1F33F}", "\u{1F33E}", "\u{1F98A}", "\u{1F9E3}", "\u{1F9F6}", "\u{1F94A}", "\u{1F423}", "\u{1F40D}", "\u{1F332}", "\u{1F6E1}\uFE0F"];

const GENDER_ICONS = { female: "\u2640", male: "\u2642", "non-binary": "\u26A7" };

const SPEEDS = [
  ["slow", 4600, "speedSlow"],
  ["normal", 2600, "speedNormal"],
  ["fast", 1200, "speedFast"]
];

const REVEAL_SPEEDS = {
  slow: { line: 2400, char: 70 },
  normal: { line: 1400, char: 40 },
  fast: { line: 700, char: 20 }
};

let state = null;
let catalog = null;
let dict = {};
let fallback = {};
let lang = "en";
let editId = null;
let editImg = null;
let itemEditId = null;
let eventEditId = null;
let subs = [];
let subEditIndex = -1;
let globalEditId = null;
let globalLists = { replaceDay: [], replaceNight: [], addonDay: [], addonNight: [] };
let miniListKey = null;
let miniEditIndex = -1;
let packs = [];
let statsSort = "kills";
let showStats = false;
let personalityEditId = null;
let abilityEditId = null;
let contentTab = "items";
let contentItemCat = "all";
let contentEventCat = "all";
let contentGlobalCat = "all";
let contentFilters = { items: "enabled", events: "enabled", globals: "enabled", personalities: "enabled" };
let contentPacks = [];
let langEditCode = "en";
let langLocale = null;
let langSection = "engine";
let langMode = "keys";
let autoTimer = null;
let autoActive = false;
let autoSpeed = 2600;
let autoBusy = false;
let revealTimer = null;
let revealCursor = 0;
let revealTypePos = 0;
let revealLines = [];
let lastRevealMode = "off";

const $ = (sel) => document.querySelector(sel);

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function t(key, vars) {
  const flat = String(key).replace(/^(ui|names|engine)\./, "");
  let s = dict[flat];
  if (s == null) s = fallback[flat] != null ? fallback[flat] : flat;
  if (vars) {
    for (const k of Object.keys(vars)) s = s.split("{" + k + "}").join(String(vars[k]));
  }
  return s;
}

let mapNumbersInit = false;

const GLOBALS_FIELDS = [
  { el: "#map-globals-min", key: "globalsMin", tag: "min" },
  { el: "#map-globals-max", key: "globalsMax", tag: "max" }
];

function saveGlobalsField(tag) {
  const f = GLOBALS_FIELDS.find((x) => x.tag === tag);
  const el = $(f.el);
  const v = el.value;
  mutate("/api/map", { [f.key]: v === "" ? null : Number(v) });
}

function wireGlobalsFields() {
  GLOBALS_FIELDS.forEach((f) => {
    const el = $(f.el);
    let timer = null;
    el.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => saveGlobalsField(f.tag), 400);
    });
    el.addEventListener("change", () => {
      clearTimeout(timer);
      saveGlobalsField(f.tag);
    });
  });
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
}

async function call(path, opts) {
  const r = await fetch(path, opts);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function mutate(path, body) {
  try {
    state = await call(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    });
    renderAll();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

async function loadDict(code) {
  const loc = await call("/api/locale/" + code);
  return Object.assign({}, loc.ui || {}, loc.names || {}, loc.engine || {});
}

async function setLang(code) {
  if (!catalog || !catalog.languages.some((l) => l.code === code)) return;
  lang = code;
  dict = await loadDict(code);
  renderAll();
}

function itemNameOf(it) {
  const n = it && it.name;
  if (n && typeof n === "object") return n[lang] || n.en || Object.values(n)[0] || it.id;
  return n || "";
}

function tplVariantsOf(tpl) {
  if (tpl == null) return [];
  return Array.isArray(tpl) ? tpl : [tpl];
}

function variantText(v) {
  if (v && typeof v === "object") return v[lang] || v.en || Object.values(v)[0] || "";
  return v || "";
}

function tplCurrentText(evt, i) {
  return variantText(tplVariantsOf(evt && evt.tpl)[i]);
}

function eventTplOf(evt) {
  return tplCurrentText(evt, 0);
}

function buildTplFromRows(containerId, existingTpl) {
  const existingTpls = tplVariantsOf(existingTpl).slice();
  const tpls = [];
  document.querySelectorAll(containerId + " textarea").forEach((ta) => {
    const text = ta.value.trim();
    if (!text) return;
    const orig = ta.dataset.orig || "";
    let idx = existingTpls.findIndex((v) => v && typeof v === "object" && variantText(v) === orig);
    let merged;
    if (idx > -1) {
      merged = mergeLocalized(existingTpls[idx], text);
      existingTpls.splice(idx, 1);
    } else {
      merged = mergeLocalized(null, text);
    }
    tpls.push(merged);
  });
  if (!tpls.length) tpls.push("");
  return tpls.length === 1 ? tpls[0] : tpls;
}

function relLabel(v) {
  return v <= -80 ? t("relEnemy") : v <= -50 ? t("relRival") : v <= -20 ? t("relCold") : v <= 20 ? t("relNeutral") : v <= 50 ? t("relFriendly") : v <= 80 ? t("relAlly") : t("relDevoted");
}

function phaseLabel() {
  switch (state.phase) {
    case "setup": return t("phaseSetup");
    case "start": return t("phaseStart");
    case "day": return t("phaseDay", { day: state.day });
    case "night": return t("phaseNight", { day: state.day });
    case "finished": return t("phaseFinished");
  }
}

function phaseHeader(e) {
  const part = e.phase === "start" ? t("logBloodbath") : e.phase === "day" ? t("logDay") : e.phase === "night" ? t("logNight") : t("logResults");
  return t("logDay") + " " + e.day + " \u00B7 " + part;
}

function renderHeader() {
  const alive = state.tributes.filter((t) => t.alive).length;
  const pill = $("#phase-pill");
  pill.textContent = phaseLabel();
  pill.className = "pill " + state.phase;
  $("#day-pill").textContent = t("dayPill", { day: state.day });
  $("#alive-pill").textContent = t("alivePill", { alive, total: state.tributes.length });

  const banner = $("#winner-banner");
  if (state.phase === "finished") {
    const wids = (state.winners && state.winners.length ? state.winners : (state.winner != null ? [state.winner] : []));
    const ws = wids.map((id) => state.tributes.find((t) => t.id === id)).filter(Boolean);
    banner.innerHTML = ws.length > 1
      ? t("winnerGroup", { names: esc(ws.map((x) => x.name).join(", ")) })
      : ws.length === 1
        ? t("winner", { name: esc(ws[0].name) })
        : t("winnerNone");
    banner.classList.remove("hidden");
  } else {
    banner.classList.add("hidden");
  }
}

function settingsHTML() {
  const s = state.settings || {};
  const langSel = '<select data-lang title="' + t("language") + '">' +
    (catalog ? catalog.languages.map((l) => '<option value="' + l.code + '"' + (lang === l.code ? " selected" : "") + ">" + esc(l.native) + "</option>").join("") : "") +
    "</select>";
  const revealSel = '<select data-setting="logReveal" title="' + t("settingReveal") + '">' +
    '<option value="off"' + ((s.logReveal || "off") === "off" ? " selected" : "") + ">" + t("revealOff") + "</option>" +
    '<option value="lines"' + (s.logReveal === "lines" ? " selected" : "") + ">" + t("revealLines") + "</option>" +
    '<option value="type"' + (s.logReveal === "type" ? " selected" : "") + ">" + t("revealType") + "</option>" +
    "</select>";
  const speedSel = s.logReveal && s.logReveal !== "off"
    ? '<select data-setting="revealSpeed" title="' + t("settingRevealSpeed") + '">' +
      SPEEDS.map(([v, ms, key]) => '<option value="' + v + '"' + ((s.revealSpeed || "normal") === v ? " selected" : "") + ">" + t(key) + "</option>").join("") +
      "</select>"
    : "";
  return '<span class="checks">' +
    '<label class="check" title="' + t("settingSponsor") + '"><input type="checkbox" data-setting="sponsorGifts"' + (s.sponsorGifts ? " checked" : "") + "> " + t("settingSponsor") + "</label>" +
    '<label class="check" title="' + t("settingAutoPlay") + '"><input type="checkbox" data-setting="autoPlay"' + (s.autoPlay ? " checked" : "") + "> " + t("settingAutoPlay") + "</label>" +
    '<label class="check" title="' + t("settingShowChanges") + '"><input type="checkbox" data-setting="showChanges"' + (s.showChanges ? " checked" : "") + "> " + t("settingShowChanges") + "</label>" +
    '<label class="check" title="' + t("settingDev") + '"><input type="checkbox" data-setting="devMode"' + (s.devMode ? " checked" : "") + "> " + t("settingDev") + "</label>" +
    revealSel +
    speedSel +
    langSel +
    "</span>";
}

function renderControls() {
  const c = $("#controls");
  let html = "";
  if (state.phase === "setup") {
    html += '<button class="btn primary" data-action="add">' + t("btnAdd") + "</button>";
    html += '<button class="btn ghost" data-action="example">' + t("btnExample") + "</button>";
    html += '<button class="btn gold" data-action="start"' + (state.tributes.length >= 2 ? "" : " disabled") + ">" + t("btnStart") + "</button>";
    html += '<button class="btn ghost" data-action="content">' + t("btnContent") + "</button>";
  } else if (state.phase === "day" || state.phase === "night") {
    const icon = state.phase === "day" ? "\u2600" : "\u{1F319}";
    const label = state.phase === "day" ? t("btnResolveDay", { day: state.day }) : t("btnResolveNight", { day: state.day });
    html += '<button class="btn gold" data-action="advance">' + icon + " " + label + "</button>";
    html += '<button class="btn ' + (autoActive ? "ghost" : "primary") + '" data-action="auto">' + (autoActive ? t("btnPause") : t("btnAutoPlay")) + "</button>";
    html += '<select class="speed-sel" data-speed>' + SPEEDS.map(([v, ms, key]) => '<option value="' + v + '"' + (autoSpeed === ms ? " selected" : "") + ">" + t(key) + "</option>").join("") + "</select>";
  } else {
    html += '<button class="btn gold" data-action="reset">' + t("btnNewGame") + "</button>";
  }
  if (state.phase !== "setup") html += '<button class="btn ghost" data-action="reset">' + t("btnReset") + "</button>";
  html += '<button class="btn ghost" data-action="stats">\u{1F4CA} ' + t("btnStats") + "</button>";
  html += settingsHTML();
  html += '<span class="phase-note hotkeys">' + t("hotkeys") + "</span>";
  c.innerHTML = html;
}

function personalityName(id) {
  const p = (catalog.personalities || []).find((x) => x.id === id);
  if (p) {
    const n = p.name;
    return n && typeof n === "object" ? (n[lang] || n.en || id) : (n || id);
  }
  return t("personality." + id);
}

function renderTributes() {
  const grid = $("#tribute-grid");
  grid.innerHTML = state.tributes.map(cardHTML).join("");
}

function invHTML(tb) {
  const ids = Object.keys(tb.items || {});
  if (!ids.length) return '<div class="inv-empty">' + t("invEmpty") + "</div>";
  const chips = [];
  for (const id of ids) {
    const st = tb.items[id];
    if (!st || st.qty <= 0) continue;
    const def = catalog.items.find((i) => i.id === id);
    if (!def) continue;
    const pct = def.dur ? Math.max(0, Math.min(100, Math.round((st.dur / def.dur) * 100))) : null;
    chips.push(
      '<span class="inv-item" title="' + esc(itemNameOf(def)) +
        (def.dur ? " \u00B7 " + t("itemDurLabel") + " " + pct + "%" : "") + '">' +
        def.emoji + (st.qty > 1 ? " \u00D7" + st.qty : "") +
        (def.dur ? '<span class="dur"><span style="width:' + pct + '%"></span></span>' : "") +
      "</span>"
    );
  }
  return chips.length ? chips.join("") : '<div class="inv-empty">' + t("invEmpty") + "</div>";
}

function profHTML(tb) {
  return '<div class="profs">' + PROF_META.map(([k, key]) => {
    const v = tb.proficiencies[k] != null ? tb.proficiencies[k] : 0;
    return '<span class="prof" title="' + esc(t(key)) + "\"><i>" + t(key) + " </i><b>" + v + "</b></span>";
  }).join("") + "</div>";
}

function cardHTML(tb) {
  const bars = STAT_META.map(([k, key]) => {
    const v = tb.attributes[k] != null ? tb.attributes[k] : 0;
    return '<div class="stat">' +
      '<div class="stat-top"><span>' + t(key) + '</span><b>' + v + '</b></div>' +
      '<div class="bar"><div class="fill ' + k + '" style="width:' + v + '%"></div></div>' +
      '</div>';
  }).join("");
  const genderIcon = GENDER_ICONS[tb.gender] || "";
  const personality = personalityName(tb.personality || "survivor");
  const allianceTag = tb.alliance ? '<span class="alliance-tag" title="' + t("allianceTag") + '">\u2694 ' + esc(tb.alliance) + "</span>" : "";
  const vetTag = tb.stats && (tb.stats.experience || 0) >= 20 ? '<span class="veteran-tag" title="' + t("veteranHint") + '">' + t("veteranTag") + "</span>" : "";
  const inSetup = state.phase === "setup";
  const cardBtns = inSetup
    ? '<div class="card-btns">' +
      '<button class="icon-btn" data-edit="' + tb.id + '" title="' + t("btnEdit") + '">\u270F\uFE0F</button>' +
      '<button class="icon-btn" data-del="' + tb.id + '" title="' + t("btnDelete") + '">\u{1F5D1}\uFE0F</button>' +
      "</div>"
    : "";
  let goalHTML = "";
  if (tb.goal) {
    const label = tb.goal.name ? t("goal." + tb.goal.key, { name: esc(tb.goal.name) }) : t("goal." + tb.goal.key);
    goalHTML = '<div class="goal goal-' + esc(tb.goal.key) + '" title="' + t("goalHint") + '">\u{1F3AF} ' + label + "</div>";
  }

  return '<div class="tribute ' + (tb.alive ? "" : "dead") + '">' +
    '<div class="card-top">' +
    '<span class="avatar">' + (tb.img ? '<img class="avatar-img" src="' + esc(tb.img) + '" alt="">' : (tb.emoji || "\u{1F3AD}")) + "</span>" +
    '<div class="who"><div class="name">' + (genderIcon ? genderIcon + " " : "") + esc(tb.name) + (tb.alive ? "" : ' <span class="dead-badge">' + t("dead") + "</span>") + "</div>" +
    '<div class="meta">' + esc(personality) + " \u00B7 " + t("stat.combat") + " " + tb.attributes.combat + " \u00B7 " + t("stat.survival") + " " + tb.attributes.survival + allianceTag + vetTag + "</div></div>" +
    cardBtns + "</div>" +
    goalHTML +
    '<div class="stats">' + bars + "</div>" +
    '<div class="card-label">' + t("invLabel") + "</div>" +
    '<div class="inv">' + invHTML(tb) + "</div>" +
    profHTML(tb) +
    "</div>";
}

let relView = "table";
let relCenterId = null;

const REL_COLORS = { green: "#5ecfa8", red: "#e05a4a", gray: "#9a978e", blue: "#4aa3ff" };

function relColor(v, allied) {
  if (allied) return REL_COLORS.blue;
  if (v >= 15) return REL_COLORS.green;
  if (v <= -15) return REL_COLORS.red;
  return REL_COLORS.gray;
}

function renderRelationsRadial() {
  const box = $("#rel-radial");
  if (!box) return;
  const ts = state.tributes;
  if (!ts.length) return;
  if (!relCenterId || !ts.some((t) => t.id === relCenterId)) relCenterId = ts[0].id;
  const center = ts.find((t) => t.id === relCenterId) || ts[0];
  const others = ts.filter((t) => t.id !== center.id);
  const CX = 220, CY = 220, R = 150;
  const step = others.length ? (2 * Math.PI) / others.length : 0;
  const nodes = others.map((t, i) => {
    const a = -Math.PI / 2 + step * i;
    return { t, x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
  });
  let svg = '<svg viewBox="0 0 440 440" class="rel-svg" xmlns="http://www.w3.org/2000/svg">';
  svg += "<defs>" + Object.keys(REL_COLORS).map((k) =>
    '<marker id="arr-' + k + '" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="' + REL_COLORS[k] + '"/></marker>'
  ).join("") + "</defs>";
  const CR = 26, OR = 15;
  const relLine = (x1, y1, x2, y2, r1, r2, ck, dead) => {
    const dx = x2 - x1, dy = y2 - y1;
    const l = Math.hypot(dx, dy) || 1;
    const ux = dx / l, uy = dy / l;
    const a = x1 + ux * r1, b = y1 + uy * r1;
    const c = x2 - ux * r2, d = y2 - uy * r2;
    return '<line x1="' + a + '" y1="' + b + '" x2="' + c + '" y2="' + d + '" stroke="' + REL_COLORS[ck] + '" stroke-width="2" marker-end="url(#arr-' + ck + ')"' + (dead ? ' opacity="0.35"' : "") + "/>";
  };
  for (const { t, x, y } of nodes) {
    const vOut = center.relationships[t.id] || 0;
    const vIn = t.relationships[center.id] || 0;
    const allied = !!center.alliance && center.alliance === t.alliance;
    const ckOut = relColorKey(relColor(vOut, allied)), ckIn = relColorKey(relColor(vIn, allied));
    const dx = x - CX, dy = y - CY;
    const len = Math.hypot(dx, dy) || 1;
    const px = (-dy / len) * 6, py = (dx / len) * 6;
    const dead = !t.alive;
    svg += relLine(CX + px, CY + py, x + px, y + py, CR, OR, ckOut, dead);
    svg += relLine(x - px, y - py, CX - px, CY - py, OR, CR, ckIn, dead);
  }
  for (let i = 0; i < nodes.length; i++) {
    const { t, x, y } = nodes[i];
    const dim = t.alive ? "" : ' opacity="0.4"';
    if (t.img) {
      svg += '<clipPath id="relclip' + i + '"><circle cx="' + x + '" cy="' + y + '" r="' + OR + '"/></clipPath>' +
        '<image href="' + esc(t.img) + '" x="' + (x - OR) + '" y="' + (y - OR) + '" width="' + (OR * 2) + '" height="' + (OR * 2) + '" clip-path="url(#relclip' + i + ')" preserveAspectRatio="xMidYMid slice"' + dim + "/>";
    } else {
      svg += '<circle cx="' + x + '" cy="' + y + '" r="' + OR + '" fill="#1b1d26" stroke="' + (t.alive ? "#d4af37" : "#555") + '" stroke-width="1.5"' + dim + "/>" +
        '<text x="' + x + '" y="' + (y + 6) + '" text-anchor="middle" font-size="16"' + dim + ">" + esc(t.emoji || "\u{1F3AD}") + "</text>";
    }
    svg += '<text x="' + x + '" y="' + (y <= CY && (y - 25) || (y + 30)) + '" text-anchor="middle" font-size="10" fill="' + (t.alive ? "#e8e6e0" : "#777") + '">' + esc(t.name) + "</text>";
  }
  if (center.img) {
    svg += '<clipPath id="relclipc"><circle cx="' + CX + '" cy="' + CY + '" r="' + CR + '"/></clipPath>' +
      '<image href="' + esc(center.img) + '" x="' + (CX - CR) + '" y="' + (CY - CR) + '" width="' + (CR * 2) + '" height="' + (CR * 2) + '" clip-path="url(#relclipc)" preserveAspectRatio="xMidYMid slice"/>';
  } else {
    svg += '<circle cx="' + CX + '" cy="' + CY + '" r="' + CR + '" fill="#1b1d26" stroke="#f2d47a" stroke-width="2"/>';
    svg += '<text x="' + CX + '" y="' + (CY + 7) + '" text-anchor="middle" font-size="24">' + esc(center.emoji || "\u{1F3AD}") + "</text>";
  }
  svg += '<text x="' + CX + '" y="' + (CY + CR + 14) + '" text-anchor="middle" font-size="11" fill="#f2d47a" font-weight="bold">' + esc(center.name) + "</text>";
  svg += "</svg>";
  const legend = '<div class="rel-legend">' +
    '<span><i style="background:' + REL_COLORS.green + '"></i>' + t("ui.relPositive") + "</span>" +
    '<span><i style="background:' + REL_COLORS.gray + '"></i>' + t("ui.relNeutral") + "</span>" +
    '<span><i style="background:' + REL_COLORS.red + '"></i>' + t("ui.relNegative") + "</span>" +
    '<span><i style="background:' + REL_COLORS.blue + '"></i>' + t("ui.relAlliance") + "</span></div>";
  const pick = '<div class="rel-center"><label>' + t("ui.relCenter") + "</label><select id=\"rel-center\">" +
    ts.map((t) => '<option value="' + t.id + '"' + (t.id === relCenterId ? " selected" : "") + ">" + esc(t.name) + "</option>").join("") +
    "</select></div>";
  box.innerHTML = pick + svg + legend;
}

function relColorKey(hex) {
  for (const k of Object.keys(REL_COLORS)) if (REL_COLORS[k] === hex) return k;
  return "gray";
}

function renderRelations() {
  const table = $("#rel-matrix");
  const radial = $("#rel-radial");
  if (!table) return;
  document.querySelectorAll("[data-rel-view]").forEach((b) => b.classList.toggle("active", b.dataset.relView === relView));
  const showRadial = relView === "radial";
  const wrap = document.querySelector(".matrix-scroll");
  if (wrap) wrap.classList.toggle("hidden", showRadial);
  radial.classList.toggle("hidden", !showRadial);
  if (showRadial) {
    renderRelationsRadial();
    return;
  }
  const ts = state.tributes;
  const locked = state.phase !== "setup";
  let html = "<thead><tr><th></th>";
  for (const t of ts) html += "<th>" + esc(t.name) + "</th>";
  html += "</tr></thead><tbody>";
  for (const a of ts) {
    html += "<tr><th class=\"row-name\">" + esc(a.name) + "</th>";
    for (const b of ts) {
      if (a.id === b.id) {
        html += '<td class="diag"></td>';
        continue;
      }
      const v = a.relationships[b.id] != null ? a.relationships[b.id] : 0;
      html += '<td><div class="rel-cell ' + (locked ? "locked" : "") + '">' +
        '<input type="range" min="-100" max="100" step="5" value="' + v + '" data-rel="' + a.id + ":" + b.id + '"' + (locked ? " disabled" : "") + ">" +
        '<span class="rel-val">' + (v > 0 ? "+" : "") + v + "</span>" +
        '<span class="rel-label">' + relLabel(v) + "</span>" +
        "</div></td>";
    }
    html += "</tr>";
  }
  html += "</tbody>";
  table.innerHTML = html;
}

function logMode() {
  return (state.settings && state.settings.logReveal) || "off";
}

function logSpeed() {
  return (state.settings && state.settings.revealSpeed) || "normal";
}

function buildLogLines() {
  const showChanges = state.settings ? state.settings.showChanges : true;
  const lines = [];
  let prevKey = "";
  for (const e of state.log) {
    const key = e.day + ":" + e.phase;
    let header = null;
    if (key !== prevKey) {
      header = '<div class="log-header">' + phaseHeader(e) + "</div>";
      prevKey = key;
    }
    let text = e.text;
    if (showChanges && e.changes) text += "  \u2014  " + e.changes;
    lines.push({ header, text, cat: esc(e.cat) });
  }
  return lines;
}

function renderLogLines(lines, cursor, typePos, mode) {
  const list = $("#log-list");
  const isType = mode === "type";
  let html = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const visible = i < cursor || (isType && i === cursor && typePos > 0);
    if (!visible) break;
    if (line.header) html += line.header;
    let text = line.text;
    if (isType && i === cursor) text = line.text.slice(0, typePos);
    html += '<div class="log-entry ' + line.cat + '">' + esc(text) + "</div>";
  }
  if (!lines.length) html = '<div class="log-empty">' + t("logEmpty") + "</div>";
  list.innerHTML = html;
  list.scrollTop = list.scrollHeight;
}

function stopRevealTimer() {
  if (revealTimer) {
    clearInterval(revealTimer);
    revealTimer = null;
  }
}

function scheduleReveal(mode) {
  stopRevealTimer();
  const speed = REVEAL_SPEEDS[logSpeed()] || REVEAL_SPEEDS.normal;
  const delay = mode === "type" ? speed.char : speed.line;
  revealTimer = setInterval(() => {
    const target = revealLines.length;
    if (mode === "type") {
      if (revealCursor >= target) {
        stopRevealTimer();
        return;
      }
      revealTypePos++;
      const cur = revealLines[revealCursor];
      if (cur && revealTypePos >= cur.text.length) {
        revealCursor++;
        revealTypePos = 0;
      }
      renderLogLines(revealLines, revealCursor, revealTypePos, mode);
    } else {
      if (revealCursor >= target) {
        stopRevealTimer();
        return;
      }
      revealCursor++;
      renderLogLines(revealLines, revealCursor, 0, mode);
    }
  }, delay);
}

function renderLog() {
  const mode = logMode();
  const lines = buildLogLines();
  const target = lines.length;
  if (lastRevealMode === "type" && mode !== "type" && revealTypePos > 0) {
    revealCursor += 1;
    revealTypePos = 0;
  }
  lastRevealMode = mode;
  revealLines = lines;
  if (revealCursor > target) {
    revealCursor = target;
    revealTypePos = 0;
  }
  if (mode === "off") {
    stopRevealTimer();
    renderLogLines(lines, target, 0, "off");
    return;
  }
  renderLogLines(lines, revealCursor, revealTypePos, mode);
  const cur = mode === "type" && revealCursor < target ? revealLines[revealCursor] : null;
  if (revealCursor < target || (cur && revealTypePos < cur.text.length)) {
    scheduleReveal(mode);
  }
}

let mainTab = "events";

function setMainTab(tab) {
  mainTab = tab;
  document.querySelectorAll(".main-tabs .tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.sheet === tab));
  document.querySelectorAll(".tab-sheet").forEach((s) => s.classList.toggle("hidden", s.dataset.sheet !== tab));
}

function renderAll() {
  applyI18n();
  renderHeader();
  renderControls();
  renderMapPanel();
  renderWinPanel();
  renderPacksPanel();
  renderStatsPanel();
  renderBoss();
  renderTributes();
  renderRelations();
  renderLog();
  renderContent();
  renderDevEvents();
  renderDevTribute();
  renderDevMap();
  if (state.phase === "finished") setMainTab("events");
}

let devTributeId = null;

function devPut(path, body) {
  call(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {})
  }).then((st) => { state = st; renderAll(); }).catch((e) => alert("Error: " + e.message));
}

const DEV_EVENT_CATS = ["gather", "scout", "build", "fight", "social", "rest", "survive", "night"];

function renderDevEvents() {
  const panel = $("#dev-events");
  if (!panel) return;
  panel.classList.toggle("hidden", !state.settings.devMode);
  if (!state.settings.devMode) return;
  const globals = (catalog.globalEvents || []).slice().sort((a, b) => String(a.id).localeCompare(String(b.id)));
  $("#dev-global").innerHTML = globals.map((g) => '<option value="' + esc(g.id) + '">' + esc(g.id) + "</option>").join("");
  $("#dev-event-cat").innerHTML = DEV_EVENT_CATS.map((c) => '<option value="' + c + '">' + esc(t("evcat." + c)) + "</option>").join("");
  $("#dev-event-tribute").innerHTML = '<option value="">' + esc(t("devRandom")) + "</option>" +
    state.tributes.filter((tb) => tb.alive).map((tb) => '<option value="' + tb.id + '">' + esc(tb.name) + "</option>").join("");
}

function renderDevTribute() {
  const panel = $("#dev-tribute");
  if (!panel) return;
  panel.classList.toggle("hidden", !state.settings.devMode);
  if (!state.settings.devMode) return;
  if (!devTributeId || !state.tributes.some((t) => t.id === devTributeId)) devTributeId = state.tributes.length ? state.tributes[0].id : null;
  $("#dev-tribute-pick").innerHTML = state.tributes.map((tb) =>
    '<option value="' + tb.id + '"' + (tb.id === devTributeId ? " selected" : "") + ">" + esc(tb.name) + "</option>"
  ).join("");
  const tb = state.tributes.find((t) => t.id === devTributeId);
  if (!tb) return;
  $("#dev-tribute-stats").innerHTML = STAT_META.map(([k, key]) => {
    const v = tb.attributes[k] != null ? tb.attributes[k] : 0;
    return '<div class="edit-stat"><label>' + t(key) + "</label>" +
      '<input type="range" min="0" max="100" value="' + v + '" data-devstat="' + k + '"><span class="rel-val">' + v + "</span></div>";
  }).join("");
  $("#dev-tribute-profs").innerHTML = PROF_META.map(([k, key]) => {
    const v = tb.proficiencies[k] != null ? tb.proficiencies[k] : 0;
    return '<div class="edit-stat"><label>' + t(key) + "</label>" +
      '<input type="range" min="0" max="100" value="' + v + '" data-devprof="' + k + '"><span class="rel-val">' + v + "</span></div>";
  }).join("");
  $("#dev-tribute-pers").innerHTML = (catalog.personalities || []).filter((p) => p.enabled !== false).map((p) =>
    '<option value="' + p.id + '"' + (tb.personality === p.id ? " selected" : "") + ">" + esc(personalityName(p.id)) + "</option>"
  ).join("");
  $("#dev-item").innerHTML = (catalog.items || []).filter((i) => i.enabled !== false).map((i) =>
    '<option value="' + i.id + '">' + esc(itemNameOf(i)) + "</option>"
  ).join("");
  const ids = Object.keys(tb.items || {}).filter((id) => tb.items[id] && tb.items[id].qty > 0);
  $("#dev-tribute-inv").innerHTML = ids.length
    ? ids.map((id) => {
        const def = catalog.items.find((i) => i.id === id);
        if (!def) return "";
        return '<div class="dev-inv-item"><span>' + def.emoji + " " + esc(itemNameOf(def)) + (tb.items[id].qty > 1 ? " \u00D7" + tb.items[id].qty : "") + "</span>" +
          '<button class="icon-btn" data-dev-item-del="' + esc(id) + '" title="' + t("btnDelete") + '">\u{1F5D1}\uFE0F</button></div>';
      }).join("")
    : '<div class="hint">' + t("invEmpty") + "</div>";
}

function renderDevMap() {
  const panel = $("#dev-map");
  if (!panel) return;
  panel.classList.toggle("hidden", !state.settings.devMode);
  if (!state.settings.devMode) return;
  const m = state.map || {};
  $("#dev-weather").checked = !!m.weather;
  $("#dev-scarcity").innerHTML = SCARCITY_META.map(([k, key]) => {
    const v = (m.scarcity && m.scarcity[k]) || 0;
    return '<div class="edit-stat"><label>' + t(key) + "</label>" +
      '<input type="range" min="0" max="100" value="' + v + '" data-devscarcity="' + k + '"><span class="rel-val">' + v + "</span></div>";
  }).join("");
}

const WIN_MODES = ["hg", "survivors", "boss_slayer", "hg_plus"];

function renderWinPanel() {
  const panel = $("#win-panel");
  if (!panel) return;
  const show = state.phase === "setup";
  panel.classList.toggle("hidden", !show);
  if (!show) return;
  const s = state.settings || {};
  const mode = s.winMode || "hg";
  $("#win-mode").innerHTML = WIN_MODES.map((k) =>
    '<label class="win-mode' + (mode === k ? " on" : "") + '"><input type="radio" name="winmode" value="' + k + '"' + (mode === k ? " checked" : "") + ">" +
    "<b>" + t("winmode." + k) + "</b><span>" + t("winmodeHint." + k) + "</span></label>"
  ).join("");
  $("#win-endday").value = s.endDay || 10;
  $("#win-bossmin").value = state.map && state.map.bossMinDay != null ? state.map.bossMinDay : "";
  $("#win-bosscount").value = state.map && state.map.bossCount != null ? state.map.bossCount : 1;
  $("#win-alliances-toggle").checked = !!s.alliances;
  $("#win-endday-field").classList.toggle("hidden", mode !== "survivors");
  $("#win-boss-field").classList.toggle("hidden", mode !== "boss_slayer");
  $("#win-alliances-field").classList.toggle("hidden", mode !== "hg_plus" && !s.alliances);
  if (mode === "hg_plus" || s.alliances) renderAllianceList();
}

function renderAllianceList() {
  const box = $("#win-alliances");
  if (!box) return;
  const alliances = [...new Set(state.tributes.map((x) => x.alliance).filter(Boolean))];
  if (!state.tributes.length) {
    box.innerHTML = '<div class="hint">' + t("empty") + "</div>";
    return;
  }
  box.innerHTML = state.tributes.map((tb) =>
    '<div class="alliance-row"><span class="row-title">' + esc(tb.name) + "</span>" +
    '<select data-alliance="' + tb.id + '">' +
    '<option value=""' + (!tb.alliance ? " selected" : "") + ">" + t("winAllianceNone") + "</option>" +
    alliances.map((a) => '<option value="' + esc(a) + '"' + (tb.alliance === a ? " selected" : "") + ">" + esc(a) + "</option>").join("") +
    '<option value="__new__">' + t("winAllianceNew") + "</option>" +
    "</select></div>"
  ).join("");
}

const BOSS_DISPLAY_MAX = 4;

function renderBoss() {
  const panel = $("#boss-panel");
  if (!panel) return;
  const list = (state.activeGlobals || []).filter((g) => g.boss && g.boss.health > 0);
  panel.classList.toggle("hidden", !list.length);
  if (!list.length) return;
  const shown = list.slice(0, BOSS_DISPLAY_MAX);
  const extra = list.length - shown.length;
  let html = shown.map((g, i) => bossCardHTML(g, i === 0)).join("");
  if (extra > 0) html += '<div class="boss-more">' + t("ui.bossMore", { n: extra }) + "</div>";
  $("#boss-body").innerHTML = html;
}

function bossCardHTML(g, primary) {
  const b = g.boss;
  const pct = Math.max(0, Math.min(100, Math.round((b.health / b.maxHealth) * 100)));
  const name = typeof b.name === "object" ? (b.name[state.settings.language] || b.name.en || Object.values(b.name)[0] || "") : (b.name || "");
  const remCount = b.remainingCount != null ? b.remainingCount : b.count;
  const countTag = b.count > 1 ? ' <span class="boss-count" title="' + esc(remCount) + " / " + esc(b.count) + " " + t("ui.bossSquadRemaining") + '">\u00D7' + remCount + (remCount < b.count ? "/" + b.count : "") + "</span>" : "";
  const beh = (b.behaviors || []).map((x) => t("ui.boss" + x.charAt(0).toUpperCase() + x.slice(1) + "B")).join(", ") || t("ui.bossStationary");
  if (!primary) {
    return '<div class="boss-card mini">' +
      '<div class="boss-top"><span class="boss-emoji">' + esc(b.emoji || "\u{1F479}") + "</span>" +
      '<div class="boss-who"><div class="boss-name">' + esc(name) + countTag + "</div>" +
      '<div class="boss-beh">' + esc(beh) + " \u00B7 " + t("stat.combat") + " " + b.combat + "</div></div></div>" +
      '<div class="boss-hp"><div class="boss-hp-top"><span></span><b>' + b.health + " / " + b.maxHealth + "</b></div>" +
      '<div class="bar boss-bar"><div class="fill health" style="width:' + pct + '%"></div></div></div>' +
      "</div>";
  }
  const bw = b.weapons && b.weapons.length ? b.weapons : [{ cat: "melee", dmg: 8 }];
  const bwLabel = bw.map((w) => t("cat." + (["melee", "ranged", "explosive"].includes(w.cat) ? w.cat : "melee")) + " " + dmgLabel(w.dmg || 8) + (w.spd && w.spd > 1 ? " \u00D7" + w.spd : "")).join(" \u00B7 ");
  return '<div class="boss-card">' +
    '<div class="boss-top"><span class="boss-emoji">' + esc(b.emoji || "\u{1F479}") + "</span>" +
    '<div class="boss-who"><div class="boss-name">' + esc(name) + countTag + "</div>" +
    '<div class="boss-meta">' + t("stat.combat") + " " + b.combat + " \u00B7 " + t("stat.morale") + " " + b.morale + " \u00B7 " + t("stat.stealth") + " " + b.stealth + " \u00B7 " + t("stat.defense") + " " + (b.defense || 0) + "</div>" +
    '<div class="boss-beh">' + esc(beh) + " \u00B7 " + esc(bwLabel) + "</div></div></div>" +
    '<div class="boss-hp"><div class="boss-hp-top"><span>' + t("ui.bossHealth") + '</span><b>' + b.health + " / " + b.maxHealth + "</b></div>" +
    '<div class="bar boss-bar"><div class="fill health" style="width:' + pct + '%"></div></div></div>' +
    "</div>";
}

function renderStatsPanel() {
  const panel = $("#stats-panel");
  if (!panel) return;
  const always = state.phase === "finished";
  panel.classList.toggle("hidden", !showStats && !always);
  if (!showStats && !always) return;
  const tributes = state.tributes;
  const sortKey = statsSort && STAT_KEYS.some(([k]) => k === statsSort) ? statsSort : "kills";
  $("#stats-sort").innerHTML = STAT_KEYS.map(([k, key]) =>
    '<option value="' + k + '"' + (k === sortKey ? " selected" : "") + ">" + t(key) + "</option>"
  ).join("");
  const sortLabel = STAT_KEYS.find(([k]) => k === sortKey)[1];
  const sorted = [...tributes].sort((a, b) => (b.stats[sortKey] || 0) - (a.stats[sortKey] || 0));
  let html = "<h3>" + t("statsLeader") + " — " + t(sortLabel) + "</h3>";
  html += '<div class="content-list">';
  if (!tributes.length) html += '<div class="hint">' + t("empty") + "</div>";
  sorted.forEach((tb, i) => {
    html += '<div class="content-row"><div class="row-main"><div class="row-title">#' + (i + 1) + " " + esc(tb.name) + (tb.alive ? "" : ' <span class="dead-badge">' + t("dead") + "</span>") + "</div>" +
      '<div class="row-sub">' + (tb.stats[sortKey] || 0) + " " + t(sortLabel) + "</div></div></div>";
  });
  html += "</div>";
  html += "<h3>" + t("statsPerTribute") + "</h3>";
  html += '<table class="stats-table"><thead><tr><th></th>' +
    STAT_KEYS.map(([, key]) => "<th>" + t(key) + "</th>").join("") +
    "</tr></thead><tbody>";
  for (const tb of tributes) {
    html += "<tr><th>" + esc(tb.name) + "</th>" + STAT_KEYS.map(([k]) => "<td>" + (tb.stats[k] || 0) + "</td>").join("") + "</tr>";
  }
  html += "</tbody></table>";
  $("#stats-body").innerHTML = html;
}

function renderPacksPanel() {
  const panel = $("#packs-panel");
  if (!panel) return;
  panel.classList.toggle("hidden", state.phase !== "setup");
  if (state.phase !== "setup") return;
  const list = $("#pack-list");
  if (!packs.length) {
    list.innerHTML = '<div class="hint">' + t("packsEmpty") + "</div>";
    return;
  }
  list.innerHTML = packs.map((p) =>
    '<div class="content-row">' +
    '<div class="row-main"><div class="row-title">' + esc(p.name) + "</div>" +
    '<div class="row-sub">' + p.tributes.length + " " + t("panelTributes") + "</div></div>" +
    '<button class="icon-btn" data-pack-load="' + esc(p.name) + '" title="' + t("packLoad") + '">\u21BA</button>' +
    '<button class="icon-btn" data-pack-del="' + esc(p.name) + '" title="' + t("btnDelete") + '">\u{1F5D1}\uFE0F</button>' +
    "</div>"
  ).join("");
}

async function refreshPacks() {
  try {
    packs = (await call("/api/packs")).packs;
    renderPacksPanel();
  } catch (e) {}
}

async function saveCurrentPack() {
  const name = prompt(t("packNamePrompt"));
  if (!name || !name.trim()) return;
  try {
    packs = (await call("/api/packs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() })
    })).packs;
    renderPacksPanel();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

async function loadPackByName(name) {
  try {
    state = await call("/api/packs/" + encodeURIComponent(name) + "/load", { method: "POST" });
    renderAll();
    await refreshPacks();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

async function deletePackByName(name) {
  if (!confirm(t("btnDelete") + "?")) return;
  try {
    packs = (await call("/api/packs/" + encodeURIComponent(name), { method: "DELETE" })).packs;
    renderPacksPanel();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

function renderMapPanel() {
  const panel = $("#map-panel");
  if (!panel) return;
  const show = state.phase === "setup";
  panel.classList.toggle("hidden", !show);
  if (!show) return;
  const m = state.map || {};
  $("#map-biome").innerHTML = (catalog.biomes || []).map((b) =>
    '<option value="' + b + '"' + (m.biome === b ? " selected" : "") + ">" + t("biome." + b) + "</option>"
  ).join("");
  $("#map-weather").checked = !!m.weather;
  $("#map-replenish").checked = m.replenish !== false;
  $("#map-globals").checked = !!m.globalEvents;
  if (!mapNumbersInit) {
    $("#map-globals-min").value = m.globalsMin != null ? m.globalsMin : "";
    $("#map-globals-max").value = m.globalsMax != null ? m.globalsMax : "";
    mapNumbersInit = true;
  }
  $("#map-scarcity").innerHTML = SCARCITY_META.map(([k, key]) => {
    const v = (m.scarcity && m.scarcity[k]) || 0;
    return '<div class="edit-stat"><label>' + t(key) + "</label>" +
      '<input type="range" min="0" max="100" value="' + v + '" data-scarcity="' + k + '">' +
      '<span class="rel-val" data-scarcityval="' + k + '">' + v + "</span></div>";
  }).join("");
}

function onMapChange(e) {
  const el = e.target.closest("[data-scarcity]");
  if (el) {
    mutate("/api/map", { scarcity: { [el.dataset.scarcity]: Number(el.value) } });
    return;
  }
  if (e.target.id === "map-biome") mutate("/api/map", { biome: e.target.value });
  else if (e.target.id === "map-weather") mutate("/api/map", { weather: e.target.checked });
  else if (e.target.id === "map-replenish") mutate("/api/map", { replenish: e.target.checked });
  else if (e.target.id === "map-globals") mutate("/api/map", { globalEvents: e.target.checked });
}

// ---------- tribute modal ----------

let editItems = [];

let bossWeapons = [{ cat: "melee", dmg: 8 }];

function bossWeaponRowHTML(w, i) {
  return '<div class="fxrow boss-weapon-row" data-bw-index="' + i + '">' +
    '<div class="seg">' +
      '<button type="button" data-bwcat="melee" class="' + (w.cat === "melee" ? "active" : "") + '">' + t("ui.weaponMelee") + "</button>" +
      '<button type="button" data-bwcat="ranged" class="' + (w.cat === "ranged" ? "active" : "") + '">' + t("ui.weaponRanged") + "</button>" +
      '<button type="button" data-bwcat="explosive" class="' + (w.cat === "explosive" ? "active" : "") + '">' + t("ui.weaponExplosive") + "</button>" +
    "</div>" +
    '<input type="text" value="' + dmgLabel(w.dmg) + '" data-bwdmg title="' + t("ui.bossWeaponDmg") + '">' +
    '<input type="number" min="1" value="' + (w.spd || 1) + '" data-bwspd title="' + t("ui.bossWeaponSpd") + '">' +
    '<button class="icon-btn" data-bw-del title="' + t("btnDelete") + '">\u{1F5D1}\uFE0F</button>' +
    "</div>";
}

function renderBossWeapons() {
  const box = $("#global-boss-weapons");
  if (!box) return;
  box.innerHTML = bossWeapons.map(bossWeaponRowHTML).join("");
}

function renderEditItems() {
  $("#edit-item-pick").innerHTML = (catalog.items || []).filter((i) => i.enabled !== false).map((i) =>
    '<option value="' + i.id + '">' + esc(itemNameOf(i)) + "</option>"
  ).join("");
  $("#edit-items").innerHTML = editItems.length
    ? editItems.map((id) => {
        const def = catalog.items.find((i) => i.id === id);
        if (!def) return "";
        return '<div class="dev-inv-item"><span>' + def.emoji + " " + esc(itemNameOf(def)) + "</span>" +
          '<button class="icon-btn" data-edit-item-del="' + esc(id) + '" title="' + t("btnDelete") + '">\u{1F5D1}\uFE0F</button></div>';
      }).join("")
    : '<div class="hint">' + t("invEmpty") + "</div>";
}

function openEdit(id) {
  editId = id;
  const tb = id ? state.tributes.find((x) => x.id === id) : null;
  editItems = tb ? Object.keys(tb.items || {}).filter((iid) => tb.items[iid] && tb.items[iid].qty > 0) : [];
  $("#modal-title").textContent = tb ? t("modalEdit") : t("modalAdd");
  $("#edit-name").value = tb ? tb.name : "";
  $("#edit-emoji").value = tb ? (tb.emoji || "") : "";
  $("#emoji-quick").innerHTML = EMOJIS.map((e) => '<button type="button" class="emoji-btn">' + e + "</button>").join("");
  editImg = tb && tb.img ? tb.img : null;
  updateAvatarPreview();
  $("#edit-gender").innerHTML = (catalog.genders || []).map((g) =>
    "<option value=\"" + g + "\"" + (tb && tb.gender === g ? " selected" : "") + ">" + t(genderKey(g)) + "</option>"
  ).join("");
  $("#edit-personality").innerHTML = (catalog.personalities || []).filter((p) => p.enabled !== false).map((p) =>
    "<option value=\"" + p.id + "\"" + (tb && tb.personality === p.id ? " selected" : "") + ">" + esc(personalityName(p.id)) + "</option>"
  ).join("");
  $("#edit-alliance").value = (tb && tb.alliance) || "";
  $("#edit-ability").innerHTML = '<option value="">' + t("abNone") + "</option>" +
    (catalog.abilities || []).filter((a) => a.enabled !== false).map((a) =>
      '<option value="' + esc(a.id) + '"' + (tb && tb.ability === a.id ? " selected" : "") + ">" + esc(abilityNameOf(a)) + "</option>"
    ).join("");
  $("#edit-stats").innerHTML = STAT_META.map(([k, key]) => {
    let v;
    if (tb) v = tb.attributes[k];
    else v = ["health", "energy", "food", "morale"].includes(k) ? 100 : k === "supplies" ? 20 : 30;
    return '<div class="edit-stat">' +
      "<label>" + t(key) + "</label>" +
      '<input type="range" min="0" max="100" value="' + v + '" data-stat="' + k + '">' +
      '<span class="rel-val" data-statval="' + k + '">' + v + "</span></div>";
  }).join("");
  $("#edit-profs").innerHTML = PROF_META.map(([k, key]) => {
    const v = tb ? tb.proficiencies[k] : 30;
    return '<div class="edit-stat">' +
      "<label>" + t(key) + "</label>" +
      '<input type="range" min="0" max="100" value="' + v + '" data-prof="' + k + '">' +
      '<span class="rel-val" data-profval="' + k + '">' + v + "</span></div>";
  }).join("");
  renderEditItems();
  $("#edit-modal").classList.remove("hidden");
  $("#edit-name").focus();
  $("#edit-name").select();
}

function updateAvatarPreview() {
  const img = $("#edit-avatar-preview");
  if (editImg) {
    img.src = editImg;
    img.classList.remove("hidden");
  } else {
    img.src = "";
    img.classList.add("hidden");
  }
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function genderKey(g) {
  return g === "female" ? "genderFemale" : g === "male" ? "genderMale" : g === "non-binary" ? "genderNB" : "genderUnspec";
}

function closeEdit() {
  $("#edit-modal").classList.add("hidden");
  editId = null;
}

async function saveEdit() {
  const name = $("#edit-name").value.trim() || "Tribute";
  const emoji = $("#edit-emoji").value.trim() || "\u{1F3AD}";
  const img = editImg || null;
  const gender = $("#edit-gender").value;
  const personality = $("#edit-personality").value;
  const alliance = $("#edit-alliance").value.trim() || null;
  const ability = $("#edit-ability").value || null;
  const attributes = {};
  document.querySelectorAll("[data-stat]").forEach((el) => {
    attributes[el.dataset.stat] = Number(el.value);
  });
  const proficiencies = {};
  document.querySelectorAll("[data-prof]").forEach((el) => {
    proficiencies[el.dataset.prof] = Number(el.value);
  });
  try {
    if (editId) {
      state = await call("/api/tributes/" + editId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emoji, img, gender, personality, alliance, ability, attributes, proficiencies, items: editItems })
      });
    } else {
      state = await call("/api/tributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emoji, img, gender, personality, alliance, ability, attributes, proficiencies, items: editItems })
      });
    }
    closeEdit();
    renderAll();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

async function removeTribute(id) {
  if (!confirm(t("confirmDeleteTribute"))) return;
  try {
    state = await call("/api/tributes/" + id, { method: "DELETE" });
    renderAll();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

// ---------- content editor ----------

function openContent() {
  renderContent();
  refreshContentPacks();
  $("#content-panel").classList.remove("hidden");
}

function saveContentPack() {
  const name = prompt(t("packNamePrompt"));
  if (!name || !name.trim()) return;
  call("/api/contentpacks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim() })
  }).then((r) => {
    contentPacks = r.packs;
    renderContentPacks();
  }).catch((e) => alert("Error: " + e.message));
}

async function loadContentPackByName(name) {
  try {
    contentPacks = (await call("/api/contentpacks/" + encodeURIComponent(name) + "/load", { method: "POST" })).packs;
    await refreshContent();
    renderContentPacks();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

async function deleteContentPackByName(name) {
  if (!confirm(t("btnDelete") + "?")) return;
  try {
    contentPacks = (await call("/api/contentpacks/" + encodeURIComponent(name), { method: "DELETE" })).packs;
    renderContentPacks();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

function closeContent() {
  $("#content-panel").classList.add("hidden");
}

async function refreshContent() {
  const [cat, content] = await Promise.all([call("/api/catalog"), call("/api/content")]);
  catalog = Object.assign({}, cat, content);
  renderContent();
  renderAll();
}

function catFilterRow(options, active, prefix) {
  const keyPrefix = prefix === "evcat" ? "evcat." : prefix === "globmode" ? "globmode." : "cat.";
  return '<div class="cat-filters">' +
    ['<button class="cat-btn' + (active === "all" ? " active" : "") + '" data-cat-filter="' + prefix + ':all">' + t("catAll") + "</button>"].concat(
      options.map((c) => '<button class="cat-btn' + (active === c ? " active" : "") + '" data-cat-filter="' + prefix + ":" + c + '">' + t(keyPrefix + c) + "</button>")
    ).join("") +
    "</div>";
}

function contentFilterHTML(type) {
  const active = contentFilters[type] || "enabled";
  return '<div class="cat-filters">' +
    ["everything", "enabled", "disabled"].map((k) =>
      '<button class="cat-btn' + (active === k ? " active" : "") + '" data-content-filter="' + type + ":" + k + '">' + t("contentFilter." + k) + "</button>"
    ).join("") +
    "</div>";
}

function contentVisible(obj, type) {
  const f = contentFilters[type] || "enabled";
  if (f === "everything") return true;
  const en = obj.enabled !== false;
  return f === "disabled" ? !en : en;
}

function contentToggleHTML(obj, type) {
  const on = obj.enabled !== false;
  return '<button class="icon-btn content-toggle' + (on ? "" : " off") + '" data-content-toggle="' + type + ":" + esc(obj.id) + '" title="' + (on ? t("contentDisable") : t("contentEnable")) + '">' + (on ? "\u2705" : "\u26D4") + "</button>";
}

function renderContentPacks() {
  const list = $("#contentpack-list");
  if (!list) return;
  if (!contentPacks.length) {
    list.innerHTML = '<div class="hint">' + t("packsEmpty") + "</div>";
    return;
  }
  list.innerHTML = contentPacks.map((p) =>
    '<div class="content-row">' +
    '<div class="row-main"><div class="row-title">' + esc(p.name) + "</div>" +
    '<div class="row-sub">' + (p.items ? p.items.length : 0) + " " + t("contentTabItems") + " \u00B7 " + (p.events ? p.events.length : 0) + " " + t("contentTabEvents") + " \u00B7 " + (p.globals ? p.globals.length : 0) + " " + t("contentTabGlobals") + " \u00B7 " + (p.personalities ? p.personalities.length : 0) + " " + t("contentTabPersonalities") + " \u00B7 " + (p.abilities ? p.abilities.length : 0) + " " + t("contentTabAbilities") + "</div></div>" +
    '<button class="icon-btn" data-contentpack-load="' + esc(p.name) + '" title="' + t("packLoad") + '">\u21BA</button>' +
    '<button class="icon-btn" data-contentpack-del="' + esc(p.name) + '" title="' + t("btnDelete") + '">\u{1F5D1}\uFE0F</button>' +
    "</div>"
  ).join("");
}

async function refreshContentPacks() {
  try {
    contentPacks = (await call("/api/contentpacks")).packs;
    renderContentPacks();
  } catch (e) {}
}

function renderContent() {
  applyI18n();
  const itemsBody = $("#content-items");
  const eventsBody = $("#content-events");
  const globalsBody = $("#content-globals");
  const persBody = $("#content-personalities");
  const abBody = $("#content-abilities");
  const langBody = $("#content-languages");
  if (!itemsBody) return;
  itemsBody.classList.toggle("hidden", contentTab !== "items");
  eventsBody.classList.toggle("hidden", contentTab !== "events");
  globalsBody.classList.toggle("hidden", contentTab !== "globals");
  persBody.classList.toggle("hidden", contentTab !== "personalities");
  abBody.classList.toggle("hidden", contentTab !== "abilities");
  langBody.classList.toggle("hidden", contentTab !== "languages");
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === contentTab);
  });
  if (contentTab === "items") renderItemsTab();
  else if (contentTab === "events") renderEventsTab();
  else if (contentTab === "globals") renderGlobalsTab();
  else if (contentTab === "personalities") renderPersonalitiesTab();
  else if (contentTab === "abilities") renderAbilitiesTab();
  else renderLanguagesTab();
}

function renderItemsTab() {
  const body = $("#content-items");
  const items = catalog ? catalog.items : [];
  let html = '<div class="content-toolbar"><button class="btn primary small" id="item-add">' + t("btnAddItem") + "</button></div>";
  html += catFilterRow(ITEMCATS, contentItemCat, "itemcat");
  html += contentFilterHTML("items");
  html += '<div class="content-list">';
  const filtered = (contentItemCat === "all" ? items : items.filter((i) => i.cat === contentItemCat)).filter((i) => contentVisible(i, "items"));
  if (!filtered.length) html += '<div class="content-row row-sub">' + t("empty") + "</div>";
  for (const it of filtered) {
    html += '<div class="content-row' + (it.enabled === false ? " disabled" : "") + '">' +
      '<span class="row-emoji">' + (it.emoji || "") + "</span>" +
      '<div class="row-main"><div class="row-title">' + esc(itemNameOf(it)) + "</div>" +
      '<div class="row-sub">' + t("cat." + it.cat) + " \u00B7 " + t("itemWeightLabel") + " " + it.weight + (it.dmg ? " \u00B7 " + t("itemDmgLabel") + " " + dmgLabel(it.dmg) + (it.spd && it.spd > 1 ? " \u00D7" + it.spd : "") : "") + "</div></div>" +
      contentToggleHTML(it, "items") +
      '<button class="icon-btn" data-item-edit="' + it.id + '">\u270F\uFE0F</button>' +
      '<button class="icon-btn" data-item-del="' + it.id + '">\u{1F5D1}\uFE0F</button>' +
      "</div>";
  }
  html += "</div>";
  body.innerHTML = html;
}

function renderEventsTab() {
  const body = $("#content-events");
  const events = catalog ? catalog.events : [];
  let html = '<div class="content-toolbar"><button class="btn primary small" id="event-add">' + t("btnAddEvent") + "</button></div>";
  html += catFilterRow(EVCATS, contentEventCat, "evcat");
  html += contentFilterHTML("events");
  html += '<div class="content-list">';
  const filtered = (contentEventCat === "all" ? events : events.filter((e) => e.cat === contentEventCat)).filter((e) => contentVisible(e, "events"));
  if (!filtered.length) html += '<div class="content-row row-sub">' + t("empty") + "</div>";
  for (const ev of filtered) {
    html += '<div class="content-row' + (ev.enabled === false ? " disabled" : "") + '">' +
      '<div class="row-main"><div class="row-title">' + esc(ev.id) + '</div>' +
      '<div class="row-sub">' + t("evcat." + ev.cat) + " \u00B7 " + t("eventPhaseLabel") + " " + ev.phase +
        " \u00B7 " + t("eventTargetsLabel") + " " + (Array.isArray(ev.targets) ? ev.targets.join("-") : ev.targets) + " \u00B7 " + esc(eventTplOf(ev)) + "</div></div>" +
      contentToggleHTML(ev, "events") +
      '<button class="icon-btn" data-event-edit="' + ev.id + '">\u270F\uFE0F</button>' +
      '<button class="icon-btn" data-event-del="' + ev.id + '">\u{1F5D1}\uFE0F</button>' +
      "</div>";
  }
  html += "</div>";
  body.innerHTML = html;
}

const GLOBAL_MODES = ["boss", "replace", "influence", "addon", "mixed", "script"];

function renderGlobalsTab() {
  const body = $("#content-globals");
  const globals = catalog ? catalog.globalEvents || [] : [];
  let html = '<div class="content-toolbar"><button class="btn primary small" id="global-add">' + t("btnAddGlobal") + "</button></div>";
  html += catFilterRow(GLOBAL_MODES, contentGlobalCat, "globmode");
  html += contentFilterHTML("globals");
  html += '<div class="content-list">';
  const filtered = (contentGlobalCat === "all" ? globals : globals.filter((g) => g.mode === contentGlobalCat)).filter((g) => contentVisible(g, "globals"));
  if (!filtered.length) html += '<div class="content-row row-sub">' + t("empty") + "</div>";
  for (const g of filtered) {
    const text = g.tpl && typeof g.tpl === "object" ? (g.tpl.en || g.tpl.ru || "") : g.tpl || "";
    const durType = g.duration ? g.duration.type : "full_days";
    const durText = durType === "endless" ? t("globdur.endless") : t("globDur") + " " + t("globdur." + durType) + " " + (g.duration ? g.duration.value : 1);
    const maxTrig = g.maxTriggers ? " \u00B7 " + t("globalMaxTriggers") + " " + g.maxTriggers : "";
    html += '<div class="content-row' + (g.enabled === false ? " disabled" : "") + '">' +
      '<div class="row-main"><div class="row-title">' + esc(g.id) + ' <span class="tag">' + t("globmode." + g.mode) + "</span></div>" +
      '<div class="row-sub">' + durText + " \u00B7 " + t("globChance") + " " + (g.chance != null ? Math.round(g.chance * 100) + "%" : "?") + maxTrig + " \u00B7 " + esc(text) + "</div></div>" +
      contentToggleHTML(g, "globals") +
      '<button class="icon-btn" data-global-edit="' + g.id + '" title="' + t("btnEdit") + '">\u270F\uFE0F</button>' +
      '<button class="icon-btn" data-global-del="' + g.id + '" title="' + t("btnDelete") + '">\u{1F5D1}\uFE0F</button>' +
      "</div>";
  }
  html += "</div>";
  body.innerHTML = html;
}

function renderLanguagesTab() {
  const body = $("#content-languages");
  const languages = catalog ? catalog.languages : [];
  const active = (state.settings && state.settings.language) || "en";
  langEditCode = active;
  let html = '<div class="lang-edit">';
  html += '<div><label class="field-label">' + t("langActive") + "</label><div class=\"lang-pills\">" +
    languages.map((l) => '<span class="lang-pill' + (l.code === active ? " active" : "") + '" data-lang-set="' + l.code + '">' + esc(l.native) + " (" + l.code + ")</span>").join("") +
    "</div></div>";
  html += "<div><label class=\"field-label\">" + t("contentTabLanguages") + " \u2014 " + esc(langEditCode) + "</label>";
  html += '<div class="cat-filters">' +
    ["keys", "json"].map((m) => '<button class="cat-btn' + (langMode === m ? " active" : "") + '" data-trans-mode="' + m + '">' + t("langMode." + m) + "</button>").join("") +
    "</div>";
  if (langMode === "keys") {
    html += '<div class="cat-filters">' +
      ["ui", "names", "engine"].map((s) => '<button class="cat-btn' + (langSection === s ? " active" : "") + '" data-trans-section="' + s + '">' + t("langSection." + s) + "</button>").join("") +
      "</div>";
    html += '<div id="trans-table" class="trans-table"></div>';
    html += '<button class="btn ghost small" id="trans-add">+ ' + t("langAddKey") + "</button>";
  } else {
    html += '<textarea id="lang-json" spellcheck="false"></textarea>';
  }
  html += '<div class="modal-actions"><button class="btn gold" id="lang-save">' + t("btnSaveLocale") + "</button></div>";
  html += '<p class="hint">' + t("langEditHint") + "</p>";
  html += "</div>";
  body.innerHTML = html;
  loadLangEditorText();
}

async function loadLangEditorText() {
  try {
    langLocale = await call("/api/locale/" + langEditCode);
  } catch (e) {
    langLocale = { __meta__: { code: langEditCode, name: langEditCode, native: langEditCode } };
  }
  if (langMode === "json") {
    $("#lang-json").value = JSON.stringify(langLocale, null, 2);
  } else {
    renderTransTable();
  }
}

function renderTransTable() {
  const box = $("#trans-table");
  if (!box) return;
  if (!langLocale[langSection]) langLocale[langSection] = {};
  const sec = langLocale[langSection];
  const keys = Object.keys(sec);
  box.innerHTML = keys.length
    ? keys.map((k) =>
        '<div class="trans-row"><input class="trans-key" value="' + esc(k) + '" title="' + t("langKeyHint") + '">' +
        '<input class="trans-val" value="' + esc(String(sec[k])) + '">' +
        '<button class="icon-btn" data-trans-del title="' + t("btnDelete") + '">\u{1F5D1}\uFE0F</button></div>'
      ).join("")
    : '<div class="hint">' + t("empty") + "</div>";
}

function collectTransTable() {
  const sec = {};
  document.querySelectorAll("#trans-table .trans-row").forEach((row) => {
    const k = row.querySelector(".trans-key").value.trim();
    const v = row.querySelector(".trans-val").value;
    if (k) sec[k] = v;
  });
  langLocale[langSection] = sec;
}

function fxRowsHTML(rows) {
  return rows.map(([k, v]) => fxRowHTML(k, v)).join("");
}

function fxRowHTML(k, v) {
  const opts = STAT_META.map(([sk]) => '<option value="' + sk + '"' + (sk === k ? " selected" : "") + ">" + t("stat." + sk) + "</option>").join("");
  return '<div class="fxrow">' +
    '<select>' + opts + "</select>" +
    '<input type="number" step="1" value="' + (v != null ? v : 0) + '">' +
    '<button class="icon-btn" data-fx-del>&#x2715;</button>' +
    "</div>";
}

function openItemEdit(id) {
  itemEditId = id;
  const it = id ? catalog.items.find((i) => i.id === id) : null;
  $("#item-modal-title").textContent = t("itemTitle");
  $("#item-name").value = it ? itemNameOf(it) : "";
  $("#item-emoji").value = it ? (it.emoji || "") : "";
  $("#item-cat").innerHTML = ITEMCATS.map((c) => "<option value=\"" + c + "\"" + (it && it.cat === c ? " selected" : "") + ">" + t("cat." + c) + "</option>").join("");
  $("#item-dmg").value = it ? dmgLabel(it.dmg) : "0";
  $("#item-spd").value = it ? (it.spd || 1) : 1;
  $("#item-prot").value = it ? (it.prot || 0) : 0;
  $("#item-warm").value = it ? (it.warm || 0) : 0;
  $("#item-heal").value = it ? (it.heal || 0) : 0;
  $("#item-feed").value = it ? (it.feed || 0) : 0;
  $("#item-weight").value = it ? (it.weight || 10) : 10;
  $("#item-dur").value = it ? (it.dur || 0) : 0;
  $("#item-modal").classList.remove("hidden");
}

function mergeLocalized(old, newText) {
  if (old && typeof old === "object") {
    const obj = Object.assign({}, old);
    obj[lang] = newText;
    return obj;
  }
  return newText;
}

async function saveItem() {
  const existing = itemEditId ? catalog.items.find((i) => i.id === itemEditId) : null;
  const def = {
    name: mergeLocalized(existing && existing.name, $("#item-name").value.trim() || "Item"),
    emoji: $("#item-emoji").value.trim() || "\u{1F4E6}",
    cat: $("#item-cat").value,
    dmg: parseDmgRange($("#item-dmg").value) || 0,
    spd: Math.max(1, Number($("#item-spd").value) || 1),
    prot: Number($("#item-prot").value) || 0,
    warm: Number($("#item-warm").value) || 0,
    heal: Number($("#item-heal").value) || 0,
    feed: Number($("#item-feed").value) || 0,
    weight: Number($("#item-weight").value) || 1,
    dur: Number($("#item-dur").value) || 0
  };
  try {
    if (itemEditId) {
      await call("/api/items/" + itemEditId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(def)
      });
    } else {
      await call("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(def)
      });
    }
    $("#item-modal").classList.add("hidden");
    itemEditId = null;
    await refreshContent();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

async function deleteItem(id) {
  if (!confirm(t("btnDelete") + "?")) return;
  try {
    await call("/api/items/" + id, { method: "DELETE" });
    await refreshContent();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

function rowsFromObj(obj) {
  return Object.keys(obj || {}).map((k) => [k, obj[k]]);
}

function openEventEdit(id) {
  eventEditId = id;
  const ev = id ? catalog.events.find((e) => e.id === id) : null;
  $("#event-modal-title").textContent = t("eventTitle");
  $("#event-id").value = ev ? ev.id : "";
  $("#event-cat").innerHTML = EVCATS.map((c) => "<option value=\"" + c + "\"" + (ev && ev.cat === c ? " selected" : "") + ">" + t("evcat." + c) + "</option>").join("");
  $("#event-phase").innerHTML = PHASES.map((p) => "<option value=\"" + p + "\"" + (ev && ev.phase === p ? " selected" : "") + ">" + p + "</option>").join("");
  $("#event-targets").value = ev ? (Array.isArray(ev.targets) ? ev.targets.join("-") : ev.targets) : "1";
  $("#event-weight").value = ev ? (ev.weight || 10) : 10;
  $("#event-tpls").innerHTML = "";
  if (ev) {
    for (let i = 0; i < tplVariantsOf(ev && ev.tpl).length; i++) {
      addTplRow("#event-tpls", tplCurrentText(ev, i));
    }
  } else {
    addTplRow("#event-tpls", "");
  }
  subs = ev && Array.isArray(ev.subs) ? ev.subs.slice() : [];
  renderSubsList();
  renderTargetSection("#event-target", ev && ev.target);
  fromScript("event", ev && ev.script);
  $("#event-script-lang").value = scriptLang("event") === "mini" ? "mini" : "js";
  renderScriptHooks("event");
  renderOutcomeSection("#event-outcomes", ev && ev.outcome);
  renderWeaponTpls("#event-wtpls", ev && ev.weaponTpls);
  $("#event-rel").value = ev ? (ev.rel || 0) : 0;
  $("#event-relrev").value = ev ? (ev.relRev || 0) : 0;
  $("#event-loot").value = ev && ev.loot ? ev.loot.join(", ") : "";
  $("#event-fxself").innerHTML = fxRowsHTML(rowsFromObj(ev && ev.fxSelf));
  $("#event-fxother").innerHTML = fxRowsHTML(rowsFromObj(ev && ev.fxOther));
  $("#event-prof").innerHTML = PROF_META.map(([k, key]) => {
    const v = ev && ev.fxProf ? ev.fxProf[k] || 0 : 0;
    return '<div class="edit-stat"><label>' + t(key) + "</label>" +
      '<input type="number" step="1" value="' + v + '" data-prof="' + k + '">' +
      '<span class="rel-val"></span></div>';
  }).join("");
  const adv = {};
  if (ev && ev.cond) adv.cond = ev.cond;
  if (ev && ev.scale) adv.scale = ev.scale;
  $("#event-advanced").value = Object.keys(adv).length ? JSON.stringify(adv, null, 2) : "";
  $("#event-modal").classList.remove("hidden");
}

function addTplRow(containerId, text) {
  const c = $(containerId);
  const row = document.createElement("div");
  row.className = "tpl-row";
  row.innerHTML = '<textarea rows="2" placeholder="' + t("tplPlaceholder") + '"></textarea>' +
    '<button class="icon-btn" data-tpl-del title="' + t("btnDelete") + '">&#x2715;</button>';
  c.appendChild(row);
  const ta = row.querySelector("textarea");
  ta.value = text || "";
  ta.dataset.orig = ta.value;
}

function addFxRow(containerId) {
  const c = $(containerId);
  const row = document.createElement("div");
  row.innerHTML = fxRowHTML("health", 0);
  c.appendChild(row.firstElementChild);
}

function parseTargets(s) {
  const m = String(s).trim().match(/^(\d+)\s*[\-\u2013]\s*(\d+)$/);
  if (m) return [Number(m[1]), Number(m[2])];
  const n = parseInt(s, 10);
  return isNaN(n) ? 1 : n;
}

function parseDmgRange(s) {
  const m = String(s).trim().match(/^(\d+)\s*[-=\u2013\u2014]\s*(\d+)$/);
  if (m) {
    const a = Math.max(1, Number(m[1]));
    return [a, Math.max(a, Number(m[2]))];
  }
  const n = Number(String(s).trim());
  return n > 0 ? n : null;
}

function dmgLabel(d) {
  if (d == null) return "";
  if (Array.isArray(d)) return d.join("-");
  return String(d);
}

function normalizeBossDmgInput(d) {
  if (Array.isArray(d)) {
    const a = Math.max(1, Number(d[0]) || 8);
    return [a, Math.max(a, Number(d[1]) || a)];
  }
  const n = Number(d);
  return n > 0 ? n : 8;
}

function rowsToObj(container) {
  const obj = {};
  container.querySelectorAll(".fxrow").forEach((row) => {
    const sel = row.querySelector("select");
    const num = row.querySelector("input[type=number]");
    if (sel && num) {
      const v = Number(num.value);
      if (v !== 0) obj[sel.value] = v;
    }
  });
  return obj;
}

function parseLoot(s) {
  const list = String(s).split(",").map((x) => x.trim()).filter(Boolean);
  return list.length ? list : undefined;
}

function parseAdvanced(s) {
  const txt = String(s).trim();
  if (!txt) return {};
  const obj = JSON.parse(txt);
  if (typeof obj !== "object" || Array.isArray(obj)) throw new Error(t("jsonError"));
  return obj;
}

const SCRIPT_EDITORS = {
  global: { container: "global-script-hooks", lang: "global-script-lang", options: ["onStart", "onDay", "onNight", "onDeath", "onDamage", "onSlay", "onEnd"] },
  ability: { container: "ab-script-hooks", lang: "ab-script-lang", options: ["onEvent", "postEvent", "onDay", "onNight", "onDamage", "onDeal", "onKill"] },
  event: { container: "event-script-hooks", lang: "event-script-lang", options: ["onEvent", "postEvent"], bareString: true },
  sub: { container: "sub-script-hooks", lang: "sub-script-lang", options: ["onEvent"], bareString: true },
  mini: { container: "mini-script-hooks", lang: "mini-script-lang", options: ["onEvent"], bareString: true }
};
const SCRIPT_HOOK_TITLES = {
  onStart: "fires when the global starts",
  onDay: "fires at the start of each day",
  onNight: "fires at the start of each night",
  onDeath: "fires when a tribute dies while the global is active",
  onDamage: "fires whenever a tribute takes health damage while the global is active",
  onSlay: "fires the moment the Boss is slain, before winners are decided",
  onEnd: "fires when the global ends",
  onEvent: "fires before an event involving the tribute is resolved; event = { id, cat, phase }",
  postEvent: "fires after the event's effects; event = { id, cat, phase }",
  onDeal: "fires when the tribute deals damage; damage = { target, amount, cause }",
  onKill: "fires when the tribute kills someone; death = { tribute, killer }"
};

function scriptHooksData(key) {
  const cfg = SCRIPT_EDITORS[key];
  if (!cfg._hooks) cfg._hooks = { lang: "js" };
  return cfg._hooks;
}

function scriptLang(key) {
  return scriptHooksData(key).lang || "js";
}

function fromScript(key, script) {
  const cfg = SCRIPT_EDITORS[key];
  const hooks = { lang: "js" };
  if (typeof script === "string") {
    hooks[(key === "ability" ? "onDay" : "onEvent")] = script;
  } else if (script && typeof script === "object") {
    if (script.lang) hooks.lang = script.lang;
    for (const h of cfg.options) if (script[h]) hooks[h] = String(script[h]);
  }
  cfg._hooks = hooks;
}

function collectScript(key) {
  const cfg = SCRIPT_EDITORS[key];
  const hooks = scriptHooksData(key);
  const out = {};
  let any = false;
  for (const h of cfg.options) {
    const v = hooks[h];
    if (v && String(v).trim()) { out[h] = String(v).trim(); any = true; }
  }
  if (!any) return null;
  if (cfg.bareString && hooks.lang !== "mini" && Object.keys(out).length === 1 && out.onEvent) return out.onEvent;
  if (hooks.lang === "mini") out.lang = "mini";
  return out;
}

function renderScriptHooks(key) {
  const cfg = SCRIPT_EDITORS[key];
  const box = document.getElementById(cfg.container);
  if (!box) return;
  const hooks = scriptHooksData(key);
  const used = cfg.options.filter((h) => hooks[h] != null);
  const avail = cfg.options.filter((h) => hooks[h] == null);
  const select = '<select class="hook-add" data-hooks-add="' + key + '"><option value="">' + t("addHook") + "\u2026</option>" +
    avail.map((h) => '<option value="' + h + '">' + h + "</option>").join("") + "</select>";
  box.innerHTML =
    '<div class="hook-list">' + used.map((h) =>
      '<div class="hook-row"><span class="hook-tag" title="' + (SCRIPT_HOOK_TITLES[h] || "") + '">' + h + "</span>" +
      '<textarea rows="2" data-hooks-text="' + key + '" data-hook="' + h + '">' + esc(hooks[h]) + "</textarea>" +
      '<button class="icon-btn" data-hooks-del="' + key + '" data-hook="' + h + '" title="' + t("btnDelete") + '">&#x2715;</button></div>'
    ).join("") + "</div>" +
    (used.length < cfg.options.length ? '<div class="hook-add-row">' + select + "</div>" : "");
}

function addScriptHook(key, h) {
  const hooks = scriptHooksData(key);
  if (hooks[h] != null) return;
  hooks[h] = "";
  renderScriptHooks(key);
}

function removeScriptHook(key, h) {
  const hooks = scriptHooksData(key);
  delete hooks[h];
  renderScriptHooks(key);
}

async function saveEvent() {
  try {
    const adv = parseAdvanced($("#event-advanced").value);
    const prof = {};
    document.querySelectorAll("#event-prof [data-prof]").forEach((el) => {
      const v = Number(el.value);
      if (v !== 0) prof[el.dataset.prof] = v;
    });
    const existing = eventEditId ? catalog.events.find((e) => e.id === eventEditId) : null;
    const cleanSubs = subs.filter(subHasContent);
    const def = {
      id: $("#event-id").value.trim(),
      cat: $("#event-cat").value,
      phase: $("#event-phase").value,
      targets: parseTargets($("#event-targets").value),
      weight: Number($("#event-weight").value) || 1,
      tpl: buildTplFromRows("#event-tpls", existing && existing.tpl),
      fxSelf: rowsToObj($("#event-fxself")),
      fxOther: rowsToObj($("#event-fxother")),
      loot: parseLoot($("#event-loot").value),
      fxProf: Object.keys(prof).length ? prof : undefined,
      subs: cleanSubs.length ? cleanSubs : undefined,
      target: targetFromSection("#event-target")
    };
    const evtScript = collectScript("event");
    if (evtScript) def.script = evtScript;
    def.outcome = outcomesFromSection("#event-outcomes", existing && existing.outcome);
    def.weaponTpls = weaponTplsFromSection("#event-wtpls", existing && existing.weaponTpls);
    const rel = Number($("#event-rel").value);
    const relRev = Number($("#event-relrev").value);
    if (rel !== 0) def.rel = rel;
    if (relRev !== 0) def.relRev = relRev;
    Object.assign(def, adv);
    if (!def.id) throw new Error("ID required");

    if (eventEditId) {
      await call("/api/events/" + eventEditId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(def)
      });
    } else {
      await call("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(def)
      });
    }
    $("#event-modal").classList.add("hidden");
    eventEditId = null;
    await refreshContent();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

async function deleteEvent(id) {
  if (!confirm(t("btnDelete") + "?")) return;
  try {
    await call("/api/events/" + id, { method: "DELETE" });
    await refreshContent();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

const COND_TYPES = ["stat", "skill", "proficiency", "personality", "gender", "hasItem", "hasCat"];

function condKeyOptions(type) {
  if (type === "stat" || type === "skill") return STAT_META.map(([k, key]) => [k, t(key)]);
  if (type === "proficiency") return PROF_META.map(([k, key]) => [k, t(key)]);
  if (type === "personality") return (catalog.personalities || []).map((p) => [p.id, personalityName(p.id)]);
  if (type === "gender") return (catalog.genders || []).map((g) => [g, t(genderKey(g))]);
  if (type === "hasItem") return catalog.items.map((i) => [i.id, itemNameOf(i)]);
  if (type === "hasCat") return ITEMCATS.map((c) => [c, t("cat." + c)]);
  return [];
}

function condRowHTML(row) {
  const type = row.type || "stat";
  const opts = condKeyOptions(type);
  const key = row.key || (opts[0] ? opts[0][0] : "");
  const hasRange = type === "stat" || type === "skill" || type === "proficiency";
  return '<div class="cond-row">' +
    '<select class="cond-type">' + COND_TYPES.map((ct) => '<option value="' + ct + '"' + (ct === type ? " selected" : "") + ">" + t("condtype." + ct) + "</option>").join("") + "</select>" +
    '<select class="cond-key">' + opts.map(([k, label]) => '<option value="' + k + '"' + (k === key ? " selected" : "") + ">" + esc(label) + "</option>").join("") + "</select>" +
    (hasRange
      ? '<input class="cond-min" type="number" placeholder="' + t("condMin") + '" value="' + (row.min != null ? row.min : "") + '">' +
        '<input class="cond-max" type="number" placeholder="' + t("condMax") + '" value="' + (row.max != null ? row.max : "") + '">'
      : "") +
    '<button class="icon-btn cond-del" title="' + t("btnDelete") + '">&#x2715;</button>' +
    "</div>";
}

function condRowsFromObj(cond) {
  const rows = [];
  if (cond) {
    if (cond.stat) rows.push({ type: "stat", key: cond.stat.name, min: cond.stat.min, max: cond.stat.max });
    if (cond.skill) rows.push({ type: "skill", key: cond.skill.name, min: cond.skill.min, max: cond.skill.max });
    if (cond.proficiency) rows.push({ type: "proficiency", key: cond.proficiency.name, min: cond.proficiency.min, max: cond.proficiency.max });
    if (cond.personality) rows.push({ type: "personality", key: cond.personality });
    if (cond.gender) rows.push({ type: "gender", key: cond.gender });
    if (cond.hasItem) rows.push({ type: "hasItem", key: cond.hasItem });
    if (cond.hasCat) rows.push({ type: "hasCat", key: cond.hasCat });
  }
  return rows;
}

function condFromRows(builder) {
  const cond = {};
  builder.querySelectorAll(".cond-row").forEach((row) => {
    const type = row.querySelector(".cond-type").value;
    const key = row.querySelector(".cond-key").value;
    if (type === "stat" || type === "skill" || type === "proficiency") {
      const minEl = row.querySelector(".cond-min");
      const maxEl = row.querySelector(".cond-max");
      const spec = {};
      if (minEl.value !== "") spec.min = Number(minEl.value);
      if (maxEl.value !== "") spec.max = Number(maxEl.value);
      if (Object.keys(spec).length) cond[type] = Object.assign({ name: key }, spec);
    } else {
      cond[type] = key;
    }
  });
  return cond;
}

function renderTargetSection(containerId, target) {
  const section = $(containerId);
  let mode = "self";
  let exclude = false;
  let cond = null;
  if (typeof target === "string") mode = "random";
  else if (target && typeof target === "object") {
    mode = target.cond ? "cond" : "random";
    exclude = !!target.excludeSelf;
    cond = target.cond;
  }
  section.innerHTML =
    '<div class="target-row">' +
    '<select class="tb-mode">' +
    '<option value="self"' + (mode === "self" ? " selected" : "") + ">" + t("tbSelf") + "</option>" +
    '<option value="random"' + (mode === "random" ? " selected" : "") + ">" + t("tbRandom") + "</option>" +
    '<option value="cond"' + (mode === "cond" ? " selected" : "") + ">" + t("tbCond") + "</option>" +
    "</select>" +
    '<label class="check"><input type="checkbox" class="tb-exclude"' + (exclude ? " checked" : "") + "> " + t("tbExclude") + "</label>" +
    "</div>" +
    '<div class="cond-builder"></div>' +
    '<button class="btn ghost small tb-add" style="display:none">' + t("condAdd") + "</button>";
  const builder = section.querySelector(".cond-builder");
  const addBtn = section.querySelector(".tb-add");
  if (mode === "cond") {
    const rows = condRowsFromObj(cond);
    builder.innerHTML = rows.map(condRowHTML).join("");
    if (!rows.length) builder.innerHTML = condRowHTML({ type: "stat", key: "health" });
    builder.style.display = "";
    addBtn.style.display = "";
  } else {
    builder.style.display = "none";
  }
}

function targetFromSection(containerId) {
  const section = $(containerId);
  const mode = section.querySelector(".tb-mode").value;
  if (mode === "self") return null;
  const exclude = section.querySelector(".tb-exclude").checked;
  if (mode === "random") return exclude ? { excludeSelf: true } : "random";
  const cond = condFromRows(section.querySelector(".cond-builder"));
  const spec = {};
  if (exclude) spec.excludeSelf = true;
  if (Object.keys(cond).length) spec.cond = cond;
  if (!Object.keys(spec).length) return "random";
  return spec;
}

function condRowToObj(row) {
  const minEl = row.querySelector(".cond-min");
  const maxEl = row.querySelector(".cond-max");
  return {
    type: row.querySelector(".cond-type").value,
    key: row.querySelector(".cond-key").value,
    min: minEl && minEl.value !== "" ? Number(minEl.value) : undefined,
    max: maxEl && maxEl.value !== "" ? Number(maxEl.value) : undefined
  };
}

function bindTargetBuilder(section) {
  section.addEventListener("change", (e) => {
    const typeSel = e.target.closest(".cond-type");
    if (typeSel) {
      const row = typeSel.closest(".cond-row");
      const data = condRowToObj(row);
      data.type = typeSel.value;
      data.key = "";
      row.outerHTML = condRowHTML(data);
      return;
    }
    const modeSel = e.target.closest(".tb-mode");
    if (modeSel) {
      const builder = section.querySelector(".cond-builder");
      const addBtn = section.querySelector(".tb-add");
      const isCond = modeSel.value === "cond";
      builder.style.display = isCond ? "" : "none";
      addBtn.style.display = isCond ? "" : "none";
      if (isCond && !builder.querySelector(".cond-row")) builder.innerHTML = condRowHTML({ type: "stat", key: "health" });
    }
  });
  section.addEventListener("click", (e) => {
    if (e.target.closest(".cond-del")) {
      const row = e.target.closest(".cond-row");
      const builder = row.parentElement;
      row.remove();
      if (!builder.querySelector(".cond-row")) builder.innerHTML = condRowHTML({ type: "stat", key: "health" });
      return;
    }
    if (e.target.closest(".tb-add")) {
      section.querySelector(".cond-builder").insertAdjacentHTML("beforeend", condRowHTML({ type: "stat", key: "health" }));
    }
  });
}

// ---------- outcome texts ----------

function outcomeRowHTML(o) {
  const tpl = o && o.tpl;
  const text = variantText(tpl);
  return '<div class="outcome-row"' + (o && o.when ? ' data-orig-when="' + esc(o.when) + '"' : "") + '>' +
    '<input class="oc-when" type="text" placeholder="' + t("outcomeWhenPlaceholder") + '" value="' + esc(o && o.when ? o.when : "") + '">' +
    '<textarea class="oc-tpl" rows="2" placeholder="' + t("tplPlaceholder") + '">' + esc(text) + "</textarea>" +
    '<button class="icon-btn oc-del" title="' + t("btnDelete") + '">&#x2715;</button>' +
    "</div>";
}

function renderOutcomeSection(containerId, outcomes) {
  const c = $(containerId);
  if (!outcomes || !outcomes.length) {
    c.innerHTML = '<div class="hint">' + t("empty") + "</div>";
    return;
  }
  c.innerHTML = outcomes.map(outcomeRowHTML).join("");
}

function outcomesFromSection(containerId, existingOutcomes) {
  const out = [];
  const pool = (existingOutcomes || []).slice();
  $(containerId).querySelectorAll(".outcome-row").forEach((row) => {
    const text = row.querySelector(".oc-tpl").value.trim();
    if (!text) return;
    const when = row.querySelector(".oc-when").value.trim();
    const entry = {};
    if (when) entry.when = when;
    const origWhen = row.dataset.origWhen || "";
    let idx = origWhen ? pool.findIndex((p) => (p.when || "") === origWhen) : -1;
    if (idx === -1) idx = pool.findIndex((p) => (p.when || "") === when);
    const prev = idx > -1 ? pool.splice(idx, 1)[0] : null;
    entry.tpl = mergeLocalized(prev && prev.tpl, text);
    out.push(entry);
  });
  return out.length ? out : undefined;
}

function addOutcomeRow(containerId) {
  const c = $(containerId);
  if (!c.querySelector(".outcome-row")) c.innerHTML = "";
  c.insertAdjacentHTML("beforeend", outcomeRowHTML({}));
}

function renderWeaponTpls(containerId, wt) {
  const c = $(containerId);
  const cats = [["melee", "cat.melee"], ["ranged", "cat.ranged"], ["explosive", "cat.explosive"]];
  c.innerHTML = cats.map(([cat, key]) => {
    const v = wt && wt[cat];
    const text = v && typeof v === "object" ? (v[lang] || v.en || Object.values(v)[0] || "") : v || "";
    return '<div class="field"><label>' + t(key) + "</label>" +
      '<textarea class="wt-tpl" data-wt="' + cat + '" rows="2">' + esc(text) + "</textarea></div>";
  }).join("");
}

function weaponTplsFromSection(containerId, existing) {
  const wt = {};
  $(containerId).querySelectorAll(".wt-tpl").forEach((ta) => {
    const text = ta.value.trim();
    if (!text) return;
    const prev = existing && existing[ta.dataset.wt];
    wt[ta.dataset.wt] = mergeLocalized(prev, text);
  });
  return Object.keys(wt).length ? wt : undefined;
}

// ---------- sub-event editor ----------

function subHasContent(s) {
  const v = s && s.tpl;
  if (typeof v === "string") return !!v.trim();
  if (Array.isArray(v)) return v.some((x) => typeof x === "string" ? x.trim() : (x && Object.values(x).some((y) => y && String(y).trim())));
  if (v && typeof v === "object") return Object.values(v).some((y) => y && String(y).trim());
  return false;
}

function renderSubsList() {
  const c = $("#event-subs");
  if (!subs.length) {
    c.innerHTML = '<div class="hint">' + t("subsEmpty") + "</div>";
    return;
  }
  c.innerHTML = subs.map((sub, i) => {
    const preview = tplCurrentText({ tpl: sub.tpl }, 0) || t("empty");
    const targets = sub.targets != null ? (Array.isArray(sub.targets) ? sub.targets.join("-") : sub.targets) : "-";
    return '<div class="content-row">' +
      '<div class="row-main"><div class="row-sub"><b>#' + (i + 1) + "</b> " + t("eventTargetsLabel") + " " + targets + " \u00B7 " + esc(preview.slice(0, 70)) + "</div></div>" +
      '<button class="icon-btn" data-sub-edit="' + i + '" title="' + t("btnEdit") + '">\u270F\uFE0F</button>' +
      '<button class="icon-btn" data-sub-del="' + i + '" title="' + t("btnDelete") + '">\u{1F5D1}\uFE0F</button>' +
      "</div>";
  }).join("");
}

function openSubEdit(index) {
  subEditIndex = index;
  const sub = index >= 0 ? subs[index] : null;
  $("#sub-modal-title").textContent = sub ? t("subTitle") + " #" + (index + 1) : t("addSubBtn");
  $("#sub-targets").value = sub && sub.targets != null ? (Array.isArray(sub.targets) ? sub.targets.join("-") : sub.targets) : "";
  $("#sub-weight").value = sub && sub.weight ? sub.weight : 5;
  $("#sub-rel").value = sub && sub.rel ? sub.rel : 0;
  $("#sub-relrev").value = sub && sub.relRev ? sub.relRev : 0;
  $("#sub-loot").value = sub && sub.loot ? sub.loot.join(", ") : "";
  $("#sub-tpls").innerHTML = "";
  const variants = tplVariantsOf(sub && sub.tpl);
  for (let i = 0; i < variants.length; i++) addTplRow("#sub-tpls", tplCurrentText({ tpl: sub && sub.tpl }, i));
  if (!variants.length) addTplRow("#sub-tpls", "");
  $("#sub-fxself").innerHTML = fxRowsHTML(rowsFromObj(sub && sub.fxSelf));
  $("#sub-fxother").innerHTML = fxRowsHTML(rowsFromObj(sub && sub.fxOther));
  $("#sub-prof").innerHTML = PROF_META.map(([k, key]) => {
    const v = sub && sub.fxProf ? sub.fxProf[k] || 0 : 0;
    return '<div class="edit-stat"><label>' + t(key) + "</label>" +
      '<input type="number" step="1" value="' + v + '" data-prof="' + k + '">' +
      '<span class="rel-val"></span></div>';
  }).join("");
  const adv = {};
  if (sub && sub.cond) adv.cond = sub.cond;
  if (sub && sub.scale) adv.scale = sub.scale;
  if (sub && sub.phase) adv.phase = sub.phase;
  $("#sub-advanced").value = Object.keys(adv).length ? JSON.stringify(adv, null, 2) : "";
  renderTargetSection("#sub-target", sub && sub.target);
  fromScript("sub", sub && sub.script);
  $("#sub-script-lang").value = scriptLang("sub") === "mini" ? "mini" : "js";
  renderScriptHooks("sub");
  renderOutcomeSection("#sub-outcomes", sub && sub.outcome);
  renderWeaponTpls("#sub-wtpls", sub && sub.weaponTpls);
  $("#sub-modal").classList.remove("hidden");
}

function closeSubEdit() {
  $("#sub-modal").classList.add("hidden");
  subEditIndex = -1;
}

function saveSub() {
  try {
    const adv = parseAdvanced($("#sub-advanced").value);
    const prof = {};
    document.querySelectorAll("#sub-prof [data-prof]").forEach((el) => {
      const v = Number(el.value);
      if (v !== 0) prof[el.dataset.prof] = v;
    });
    const existingSub = subEditIndex >= 0 ? subs[subEditIndex] : null;
    const sub = {
      tpl: buildTplFromRows("#sub-tpls", existingSub && existingSub.tpl),
      fxSelf: rowsToObj($("#sub-fxself")),
      fxOther: rowsToObj($("#sub-fxother")),
      loot: parseLoot($("#sub-loot").value),
      fxProf: Object.keys(prof).length ? prof : undefined
    };
    const targetsText = $("#sub-targets").value.trim();
    if (targetsText) sub.targets = parseTargets(targetsText);
    const weight = $("#sub-weight").value;
    if (weight) sub.weight = Number(weight);
    const rel = Number($("#sub-rel").value);
    const relRev = Number($("#sub-relrev").value);
    if (rel !== 0) sub.rel = rel;
    if (relRev !== 0) sub.relRev = relRev;
    const target = targetFromSection("#sub-target");
    if (target) sub.target = target;
    const subScript = collectScript("sub");
    if (subScript) sub.script = subScript;
    const subOutcome = outcomesFromSection("#sub-outcomes", existingSub && existingSub.outcome);
    if (subOutcome) sub.outcome = subOutcome;
    const subWt = weaponTplsFromSection("#sub-wtpls", existingSub && existingSub.weaponTpls);
    if (subWt) sub.weaponTpls = subWt;
    Object.assign(sub, adv);
    if (!sub.fxSelf || !Object.keys(sub.fxSelf).length) delete sub.fxSelf;
    if (!sub.fxOther || !Object.keys(sub.fxOther).length) delete sub.fxOther;
    if (subEditIndex >= 0) subs[subEditIndex] = sub;
    else subs.push(sub);
    renderSubsList();
    closeSubEdit();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

async function saveLocaleEdit() {
  try {
    let loc;
    if (langMode === "keys") {
      collectTransTable();
      loc = langLocale;
    } else {
      loc = JSON.parse($("#lang-json").value);
    }
    if (!loc || !loc.__meta__) throw new Error(t("jsonError"));
    await call("/api/locale/" + langEditCode, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loc)
    });
    if (langEditCode === lang) await setLang(lang);
    await refreshContent();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

// ---------- global event editor ----------

function globalModeOf(def) {
  const parts = [];
  if (def.boss) parts.push("boss");
  if (def.replace && (def.replace.day || def.replace.night)) parts.push("replace");
  if (def.addon && (def.addon.day || def.addon.night)) parts.push("addon");
  if (def.mods || (def.disable && def.disable.length)) parts.push("influence");
  if (def.script && (def.script.onStart || def.script.onDeath || def.script.onDamage || def.script.onDay || def.script.onNight || def.script.onSlay || def.script.onEnd)) parts.push("script");
  if (!parts.length) return "influence";
  return parts.length > 1 ? "mixed" : parts[0];
}

function openGlobalEdit(id) {
  globalEditId = id;
  const g = id ? (catalog.globalEvents || []).find((x) => x.id === id) : null;
  $("#global-modal-title").textContent = g ? t("globalTitle") + " " + esc(g.id) : t("btnAddGlobal");
  $("#global-id").value = g ? g.id : "";
  $("#global-chance").value = g ? Math.round((g.chance != null ? g.chance : 0.1) * 100) : 10;
  $("#global-weight").value = g ? (g.weight || 10) : 10;
  $("#global-maxtriggers").value = g && g.maxTriggers ? g.maxTriggers : "";
  $("#global-durtype").innerHTML = ["full_days", "days", "nights", "endless"].map((d) =>
    "<option value=\"" + d + "\"" + (g && g.duration && g.duration.type === d ? " selected" : "") + ">" + t("globdur." + d) + "</option>"
  ).join("");
  $("#global-durvalue").value = g && g.duration ? (g.duration.value || 1) : 1;
  $("#global-durvalue").disabled = $("#global-durtype").value === "endless";
  $("#global-disable").value = g && g.disable ? g.disable.join(", ") : "";
  $("#global-tpls").innerHTML = "";
  const tpls = tplVariantsOf(g && g.tpl);
  for (let i = 0; i < tpls.length; i++) addTplRow("#global-tpls", tplCurrentText({ tpl: g && g.tpl }, i));
  if (!tpls.length) addTplRow("#global-tpls", "");
  $("#global-endtpls").innerHTML = "";
  const endTpls = tplVariantsOf(g && g.endTpl);
  for (let i = 0; i < endTpls.length; i++) addTplRow("#global-endtpls", tplCurrentText({ tpl: g && g.endTpl }, i));
  $("#global-buff").innerHTML = fxRowsHTML(rowsFromObj(g && g.mods && g.mods.buff));
  $("#global-nerf").innerHTML = fxRowsHTML(rowsFromObj(g && g.mods && g.mods.nerf));
  globalLists = {
    replaceDay: g && g.replace && g.replace.day ? g.replace.day.slice() : [],
    replaceNight: g && g.replace && g.replace.night ? g.replace.night.slice() : [],
    addonDay: g && g.addon && g.addon.day ? g.addon.day.slice() : [],
    addonNight: g && g.addon && g.addon.night ? g.addon.night.slice() : []
  };
  renderGlobalLists();
  const sc = g && g.script ? g.script : {};
  $("#global-script-lang").value = sc.lang === "mini" ? "mini" : "js";
  fromScript("global", g && g.script);
  renderScriptHooks("global");
  const boss = g && g.boss ? g.boss : null;
  const bossName = boss && boss.name ? (typeof boss.name === "object" ? (boss.name[state.settings.language] || boss.name.en || Object.values(boss.name)[0] || "") : boss.name) : "";
  $("#global-boss-name").value = bossName;
  $("#global-boss-emoji").value = (boss && boss.emoji) || "\u{1F479}";
  $("#global-boss-count").value = (boss && boss.count) || 1;
  const ba = (boss && boss.attributes) || {};
  $("#global-boss-health").value = ba.health != null ? ba.health : 150;
  $("#global-boss-morale").value = ba.morale != null ? ba.morale : 80;
  $("#global-boss-combat").value = ba.combat != null ? ba.combat : 60;
  $("#global-boss-stealth").value = ba.stealth != null ? ba.stealth : 30;
  $("#global-boss-defense").value = ba.defense != null ? ba.defense : 0;
  const bw = (boss && boss.weapons) || (boss && boss.weapon ? [boss.weapon] : null);
  bossWeapons = bw ? bw.map((w) => ({ cat: ["melee", "ranged", "explosive"].includes(w.cat) ? w.cat : "melee", dmg: normalizeBossDmgInput(w.dmg), spd: Math.max(1, Number(w.spd) || 1) })) : [{ cat: "melee", dmg: 8, spd: 1 }];
  renderBossWeapons();
  $("#global-boss-dmgmult").value = boss && boss.damageMult != null ? boss.damageMult : 1;
  $("#global-boss-explosion").value = boss && boss.explosion != null ? boss.explosion : 0;
  const beh = (boss && boss.behaviors) || [];
  $("#global-boss-patrol").checked = beh.includes("patrol");
  $("#global-boss-drain").checked = beh.includes("drain");
  $("#global-boss-steal").checked = beh.includes("steal");
  $("#global-boss-retaliate").checked = !boss || boss.retaliate !== false;
  $("#global-modal").classList.remove("hidden");
}

function renderGlobalLists() {
  const mk = (key, labelKey) => {
    const list = globalLists[key];
    let html = '<div class="mini-list">';
    if (!list.length) html += '<div class="hint">' + t("empty") + "</div>";
    list.forEach((e, i) => {
      const preview = e && e.tpl && typeof e.tpl === "object" ? (e.tpl.en || e.tpl.ru || Object.values(e.tpl)[0] || "") : (e && e.tpl) || "";
      html += '<div class="content-row">' +
        '<div class="row-main"><div class="row-sub"><b>#' + (i + 1) + "</b> " + esc(String(preview).slice(0, 60)) + "</div></div>" +
        '<button class="icon-btn" data-mini-edit="' + key + ":" + i + '" title="' + t("btnEdit") + '">\u270F\uFE0F</button>' +
        '<button class="icon-btn" data-mini-del="' + key + ":" + i + '" title="' + t("btnDelete") + '">\u{1F5D1}\uFE0F</button>' +
        "</div>";
    });
    html += '<button class="btn ghost small" data-mini-add="' + key + '" title="' + t(labelKey) + '">' + t("btnAddEvent") + "</button></div>";
    return html;
  };
  $("#global-replace-day").innerHTML = mk("replaceDay", "ui.globalReplaceDay");
  $("#global-replace-night").innerHTML = mk("replaceNight", "ui.globalReplaceNight");
  $("#global-addon-day").innerHTML = mk("addonDay", "ui.globalAddonDay");
  $("#global-addon-night").innerHTML = mk("addonNight", "ui.globalAddonNight");
}

function openMiniEdit(listKey, index) {
  miniListKey = listKey;
  miniEditIndex = index;
  const list = globalLists[listKey];
  const ev = index >= 0 ? list[index] : null;
  $("#mini-modal-title").textContent = t("eventTitle") + (index >= 0 ? " #" + (index + 1) : " \u2014 " + t("btnAddEvent"));
  $("#mini-targets").value = ev && ev.targets != null ? (Array.isArray(ev.targets) ? ev.targets.join("-") : ev.targets) : "";
  $("#mini-weight").value = ev && ev.weight ? ev.weight : 5;
  $("#mini-rel").value = ev && ev.rel ? ev.rel : 0;
  $("#mini-relrev").value = ev && ev.relRev ? ev.relRev : 0;
  $("#mini-loot").value = ev && ev.loot ? ev.loot.join(", ") : "";
  $("#mini-tpls").innerHTML = "";
  const tpls = tplVariantsOf(ev && ev.tpl);
  for (let i = 0; i < tpls.length; i++) addTplRow("#mini-tpls", tplCurrentText({ tpl: ev && ev.tpl }, i));
  if (!tpls.length) addTplRow("#mini-tpls", "");
  const isReplace = listKey.startsWith("replace");
  $("#mini-fxself").innerHTML = fxRowsHTML(rowsFromObj(ev && (ev.fxSelf || ev.fx)));
  $("#mini-fxother").innerHTML = fxRowsHTML(rowsFromObj(ev && ev.fxOther));
  const fxOtherWrap = $("#mini-fxother").parentElement;
  if (fxOtherWrap) fxOtherWrap.style.display = isReplace ? "" : "none";
  renderTargetSection("#mini-target", ev && ev.target);
  fromScript("mini", ev && ev.script);
  $("#mini-script-lang").value = scriptLang("mini") === "mini" ? "mini" : "js";
  renderScriptHooks("mini");
  renderOutcomeSection("#mini-outcomes", ev && ev.outcome);
  renderWeaponTpls("#mini-wtpls", ev && ev.weaponTpls);
  $("#mini-modal").classList.remove("hidden");
}

function closeMiniEdit() {
  $("#mini-modal").classList.add("hidden");
  miniListKey = null;
  miniEditIndex = -1;
}

function saveMini() {
  try {
    const list = globalLists[miniListKey];
    const existing = miniEditIndex >= 0 ? list[miniEditIndex] : null;
    const fxSelf = rowsToObj($("#mini-fxself"));
    const fxOther = rowsToObj($("#mini-fxother"));
    const entry = {
      tpl: buildTplFromRows("#mini-tpls", existing && existing.tpl)
    };
    const targetsText = $("#mini-targets").value.trim();
    if (targetsText) entry.targets = parseTargets(targetsText);
    const weight = $("#mini-weight").value;
    if (weight) entry.weight = Number(weight);
    const rel = Number($("#mini-rel").value);
    const relRev = Number($("#mini-relrev").value);
    if (rel !== 0) entry.rel = rel;
    if (relRev !== 0) entry.relRev = relRev;
    const loot = parseLoot($("#mini-loot").value);
    if (loot && loot.length) entry.loot = loot;
    const target = targetFromSection("#mini-target");
    if (target) entry.target = target;
    const miniScript = collectScript("mini");
    if (miniScript) entry.script = miniScript;
    const miniOutcome = outcomesFromSection("#mini-outcomes", existing && existing.outcome);
    if (miniOutcome) entry.outcome = miniOutcome;
    const miniWt = weaponTplsFromSection("#mini-wtpls", existing && existing.weaponTpls);
    if (miniWt) entry.weaponTpls = miniWt;
    const isReplace = miniListKey.startsWith("replace");
    if (Object.keys(fxSelf).length) entry[isReplace ? "fxSelf" : "fx"] = fxSelf;
    if (isReplace && Object.keys(fxOther).length) entry.fxOther = fxOther;
    if (miniEditIndex >= 0) list[miniEditIndex] = entry;
    else list.push(entry);
    renderGlobalLists();
    closeMiniEdit();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

async function saveGlobal() {
  try {
    const existing = globalEditId ? (catalog.globalEvents || []).find((x) => x.id === globalEditId) : null;
    const durType = $("#global-durtype").value;
    const durValue = durType === "endless" ? 1 : Math.max(1, Number($("#global-durvalue").value) || 1);
    const maxTriggers = $("#global-maxtriggers").value;
    const replaceDay = globalLists.replaceDay;
    const replaceNight = globalLists.replaceNight;
    const addonDay = globalLists.addonDay;
    const addonNight = globalLists.addonNight;
    const buff = rowsToObj($("#global-buff"));
    const nerf = rowsToObj($("#global-nerf"));
    const disable = parseLoot($("#global-disable").value);
    const mods = {};
    if (Object.keys(buff).length) mods.buff = buff;
    if (Object.keys(nerf).length) mods.nerf = nerf;
    const def = {
      id: $("#global-id").value.trim(),
      chance: Math.max(0, Math.min(100, Number($("#global-chance").value) || 0)) / 100,
      weight: Number($("#global-weight").value) || 10,
      duration: { type: durType, value: durValue },
      tpl: buildTplFromRows("#global-tpls", existing && existing.tpl),
      endTpl: buildTplFromRows("#global-endtpls", existing && existing.endTpl)
    };
    if (maxTriggers !== "") def.maxTriggers = Math.max(1, Number(maxTriggers) || 1);
    if (Object.keys(mods).length) def.mods = mods;
    if (disable && disable.length) def.disable = disable;
    if (replaceDay.length || replaceNight.length) {
      def.replace = {};
      if (replaceDay.length) def.replace.day = replaceDay;
      if (replaceNight.length) def.replace.night = replaceNight;
    }
    if (addonDay.length || addonNight.length) {
      def.addon = {};
      if (addonDay.length) def.addon.day = addonDay;
      if (addonNight.length) def.addon.night = addonNight;
    }
    def.mode = globalModeOf(def);
    const bossName = $("#global-boss-name").value.trim();
    if (bossName) {
      const behaviors = [];
      if ($("#global-boss-patrol").checked) behaviors.push("patrol");
      if ($("#global-boss-drain").checked) behaviors.push("drain");
      if ($("#global-boss-steal").checked) behaviors.push("steal");
      def.boss = {
        name: bossName,
        emoji: $("#global-boss-emoji").value.trim() || "\u{1F479}",
        count: Math.max(1, Number($("#global-boss-count").value) || 1),
        attributes: {
          health: Math.max(1, Number($("#global-boss-health").value) || 150),
          morale: Math.max(0, Math.min(100, Number($("#global-boss-morale").value) || 80)),
          combat: Math.max(0, Math.min(100, Number($("#global-boss-combat").value) || 60)),
          stealth: Math.max(0, Math.min(100, Number($("#global-boss-stealth").value) || 30)),
          defense: Math.max(0, Math.min(100, Number($("#global-boss-defense").value) || 0))
        },
        behaviors: behaviors
      };
      if (!$("#global-boss-retaliate").checked) def.boss.retaliate = false;
      const explosion = Number($("#global-boss-explosion").value) || 0;
      if (explosion > 0) def.boss.explosion = explosion;
      const weapons = bossWeapons.filter((w) => w && w.dmg).map((w) => ({ cat: w.cat, dmg: normalizeBossDmgInput(w.dmg), spd: Math.max(1, Math.round(Number(w.spd)) || 1) }));
      def.boss.weapons = weapons;
      const dmgMult = Number($("#global-boss-dmgmult").value) || 1;
      if (dmgMult !== 1) def.boss.damageMult = Math.max(0, Math.min(5, dmgMult));
    }
    const script = collectScript("global");
    if (script) def.script = script;
    if (!def.id) throw new Error("ID required");

    if (globalEditId) {
      await call("/api/globals/" + globalEditId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(def)
      });
    } else {
      await call("/api/globals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(def)
      });
    }
    $("#global-modal").classList.add("hidden");
    globalEditId = null;
    await refreshContent();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

async function deleteGlobal(id) {
  if (!confirm(t("btnDelete") + "?")) return;
  try {
    await call("/api/globals/" + id, { method: "DELETE" });
    await refreshContent();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

function renderPersonalitiesTab() {
  const body = $("#content-personalities");
  const pers = catalog ? catalog.personalities || [] : [];
  let html = '<div class="content-toolbar"><button class="btn primary small" id="pers-add">' + t("btnAddPers") + "</button></div>";
  html += contentFilterHTML("personalities");
  html += '<div class="content-list">';
  const filtered = pers.filter((p) => contentVisible(p, "personalities"));
  if (!filtered.length) html += '<div class="content-row row-sub">' + t("empty") + "</div>";
  for (const p of filtered) {
    const w = Object.keys(p.weights || {}).map((k) => (p.weights[k] > 0 ? "+" : "") + p.weights[k] + " " + t("evcat." + k)).join(", ");
    html += '<div class="content-row' + (p.enabled === false ? " disabled" : "") + '">' +
      '<div class="row-main"><div class="row-title">' + esc(personalityName(p.id)) + (p.default ? ' <span class="tag">' + t("persDefault") + "</span>" : "") + "</div>" +
      '<div class="row-sub">' + (w || t("persNoWeights")) + "</div></div>" +
      contentToggleHTML(p, "personalities") +
      '<button class="icon-btn" data-pers-edit="' + esc(p.id) + '" title="' + t("btnEdit") + '">\u270F\uFE0F</button>' +
      (p.default ? "" : '<button class="icon-btn" data-pers-del="' + esc(p.id) + '" title="' + t("btnDelete") + '">\u{1F5D1}\uFE0F</button>') +
      "</div>";
  }
  html += "</div>";
  body.innerHTML = html;
}

function renderAbilitiesTab() {
  const body = $("#content-abilities");
  const abs = catalog ? catalog.abilities || [] : [];
  let html = '<div class="content-toolbar"><button class="btn primary small" id="ab-add">' + t("btnAddAbility") + "</button></div>";
  html += contentFilterHTML("abilities");
  html += '<div class="content-list">';
  const filtered = abs.filter((a) => contentVisible(a, "abilities"));
  if (!filtered.length) html += '<div class="content-row row-sub">' + t("empty") + "</div>";
  for (const a of filtered) {
    const parts = [];
    if (a.weights) for (const k of Object.keys(a.weights)) if (a.weights[k]) parts.push((a.weights[k] > 0 ? "+" : "") + a.weights[k] + " " + t("evcat." + k));
    if (a.damageDealt) parts.push("x" + a.damageDealt + " " + t("ui.abDealt"));
    if (a.damageTaken) parts.push("x" + a.damageTaken + " " + t("ui.abTaken"));
    if (a.extraAction) parts.push(t("ui.abExtraAction"));
    html += '<div class="content-row' + (a.enabled === false ? " disabled" : "") + '">' +
      '<div class="row-main"><div class="row-title">' + esc(abilityNameOf(a)) + "</div>" +
      '<div class="row-sub">' + (parts.join(" \u00B7 ") || t("persNoWeights")) + "</div></div>" +
      contentToggleHTML(a, "abilities") +
      '<button class="icon-btn" data-ab-edit="' + esc(a.id) + '" title="' + t("btnEdit") + '">\u270F\uFE0F</button>' +
      '<button class="icon-btn" data-ab-del="' + esc(a.id) + '" title="' + t("btnDelete") + '">\u{1F5D1}\uFE0F</button>' +
      "</div>";
  }
  html += "</div>";
  body.innerHTML = html;
}

function abilityNameOf(a) {
  const n = a && a.name;
  if (n && typeof n === "object") return n[lang] || n.en || Object.values(n)[0] || a.id;
  return n || a.id;
}

function openAbilityEdit(id) {
  abilityEditId = id;
  const a = id ? (catalog.abilities || []).find((x) => x.id === id) : null;
  $("#ability-modal-title").textContent = a ? t("abTitle") + " " + esc(abilityNameOf(a)) : t("btnAddAbility");
  $("#ab-id").value = a ? a.id : "";
  $("#ab-id").disabled = !!a;
  $("#ab-name").value = a && a.name && typeof a.name === "object" ? (a.name[lang] || a.name.en || "") : (a ? a.name || "" : "");
  $("#ab-cond").value = (a && a.cond) || "";
  $("#ab-weights").innerHTML = EVCATS.slice(0, 6).map((act) => {
    const v = a && a.weights ? (a.weights[act] || 0) : 0;
    return '<div class="edit-stat"><label>' + t("evcat." + act) + "</label>" +
      '<input type="number" step="1" value="' + v + '" data-abw="' + act + '"><span class="rel-val"></span></div>';
  }).join("");
  $("#ab-dealt").value = a && a.damageDealt != null ? a.damageDealt : 1;
  $("#ab-taken").value = a && a.damageTaken != null ? a.damageTaken : 1;
  const up = (a && a.upkeep) || {};
  $("#ab-food").value = up.food != null ? up.food : 0;
  $("#ab-energy").value = up.energy != null ? up.energy : 0;
  $("#ab-cold").value = (a && a.coldResist) || 0;
  $("#ab-scav").value = (a && a.scavengeChance) || 0;
  $("#ab-target").value = (a && a.targetWeight) || 1;
  const xa = (a && a.extraAction) || {};
  $("#ab-xa-stat").value = xa.stat || "health";
  $("#ab-xa-below").value = xa.below != null ? xa.below : 30;
  $("#ab-xa-max").value = xa.max != null ? xa.max : 1;
  fromScript("ability", a && a.script);
  $("#ab-script-lang").value = scriptLang("ability") === "mini" ? "mini" : "js";
  renderScriptHooks("ability");
  $("#ability-modal").classList.remove("hidden");
}

async function saveAbility() {
  try {
    const weights = {};
    document.querySelectorAll("#ab-weights [data-abw]").forEach((el) => {
      const v = Number(el.value);
      if (v !== 0) weights[el.dataset.abw] = v;
    });
    const name = $("#ab-name").value.trim();
    const existing = abilityEditId ? (catalog.abilities || []).find((x) => x.id === abilityEditId) : null;
    const def = {
      id: $("#ab-id").value.trim(),
      name: mergeLocalized(existing && existing.name, name || "Ability"),
      weights
    };
    const cond = $("#ab-cond").value.trim();
    if (cond) def.cond = cond;
    const dealt = Number($("#ab-dealt").value);
    const taken = Number($("#ab-taken").value);
    if (dealt !== 1) def.damageDealt = dealt;
    if (taken !== 1) def.damageTaken = taken;
    const upkeep = {};
    const f = Number($("#ab-food").value), en = Number($("#ab-energy").value);
    if (f !== 0) upkeep.food = f;
    if (en !== 0) upkeep.energy = en;
    if (Object.keys(upkeep).length) def.upkeep = upkeep;
    const cold = Number($("#ab-cold").value), scav = Number($("#ab-scav").value), target = Number($("#ab-target").value);
    if (cold !== 0) def.coldResist = cold;
    if (scav !== 0) def.scavengeChance = scav;
    if (target !== 1) def.targetWeight = target;
    const xaBelow = Number($("#ab-xa-below").value), xaMax = Number($("#ab-xa-max").value);
    if (xaBelow > 0 && xaMax > 0) def.extraAction = { stat: $("#ab-xa-stat").value, below: xaBelow, max: xaMax };
    const scriptHooks = collectScript("ability");
    if (scriptHooks) def.script = scriptHooks;
    if (!def.id) throw new Error("ID required");
    if (abilityEditId) {
      await call("/api/abilities/" + abilityEditId, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(def) });
    } else {
      await call("/api/abilities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(def) });
    }
    $("#ability-modal").classList.add("hidden");
    abilityEditId = null;
    await refreshContent();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

function openPersonalityEdit(id) {
  personalityEditId = id;
  const p = id ? (catalog.personalities || []).find((x) => x.id === id) : null;
  $("#personality-modal-title").textContent = p ? t("persTitle") + " " + esc(personalityName(p.id)) : t("btnAddPers");
  $("#pers-id").value = p ? p.id : "";
  $("#pers-id").disabled = !!p;
  $("#pers-name").value = p && p.name && typeof p.name === "object" ? (p.name[lang] || p.name.en || "") : (p ? p.name || "" : "");
  $("#pers-weights").innerHTML = EVCATS.slice(0, 6).map((a) => {
    const v = p && p.weights ? (p.weights[a] || 0) : 0;
    return '<div class="edit-stat"><label>' + t("evcat." + a) + "</label>" +
      '<input type="number" step="1" value="' + v + '" data-persw="' + a + '">' +
      '<span class="rel-val"></span></div>';
  }).join("");
  $("#personality-modal").classList.remove("hidden");
}

async function savePersonality() {
  const weights = {};
  document.querySelectorAll("#pers-weights [data-persw]").forEach((el) => {
    const v = Number(el.value);
    if (v !== 0) weights[el.dataset.persw] = v;
  });
  const name = $("#pers-name").value.trim();
  const existing = personalityEditId ? (catalog.personalities || []).find((x) => x.id === personalityEditId) : null;
  const def = {
    name: mergeLocalized(existing && existing.name, name || "Personality"),
    weights
  };
  try {
    if (personalityEditId) {
      await call("/api/personalities/" + personalityEditId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(def)
      });
    } else {
      def.id = $("#pers-id").value.trim();
      if (!def.id) throw new Error("ID required");
      await call("/api/personalities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(def)
      });
    }
    $("#personality-modal").classList.add("hidden");
    personalityEditId = null;
    await refreshContent();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

async function deletePersonality(id) {
  if (!confirm(t("btnDelete") + "?")) return;
  try {
    await call("/api/personalities/" + encodeURIComponent(id), { method: "DELETE" });
    await refreshContent();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

async function deleteAbility(id) {
  if (!confirm(t("btnDelete") + "?")) return;
  try {
    await call("/api/abilities/" + encodeURIComponent(id), { method: "DELETE" });
    await refreshContent();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

// ---------- auto-play ----------

function startAuto() {
  if (autoTimer || autoBusy) return;
  if (!state || state.phase === "setup" || state.phase === "finished") return;
  autoActive = true;
  autoTimer = setInterval(async () => {
    if (autoBusy || !state) return;
    if (state.phase === "setup" || state.phase === "finished") {
      stopAuto();
      return;
    }
    autoBusy = true;
    await mutate("/api/advance", {});
    autoBusy = false;
    if (state.phase === "finished") stopAuto();
  }, autoSpeed);
  renderControls();
}

function stopAuto() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
  autoActive = false;
  autoBusy = false;
  renderControls();
}

function setSpeed(v) {
  const entry = SPEEDS.find((s) => s[0] === v) || SPEEDS[1];
  autoSpeed = entry[1];
  if (autoActive) {
    stopAuto();
    startAuto();
  } else {
    renderControls();
  }
}

// ---------- events ----------

function onControl(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const a = btn.dataset.action;
  if (a === "add") openEdit(null);
  else if (a === "start") {
    if (state.tributes.length < 2) {
      alert(t("needTwo"));
      return;
    }
    mutate("/api/start", {}).then(() => {
      if (state.settings && state.settings.autoPlay) startAuto();
    });
  } else if (a === "advance") {
    mutate("/api/advance", {});
  } else if (a === "auto") {
    if (autoActive) stopAuto();
    else startAuto();
  } else if (a === "stats") {
    showStats = !showStats;
    renderStatsPanel();
  } else if (a === "content") {
    openContent();
  } else if (a === "reset") {
    if (confirm(t("confirmReset"))) {
      stopAuto();
      mutate("/api/reset", {});
    }
  } else if (a === "example") {
    if (confirm(t("confirmExample"))) {
      stopAuto();
      mutate("/api/example", {});
    }
  }
}

function onGridClick(e) {
  const btn = e.target.closest("[data-edit], [data-del]");
  if (!btn) return;
  if (btn.dataset.edit) openEdit(btn.dataset.edit);
  else if (btn.dataset.del) removeTribute(btn.dataset.del);
}

async function onRelChange(e) {
  const el = e.target.closest("[data-rel]");
  if (!el) return;
  const [a, b] = el.dataset.rel.split(":");
  try {
    state = await call("/api/tributes/" + a, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relationships: { [b]: Number(el.value) } })
    });
    renderRelations();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

function onSettingChange(e) {
  const el = e.target.closest("[data-setting]");
  if (!el) return;
  const val = el.type === "checkbox" ? el.checked : el.value;
  mutate("/api/settings", { [el.dataset.setting]: val });
}

function onWinChange(e) {
  const mode = e.target.closest('input[name="winmode"]');
  if (mode) {
    mutate("/api/settings", { winMode: mode.value }).then(() => renderWinPanel());
    return;
  }
  if (e.target.id === "win-endday") {
    const v = Number(e.target.value);
    if (v >= 1) mutate("/api/settings", { endDay: Math.floor(v) });
    return;
  }
  if (e.target.id === "win-bossmin") {
    const v = e.target.value;
    mutate("/api/map", { bossMinDay: v === "" ? null : Math.max(1, Number(v)) });
    return;
  }
  if (e.target.id === "win-bosscount") {
    const v = Number(e.target.value);
    if (v >= 1) mutate("/api/map", { bossCount: Math.floor(v) });
    return;
  }
  if (e.target.id === "win-alliances-toggle") {
    mutate("/api/settings", { alliances: e.target.checked }).then(() => renderWinPanel());
    return;
  }
  const sel = e.target.closest("[data-alliance]");
  if (sel) {
    const id = sel.dataset.alliance;
    let val = sel.value;
    if (val === "__new__") {
      val = prompt(t("winAllianceNamePrompt")) || "";
      if (!val.trim()) { renderAllianceList(); return; }
      val = val.trim();
    }
    call("/api/tributes/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alliance: val })
    }).then((s) => {
      state = s;
      renderAllianceList();
    }).catch((err) => alert("Error: " + err.message));
  }
}

function onSpeedChange(e) {
  const el = e.target.closest("[data-speed]");
  if (el) setSpeed(el.value);
}

function onLangChange(e) {
  const el = e.target.closest("[data-lang]");
  if (el && el.value !== lang) {
    mutate("/api/settings", { language: el.value }).then(() => setLang(el.value));
  }
}

function onContentClick(e) {
  const tab = e.target.closest(".tab-btn");
  if (tab) {
    contentTab = tab.dataset.tab;
    renderContent();
    return;
  }
  const cf = e.target.closest("[data-cat-filter]");
  if (cf) {
    const [prefix, val] = cf.dataset.catFilter.split(":");
    if (prefix === "itemcat") contentItemCat = val;
    else if (prefix === "evcat") contentEventCat = val;
    else if (prefix === "globmode") contentGlobalCat = val;
    renderContent();
    return;
  }
  const ef = e.target.closest("[data-content-filter]");
  if (ef) {
    const [type, val] = ef.dataset.contentFilter.split(":");
    contentFilters[type] = val;
    renderContent();
    return;
  }
  const ct = e.target.closest("[data-content-toggle]");
  if (ct) {
    const [type, id] = ct.dataset.contentToggle.split(":");
    const list = type === "items" ? (catalog.items || []) : type === "events" ? (catalog.events || []) : type === "globals" ? (catalog.globalEvents || []) : type === "personalities" ? (catalog.personalities || []) : (catalog.abilities || []);
    const obj = list.find((x) => x.id === id);
    const next = !obj || obj.enabled === false;
    call("/api/content/enabled", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, enabled: next })
    }).then(async () => { await refreshContent(); });
    return;
  }
  if (e.target.id === "contentpack-save") { saveContentPack(); return; }
  const cpl = e.target.closest("[data-contentpack-load]");
  if (cpl) { loadContentPackByName(cpl.dataset.contentpackLoad); return; }
  const cpd = e.target.closest("[data-contentpack-del]");
  if (cpd) { deleteContentPackByName(cpd.dataset.contentpackDel); return; }
  if (e.target.id === "content-close") closeContent();
  else if (e.target.id === "content-reload") {
    call("/api/content/reload").then(async (c) => {
      catalog = Object.assign({}, catalog, c);
      await setLang(lang);
    });
  } else if (e.target.id === "item-add") openItemEdit(null);
  else if (e.target.id === "event-add") openEventEdit(null);
  else if (e.target.id === "global-add") openGlobalEdit(null);
  else if (e.target.id === "pers-add") openPersonalityEdit(null);
  else if (e.target.id === "ab-add") openAbilityEdit(null);
  else if (e.target.id === "lang-save") saveLocaleEdit();
  else if (e.target.id === "trans-add") {
    if (!langLocale[langSection]) langLocale[langSection] = {};
    langLocale[langSection]["new_key"] = "";
    renderTransTable();
  }
  const tm = e.target.closest("[data-trans-mode]");
  if (tm) { langMode = tm.dataset.transMode; renderContent(); return; }
  const ts = e.target.closest("[data-trans-section]");
  if (ts) { langSection = ts.dataset.transSection; renderTransTable(); return; }
  const td = e.target.closest("[data-trans-del]");
  if (td) { td.closest(".trans-row").remove(); return; }
  else if (e.target.id === "event-fxself-add") addFxRow("#event-fxself");
  else if (e.target.id === "event-fxother-add") addFxRow("#event-fxother");

  const ie = e.target.closest("[data-item-edit], [data-item-del]");
  if (ie) {
    if (ie.dataset.itemEdit) openItemEdit(ie.dataset.itemEdit);
    else if (ie.dataset.itemDel) deleteItem(ie.dataset.itemDel);
    return;
  }
  const ee = e.target.closest("[data-event-edit], [data-event-del]");
  if (ee) {
    if (ee.dataset.eventEdit) openEventEdit(ee.dataset.eventEdit);
    else if (ee.dataset.eventDel) deleteEvent(ee.dataset.eventDel);
    return;
  }
  const ge = e.target.closest("[data-global-edit], [data-global-del]");
  if (ge) {
    if (ge.dataset.globalEdit) openGlobalEdit(ge.dataset.globalEdit);
    else if (ge.dataset.globalDel) deleteGlobal(ge.dataset.globalDel);
    return;
  }
  const pe = e.target.closest("[data-pers-edit], [data-pers-del]");
  if (pe) {
    if (pe.dataset.persEdit) openPersonalityEdit(pe.dataset.persEdit);
    else if (pe.dataset.persDel) deletePersonality(pe.dataset.persDel);
    return;
  }
  const ae = e.target.closest("[data-ab-edit], [data-ab-del]");
  if (ae) {
    if (ae.dataset.abEdit) openAbilityEdit(ae.dataset.abEdit);
    else if (ae.dataset.abDel) deleteAbility(ae.dataset.abDel);
    return;
  }
  const lp = e.target.closest("[data-lang-set]");
  if (lp) {
    mutate("/api/settings", { language: lp.dataset.langSet }).then(() => setLang(lp.dataset.langSet));
  }
}

function onContentChange(e) {
  const prof = e.target.closest("#event-prof [data-prof]");
  if (prof) {
    const label = prof.parentElement.querySelector(".rel-val");
    if (label) label.textContent = prof.value;
  }
}

function onKeydown(e) {
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "select" || tag === "textarea" || e.target.isContentEditable) return;
  const k = e.key.toLowerCase();
  if (k === " " || k === "d") {
    if (!state || (state.phase !== "day" && state.phase !== "night")) return;
    e.preventDefault();
    mutate("/api/advance", {});
  } else if (k === "p") {
    if (autoActive) stopAuto();
    else startAuto();
  } else if (k === "1") setSpeed("slow");
  else if (k === "2") setSpeed("normal");
  else if (k === "3") setSpeed("fast");
}

function init() {
  $(".main-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-sheet]");
    if (b) setMainTab(b.dataset.sheet);
  });
  $("#controls").addEventListener("click", onControl);
  $("#controls").addEventListener("change", (e) => {
    onSpeedChange(e);
    onSettingChange(e);
    onLangChange(e);
  });
  $("#tribute-grid").addEventListener("click", onGridClick);
  $("#rel-matrix").addEventListener("change", onRelChange);
  $("#rel-radial").addEventListener("change", (e) => {
    if (e.target.id === "rel-center") { relCenterId = e.target.value; renderRelationsRadial(); }
  });
  document.addEventListener("click", (e) => {
    const rv = e.target.closest("[data-rel-view]");
    if (rv) { relView = rv.dataset.relView; renderRelations(); }
  });
  $("#content-panel").addEventListener("click", onContentClick);
  $("#content-panel").addEventListener("change", onContentChange);
  $("#packs-panel").addEventListener("click", (e) => {
    if (e.target.closest("#pack-save")) { saveCurrentPack(); return; }
    const l = e.target.closest("[data-pack-load]");
    if (l) { loadPackByName(l.dataset.packLoad); return; }
    const d = e.target.closest("[data-pack-del]");
    if (d) deletePackByName(d.dataset.packDel);
  });
  $("#stats-sort").addEventListener("change", (e) => {
    statsSort = e.target.value;
    renderStatsPanel();
  });
  $("#personality-cancel").addEventListener("click", () => {
    $("#personality-modal").classList.add("hidden");
    personalityEditId = null;
  });
  $("#ability-cancel").addEventListener("click", () => {
    $("#ability-modal").classList.add("hidden");
    abilityEditId = null;
  });
  $("#personality-save").addEventListener("click", savePersonality);
  $("#ability-save").addEventListener("click", saveAbility);
  $("#personality-modal").addEventListener("click", (e) => {
    if (e.target === $("#personality-modal")) {
      $("#personality-modal").classList.add("hidden");
      personalityEditId = null;
    }
  });
  $("#map-panel").addEventListener("change", onMapChange);
  wireGlobalsFields();
  $("#win-panel").addEventListener("change", onWinChange);
  $("#map-scarcity").addEventListener("input", (e) => {
    const el = e.target.closest("[data-scarcity]");
    if (el) {
      const label = document.querySelector('[data-scarcityval="' + el.dataset.scarcity + '"]');
      if (label) label.textContent = el.value;
    }
  });
  $("#edit-stats").addEventListener("input", (e) => {
    const el = e.target.closest("[data-stat]");
    if (el) {
      const label = document.querySelector('[data-statval="' + el.dataset.stat + '"]');
      if (label) label.textContent = el.value;
    }
  });
  $("#edit-profs").addEventListener("input", (e) => {
    const el = e.target.closest("[data-prof]");
    if (el) {
      const label = document.querySelector('[data-profval="' + el.dataset.prof + '"]');
      if (label) label.textContent = el.value;
    }
  });
  $("#edit-cancel").addEventListener("click", closeEdit);
  $("#edit-save").addEventListener("click", saveEdit);
  $("#emoji-quick").addEventListener("click", (e) => {
    const b = e.target.closest(".emoji-btn");
    if (b) {
      $("#edit-emoji").value = b.textContent;
      editImg = null;
      $("#edit-avatar-file").value = "";
      updateAvatarPreview();
    }
  });
  $("#edit-avatar-file").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { editImg = reader.result; updateAvatarPreview(); };
    reader.readAsDataURL(file);
  });
$("#edit-avatar-clear").addEventListener("click", () => {
    editImg = null;
    updateAvatarPreview();
  });
  $("#edit-item-add").addEventListener("click", () => {
    const id = $("#edit-item-pick").value;
    if (id && !editItems.includes(id)) {
      editItems.push(id);
      renderEditItems();
    }
  });
  $("#edit-items").addEventListener("click", (e) => {
    const d = e.target.closest("[data-edit-item-del]");
    if (d) {
      editItems = editItems.filter((x) => x !== d.dataset.editItemDel);
      renderEditItems();
    }
  });
  $("#edit-name").addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveEdit();
  });
  $("#edit-modal").addEventListener("click", (e) => {
    if (e.target === $("#edit-modal")) closeEdit();
  });
  $("#item-cancel").addEventListener("click", () => {
    $("#item-modal").classList.add("hidden");
    itemEditId = null;
  });
  $("#item-save").addEventListener("click", saveItem);
  $("#item-modal").addEventListener("click", (e) => {
    if (e.target === $("#item-modal")) {
      $("#item-modal").classList.add("hidden");
      itemEditId = null;
    }
  });
  $("#event-cancel").addEventListener("click", () => {
    $("#event-modal").classList.add("hidden");
    eventEditId = null;
  });
  $("#event-save").addEventListener("click", saveEvent);
  $("#event-tpl-add").addEventListener("click", () => addTplRow("#event-tpls", ""));
  $("#event-sub-add").addEventListener("click", () => openSubEdit(-1));
  $("#event-outcome-add").addEventListener("click", () => addOutcomeRow("#event-outcomes"));
  $("#sub-outcome-add").addEventListener("click", () => addOutcomeRow("#sub-outcomes"));
  $("#mini-outcome-add").addEventListener("click", () => addOutcomeRow("#mini-outcomes"));
  $("#event-modal").addEventListener("click", (e) => {
    const del = e.target.closest("[data-tpl-del]");
    if (del) {
      const rows = document.querySelectorAll("#event-tpls .tpl-row");
      if (rows.length > 1) del.closest(".tpl-row").remove();
      else del.closest(".tpl-row").querySelector("textarea").value = "";
      return;
    }
    const oc = e.target.closest(".oc-del");
    if (oc) {
      oc.closest(".outcome-row").remove();
      return;
    }
    const subEdit = e.target.closest("[data-sub-edit]");
    if (subEdit) {
      openSubEdit(Number(subEdit.dataset.subEdit));
      return;
    }
    const subDel = e.target.closest("[data-sub-del]");
    if (subDel) {
      if (confirm(t("btnDelete") + "?")) {
        subs.splice(Number(subDel.dataset.subDel), 1);
        renderSubsList();
      }
      return;
    }
    if (e.target === $("#event-modal")) {
      $("#event-modal").classList.add("hidden");
      eventEditId = null;
    }
  });
  $("#sub-cancel").addEventListener("click", closeSubEdit);
  $("#sub-save").addEventListener("click", saveSub);
  $("#sub-tpl-add").addEventListener("click", () => addTplRow("#sub-tpls", ""));
  $("#sub-fxself-add").addEventListener("click", () => addFxRow("#sub-fxself"));
  $("#sub-fxother-add").addEventListener("click", () => addFxRow("#sub-fxother"));
  bindTargetBuilder($("#event-target"));
  bindTargetBuilder($("#sub-target"));
  bindTargetBuilder($("#mini-target"));
  $("#sub-modal").addEventListener("click", (e) => {
    const del = e.target.closest("[data-tpl-del]");
    if (del) {
      const rows = document.querySelectorAll("#sub-tpls .tpl-row");
      if (rows.length > 1) del.closest(".tpl-row").remove();
      else del.closest(".tpl-row").querySelector("textarea").value = "";
      return;
    }
    const oc = e.target.closest(".oc-del");
    if (oc) {
      oc.closest(".outcome-row").remove();
      return;
    }
    if (e.target === $("#sub-modal")) closeSubEdit();
  });
  $("#global-cancel").addEventListener("click", () => {
    $("#global-modal").classList.add("hidden");
    globalEditId = null;
  });
  $("#global-save").addEventListener("click", saveGlobal);
  $("#global-tpl-add").addEventListener("click", () => addTplRow("#global-tpls", ""));
  $("#global-endtpl-add").addEventListener("click", () => addTplRow("#global-endtpls", ""));
  $("#global-buff-add").addEventListener("click", () => addFxRow("#global-buff"));
  $("#global-nerf-add").addEventListener("click", () => addFxRow("#global-nerf"));
  $("#global-boss-weapons").addEventListener("click", (e) => {
    const cat = e.target.closest("[data-bwcat]");
    if (cat) {
      const row = cat.closest(".boss-weapon-row");
      const i = Number(row.dataset.bwIndex);
      if (Number.isInteger(i) && i > -1 && i < bossWeapons.length) bossWeapons[i].cat = cat.dataset.bwcat;
      renderBossWeapons();
      return;
    }
    const del = e.target.closest("[data-bw-del]");
    if (del) {
      const row = del.closest(".boss-weapon-row");
      const i = Number(row.dataset.bwIndex);
      if (Number.isInteger(i) && i > -1 && i < bossWeapons.length) bossWeapons.splice(i, 1);
      renderBossWeapons();
    }
  });
  $("#global-boss-weapons").addEventListener("change", (e) => {
    const inp = e.target.closest("[data-bwdmg]");
    const row = inp ? inp.closest(".boss-weapon-row") : e.target.closest("[data-bwspd]") ? e.target.closest(".boss-weapon-row") : null;
    if (!row) return;
    const i = Number(row.dataset.bwIndex);
    if (Number.isInteger(i) && i > -1 && i < bossWeapons.length) {
      if (inp) bossWeapons[i].dmg = normalizeBossDmgInput(parseDmgRange(inp.value));
      else bossWeapons[i].spd = Math.max(1, Math.round(Number(e.target.value)) || 1);
    }
  });
  $("#global-boss-weapon-add").addEventListener("click", () => {
    bossWeapons.push({ cat: "melee", dmg: 8, spd: 1 });
    renderBossWeapons();
  });
  $("#global-durtype").addEventListener("change", (e) => {
    $("#global-durvalue").disabled = e.target.value === "endless";
  });
  $("#global-modal").addEventListener("click", (e) => {
    const del = e.target.closest("[data-tpl-del]");
    if (del) {
      const rows = document.querySelectorAll("#global-tpls .tpl-row, #global-endtpls .tpl-row");
      const container = del.closest(".tpl-row").parentElement;
      if (container.querySelectorAll(".tpl-row").length > 1) del.closest(".tpl-row").remove();
      else del.closest(".tpl-row").querySelector("textarea").value = "";
      return;
    }
    const me = e.target.closest("[data-mini-edit], [data-mini-del], [data-mini-add]");
    if (me) {
      const [key, idx] = (me.dataset.miniEdit || me.dataset.miniDel || me.dataset.miniAdd).split(":");
      if (me.dataset.miniAdd) openMiniEdit(key, -1);
      else if (me.dataset.miniEdit) openMiniEdit(key, Number(idx));
      else {
        globalLists[key].splice(Number(idx), 1);
        renderGlobalLists();
      }
      return;
    }
    if (e.target === $("#global-modal")) {
      $("#global-modal").classList.add("hidden");
      globalEditId = null;
    }
  });
  $("#mini-cancel").addEventListener("click", closeMiniEdit);
  $("#mini-save").addEventListener("click", saveMini);
  $("#mini-tpl-add").addEventListener("click", () => addTplRow("#mini-tpls", ""));
  $("#mini-fxself-add").addEventListener("click", () => addFxRow("#mini-fxself"));
  $("#mini-fxother-add").addEventListener("click", () => addFxRow("#mini-fxother"));
  $("#mini-modal").addEventListener("click", (e) => {
    const del = e.target.closest("[data-tpl-del]");
    if (del) {
      const rows = document.querySelectorAll("#mini-tpls .tpl-row");
      if (rows.length > 1) del.closest(".tpl-row").remove();
      else del.closest(".tpl-row").querySelector("textarea").value = "";
      return;
    }
    const oc = e.target.closest(".oc-del");
    if (oc) {
      oc.closest(".outcome-row").remove();
      return;
    }
    if (e.target === $("#mini-modal")) closeMiniEdit();
  });
  document.addEventListener("click", (e) => {
    const fxd = e.target.closest("[data-fx-del]");
    if (fxd) fxd.closest(".fxrow").remove();
  });
  document.addEventListener("input", (e) => {
    const ta = e.target.closest("[data-hooks-text]");
    if (ta && ta.dataset.hook) scriptHooksData(ta.dataset.hooksText)[ta.dataset.hook] = ta.value;
  });
  document.addEventListener("change", (e) => {
    const sel = e.target.closest("[data-hooks-add]");
    if (sel && sel.value) { addScriptHook(sel.dataset.hooksAdd, sel.value); sel.value = ""; }
    else if (e.target.id === "global-script-lang") scriptHooksData("global").lang = e.target.value;
    else if (e.target.id === "ab-script-lang") scriptHooksData("ability").lang = e.target.value;
    else if (e.target.id === "event-script-lang") scriptHooksData("event").lang = e.target.value;
    else if (e.target.id === "sub-script-lang") scriptHooksData("sub").lang = e.target.value;
    else if (e.target.id === "mini-script-lang") scriptHooksData("mini").lang = e.target.value;
  });
  document.addEventListener("click", (e) => {
    const del = e.target.closest("[data-hooks-del]");
    if (del && del.dataset.hook) removeScriptHook(del.dataset.hooksDel, del.dataset.hook);
  });
  $("#dev-events").addEventListener("click", (e) => {
    if (e.target.id === "dev-global-go") {
      const id = $("#dev-global").value;
      if (id) mutate("/api/dev/global", { id });
    } else if (e.target.id === "dev-event-go") {
      mutate("/api/dev/event", { cat: $("#dev-event-cat").value, tributeId: $("#dev-event-tribute").value || null });
    }
  });
  $("#dev-tribute-pick").addEventListener("change", (e) => { devTributeId = e.target.value; renderDevTribute(); });
  $("#dev-tribute-pers").addEventListener("change", (e) => devPut("/api/tributes/" + devTributeId, { personality: e.target.value }));
  $("#dev-tribute-stats").addEventListener("change", (e) => {
    const el = e.target.closest("[data-devstat]");
    if (el) devPut("/api/tributes/" + devTributeId, { attributes: { [el.dataset.devstat]: Number(el.value) } });
  });
  $("#dev-tribute-profs").addEventListener("change", (e) => {
    const el = e.target.closest("[data-devprof]");
    if (el) devPut("/api/tributes/" + devTributeId, { proficiencies: { [el.dataset.devprof]: Number(el.value) } });
  });
  $("#dev-item-add").addEventListener("click", () => {
    const itemId = $("#dev-item").value;
    if (itemId) mutate("/api/dev/item", { tributeId: devTributeId, itemId });
  });
  $("#dev-tribute-inv").addEventListener("click", (e) => {
    const d = e.target.closest("[data-dev-item-del]");
    if (d) mutate("/api/dev/item", { tributeId: devTributeId, itemId: d.dataset.devItemDel, remove: true });
  });
  $("#dev-map").addEventListener("click", (e) => {
    if (e.target.id === "dev-weather-go") mutate("/api/dev/weather", {});
  });
  $("#dev-weather").addEventListener("change", (e) => mutate("/api/map", { weather: e.target.checked }));
  $("#dev-scarcity").addEventListener("change", (e) => {
    const el = e.target.closest("[data-devscarcity]");
    if (el) mutate("/api/map", { scarcity: { [el.dataset.devscarcity]: Number(el.value) } });
  });
  document.addEventListener("keydown", onKeydown);

  Promise.all([call("/api/catalog"), call("/api/content"), call("/api/state")]).then(async ([cat, content, s]) => {
    catalog = Object.assign({}, cat, content);
    state = s;
    lang = state.settings.language || "en";
    const [d, fb] = await Promise.all([loadDict(lang), loadDict("en")]);
    dict = d;
    fallback = fb;
    renderAll();
    refreshPacks();
  }).catch((err) => {
    $("#controls").innerHTML = '<p class="err" style="color:var(--red)">Cannot reach the server: ' + esc(err.message) + "</p>";
  });
}

document.addEventListener("DOMContentLoaded", init);