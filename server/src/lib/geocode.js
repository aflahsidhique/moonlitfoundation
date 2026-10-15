let lastRequestAt = 0;
async function throttle() {
  const elapsed = Date.now() - lastRequestAt;
  const wait = Math.max(0, 1100 - elapsed);
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();
}
async function geocodeAddress(query) {
  if (!query || !query.trim()) return null;
  await throttle();
  try {
    const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(query);
    const res = await fetch(url, {
      headers: { "User-Agent": "MoonlitFoundationSite/1.0 (nonprofit volunteer platform)" }
    });
    if (!res.ok) return null;
    const results = await res.json();
    if (!results.length) return null;
    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
  } catch (err) {
    return null;
  }
}
module.exports = { geocodeAddress };
