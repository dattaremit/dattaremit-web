export const queryKeys = {
  users: { me: ["users", "me"] as const },
  account: ["account"] as const,
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
  exchangeRate: ["exchange-rate"] as const,
  transferLimits: ["transfer", "limits"] as const,
  emailCheck: (scope: "user" | "recipient", email: string) =>
    ["check-email", scope, email] as const,
} as const;
