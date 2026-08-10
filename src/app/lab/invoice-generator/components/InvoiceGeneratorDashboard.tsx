// src/app/lab/invoice-generator/components/InvoiceGeneratorDashboard.tsx

'use client';

import React, { useState } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import { Invoice, InvoiceStatus } from '../lib/types';
import { calculateInvoiceSummary, formatCurrency } from '../lib/calculations';
import { exportToPDF, exportToPNG } from '../lib/exportUtils';
import InvoicePreview from './InvoicePreview';
import InvoiceEditor from './InvoiceEditor';
import BusinessProfileForm from './BusinessProfileForm';
import ServicePresetSelector from './ServicePresetSelector';
import StatusBadge from './StatusBadge';
import Header from '@/components/layout/Header';
import Bottom from '@/components/layout/Bottom';
import Footer3 from '@/components/layout/Footer3';
import { SmoothCursor } from '@/components/layout/SmoothCursor';
import FadeUp from '@/components/animations/FadeUp';
import { Plus, Search, Settings, FileText, Briefcase, Eye, Edit2, Copy, Download, Trash2, X, FileDown, Image as ImageIcon } from 'lucide-react';
import { Squircle } from '@squircle-js/react';

export default function InvoiceGeneratorDashboard() {
  const { 
    invoices, 
    deleteInvoice, 
    duplicateInvoice,
    isLoading 
  } = useInvoices();

  // Navigation / Modal States
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null); // 'new' or UUID
  const [activePreviewInvoice, setActivePreviewInvoice] = useState<Invoice | null>(null);
  const [showBusinessProfile, setShowBusinessProfile] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Mobile Menu Header State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cursor States
  const [cursorColor, setCursorColor] = useState('var(--black-val)');
  const [cursorStrokeColor, setCursorStrokeColor] = useState('var(--white-val)');

  const handleHoverColor = (fill: string, stroke?: string) => {
    setCursorColor(fill);
    setCursorStrokeColor(stroke || '#ffffff');
  };

  const handleResetColor = () => {
    setCursorColor('var(--black-val)');
    setCursorStrokeColor('var(--white-val)');
  };

  // 1. Calculations for Statistics
  const activeInvoices = invoices.filter(inv => inv.status !== 'Cancelled');
  
  const stats = activeInvoices.reduce((acc, inv) => {
    const summary = calculateInvoiceSummary(inv);
    acc.totalInvoiced += summary.total;
    acc.totalPaid += inv.amountPaid || 0;
    acc.totalOutstanding += summary.balanceDue;

    if (inv.status === 'Paid') acc.paidCount++;
    else if (inv.status === 'Overdue') acc.overdueCount++;
    else acc.unpaidCount++;

    return acc;
  }, {
    totalInvoiced: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    paidCount: 0,
    overdueCount: 0,
    unpaidCount: 0
  });

  // 2. Filter & Sort Logic
  const filteredInvoices = invoices
    .filter(inv => {
      const query = searchQuery.toLowerCase();
      const clientName = inv.client.name.toLowerCase();
      const clientCompany = (inv.client.company || '').toLowerCase();
      const invNum = inv.invoiceNumber.toLowerCase();
      
      const matchesSearch = clientName.includes(query) || clientCompany.includes(query) || invNum.includes(query);
      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      return sortBy === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
    });

  // Exporters
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExportPDF = async (inv: Invoice, elementId: string) => {
    setIsExporting(inv.id);
    const success = await exportToPDF(elementId, inv.invoiceNumber);
    if (!success) alert('Failed to generate PDF. Please try again.');
    setIsExporting(null);
  };

  const handleExportPNG = async (inv: Invoice, elementId: string) => {
    setIsExporting(inv.id);
    const success = await exportToPNG(elementId, inv.invoiceNumber);
    if (!success) alert('Failed to generate PNG. Please try again.');
    setIsExporting(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400 font-light">
        Loading Laboratory settings...
      </div>
    );
  }

  return (
    <main className="bg-black min-h-screen text-white selection:bg-zinc-800 selection:text-white">
      <Header currentBrand="default" onMobileMenuToggle={setIsMobileMenuOpen} />
      <SmoothCursor cursorColor={cursorColor} cursorStrokeColor={cursorStrokeColor} />

      {/* RENDER INVOICE EDITOR MODE */}
      {activeInvoiceId !== null ? (
        <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto w-full">
          <InvoiceEditor
            invoiceId={activeInvoiceId === 'new' ? undefined : activeInvoiceId}
            onBack={() => setActiveInvoiceId(null)}
            onPreview={(inv) => setActivePreviewInvoice(inv)}
          />
        </div>
      ) : (
        /* RENDER DASHBOARD LISTINGS MODE */
        <div className="pt-28 pb-32 px-6 max-w-7xl mx-auto w-full space-y-10">
          
          {/* Dashboard Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="font-space text-[10px] tracking-widest uppercase text-[#3BA2DE]">
                Lab-01 / Concept UI
              </span>
              <h1 className="text-3xl font-light tracking-tight text-zinc-100 mt-1">
                Invoice <span className="font-semibold text-white">Generator.</span>
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowBusinessProfile(true)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors flex items-center gap-1.5"
                onMouseEnter={() => handleHoverColor('#ffffff', '#000000')}
                onMouseLeave={handleResetColor}
              >
                <Settings size={14} /> Profile Settings
              </button>
              <button
                onClick={() => setShowPresets(true)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors flex items-center gap-1.5"
                onMouseEnter={() => handleHoverColor('#ffffff', '#000000')}
                onMouseLeave={handleResetColor}
              >
                <Briefcase size={14} /> Service Presets
              </button>
              <button
                onClick={() => setActiveInvoiceId('new')}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#3BA2DE] hover:bg-[#3BA2DE]/90 text-white transition-all shadow-md shadow-[#3BA2DE]/20 flex items-center gap-1.5"
                onMouseEnter={() => handleHoverColor('#3BA2DE', '#ffffff')}
                onMouseLeave={handleResetColor}
              >
                <Plus size={14} /> Create Invoice
              </button>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Squircle cornerRadius={16} cornerSmoothing={0.7} className="bg-zinc-900/20 border border-zinc-800/40 p-5 space-y-2">
              <span className="text-[10px] font-space text-zinc-500 uppercase tracking-wider block">Total Invoiced</span>
              <h3 className="text-xl font-semibold text-zinc-100">{formatCurrency(stats.totalInvoiced, 'NGN')}</h3>
              <p className="text-[10px] text-zinc-500">{activeInvoices.length} invoices generated</p>
            </Squircle>

            <Squircle cornerRadius={16} cornerSmoothing={0.7} className="bg-zinc-900/20 border border-zinc-800/40 p-5 space-y-2">
              <span className="text-[10px] font-space text-zinc-500 uppercase tracking-wider block font-medium text-green-400">Total Collected</span>
              <h3 className="text-xl font-semibold text-green-400">{formatCurrency(stats.totalPaid, 'NGN')}</h3>
              <p className="text-[10px] text-zinc-500">{stats.paidCount} fully paid</p>
            </Squircle>

            <Squircle cornerRadius={16} cornerSmoothing={0.7} className="bg-zinc-900/20 border border-zinc-800/40 p-5 space-y-2">
              <span className="text-[10px] font-space text-zinc-500 uppercase tracking-wider block font-medium text-red-400">Outstanding Balance</span>
              <h3 className="text-xl font-semibold text-red-400">{formatCurrency(stats.totalOutstanding, 'NGN')}</h3>
              <p className="text-[10px] text-zinc-500">{stats.overdueCount} overdue items</p>
            </Squircle>

            <Squircle cornerRadius={16} cornerSmoothing={0.7} className="bg-zinc-900/20 border border-zinc-800/40 p-5 space-y-2">
              <span className="text-[10px] font-space text-zinc-500 uppercase tracking-wider block">Average Deal Size</span>
              <h3 className="text-xl font-semibold text-zinc-100">
                {formatCurrency(activeInvoices.length > 0 ? stats.totalInvoiced / activeInvoices.length : 0, 'NGN')}
              </h3>
              <p className="text-[10px] text-zinc-500">Live average rate</p>
            </Squircle>
          </div>

          {/* Search, Filter and Actions Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/10 p-4 rounded-xl border border-zinc-800/50">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              <input
                type="text"
                placeholder="Search invoice # or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-650"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400 font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400 font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Invoices List / Table */}
          <Squircle cornerRadius={16} cornerSmoothing={0.7} className="border border-zinc-800/60 bg-zinc-900/10 overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-850 bg-zinc-900/30 text-zinc-450 font-space text-[10px] uppercase tracking-wider">
                    <th className="p-4">Invoice #</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Issued</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map(inv => {
                      const summary = calculateInvoiceSummary(inv);
                      const exportNodeId = `dashboard-export-${inv.id}`;
                      
                      return (
                        <tr key={inv.id} className="hover:bg-zinc-900/20 text-zinc-300">
                          {/* Embedded hidden preview node for direct background PDF downloads */}
                          <td className="hidden">
                            <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none select-none">
                              <InvoicePreview 
                                invoice={inv} 
                                brandColor={inv.brandColor} 
                                template={inv.template} 
                                containerId={exportNodeId}
                              />
                            </div>
                          </td>

                          <td className="p-4 font-mono font-semibold text-zinc-100">{inv.invoiceNumber}</td>
                          <td className="p-4">
                            <div>
                              <p className="font-semibold text-zinc-100">{inv.client.name}</p>
                              {inv.client.company && <p className="text-[10px] text-zinc-500 mt-0.5">{inv.client.company}</p>}
                            </div>
                          </td>
                          <td className="p-4 text-zinc-450">{new Date(inv.dateIssued).toLocaleDateString()}</td>
                          <td className="p-4 text-zinc-450">{new Date(inv.dueDate).toLocaleDateString()}</td>
                          <td className="p-4 text-right font-medium text-zinc-200">
                            {formatCurrency(summary.total, inv.currency)}
                          </td>
                          <td className="p-4 text-center">
                            <StatusBadge status={inv.status} />
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setActivePreviewInvoice(inv)}
                                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                                title="Quick View Preview"
                              >
                                <Eye size={12} />
                              </button>
                              <button
                                onClick={() => setActiveInvoiceId(inv.id)}
                                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                                title="Edit Invoice"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => duplicateInvoice(inv.id)}
                                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                                title="Duplicate Invoice"
                              >
                                <Copy size={12} />
                              </button>
                              <button
                                onClick={() => handleExportPDF(inv, exportNodeId)}
                                disabled={isExporting !== null}
                                className="p-1.5 rounded bg-[#3BA2DE]/10 hover:bg-[#3BA2DE]/20 border border-[#3BA2DE]/25 text-[#3BA2DE] disabled:opacity-40 transition-colors"
                                title="Download PDF"
                              >
                                <Download size={12} />
                              </button>
                              <button
                                onClick={() => deleteInvoice(inv.id)}
                                className="p-1.5 rounded bg-zinc-900 hover:bg-red-950/20 border border-zinc-800 hover:border-red-900/30 text-zinc-500 hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-zinc-500 font-light">
                        {invoices.length === 0 ? (
                          <div className="space-y-4">
                            <FileText size={32} className="mx-auto text-zinc-700" />
                            <div>
                              <p className="font-semibold text-zinc-350 text-sm">No invoices created yet</p>
                              <p className="text-zinc-500 text-xs mt-1">Start by creating your first professional invoice in seconds.</p>
                            </div>
                            <button
                              onClick={() => setActiveInvoiceId('new')}
                              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#3BA2DE] hover:bg-[#3BA2DE]/90 text-white transition-all inline-flex items-center gap-1.5"
                            >
                              <Plus size={14} /> Create First Invoice
                            </button>
                          </div>
                        ) : (
                          "No invoices match your search filters."
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Squircle>
        </div>
      )}

      {/* FULL SCREEN DETAILED PREVIEW / DOWNLOAD OVERLAY */}
      {activePreviewInvoice && (
        <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 backdrop-blur-md overflow-y-auto">
          {/* Header Panel */}
          <div className="bg-zinc-900 border-b border-zinc-850 p-4 sticky top-0 flex justify-between items-center z-50">
            <div>
              <h2 className="text-sm font-semibold text-white">Invoice Preview</h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">{activePreviewInvoice.invoiceNumber}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleExportPNG(activePreviewInvoice, 'preview-overlay-render')}
                disabled={isExporting !== null}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <ImageIcon size={14} /> Download PNG
              </button>
              
              <button
                onClick={() => handleExportPDF(activePreviewInvoice, 'preview-overlay-render')}
                disabled={isExporting !== null}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#3BA2DE] hover:bg-[#3BA2DE]/90 text-white disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-md shadow-[#3BA2DE]/20"
              >
                <FileDown size={14} /> Download PDF
              </button>

              <button
                onClick={() => setActivePreviewInvoice(null)}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors ml-2"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Render Area */}
          <div className="flex-1 p-6 md:p-12 flex justify-center items-start">
            <InvoicePreview
              invoice={activePreviewInvoice}
              brandColor={activePreviewInvoice.brandColor}
              template={activePreviewInvoice.template}
              containerId="preview-overlay-render"
            />
          </div>
        </div>
      )}

      {/* SETTINGS MODALS */}
      {showBusinessProfile && (
        <BusinessProfileForm onClose={() => setShowBusinessProfile(false)} />
      )}
      
      {showPresets && (
        <ServicePresetSelector onClose={() => setShowPresets(false)} />
      )}

      <Footer3 />
      <Bottom />
    </main>
  );
}
