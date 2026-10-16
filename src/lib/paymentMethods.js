export const PAYMENT_METHODS = {
  USDT:          { label: 'USDT (Tether)',   icon: 'fas fa-dollar-sign',  color: '#22c55e' },
  BTC:           { label: 'Bitcoin',          icon: 'fab fa-bitcoin',      color: '#f97316' },
  ETH:           { label: 'Ethereum',          icon: 'fab fa-ethereum',     color: '#818cf8' },
  SOL:           { label: 'Solana',             icon: 'fas fa-coins',        color: '#c9a84c' },
  BANK_TRANSFER: { label: 'Bank Transfer',        icon: 'fas fa-building-columns', color: '#5a5a78' },
};

// Placeholder withdrawal fee schedule. There's no FeeConfig model in the
// schema, so this is a simple flat example (percentage + fixed network fee
// per method) — swap for real numbers, or move to a DB-backed config table,
// whenever you're ready to make fees admin-editable.
export const WITHDRAWAL_FEES = {
  USDT:          { percent: 1,   flatCents: 100 },   // 1% + $1.00
  BTC:           { percent: 1,   flatCents: 200 },   // 1% + $2.00
  ETH:           { percent: 1,   flatCents: 150 },   // 1% + $1.50
  SOL:           { percent: 1,   flatCents: 50  },   // 1% + $0.50
  BANK_TRANSFER: { percent: 0.5, flatCents: 500 },   // 0.5% + $5.00
};

export function calculateWithdrawalFee(amountCents, method) {
  const fee = WITHDRAWAL_FEES[method] || WITHDRAWAL_FEES.USDT;
  const percentFee = Math.round(amountCents * (fee.percent / 100));
  return percentFee + fee.flatCents;
}
