import { GROUPS, ALL, PHOTOS, ACCOUNT } from "/items.js";

const BYID = Object.fromEntries(ALL.map(i => [i.id, i]));
const bookable = ALL.filter(i => !i.multi && !i.done);

let claims = {};
let loaded = false;
let filter = "all";
let busy = false;
let openId = null;

const $ = id => document.getElementById(id);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

/* Tokens prove "this browser booked it", so the same person can cancel later. */
function readTokens() { try { return JSON.parse(localStorage.getItem("wl-tokens") || "{}"); } catch (e) { return {}; } }
function writeTokens(t) { try { localStorage.setItem("wl-tokens", JSON.stringify(t)); } catch (e) {} }
let tokens = readTokens();

function toast(msg) { const t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2800); }
function notice(msg, warn) { const n = $("notice"); n.textContent = msg; n.className = "notice" + (warn ? " warn" : ""); n.hidden = !msg; }
function photos(i) { return PHOTOS[i.id] || []; }
function stateOf(i) {
  if (i.done) return "done";
  if (i.multi) return "multi";
  const c = claims[i.id];
  if (!c) return "open";
  return tokens[i.id] ? "mine" : "taken";
}
function bookedLabel(c) { return (c.name ? "Taken by " + c.name : "Taken") + (c.size ? " (" + c.size + ")" : ""); }

function picEl(i) {
  const p = el("div", "pic" + (i.group === "books" ? " book" : "") + (i.id === "fc26" ? " cover" : ""));
  const src = photos(i)[0];
  if (src) { const im = el("img"); im.src = src; im.alt = i.name; im.loading = "lazy"; p.append(im); }
  else p.append(el("span", "glyph", i.name.charAt(0)));
  return p;
}

function render() {
  const open = bookable.filter(i => stateOf(i) === "open").length;
  const counted = ALL.filter(i => !i.multi);
  $("openCount").textContent = loaded ? open : "…";
  $("openLabel").textContent = loaded ? (open === 1 ? "gift" : "gifts") + " still open, " + (counted.length - open) + " taken" : "Loading the list";
  const root = $("sections"); root.textContent = "";
  for (const g of GROUPS) {
    const items = ALL.filter(i => i.group === g.key).filter(i => {
      const s = stateOf(i);
      if (filter === "open") return s === "open" || s === "multi";
      if (filter === "booked") return s === "mine" || s === "taken";
      return true;
    });
    if (!items.length) continue;
    const sec = el("section"); const h = el("h2", null, g.title);
    if (g.key !== "other") {
      const all = ALL.filter(i => i.group === g.key && !i.done);
      h.append(el("small", null, all.filter(i => stateOf(i) === "open").length + " of " + all.length + " open"));
    }
    const grid = el("div", "grid");
    for (const i of items) grid.append(card(i));
    sec.append(h, grid); root.append(sec);
  }
  if (!root.children.length) root.append(el("p", "note", filter === "booked" ? "Nothing has been taken yet." : "Everything has been taken. Cash is always welcome."));
  if (openId) renderSheet();
}

function card(i) {
  const s = stateOf(i);
  const b = el("div", "card" + (s === "taken" || s === "done" ? " is-taken" : ""));
  const p = picEl(i);
  if (s === "done") p.append(el("span", "badge taken", "Already got it"));
  else if (s === "taken") p.append(el("span", "badge taken", bookedLabel(claims[i.id])));
  else if (s === "mine") p.append(el("span", "badge mine", "You're getting this"));
  else if (s === "multi") p.append(el("span", "badge open", "Always open"));
  const m = el("div", "meta"); m.append(el("div", "name", i.name)); if (i.note) m.append(el("div", "note", i.note));
  const labels = { open: "I'll get this", mine: "You're getting this", taken: "Taken", done: "Already got it", multi: "Send cash" };
  const a = el("button", "cta cta-" + s, labels[s]); a.setAttribute("aria-label", labels[s] + ": " + i.name);
  a.onclick = () => openSheet(i.id);
  p.onclick = m.onclick = () => openSheet(i.id);
  b.append(p, m, a);
  return b;
}

