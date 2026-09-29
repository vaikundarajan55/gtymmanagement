// Membership plan prices charged at online checkout. Keep in sync with PLANS in frontend/src/data/site.js.
export const PLANS = {
  Monthly:       { price: 1200,  months: 1 },
  Quarterly:     { price: 3200,  months: 3 },
  'Half-Yearly': { price: 5500,  months: 6 },
  Yearly:        { price: 10800, months: 12 },
};

export const GST_RATE = 0.18;
export const MAX_BOOKING_DAYS_AHEAD = 30;
