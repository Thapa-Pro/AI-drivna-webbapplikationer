const MENU_URL = "https://airbean-9pcyw.ondigitalocean.app/api/beans/";
const KEY = "airbean_menu_json";
const KEY_TIME = "airbean_menu_time";
const MAX_HOURS = 12;

export async function fetchMenuFromAPI() {
  const res = await fetch(MENU_URL);
  if (!res.ok) throw new Error(`Menu fetch failed: ${res.status}`);
  return await res.json();
}

export function cacheMenu(menu) {
  localStorage.setItem(KEY, JSON.stringify(menu));
  localStorage.setItem(KEY_TIME, String(Date.now()));
}

export function getCachedMenu() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

function isStale() {
  const t = Number(localStorage.getItem(KEY_TIME) || 0);
  return (Date.now() - t) / (1000*60*60) > MAX_HOURS;
}
///////////////////////////////////////////
// Tries to return a usable menu every time.
// - update = true  → try to fetch fresh first, then fall back to cache if needed
// - update = false → use cache if it's fresh; otherwise fetch and cache
export async function ensureMenu(update = true) {
  const cached = getCachedMenu();

  // 1) If caller wants an update now, try fetching first
  if (update) {
    try {
      const fresh = await fetchMenuFromAPI();
      cacheMenu(fresh);
      return fresh;
    } catch (err) {
      // Fetch failed — if we have any cached data, return it as a fallback
      if (cached) return cached;
      throw err; // nothing to show
    }
  }

  // 2) If not updating now: use cache if present and still fresh
  if (cached && !isStale()) {
    return cached;
  }

  // 3) Otherwise, fetch fresh and cache it
  try {
    const fresh = await fetchMenuFromAPI();
    cacheMenu(fresh);
    return fresh;
  } catch (err) {
    if (cached) return cached; // serve stale cache as last resort
    throw err;
  }
}
/////////////////////////////////////////////

export function formatMenuForLLM(menuJson) {
  const items = Array.isArray(menuJson) ? menuJson : menuJson?.menu || [];
  const lines = items.slice(0, 50).map(it => {
    const name  = it.title || it.name || "Okänt";
    const price = it.price != null ? `${it.price} kr` : "pris saknas";
    const desc  = it.desc || it.description || "";
    return `${name} — ${price}${desc ? ` — ${desc}` : ""}`;
  });
  return lines.length ? lines.join("\n") : "Ingen meny kunde läsas.";
}
