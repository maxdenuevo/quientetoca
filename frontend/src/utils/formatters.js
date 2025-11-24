/**
 * Shared formatting utilities for dates, prices, and countdowns
 * Consolidates duplicate code from JoinGroup.jsx and OrganizerDashboard.jsx
 */

/**
 * Calculate countdown to a deadline
 * @param {string} deadline - ISO date string
 * @returns {{ expired: boolean, text: string }}
 */
export function getCountdown(deadline) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate - now;

  if (diff <= 0) return { expired: true, text: 'Sorteo realizado' };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return { expired: false, text: `${days} día${days > 1 ? 's' : ''} ${hours}h` };
  }
  return { expired: false, text: `${hours} hora${hours > 1 ? 's' : ''}` };
}

/**
 * Format price in Chilean Pesos (CLP) with currency symbol
 * Use for displaying final prices (e.g., "$10.000")
 * @param {number} price - Price value
 * @returns {string} - Formatted price string with CLP symbol
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format number with Chilean thousand separators for input fields
 * Use for form inputs (e.g., "10.000" without currency symbol)
 * @param {string|number} value - Price value
 * @returns {string} - Formatted number string
 */
export function formatPriceInput(value) {
  if (!value) return '';
  const numberValue = parseInt(value.toString().replace(/\./g, ''));
  return isNaN(numberValue) ? '' : numberValue.toLocaleString('es-CL');
}

/**
 * Parse formatted price input to plain number string
 * Use to extract numeric value from formatted input
 * @param {string} formattedValue - Formatted price string (e.g., "10.000")
 * @returns {string} - Plain number string (e.g., "10000")
 */
export function parsePriceInput(formattedValue) {
  return formattedValue.replace(/\./g, '');
}

/**
 * Calculate winning price range from votes
 * @param {Array} votes - Array of price votes with min_price and max_price
 * @param {Object} group - Group object with price_min and price_max fallbacks
 * @returns {{ min: number, max: number }}
 */
export function getWinningPriceRange(votes, group) {
  if (!votes || votes.length === 0) {
    return { min: group?.price_min, max: group?.price_max };
  }

  // Simple average of all votes
  const avgMin = Math.round(
    votes.reduce((sum, v) => sum + v.min_price, 0) / votes.length
  );
  const avgMax = Math.round(
    votes.reduce((sum, v) => sum + v.max_price, 0) / votes.length
  );

  return { min: avgMin, max: avgMax };
}

/**
 * Format date in Spanish locale
 * @param {string} date - ISO date string
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    day: 'numeric',
    month: 'long',
  };
  return new Date(date).toLocaleDateString('es-CL', { ...defaultOptions, ...options });
}

/**
 * Format date with full weekday
 * @param {string} date - ISO date string
 * @returns {string} - Formatted date string with weekday
 */
export function formatDateWithWeekday(date) {
  return new Date(date).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Calculate days until a date
 * @param {string} date - ISO date string
 * @returns {number} - Days until the date (negative if past)
 */
export function getDaysUntil(date) {
  const now = new Date();
  const targetDate = new Date(date);
  const diff = targetDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
