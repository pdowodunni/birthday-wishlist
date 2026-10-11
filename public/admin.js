import { ALL } from "/items.js";

const BYID = Object.fromEntries(ALL.map(i => [i.id, i]));
const bookable = ALL.filter(i => !i.multi && !i.done);
const $ = id => document.getElementById(id);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

let pin = "";
try { pin = sessionStorage.getItem("wl-pin") || ""; } catch (e) {}
let claims = {};
let confirmId = null;

function toast(msg) { const t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2600); }

async function call(body) {
  const r = await fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pin, ...body }) });
  let data = null; try { data = await r.json(); } catch (e) {}
  return { ok: r.ok, status: r.status, data };
}

function showPin(err) {
  $("view").hidden = true; $("pinForm").hidden = false;
  $("pinErr").hidden = !err; $("pinErr").textContent = err || "";
  $("pin").focus();
}

async function load() {
  if (!pin) return showPin();
  const r = await call({});
  if (r.status === 401) { pin = ""; try { sessionStorage.removeItem("wl-pin"); } catch (e) {} return showPin("Wrong PIN. Try again."); }
  if (!r.ok) return showPin("Couldn't reach the site. Check your connection.");
  try { sessionStorage.setItem("wl-pin", pin); } catch (e) {}
  claims = r.data || {};
  $("pinForm").hidden = true; $("view").hidden = false;
  render();
}

function when(at) { return at ? new Date(at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : ""; }

function render() {
  const rows = Object.entries(claims).map(([id, c]) => ({ i: BYID[id], id, c })).filter(r => r.i)
    .sort((a, b) => (b.c.at || "").localeCompare(a.c.at || ""));
  const s = $("summary"); s.textContent = "";
  for (const [n, label] of [[rows.length, "booked"], [bookable.length - rows.length, "still open"], [rows.filter(r => !r.c.name).length, "anonymous"]]) {
    const d = el("div"); d.append(el("strong", null, String(n)), el("span", null, label)); s.append(d);
  }

  const box = $("ledger"); box.textContent = "";
  box.append(el("h2", null, "Booked"));
  if (!rows.length) box.append(el("p", "note", "Nobody has picked a gift yet. Bookings show up here as they come in."));
  else {
    const t = el("table"); const hd = el("tr");
    for (const x of ["Gift", "From", "When", ""]) hd.append(el("th", null, x));
    t.append(hd);
    for (const { i, id, c } of rows) {
      const tr = el("tr");
      const btn = el("button", "clear" + (confirmId === id ? " confirm" : ""), confirmId === id ? "Tap again" : "Clear");
      btn.onclick = () => clear(id);
      const td = el("td"); td.append(btn);
      tr.append(el("td", null, i.name + (c.size ? " (" + c.size + ")" : "")), el("td", null, c.name || "Anonymous"), el("td", null, when(c.at)), td);
      t.append(tr);
    }
    const w = el("div", "tablewrap"); w.append(t); box.append(w);
  }

  const open = bookable.filter(i => !claims[i.id]);
  const ob = $("openList"); ob.textContent = "";
  ob.append(el("h2", null, "Still open"));
  if (!open.length) ob.append(el("p", "note", "Everything has been booked."));
  else { const ul = el("ul"); for (const i of open) ul.append(el("li", null, i.name)); ob.append(ul); }
}

async function clear(id) {
  if (confirmId !== id) { confirmId = id; render(); return; }
  confirmId = null;
  const r = await call({ action: "clear", id });
  if (r.ok) { claims = r.data || {}; toast("Cleared: " + BYID[id].name); render(); }
  else toast("Couldn't clear that. Try again.");
}

$("pinForm").addEventListener("submit", e => { e.preventDefault(); pin = $("pin").value.trim(); load(); });
$("lock").onclick = () => { pin = ""; try { sessionStorage.removeItem("wl-pin"); } catch (e) {} $("pin").value = ""; showPin(); };

load();
setInterval(() => { if (pin && !document.hidden) load(); }, 30000);
