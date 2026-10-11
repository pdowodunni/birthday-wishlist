import { store, seedOnce, allClaims, json } from "../lib/store.mjs";

// Public list of taken gifts. Never includes cancel tokens.
export default async () => {
  const s = store();
  await seedOnce(s);
  const all = await allClaims(s);
  const out = {};
  for (const [id, c] of Object.entries(all)) out[id] = { name: c.name || "", size: c.size || "" };
  return json(out);
};

export const config = { path: "/api/claims" };
