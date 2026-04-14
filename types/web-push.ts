/**
 * Payload sent to the server when registering a web push subscription.
 *
 * Server endpoint: POST /devices/register-web-push
 *
 * NOTE (server work required): the existing /devices/register endpoint is
 * shaped for Expo (`expoPushToken`, platform IOS/ANDROID). Web push needs a
 * separate endpoint or extended schema that stores the full subscription
 * object (endpoint + keys.p256dh + keys.auth) so the server's web-push
 * library can send to it.
 */
export interface WebPushRegistrationPayload {
  platform: "WEB";
  deviceName?: string;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}

export interface WebPushDevice {
  id: string;
  platform: "WEB";
  endpoint: string;
  deviceName: string | null;
  lastActiveAt: string;
  created_at: string;
}
