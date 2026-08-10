// src/app/lab/invoice-generator/lib/calculations.ts

import { Invoice, InvoiceSummary, InvoiceItem } from './types';

/**
 * Calculates item total amount: quantity * unitPrice
 */
export function calculateItemAmount(quantity: number, unitPrice: number): number {
  const q = isNaN(quantity) || quantity < 0 ? 0 : quantity;
  const p = isNaN(unitPrice) || unitPrice < 0 ? 0 : unitPrice;
  return Number((q * p).toFixed(2));
}

/**
 * Calculates subtotals, discounts, taxes, totals, and balances for an invoice
 * Guaranteed to be the single source of truth for all calculations.
 */
export function calculateInvoiceSummary(invoice: Partial<Invoice>): InvoiceSummary {
  const items = invoice.items || [];
  const discountType = invoice.discountType || 'none';
  const discountValue = invoice.discountValue || 0;
  const taxRate = invoice.taxRate || 0;
  const taxEnabled = invoice.taxEnabled ?? false;
  const amountPaid = invoice.amountPaid || 0;

  // 1. Subtotal = sum of all items (quantity * unitPrice)
  const subtotal = items.reduce((sum, item) => {
    return sum + calculateItemAmount(item.quantity, item.unitPrice);
  }, 0);

  // 2. Discount amount calculation
  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = (subtotal * Math.min(100, Math.max(0, discountValue))) / 100;
  } else if (discountType === 'fixed') {
    discountAmount = Math.min(subtotal, Math.max(0, discountValue));
  }
  discountAmount = Number(discountAmount.toFixed(2));

  // 3. Tax amount calculation
  // Apply tax on taxable amount: Subtotal - Discount
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  let taxAmount = 0;
  if (taxEnabled && taxRate > 0) {
    taxAmount = (taxableAmount * Math.max(0, taxRate)) / 100;
  }
  taxAmount = Number(taxAmount.toFixed(2));

  // 4. Total = Subtotal - Discount + Tax
  const total = Number((taxableAmount + taxAmount).toFixed(2));

  // 5. Balance Due = Total - Amount Paid
  const balanceDue = Number((total - Math.max(0, amountPaid)).toFixed(2));

  return {
    subtotal,
    discountAmount,
    taxAmount,
    total,
    balanceDue: Math.max(0, balanceDue),
  };
}

/**
 * Formats a currency value based on standard locale formats
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const value = isNaN(amount) ? 0 : amount;
  
  // Custom formatter mapping for requested currencies
  switch (currencyCode.toUpperCase()) {
    case 'NGN': // Nigerian Naira
      return '₦' + value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'USD': // US Dollar
      return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'EUR': // Euro
      return '€' + value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'GBP': // British Pound
      return '£' + value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'KRW': // South Korean Won (usually has no decimal parts)
      return '₩' + Math.round(value).toLocaleString('ko-KR');
    default:
      return currencyCode + ' ' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

/**
 * Generates next sequential invoice number based on prefix, year, and incrementing index
 */
export function generateNextInvoiceNumber(prefix: string = 'INV', lastInvoiceNum?: string): string {
  const currentYear = new Date().getFullYear();
  
  if (!lastInvoiceNum) {
    return `${prefix}-${currentYear}-0001`;
  }

  // Parse last invoice number, format is prefix-year-index (e.g. INV-2026-0001)
  const parts = lastInvoiceNum.split('-');
  if (parts.length < 3) {
    return `${prefix}-${currentYear}-0001`;
  }

  const lastIndexPart = parts[parts.length - 1];
  const lastIndex = parseInt(lastIndexPart, 10);
  
  if (isNaN(lastIndex)) {
    return `${prefix}-${currentYear}-0001`;
  }

  const nextIndex = lastIndex + 1;
  const paddedIndex = nextIndex.toString().padStart(4, '0');
  
  return `${prefix}-${currentYear}-${paddedIndex}`;
}

/**
 * Formats a date string into "25th Aug., 2026" style.
 */
export function formatInvoiceDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const day = date.getDate();
    const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
    const monthStr = months[date.getMonth()];
    const year = date.getFullYear();

    // Suffix rules
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';

    return `${day}${suffix} ${monthStr}, ${year}`;
  } catch (error) {
    return dateStr;
  }
}
