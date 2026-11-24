export const CURRENCY_RATES = {
  USD: { symbol: '$', rate: 1.0, name: 'US Dollar', locale: 'en-US' },
  INR: { symbol: '₹', rate: 83.2, name: 'Indian Rupee', locale: 'en-IN' },
  EUR: { symbol: '€', rate: 0.92, name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', rate: 0.79, name: 'British Pound', locale: 'en-GB' },
  JPY: { symbol: '¥', rate: 154.5, name: 'Japanese Yen', locale: 'ja-JP' },
  AED: { symbol: 'AED', rate: 3.67, name: 'UAE Dirham', locale: 'ar-AE' },
  SGD: { symbol: 'S$', rate: 1.34, name: 'Singapore Dollar', locale: 'en-SG' },
  CAD: { symbol: 'CA$', rate: 1.38, name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { symbol: 'A$', rate: 1.52, name: 'Australian Dollar', locale: 'en-AU' },
};

export const USD_TO_INR = 83.2;

export const formatCurrency = (usdAmount, currencyCode = 'USD') => {
  const meta = CURRENCY_RATES[currencyCode] || CURRENCY_RATES.USD;
  const converted = Number(usdAmount || 0) * meta.rate;
  try {
    return new Intl.NumberFormat(meta.locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: currencyCode === 'JPY' ? 0 : 2,
    }).format(converted);
  } catch {
    return `${meta.symbol}${converted.toFixed(2)}`;
  }
};

export const formatINR = (usdAmount) => formatCurrency(usdAmount, 'INR');

export const formatINRFromAmount = (inrAmount) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(Number(inrAmount || 0));
