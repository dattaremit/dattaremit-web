import { queryKeys } from "../query-keys";

describe("queryKeys", () => {
  describe("static keys", () => {
    it("exposes a stable key for the current user", () => {
      expect(queryKeys.users.me).toEqual(["users", "me"]);
    });

    it("exposes a stable key for the account", () => {
      expect(queryKeys.account).toEqual(["account"]);
    });

    it("exposes a stable key for the exchange rate", () => {
      expect(queryKeys.exchangeRate).toEqual(["exchange-rate"]);
    });

    it("exposes a stable key for unread notifications count", () => {
      expect(queryKeys.notifications.unreadCount).toEqual(["notifications", "unread-count"]);
    });
  });

  describe("dynamic keys", () => {
    it("builds a detail key for an address by id", () => {
      expect(queryKeys.addresses.detail("addr-123")).toEqual(["addresses", "addr-123"]);
    });

    it("builds a list key for activities including the params object", () => {
      const params = { page: 2, type: "TRANSFER" };
      expect(queryKeys.activities.list(params)).toEqual(["activities", "list", params]);
    });

    it("builds a recipient banks key by id", () => {
      expect(queryKeys.recipients.banks("rec-1")).toEqual(["recipients", "rec-1", "banks"]);
    });

    it("builds a scoped email-check key", () => {
      expect(queryKeys.emailCheck("user", "x@example.com")).toEqual([
        "check-email",
        "user",
        "x@example.com",
      ]);
      expect(queryKeys.emailCheck("recipient", "y@example.com")).toEqual([
        "check-email",
        "recipient",
        "y@example.com",
      ]);
    });
  });

  describe("namespacing", () => {
    it("uses distinct top-level prefixes per resource", () => {
      const prefixes = [
        queryKeys.users.me[0],
        queryKeys.account[0],
        queryKeys.addresses.all[0],
        queryKeys.activities.all[0],
        queryKeys.recipients.all[0],
        queryKeys.myBanks.all[0],
        queryKeys.notifications.all[0],
      ];
      expect(new Set(prefixes).size).toBe(prefixes.length);
    });
  });
});
