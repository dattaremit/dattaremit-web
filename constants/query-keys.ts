export const queryKeys = {
  users: { me: ["users", "me"] as const },
  account: ["account"] as const,
  addresses: {
    all: ["addresses"] as const,
    detail: (id: string) => ["addresses", id] as const,
  },
  fundingAccount: ["fundingAccount"] as const,
  externalAccounts: {
    all: ["externalAccounts"] as const,
    detail: (id: string) => ["externalAccounts", id] as const,
  },
  activities: {
    all: ["activities"] as const,
    list: (params?: Record<string, unknown>) =>
      ["activities", "list", params] as const,
    detail: (id: string) => ["activities", id] as const,
  },
} as const;
