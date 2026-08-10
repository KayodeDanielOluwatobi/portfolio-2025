// src/app/lab/invoice-generator/lib/types.ts

export interface Client {
  id: string;
  name: string;
  company?: string;
  logo?: string; // base64 Data URL
  address?: string;
  email?: string;
  phone?: string;
  createdAt: number;
}

export interface BusinessProfile {
  ownerName: string;
  businessName: string;
  logo?: string; // base64 Data URL
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  defaultCurrency: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  defaultPaymentTerms?: string;
  defaultInvoicePrefix?: string;
  defaultThankYouMessage?: string;
  defaultTerms?: string;
  defaultTaxRate?: number;
  brandColor?: string; // hex code
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ServicePreset {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
}

export interface PaymentInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  paymentReference?: string;
  paymentInstructions?: string;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Partially Paid' | 'Overdue' | 'Cancelled';
export type DiscountType = 'percentage' | 'fixed' | 'none';
export type InvoiceTemplate = 'minimal' | 'modern' | 'corporate';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  dateIssued: string; // ISO String
  dueDate: string; // ISO String
  createdAt: number; // timestamp
  status: InvoiceStatus;
  currency: string;
  paymentTerms: string;
  client: Client;
  items: InvoiceItem[];
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
  taxEnabled: boolean;
  amountPaid: number;
  paymentInfo: PaymentInfo;
  notes?: string;
  thankYouMessage?: string;
  template: InvoiceTemplate;
  brandColor?: string; // override profile brandColor
}

export interface InvoiceSummary {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  balanceDue: number;
}
