// src/app/lab/invoice-generator/components/InvoicePreview.tsx

import React from 'react';
import { Invoice, InvoiceTemplate } from '../lib/types';
import { calculateInvoiceSummary, formatCurrency, formatInvoiceDate } from '../lib/calculations';

interface InvoicePreviewProps {
  invoice: Partial<Invoice>;
  brandColor?: string;
  template?: InvoiceTemplate;
  containerId?: string;
}

export default function InvoicePreview({
  invoice,
  brandColor = '#3BA2DE',
  template = 'minimal',
  containerId = 'invoice-render-area'
}: InvoicePreviewProps) {
  const summary = calculateInvoiceSummary(invoice);

  const business = {
    name: invoice.paymentInfo?.accountName || 'Your Business Name',
    address: invoice.notes ? 'Your Address Here' : '',
    email: 'billing@yourbusiness.com',
    phone: '',
    ...invoice
  };

  const client = invoice.client || {
    name: 'Client Contact Name',
    company: 'Client Company Name',
    address: '123 Client Street, Suite 100\nCity, State, Country',
    email: 'client@company.com',
    phone: '+1 (555) 019-2834'
  };

  const items = invoice.items || [];
  const status = invoice.status || 'Draft';
  const currency = invoice.currency || 'USD';

  // Apply visual theme styling based on the selected template
  const getTemplateStyles = () => {
    switch (template) {
      case 'modern':
        return {
          wrapper: 'font-sans p-10 bg-white text-zinc-800 relative min-h-[1050px] flex flex-col justify-between',
          primaryText: 'text-zinc-900 font-bold',
          headerBg: 'border-l-8 pl-6 py-2',
          headerBorderColor: { borderLeftColor: brandColor },
          tableHeader: 'bg-zinc-50 font-semibold uppercase tracking-wider text-[11px] text-zinc-500 border-b border-zinc-200',
          accentText: { color: brandColor },
          footerLine: 'border-t-2 border-zinc-100 pt-6',
        };
      case 'corporate':
        return {
          wrapper: 'font-serif p-12 bg-white text-zinc-900 relative min-h-[1050px] flex flex-col justify-between border-t-8',
          wrapperBorderColor: { borderTopColor: brandColor },
          primaryText: 'text-zinc-900 font-bold tracking-tight',
          headerBg: 'flex justify-between items-start border-b pb-6 mb-8',
          tableHeader: 'bg-zinc-800 text-white font-medium text-[11px] uppercase tracking-wide',
          accentText: { color: brandColor },
          footerLine: 'border-t border-zinc-300 pt-8',
        };
      case 'minimal':
      default:
        return {
          wrapper: 'font-sans p-10 bg-white text-zinc-800 relative min-h-[1050px] flex flex-col justify-between',
          primaryText: 'text-zinc-900 font-medium',
          headerBg: 'flex justify-between items-start border-b border-zinc-100 pb-8 mb-8',
          tableHeader: 'border-b-2 border-zinc-900 font-semibold text-[12px] text-zinc-900 uppercase',
          accentText: { color: '#000000' },
          footerLine: 'border-t border-zinc-100 pt-6',
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div className="w-full overflow-x-auto bg-zinc-800/10 p-2 md:p-6 rounded-2xl border border-zinc-800/50 flex justify-center">
      {/* Scope CSS style overrides specifically for this sheet to prevent dark-mode inheritance */}
      <style dangerouslySetInnerHTML={{ __html: `
        .invoice-print-theme {
          background-color: #ffffff !important;
          color: #18181b !important;
        }
        .invoice-print-theme div,
        .invoice-print-theme p,
        .invoice-print-theme span,
        .invoice-print-theme td,
        .invoice-print-theme th,
        .invoice-print-theme h2,
        .invoice-print-theme h4,
        .invoice-print-theme table {
          color: #18181b !important;
        }
        .invoice-print-theme .text-zinc-500 {
          color: #71717a !important;
        }
        .invoice-print-theme .text-zinc-400 {
          color: #a1a1aa !important;
        }
        .invoice-print-theme .text-zinc-650,
        .invoice-print-theme .text-zinc-600 {
          color: #52525b !important;
        }
        .invoice-print-theme .text-zinc-805,
        .invoice-print-theme .text-zinc-800 {
          color: #27272a !important;
        }
        .invoice-print-theme .text-zinc-900 {
          color: #09090b !important;
        }
        .invoice-print-theme .border-zinc-200 {
          border-color: #e4e4e7 !important;
        }
        .invoice-print-theme .border-zinc-100 {
          border-color: #f4f4f5 !important;
        }
        .invoice-print-theme .divide-zinc-100 > :not([hidden]) ~ :not([hidden]) {
          border-color: #f4f4f5 !important;
        }
        .invoice-print-theme .bg-zinc-50 {
          background-color: #f4f4f5 !important;
        }
        .invoice-print-theme .bg-zinc-800 {
          background-color: #27272a !important;
        }
        .invoice-print-theme .text-green-500\\/20 {
          color: rgba(34, 197, 94, 0.2) !important;
        }
        .invoice-print-theme .border-green-500\\/20 {
          border-color: rgba(34, 197, 94, 0.2) !important;
        }
      ` }} />
      {/* Target printable element */}
      <div 
        id={containerId} 
        className={`${styles.wrapper} invoice-print-theme shadow-2xl w-[794px] min-h-[1123px] shrink-0 text-left relative overflow-visible`}
        style={template === 'corporate' ? styles.wrapperBorderColor : undefined}
      >
        {/* PAID Watermark stamp */}
        {status === 'Paid' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-green-500/20 text-green-500/20 font-black text-6xl tracking-widest uppercase py-4 px-12 rounded-2xl rotate-12 select-none pointer-events-none z-50">
            PAID
          </div>
        )}

        <div>
          {/* Header Row */}
          <div 
            className={template === 'modern' ? `${styles.headerBg} flex justify-between items-start mb-8` : styles.headerBg}
            style={template === 'modern' ? styles.headerBorderColor : undefined}
          >
            {/* Left: Logo & Business Details */}
            <div className="space-y-4">
              {invoice.brandColor && (
                <div className="hidden" style={{ color: invoice.brandColor }} /> 
              )}
              {business.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={business.logo} 
                  alt="Business Logo" 
                  className="max-h-16 max-w-xs object-contain p-1 block" 
                />
              ) : (
                <div className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-3 h-8 rounded" style={{ backgroundColor: brandColor }} />
                  {business.businessName || 'Your Business'}
                </div>
              )}
              
              <div className="text-xs text-zinc-500 space-y-1 font-light">
                {business.ownerName && <p className="font-medium text-zinc-700">{business.ownerName}</p>}
                {business.businessName && business.logo && <p className="font-medium text-zinc-700">{business.businessName}</p>}
                {business.address && <p className="whitespace-pre-line">{business.address}</p>}
                {business.email && <p>{business.email}</p>}
                {business.phone && <p>{business.phone}</p>}
                {business.website && <p>{business.website}</p>}
              </div>
            </div>

            {/* Right: Invoice Meta */}
            <div className="text-right space-y-2">
              <h2 className="text-xl font-light tracking-wider text-zinc-900 uppercase">
                Invoice
              </h2>
              <div className="space-y-1 text-xs">
                <p className="text-zinc-500">
                  Number: <span className="font-semibold text-zinc-800">{invoice.invoiceNumber || 'INV-XXXX'}</span>
                </p>
                <p className="text-zinc-500">
                  Date: <span className="text-zinc-800">{invoice.dateIssued ? formatInvoiceDate(invoice.dateIssued) : formatInvoiceDate(new Date().toISOString())}</span>
                </p>
                <p className="text-zinc-500">
                  Due Date: <span className="text-zinc-800 font-medium">{invoice.dueDate ? formatInvoiceDate(invoice.dueDate) : 'Select Due Date'}</span>
                </p>
                <p className="text-zinc-500">
                  Status: <span className="text-zinc-800 font-semibold uppercase">{status}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Billing Info Row */}
          <div className="grid grid-cols-2 gap-12 mb-10 text-xs">
            {/* Bill To */}
            <div className="space-y-2">
              <span className="font-space text-[10px] tracking-wider uppercase text-zinc-400 block">
                Bill To
              </span>
              <div className="space-y-1">
                <h4 className="font-semibold text-zinc-800 text-xs">{client.name || 'Client Name'}</h4>
                {client.company && <p className="text-zinc-600 font-medium">{client.company}</p>}
                {client.address && <p className="text-zinc-500 whitespace-pre-line">{client.address}</p>}
                {client.email && <p className="text-zinc-500">{client.email}</p>}
                {client.phone && <p className="text-zinc-500">{client.phone}</p>}
              </div>
            </div>

            {/* Payment Details in Corporate Template Header */}
            {template === 'corporate' && (
              <div className="space-y-2">
                <span className="font-space text-[10px] tracking-wider uppercase text-zinc-400 block">
                  Payment Details
                </span>
                <div className="space-y-0.5 text-zinc-600">
                  {invoice.paymentInfo?.bankName && <p>Bank: <span className="font-medium text-zinc-800">{invoice.paymentInfo.bankName}</span></p>}
                  {invoice.paymentInfo?.accountName && <p>Name: <span className="font-medium text-zinc-800">{invoice.paymentInfo.accountName}</span></p>}
                  {invoice.paymentInfo?.accountNumber && <p>Acc: <span className="font-medium text-zinc-800 font-mono">{invoice.paymentInfo.accountNumber}</span></p>}
                </div>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-10">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr>
                  <th className={`${styles.tableHeader} p-3 w-[55%]`}>Description</th>
                  <th className={`${styles.tableHeader} p-3 text-center w-[10%]`}>Qty</th>
                  <th className={`${styles.tableHeader} p-3 text-right w-[15%]`}>Unit Price</th>
                  <th className={`${styles.tableHeader} p-3 text-right w-[20%]`}>Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-zinc-50/50">
                      <td className="p-3 text-zinc-800 font-light whitespace-pre-line">{item.description}</td>
                      <td className="p-3 text-center text-zinc-600">{item.quantity}</td>
                      <td className="p-3 text-right text-zinc-600">{formatCurrency(item.unitPrice, currency)}</td>
                      <td className="p-3 text-right text-zinc-800 font-medium">
                        {formatCurrency(item.quantity * item.unitPrice, currency)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-400 font-light">
                      No services or items added to this invoice.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Summary Row */}
          <div className="flex justify-end mb-12">
            <div className="w-[300px] text-xs space-y-2.5 border-t border-zinc-200 pt-4">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="font-medium text-zinc-800">{formatCurrency(summary.subtotal, currency)}</span>
              </div>
              
              {summary.discountAmount > 0 && (
                <div className="flex justify-between text-zinc-500">
                  <span>Discount {invoice.discountType === 'percentage' ? `(${invoice.discountValue}%)` : ''}</span>
                  <span className="font-medium text-zinc-800">-{formatCurrency(summary.discountAmount, currency)}</span>
                </div>
              )}
              
              {invoice.taxEnabled && summary.taxAmount > 0 && (
                <div className="flex justify-between text-zinc-500">
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span className="font-medium text-zinc-800">{formatCurrency(summary.taxAmount, currency)}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-zinc-200 pt-3 text-sm font-semibold">
                <span className="text-zinc-900">Total</span>
                <span style={template !== 'minimal' ? styles.accentText : undefined} className="text-zinc-900 font-bold">
                  {formatCurrency(summary.total, currency)}
                </span>
              </div>

              {invoice.amountPaid && invoice.amountPaid > 0 ? (
                <>
                  <div className="flex justify-between text-zinc-500 text-[11px] pt-1">
                    <span>Amount Paid</span>
                    <span className="font-medium text-zinc-800">{formatCurrency(invoice.amountPaid, currency)}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-100 pt-2 text-zinc-900 font-semibold text-xs">
                    <span>Balance Due</span>
                    <span className="font-bold">{formatCurrency(summary.balanceDue, currency)}</span>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Footer section (Tied to the bottom of the page container) */}
        <div className={`${styles.footerLine} space-y-6 text-[11px]`}>
          <div className="grid grid-cols-2 gap-12">
            {/* Left: Terms and Conditions */}
            {invoice.notes && (
              <div className="space-y-1.5">
                <span className="font-space text-[9px] tracking-wider uppercase text-zinc-400 block">
                  Terms & Conditions
                </span>
                <p className="text-zinc-500 whitespace-pre-line leading-relaxed font-light">
                  {invoice.notes}
                </p>
              </div>
            )}

            {/* Right: Payment Instructions (Minimal & Modern Templates only) */}
            {template !== 'corporate' && (invoice.paymentInfo?.bankName || invoice.paymentInfo?.accountNumber) && (
              <div className="space-y-1.5">
                <span className="font-space text-[9px] tracking-wider uppercase text-zinc-400 block">
                  Payment Details
                </span>
                <div className="text-zinc-500 space-y-0.5 font-light">
                  {invoice.paymentInfo.bankName && <p>Bank Name: <span className="font-medium text-zinc-700">{invoice.paymentInfo.bankName}</span></p>}
                  {invoice.paymentInfo.accountName && <p>Account Name: <span className="font-medium text-zinc-700">{invoice.paymentInfo.accountName}</span></p>}
                  {invoice.paymentInfo.accountNumber && <p>Account Number: <span className="font-medium text-zinc-700 font-mono">{invoice.paymentInfo.accountNumber}</span></p>}
                  {invoice.paymentInfo.paymentReference && <p>Reference: <span className="font-medium text-zinc-700">{invoice.paymentInfo.paymentReference}</span></p>}
                </div>
              </div>
            )}
          </div>

          {/* Thank You Message */}
          <div className="text-center pt-4 border-t border-zinc-100 text-zinc-400 font-light italic">
            {invoice.thankYouMessage || 'Thank you for your business!'}
          </div>
        </div>
      </div>
    </div>
  );
}
