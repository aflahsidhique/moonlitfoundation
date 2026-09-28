import { API_BASE } from "../../lib/api";
import { portalFetch } from "./portalApi";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function pushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

export function getPushSubscription() {
  return navigator.serviceWorker.register("/portal/sw.js").then((reg) => reg.pushManager.getSubscription());
}

export function enablePush() {
  return fetch(API_BASE.replace(/\/api$/, "") + "/api/config")
    .then((res) => res.json())
    .then((cfg) => {
      if (!cfg.vapidPublicKey) throw new Error("Push notifications aren't configured on the server yet.");
      return Notification.requestPermission()
        .then((perm) => {
          if (perm !== "granted") throw new Error("Notification permission denied.");
          return navigator.serviceWorker.register("/portal/sw.js");
        })
        .then((reg) => reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(cfg.vapidPublicKey),
        }));
    })
    .then((sub) => {
      const raw = sub.toJSON();
      return portalFetch("/volunteer-auth/push-subscribe", {
        method: "POST",
        body: JSON.stringify({ endpoint: raw.endpoint, p256dh: raw.keys.p256dh, auth: raw.keys.auth }),
      });
    });
}

export function disablePush() {
  return getPushSubscription().then((sub) => {
    if (!sub) return;
    const endpoint = sub.endpoint;
    return sub.unsubscribe().then(() => portalFetch("/volunteer-auth/push-unsubscribe", { method: "POST", body: JSON.stringify({ endpoint }) }));
  });
}
