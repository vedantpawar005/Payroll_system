/**
 * Formats a number as a currency string (USD/INR style).
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Formats an ISO date string (YYYY-MM-DD) to a reader-friendly format.
 * @param {string} dateString
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

/**
 * Returns a list of the last N months formatted as YYYY-MM
 * @param {number} count
 * @returns {string[]}
 */
export const getLastMonths = (count = 6) => {
  const months = [];
  const date = new Date();
  for (let i = 0; i < count; i++) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    months.push(`${y}-${m}`);
    date.setMonth(date.getMonth() - 1);
  }
  return months;
};
