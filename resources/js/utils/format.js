/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} [currency='KES'] - The currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'KES') => {
    if (!amount) return '0.00';
    
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};