/* ---------- booking sheet ---------- */
let draft = { name: "", anon: false, size: null, err: "", confirmCancel: false };
function openSheet(id) { openId = id; draft = { name: "", anon: false, size: null, err: "", confirmCancel: false }; renderSheet(); $("scrim").hidden = false; }
function closeSheet() { openId = null; $("scrim").hidden = true; $("scrim").textContent = ""; }
$("scrim").addEventListener("click", e => { if (e.target.id === "scrim") closeSheet(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && openId) closeSheet(); });

function renderSheet() {
  const i = BYID[openId]; if (!i) return;
  const s = stateOf(i), c = claims[i.id];
  const focusName = document.activeElement && document.activeElement.id === "bookName";
  const scrim = $("scrim"); scrim.textContent = "";
  const sh = el("div", "sheet"); sh.setAttribute("role", "dialog"); sh.setAttribute("aria-label", i.name);
  sh.append(picEl(i));
  const extra = photos(i).slice(1);
  if (extra.length) { const st = el("div", "strip"); for (const u of extra) { const im = el("img"); im.src = u; im.alt = i.name; st.append(im); } sh.append(st); }
  const t = el("div"); t.append(el("h3", null, i.name)); if (i.note) t.append(el("div", "note", i.note)); sh.append(t);
  if (i.link) { const lk = el("a", "btn ghost buy", "Where to buy: " + i.link[0]); lk.href = i.link[1]; lk.target = "_blank"; lk.rel = "noopener"; sh.append(lk); }

  if (s === "done") sh.append(el("div", "status taken", "Daniel already has this one."));
  else if (s === "multi") {
    sh.append(el("div", "status mine", "No booking needed. Anyone and everyone can send a transfer."));
    const acct = el("div", "acct");
    acct.append(el("div", "note", "Bank"), el("div", "name", ACCOUNT.bank), el("div", "note", "Account number"), el("div", "acctno", ACCOUNT.number));
    const cp = el("button", "btn", "Copy account number");
    cp.onclick = async () => {
      try { await navigator.clipboard.writeText(ACCOUNT.number); toast("Account number copied"); }
      catch (e) { const r = document.createRange(); r.selectNodeContents(acct.querySelector(".acctno")); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); toast("Selected. Copy it from here"); }
    };
    sh.append(acct, cp);
  } else if (s === "taken" || s === "mine") {
    sh.append(el("div", "status " + (s === "mine" ? "mine" : "taken"), s === "mine" ? "You're getting this" + (c.size ? " (" + c.size + ")" : "") + ". Thank you!" : bookedLabel(c) + ". Please pick something else."));
    if (s === "mine") {
      const cb = el("button", "btn danger", draft.confirmCancel ? "Tap again to cancel" : "Cancel my booking");
      cb.onclick = () => { if (draft.confirmCancel) cancel(i); else { draft.confirmCancel = true; renderSheet(); } };
      sh.append(cb);
    }
  } else {
    sh.append(el("div", "status taken", "Still open"));
    if (i.sizes) {
      sh.append(el("label", null, "Which size are you getting?"));
      const r = el("div", "row");
      for (const z of i.sizes) { const o = el("button", "opt", z); o.setAttribute("aria-pressed", String(draft.size === z)); o.onclick = () => { draft.size = z; draft.err = ""; renderSheet(); }; r.append(o); }
      sh.append(r);
    }
    const lb = el("label", null, "Your name"); lb.htmlFor = "bookName";
    const inp = el("input"); inp.type = "text"; inp.id = "bookName"; inp.placeholder = "Enter your name"; inp.value = draft.name; inp.autocomplete = "off"; inp.disabled = draft.anon; inp.maxLength = 40;
    inp.oninput = () => { draft.name = inp.value; };
    inp.onkeydown = e => { if (e.key === "Enter") book(i); };
    const rg = el("div", "radios"); rg.setAttribute("role", "radiogroup"); rg.setAttribute("aria-label", "How to show your name");
    for (const [v, txt] of [[false, "Show my name"], [true, "Stay anonymous"]]) {
      const l = el("label", "radio"); const r = el("input"); r.type = "radio"; r.name = "anon"; r.id = "anon-" + v; r.checked = draft.anon === v;
      r.onchange = () => { draft.anon = v; draft.err = ""; renderSheet(); };
      l.append(r, document.createTextNode(" " + txt)); rg.append(l);
    }
    sh.append(lb, inp, rg);
    if (draft.err) sh.append(el("p", "err", draft.err));
    const bb = el("button", "btn", busy ? "Saving…" : "I'll get this"); bb.disabled = busy; bb.onclick = () => book(i);
    sh.append(bb);
    if (focusName) setTimeout(() => { const n = $("bookName"); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } });
  }
  const close = el("button", "btn ghost", "Close"); close.onclick = closeSheet; sh.append(close);
  scrim.append(sh);
}

