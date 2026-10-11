import { store, isBookable, hash, json } from "../lib/store.mjs";

// Only the browser that booked a gift holds its token, so only it can cancel.
export default async req => {
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);
  let body; try { body = await req.json(); } catch { return json({ error: "Bad request." }, 400); }
  if (!isBookable(body.id) || !body.token) return json({ error: "Bad request." }, 400);
  const s = store();
  const c = await s.get("claim/" + body.id, { type: "json" });
  if (!c) return json({ ok: true });
  if (!c.tokenHash || c.tokenHash !== hash(body.token)) return json({ error: "Only the person who booked this can cancel it." }, 403);
  await s.delete("claim/" + body.id);
  return json({ ok: true });
};

export const config = { path: "/api/cancel" };
