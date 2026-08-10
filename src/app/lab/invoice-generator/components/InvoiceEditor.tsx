// src/app/lab/invoice-generator/components/InvoiceEditor.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Invoice, Client, InvoiceItem, ServicePreset, InvoiceTemplate, InvoiceStatus, DiscountType } from '../lib/types';
import { useInvoices } from '../context/InvoiceContext';
import { calculateInvoiceSummary, formatCurrency } from '../lib/calculations';
import { Plus, Trash2, Save, X, Settings, ArrowLeft, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';
import { Squircle } from '@squircle-js/react';
import InvoicePreview from './InvoicePreview';

interface InvoiceEditorProps {
  invoiceId?: string; // If editing existing
  onBack: () => void;
  onPreview: (invoice: Invoice) => void;
}

export default function InvoiceEditor({ invoiceId, onBack, onPreview }: InvoiceEditorProps) {
  const { 
    invoices, 
    clients, 
    presets, 
    businessProfile, 
    saveInvoice, 
    saveClient,
    generateNewInvoiceNumber
  } = useInvoices();

  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit');
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  
  // Local state for the invoice being created/edited
  const [formData, setFormData] = useState<Invoice>(() => {
    if (invoiceId) {
      const existing = invoices.find(inv => inv.id === invoiceId);
      if (existing) return JSON.parse(JSON.stringify(existing)); // deep copy
    }

    // Default new invoice state
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 15); // +15 days default

    return {
      id: crypto.randomUUID(),
      invoiceNumber: '', // will be set on mount
      dateIssued: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      createdAt: Date.now(),
      status: 'Draft',
      currency: businessProfile.defaultCurrency || 'USD',
      paymentTerms: businessProfile.defaultPaymentTerms || 'Net 15',
      client: {
        id: '',
        name: '',
        company: '',
        address: '',
        email: '',
        phone: '',
        createdAt: Date.now()
      },
      items: [
        { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }
      ],
      discountType: 'none',
      discountValue: 0,
      taxRate: businessProfile.defaultTaxRate || 0,
      taxEnabled: (businessProfile.defaultTaxRate || 0) > 0,
      amountPaid: 0,
      paymentInfo: {
        bankName: businessProfile.bankName || '',
        accountName: businessProfile.accountName || '',
        accountNumber: businessProfile.accountNumber || '',
        paymentInstructions: ''
      },
      notes: businessProfile.defaultTerms || '',
      thankYouMessage: businessProfile.defaultThankYouMessage || '',
      template: 'minimal',
      brandColor: businessProfile.brandColor || '#3BA2DE'
    };
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [newClientMode, setNewClientMode] = useState<boolean>(true);
  
  // Initialize new invoice number on load if it's a new invoice
  useEffect(() => {
    if (!invoiceId) {
      setFormData(prev => ({
        ...prev,
        invoiceNumber: generateNewInvoiceNumber()
      }));
    }
  }, [invoiceId]);

  // Sync client selector state if we are in edit mode
  useEffect(() => {
    if (formData.client.id) {
      const match = clients.find(c => c.id === formData.client.id);
      if (match) {
        setSelectedClientId(formData.client.id);
        setNewClientMode(false);
      }
    }
  }, [formData.client.id, clients]);

  const summary = calculateInvoiceSummary(formData);

  // Input Handlers
  const handleMetaChange = (field: keyof Invoice, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors
    if (errors[field as string]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const handlePaymentInfoChange = (field: keyof typeof formData.paymentInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      paymentInfo: {
        ...prev.paymentInfo,
        [field]: value
      }
    }));
  };

  // Client Selection Handlers
  const handleClientSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedClientId(val);
    
    if (val === 'new') {
      setNewClientMode(true);
      setFormData(prev => ({
        ...prev,
        client: { id: crypto.randomUUID(), name: '', company: '', address: '', email: '', phone: '', createdAt: Date.now() }
      }));
    } else {
      setNewClientMode(false);
      const selected = clients.find(c => c.id === val);
      if (selected) {
        setFormData(prev => ({ ...prev, client: { ...selected } }));
      }
    }
  };

  const handleClientFieldChange = (field: keyof Client, value: string) => {
    setFormData(prev => ({
      ...prev,
      client: {
        ...prev.client,
        [field]: value
      }
    }));
  };

  // Item Handlers
  const handleItemChange = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const val = field === 'quantity' || field === 'unitPrice' ? Number(value) : value;
          return { ...item, [field]: val };
        }
        return item;
      })
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    if (formData.items.length <= 1) return; // Keep at least one item
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handleAddPresetItem = (preset: ServicePreset) => {
    setFormData(prev => {
      // If the first item is empty, overwrite it. Otherwise append.
      const isFirstItemEmpty = prev.items.length === 1 && !prev.items[0].description && prev.items[0].unitPrice === 0;
      
      const newPresetItem = {
        id: crypto.randomUUID(),
        description: preset.description ? `${preset.name}\n${preset.description}` : preset.name,
        quantity: 1,
        unitPrice: preset.unitPrice
      };

      return {
        ...prev,
        items: isFirstItemEmpty ? [newPresetItem] : [...prev.items, newPresetItem]
      };
    });
  };

  // Logo Processing Helper
  const processLogoFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size must be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData(prev => ({
          ...prev,
          logo: event.target.result as string
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Logo Upload Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processLogoFile(file);
  };

  const handleRemoveLogo = () => {
    setFormData(prev => {
      const copy = { ...prev };
      delete copy.logo;
      return copy;
    });
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'Invoice number is required';
    }

    if (!formData.client.name.trim()) {
      newErrors.clientName = 'Client contact name is required';
    }

    if (!formData.client.email?.trim()) {
      newErrors.clientEmail = 'Client email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.client.email)) {
      newErrors.clientEmail = 'Invalid email address';
    }

    formData.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_desc`] = 'Description is required';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_qty`] = 'Quantity must be > 0';
      }
      if (item.unitPrice < 0) {
        newErrors[`item_${index}_price`] = 'Price cannot be negative';
      }
    });

    if (formData.discountType !== 'none' && formData.discountValue < 0) {
      newErrors.discount = 'Discount cannot be negative';
    }

    if (formData.taxEnabled && formData.taxRate < 0) {
      newErrors.tax = 'Tax rate cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save Callback
  const handleSave = () => {
    if (!validateForm()) return;
    
    // Save new client to client list automatically if created
    if (newClientMode && formData.client.name.trim()) {
      saveClient({
        ...formData.client,
        createdAt: Date.now()
      });
    }

    saveInvoice(formData);
    onBack();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Editor Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-medium text-white">
              {invoiceId ? 'Edit Invoice' : 'Create New Invoice'}
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              {formData.invoiceNumber || 'INV-XXXX'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Mobile responsive toggle */}
          <div className="lg:hidden flex border border-zinc-800 rounded-lg p-1 bg-zinc-950 text-xs mr-2 shrink-0">
            <button
              onClick={() => setActiveView('edit')}
              className={`px-3 py-1.5 rounded-md transition-all font-medium ${
                activeView === 'edit' ? 'bg-[#3BA2DE] text-white shadow' : 'text-zinc-400'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1.5 rounded-md transition-all font-medium ${
                activeView === 'preview' ? 'bg-[#3BA2DE] text-white shadow' : 'text-zinc-400'
              }`}
            >
              Preview
            </button>
          </div>

          <button
            onClick={() => onPreview(formData)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors flex-1 sm:flex-none text-center"
          >
            Full Preview
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#3BA2DE] hover:bg-[#3BA2DE]/90 text-white transition-all shadow-md shadow-[#3BA2DE]/20 flex items-center justify-center gap-1.5 flex-1 sm:flex-none text-center"
          >
            <Save size={14} />
            Save Invoice
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: EDITOR FORM */}
        <div className={`space-y-6 lg:col-span-6 ${activeView === 'edit' ? 'block' : 'hidden lg:block'}`}>
          {/* Section 1: Template and Design */}
          <Squircle cornerRadius={16} cornerSmoothing={0.7} className="bg-zinc-900/30 border border-zinc-800/50 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Settings size={16} className="text-[#3BA2DE]" /> Design Template
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {(['minimal', 'modern', 'corporate'] as InvoiceTemplate[]).map(t => (
                <button
                  key={t}
                  onClick={() => handleMetaChange('template', t)}
                  className={`p-3 rounded-lg border text-xs capitalize transition-all text-center ${
                    formData.template === t 
                      ? 'border-[#3BA2DE] bg-[#3BA2DE]/10 text-white font-medium' 
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {formData.template === 'modern' && (
              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.brandColor}
                    onChange={(e) => handleMetaChange('brandColor', e.target.value)}
                    className="w-10 h-8 rounded border border-zinc-800 bg-zinc-950 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.brandColor}
                    onChange={(e) => handleMetaChange('brandColor', e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-300 w-28 uppercase font-mono"
                  />
                </div>
              </div>
            )}
          </Squircle>

          {/* Section 2: Logo and Business Info */}
          <Squircle cornerRadius={16} cornerSmoothing={0.7} className="bg-zinc-900/30 border border-zinc-800/50 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Logo Upload
            </h3>
            <div className="flex items-center gap-4">
              {formData.logo ? (
                <div className="relative group w-20 h-20 bg-white border border-zinc-200 rounded-lg p-2 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Logo"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <label 
                  className={`w-20 h-20 border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    isDraggingLogo 
                      ? 'border-[#3BA2DE] bg-[#3BA2DE]/10 text-[#3BA2DE]' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-400 hover:border-zinc-700'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingLogo(true);
                  }}
                  onDragLeave={() => setIsDraggingLogo(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingLogo(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) processLogoFile(file);
                  }}
                >
                  <Upload size={16} className={isDraggingLogo ? 'animate-bounce' : ''} />
                  <span className="text-[10px] mt-1.5 font-light">
                    {isDraggingLogo ? 'Drop Here' : 'Upload'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              )}
              <div className="text-zinc-500 text-xs font-light">
                <p>Upload your business logo.</p>
                <p className="text-[10px] text-zinc-600">Supports PNG, JPEG, SVG. Max 2MB.</p>
              </div>
            </div>
          </Squircle>

          {/* Section 3: Client Details */}
          <Squircle cornerRadius={16} cornerSmoothing={0.7} className="bg-zinc-900/30 border border-zinc-800/50 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">Client Information</h3>
              
              <select 
                value={selectedClientId}
                onChange={handleClientSelectChange}
                className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-300 font-medium"
              >
                <option value="new">+ Create New Client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company ? `${c.name} (${c.company})` : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Client Name *</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.client.name}
                  onChange={(e) => handleClientFieldChange('name', e.target.value)}
                  className={`w-full bg-zinc-950 border ${errors.clientName ? 'border-red-600' : 'border-zinc-800'} rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600`}
                />
                {errors.clientName && <p className="text-[10px] text-red-500">{errors.clientName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Client Company</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={formData.client.company || ''}
                  onChange={(e) => handleClientFieldChange('company', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Client Email *</label>
                <input
                  type="email"
                  placeholder="e.g. billing@client.com"
                  value={formData.client.email || ''}
                  onChange={(e) => handleClientFieldChange('email', e.target.value)}
                  className={`w-full bg-zinc-950 border ${errors.clientEmail ? 'border-red-600' : 'border-zinc-800'} rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600`}
                />
                {errors.clientEmail && <p className="text-[10px] text-red-500">{errors.clientEmail}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Client Phone</label>
                <input
                  type="text"
                  placeholder="e.g. +234 800 000 0000"
                  value={formData.client.phone || ''}
                  onChange={(e) => handleClientFieldChange('phone', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Client Address</label>
                <textarea
                  placeholder="e.g. 100 Victoria Island, Lagos"
                  rows={2}
                  value={formData.client.address || ''}
                  onChange={(e) => handleClientFieldChange('address', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 resize-none"
                />
              </div>
            </div>
          </Squircle>

          {/* Section 4: Invoice Meta Details */}
          <Squircle cornerRadius={16} cornerSmoothing={0.7} className="bg-zinc-900/30 border border-zinc-800/50 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Invoice Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Invoice Number *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => handleMetaChange('invoiceNumber', e.target.value)}
                    className={`w-full bg-zinc-950 border ${errors.invoiceNumber ? 'border-red-600' : 'border-zinc-800'} rounded px-3 py-2 text-xs text-zinc-100 font-mono`}
                  />
                  {!invoiceId && (
                    <button
                      onClick={() => handleMetaChange('invoiceNumber', generateNewInvoiceNumber())}
                      className="p-2 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white"
                      title="Regenerate Sequential Number"
                    >
                      <RefreshCw size={14} />
                    </button>
                  )}
                </div>
                {errors.invoiceNumber && <p className="text-[10px] text-red-500">{errors.invoiceNumber}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleMetaChange('status', e.target.value as InvoiceStatus)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Date Issued</label>
                <input
                  type="date"
                  value={formData.dateIssued}
                  onChange={(e) => handleMetaChange('dateIssued', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleMetaChange('dueDate', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleMetaChange('currency', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300"
                >
                  <option value="USD">USD ($)</option>
                  <option value="NGN">NGN (₦)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="KRW">KRW (₩)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Payment Terms</label>
                <input
                  type="text"
                  placeholder="e.g. Net 15"
                  value={formData.paymentTerms}
                  onChange={(e) => handleMetaChange('paymentTerms', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100"
                />
              </div>
            </div>
          </Squircle>

          {/* Section 5: Line Items Editor */}
          <Squircle cornerRadius={16} cornerSmoothing={0.7} className="bg-zinc-900/30 border border-zinc-800/50 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">Invoice Items</h3>
              
              {/* Presets picker */}
              {presets.length > 0 && (
                <select
                  onChange={(e) => {
                    const preset = presets.find(p => p.id === e.target.value);
                    if (preset) handleAddPresetItem(preset);
                    e.target.value = ''; // reset selection
                  }}
                  className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-400"
                >
                  <option value="">+ Add Service Preset</option>
                  {presets.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={item.id} className="relative bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/80 space-y-3">
                  {formData.items.length > 1 && (
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 transition-colors p-1"
                      title="Delete Item"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-space text-zinc-500 uppercase tracking-wider">Item Description *</label>
                    <textarea
                      placeholder="e.g. Logo Design, includes vector source code..."
                      rows={2}
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className={`w-full bg-zinc-950 border ${errors[`item_${index}_desc`] ? 'border-red-600' : 'border-zinc-800'} rounded px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-700 resize-none`}
                    />
                    {errors[`item_${index}_desc`] && <p className="text-[10px] text-red-500">{errors[`item_${index}_desc`]}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-space text-zinc-500 uppercase tracking-wider">Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        className={`w-full bg-zinc-950 border ${errors[`item_${index}_qty`] ? 'border-red-600' : 'border-zinc-800'} rounded px-3 py-1.5 text-xs text-zinc-100`}
                      />
                      {errors[`item_${index}_qty`] && <p className="text-[10px] text-red-500">{errors[`item_${index}_qty`]}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-space text-zinc-500 uppercase tracking-wider">Unit Price *</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        value={item.unitPrice || ''}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                        className={`w-full bg-zinc-950 border ${errors[`item_${index}_price`] ? 'border-red-600' : 'border-zinc-800'} rounded px-3 py-1.5 text-xs text-zinc-100`}
                      />
                      {errors[`item_${index}_price`] && <p className="text-[10px] text-red-500">{errors[`item_${index}_price`]}</p>}
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-zinc-500">
                    Total: <span className="font-semibold text-zinc-300">{formatCurrency(item.quantity * item.unitPrice, formData.currency)}</span>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddItem}
                className="w-full py-2.5 bg-zinc-950 border border-zinc-800 border-dashed rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Add Line Item
              </button>
            </div>
          </Squircle>

          {/* Section 6: Tax, Discounts & Amount Paid */}
          <Squircle cornerRadius={16} cornerSmoothing={0.7} className="bg-zinc-900/30 border border-zinc-800/50 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Discounts, Tax & Paid</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Discount Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => handleMetaChange('discountType', e.target.value as DiscountType)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300"
                >
                  <option value="none">None</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              {formData.discountType !== 'none' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">
                    Discount Value {formData.discountType === 'percentage' ? '(%)' : `(${formData.currency})`}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discountValue || ''}
                    onChange={(e) => handleMetaChange('discountValue', Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100"
                  />
                </div>
              )}

              <div className="space-y-2 sm:col-span-2 border-t border-zinc-800/80 pt-3 flex justify-between items-center">
                <div>
                  <label className="text-[11px] font-space text-zinc-300 uppercase tracking-wider block">Enable Tax</label>
                  <span className="text-[10px] text-zinc-500">Apply tax rate to Subtotal minus Discount</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.taxEnabled}
                  onChange={(e) => handleMetaChange('taxEnabled', e.target.checked)}
                  className="w-4 h-4 bg-zinc-950 border border-zinc-800 rounded cursor-pointer accent-[#3BA2DE]"
                />
              </div>

              {formData.taxEnabled && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.taxRate || ''}
                    onChange={(e) => handleMetaChange('taxRate', Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100"
                  />
                </div>
              )}

              <div className="space-y-1.5 sm:col-span-2 border-t border-zinc-800/80 pt-3">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Amount Paid ({formData.currency})</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={formData.amountPaid || ''}
                  onChange={(e) => handleMetaChange('amountPaid', Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100"
                />
              </div>
            </div>
          </Squircle>

          {/* Section 7: Payment Details */}
          <Squircle cornerRadius={16} cornerSmoothing={0.7} className="bg-zinc-900/30 border border-zinc-800/50 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Payment Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Bank Name</label>
                <input
                  type="text"
                  value={formData.paymentInfo.bankName}
                  onChange={(e) => handlePaymentInfoChange('bankName', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Account Name</label>
                <input
                  type="text"
                  value={formData.paymentInfo.accountName}
                  onChange={(e) => handlePaymentInfoChange('accountName', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Account Number</label>
                <input
                  type="text"
                  value={formData.paymentInfo.accountNumber}
                  onChange={(e) => handlePaymentInfoChange('accountNumber', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 font-mono"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Payment Reference</label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-0001"
                  value={formData.paymentInfo.paymentReference || ''}
                  onChange={(e) => handlePaymentInfoChange('paymentReference', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100"
                />
              </div>
            </div>
          </Squircle>

          {/* Section 8: Terms & Notes */}
          <Squircle cornerRadius={16} cornerSmoothing={0.7} className="bg-zinc-900/30 border border-zinc-800/50 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Terms & Thank You Message</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Terms & Conditions</label>
                <textarea
                  placeholder="Insert payment rules, project policies, etc..."
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => handleMetaChange('notes', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 resize-none font-light leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Thank You Message</label>
                <input
                  type="text"
                  placeholder="Thank you for your business!"
                  value={formData.thankYouMessage || ''}
                  onChange={(e) => handleMetaChange('thankYouMessage', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100"
                />
              </div>
            </div>
          </Squircle>
        </div>

        {/* RIGHT COLUMN: REAL-TIME PREVIEW */}
        <div className={`lg:col-span-6 space-y-6 ${activeView === 'preview' ? 'block' : 'hidden lg:block'}`}>
          <div className="sticky top-28 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 scrollbar-thin">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Live Preview
              </h3>
              <div className="text-[10px] text-zinc-500 font-mono uppercase">
                A4 Aspect Ratio (794px Width)
              </div>
            </div>

            <div className="relative">
              {/* Import the visual renderer */}
              <div className="border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
                <InvoicePreview 
                  invoice={formData}
                  brandColor={formData.brandColor}
                  template={formData.template}
                  containerId="editor-realtime-preview"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
