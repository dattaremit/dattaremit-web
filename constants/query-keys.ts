export const queryKeys = {
  users: { me: ["users", "me"] as const },
  account: ["account"] as const,
  externalAccount: ["external-account"] as const,
  nreAccount: ["nre-account"] as const,
  addresses: {
    all: ["addresses"] as const,
    detail: (id: string) => ["addresses", id] as const,
  },
  activities: {
    all: ["activities"] as const,
    list: (params?: Record<string, unknown>) => ["activities", "list", params] as const,
    detail: (id: string) => ["activities", id] as const,
  },
  recipients: {
    all: ["recipients"] as const,
    list: () => ["recipients", "list"] as const,
    detail: (id: string) => ["recipients", id] as const,
    banks: (id: string) => ["recipients", id, "banks"] as const,
  },
  myBanks: {
    all: ["my-banks"] as const,
    list: () => ["my-banks", "list"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (params?: Record<string, unknown>) => ["notifications", "list", params] as const,
    unreadCount: ["notifications", "unread-count"] as const,
  },
  referral: ["referral", "me"] as const,
  transferRequests: ["transfer-requests"] as const,
  exchangeRate: ["exchange-rate"] as const,
  transferLimits: ["transfer", "limits"] as const,
  selfFee: ["transfer", "self-fee"] as const,
  fee: {
    regular: (amount: number) => ["fee", "regular", amount] as const,
    nre: (amount: number) => ["fee", "nre", amount] as const,
  },
  emailCheck: (scope: "user" | "recipient", email: string) =>
    ["check-email", scope, email] as const,
  addressAutocomplete: (sessionToken: string, input: string) =>
    ["address-autocomplete", sessionToken, input] as const,
  support: { conversations: ["support", "conversations"] as const },
} as const;
