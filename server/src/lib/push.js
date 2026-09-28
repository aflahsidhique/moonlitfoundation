const webpush = require("web-push");

function isConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

if (isConfigured()) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// subscription: { endpoint, p256dh, auth } (as stored on PushSubscription)
// payload: plain object, JSON-serialized for the service worker to read.
async function sendPush(subscription, payload) {
  if (!isConfigured()) throw new Error("not configured (set VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)");

  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth }
    },
    JSON.stringify(payload)
  );
}

module.exports = { sendPush, isConfigured };
