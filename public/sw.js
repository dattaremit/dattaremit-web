/* global self, clients */

/**
 * Dattaremit web push service worker.
 *
 * Receives push events from the server, shows a native notification, and
 * posts a message to all open app clients so the in-app banner can render.
 *
 * Server payload shape (application/json):
 *   {
 *     "title": string,
 *     "body": string,
 *     "type"?: string,
 *     "data"?: { url?: string, ... }
 *   }
 */

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Dattaremit", body: event.data.text() };
  }

  const title = payload.title || "Dattaremit";
  const options = {
    body: payload.body || "",
    icon: "/icon.png",
    badge: "/icon.png",
    data: payload.data || {},
    tag: payload.type || "default",
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      broadcast(payload),
    ]),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/notifications";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((matchedClients) => {
        for (const client of matchedClients) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      }),
  );
});

function broadcast(payload) {
  return self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((matchedClients) => {
      for (const client of matchedClients) {
        client.postMessage({ type: "DATTAREMIT_PUSH", payload });
      }
    });
}
