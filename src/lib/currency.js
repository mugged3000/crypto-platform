// All monetary amounts in the DB (User.balance, Deposit.amount, etc.) are
// stored as integer CENTS — matches the existing convention already used on
// the main dashboard page. These helpers keep that conversion consistent
// everywhere instead of every page doing its own `/100` and `*100` math.

export function centsToDollars(cents) {
  return (cents || 0) / 100;
}

export function dollarsToCents(dollars) {
  return Math.round(parseFloat(dollars || 0) * 100);
}

export function formatCurrency(cents) {
  return `$${centsToDollars(cents).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
