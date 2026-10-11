import { getStore } from "@netlify/blobs";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { BOOKABLE_IDS } from "../../public/items.js";

export const store = () => getStore({ name: "wishlist", consistency: "strong" });
export const isBookable = id => typeof id === "string" && BOOKABLE_IDS.includes(id);
export const hash = s => createHash("sha256").update(String(s)).digest("hex");
export const newToken = () => randomUUID();
export const clean = (s, max) => String(s || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max);

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export function samePin(given) {
  const pin = (globalThis.Netlify?.env.get("ADMIN_PIN") ?? process.env.ADMIN_PIN ?? "").trim();
  if (!pin) return false;
  const a = Buffer.from(hash(given || "")), b = Buffer.from(hash(pin));
  return timingSafeEqual(a, b);
}

// Bookings made on the old Claude-hosted page, carried over once.
const CARRIED_OVER = { tank: { name: "kunle", size: "", at: "2026-10-11T14:54:50.548Z" } };

export async function seedOnce(s) {
  const done = await s.get("meta/seeded");
  if (done) return;
  for (const [id, c] of Object.entries(CARRIED_OVER)) await s.setJSON("claim/" + id, { ...c, tokenHash: null }, { onlyIfNew: true });
  await s.set("meta/seeded", new Date().toISOString());
}

export async function allClaims(s) {
  const { blobs } = await s.list({ prefix: "claim/" });
  const out = {};
  await Promise.all(blobs.map(async b => {
    const v = await s.get(b.key, { type: "json" });
    if (v) out[b.key.slice(6)] = v;
  }));
  return out;
}
