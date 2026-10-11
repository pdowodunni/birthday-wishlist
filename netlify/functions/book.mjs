import { store, seedOnce, isBookable, newToken, hash, clean, json } from "../lib/store.mjs";
import { ALL } from "../../public/items.js";

export default async req => {
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);
  let body; try { body = await req.json(); } catch { return json({ error: "Bad request." }, 400); }
  const id = body.id;
  if (!isBookable(id)) return json({ error: "That gift can't be booked." }, 400);
  const item = ALL.find(i => i.id === id);
  const size = clean(body.size, 20);
  if (item.sizes && !item.sizes.includes(size)) return json({ error: "Pick a size first." }, 400);
  const name = clean(body.name, 40);

  const s = store();
  await seedOnce(s);
  const token = newToken();
  const claim = { name, size: item.sizes ? size : "", at: new Date().toISOString(), tokenHash: hash(token) };
  // onlyIfNew makes this first-come-first-served: a second booking for the same gift fails.
  const res = await s.setJSON("claim/" + id, claim, { onlyIfNew: true });
  if (!res.modified) return json({ error: "Someone just took this one. Please pick something else." }, 409);
  return json({ token, claim: { name: claim.name, size: claim.size } });
};

export const config = { path: "/api/book" };
