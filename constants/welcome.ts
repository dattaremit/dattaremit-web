export const SEND_AMOUNT = 1000;

export const COMPETITOR_SPREADS = [
  { name: "Dattaremit", spreadPct: 0, fee: 0, highlight: true },
  { name: "Wise", spreadPct: 0.5, fee: 5.5, highlight: false },
  { name: "Xoom", spreadPct: 2.5, fee: 0, highlight: false },
] as const;

export const DISCLAIMER_TEXT =
  "Rates are indicative and may vary at the time of transfer. Competitor data is approximate and sourced from public information.";