async function api(path, body) {
  const r = await fetch(path, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : { cache: "no-store" });
  let data = null; try { data = await r.json(); } catch (e) {}
  return { ok: r.ok, status: r.status, data };
}

async function load() {
  try {
    const r = await api("/api/claims");
    if (!r.ok) throw new Error();
    claims = r.data || {};
    loaded = true;
    // Forget tokens for bookings that no longer exist (e.g. cleared by Daniel).
    let changed = false;
    for (const id of Object.keys(tokens)) if (!claims[id]) { delete tokens[id]; changed = true; }
    if (changed) writeTokens(tokens);
    notice("");
  } catch (e) {
    notice("Couldn't load the latest list. Check your connection; it will retry on its own.", true);
  }
  render();
}

async function book(i) {
  if (busy) return;
  const name = draft.anon ? "" : (draft.name || "").trim();
  if (i.sizes && !draft.size) { draft.err = "Pick a size first."; renderSheet(); return; }
  if (!draft.anon && !name) { draft.err = "Enter your name, or choose Stay anonymous."; renderSheet(); return; }
  busy = true; draft.err = ""; renderSheet();
  try {
    const r = await api("/api/book", { id: i.id, name, size: draft.size || "" });
    if (r.ok && r.data && r.data.token) {
      tokens[i.id] = r.data.token; writeTokens(tokens);
      claims[i.id] = r.data.claim;
      toast(i.name + " is now taken. Thank you" + (name ? ", " + name : "") + "!");
    } else if (r.status === 409) {
      draft.err = "Someone just took this one. Please pick something else.";
      await load();
    } else {
      draft.err = (r.data && r.data.error) || "Couldn't book that. Check your connection and try again.";
    }
  } catch (e) {
    draft.err = "Couldn't book that. Check your connection and try again.";
  } finally { busy = false; render(); }
}

async function cancel(i) {
  try {
    const r = await api("/api/cancel", { id: i.id, token: tokens[i.id] });
    if (r.ok) { delete claims[i.id]; delete tokens[i.id]; writeTokens(tokens); toast("Booking cancelled: " + i.name); }
    else toast((r.data && r.data.error) || "Couldn't cancel that. Try again.");
  } catch (e) { toast("Couldn't cancel that. Try again."); }
  draft.confirmCancel = false; render();
}

for (const [id, f] of [["f-all", "all"], ["f-open", "open"], ["f-booked", "booked"]]) {
  $(id).onclick = () => { filter = f; for (const x of ["f-all", "f-open", "f-booked"]) $(x).setAttribute("aria-pressed", String(x === id)); render(); };
}

render();
load();
setInterval(() => { if (!document.hidden && !busy) load(); }, 20000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) load(); });
