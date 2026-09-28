/* ============================================================
   MOONLIT FOUNDATION — portal/sw.js
   Minimal service worker whose only job is to display Web Push
   notifications (blood alerts, etc.) and focus/open the portal
   when one is clicked. Registered by portal.js from the
   Notifications section's "Enable Push Notifications" toggle.
   ============================================================ */
self.addEventListener("push", function (event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}

  var title = data.title || "Moonlit Foundation";
  var options = {
    body: data.body || "",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    data: { url: data.url || "/portal" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || "/portal";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clients) {
      for (var i = 0; i < clients.length; i++) {
        if (clients[i].url.indexOf(url) !== -1 && "focus" in clients[i]) return clients[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
