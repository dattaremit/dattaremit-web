export const queryKeys = {
  users: { me: ["users", "me"] as const },
  account: ["account"] as const,
  addresses: {
    all: ["addresses"] as const,
    detail: (id: string) => ["addresses", id] as const,
  },
  activities: {
    all: ["activities"] as const,
    list: (params?: Record<string, unknown>) =>
      ["activities", "list", params] as const,
    detail: (id: string) => ["activities", id] as const,
  },
  recipients: {
    all: ["recipients"] as const,
    list: () => ["recipients", "list"] as const,
    detail: (id: string) => ["recipients", id] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (params?: Record<string, unknown>) =>
      ["notifications", "list", params] as const,
    unreadCount: ["notifications", "unread-count"] as const,
  },
} as const;
