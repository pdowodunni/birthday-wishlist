import { store, seedOnce, allClaims, isBookable, samePin, json } from "../lib/store.mjs";

// Daniel's view: who booked what. Needs the ADMIN_PIN environment variable.
export default async req => {
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);
  let body; try { body = await req.json(); } catch { return json({ error: "Bad request." }, 400); }
  if (!samePin(body.pin)) {
    await new Promise(r => setTimeout(r, 800));
    return json({ error: "Wrong PIN." }, 401);
  }
  const s = store();
  await seedOnce(s);
  if (body.action === "clear") {
    if (!isBookable(body.id)) return json({ error: "Unknown gift." }, 400);
    await s.delete("claim/" + body.id);
  }
  const all = await allClaims(s);
  const out = {};
  for (const [id, c] of Object.entries(all)) out[id] = { name: c.name || "", size: c.size || "", at: c.at || "" };
  return json(out);
};

export const config = { path: "/api/admin" };
