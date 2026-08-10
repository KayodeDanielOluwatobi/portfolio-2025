// src/app/lab/invoice-generator/components/BusinessProfileForm.tsx

'use client';

import React, { useState } from 'react';
import { BusinessProfile } from '../lib/types';
import { useInvoices } from '../context/InvoiceContext';
import { Save, Upload, X } from 'lucide-react';
import { Squircle } from '@squircle-js/react';

interface BusinessProfileFormProps {
  onClose: () => void;
}

export default function BusinessProfileForm({ onClose }: BusinessProfileFormProps) {
  const { businessProfile, saveBusinessProfile } = useInvoices();
  
  const [formData, setFormData] = useState<BusinessProfile>({ ...businessProfile });

  const handleChange = (field: keyof BusinessProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        handleChange('logo', event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleChange('logo', undefined);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveBusinessProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Squircle 
        cornerRadius={24} 
        cornerSmoothing={0.7} 
        className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin text-left"
      >
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-medium text-white">Business Settings</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Configure defaults for all new invoices</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Logo Section */}
          <div className="space-y-2 border-b border-zinc-900 pb-5">
            <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider block">Default Logo</label>
            <div className="flex items-center gap-4">
              {formData.logo ? (
                <div className="relative group w-20 h-20 bg-white border border-zinc-200 rounded-lg p-2 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <label className="w-20 h-20 bg-zinc-900 border border-zinc-800 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer text-zinc-500 hover:text-zinc-400 hover:border-zinc-700 transition-colors">
                  <Upload size={16} />
                  <span className="text-[10px] mt-1.5 font-light">Upload</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              )}
              <div className="text-zinc-500 text-xs font-light">
                <p>This logo will load automatically on new invoices.</p>
                <p className="text-[10px] text-zinc-600">Supports PNG, JPEG, SVG. Max 2MB.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Owner Details */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Contractor / Owner Name</label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => handleChange('ownerName', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-700"
                placeholder="e.g. Jane Doe"
              />
            </div>

            {/* Business Details */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Business Name</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-700"
                placeholder="e.g. PixelCraft Studios"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Business Email</label>
              <input
                type="email"
                required
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-700"
                placeholder="e.g. billings@pixelcraft.design"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Business Phone</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-700"
                placeholder="e.g. +234 812 345 6789"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Website URL</label>
              <input
                type="text"
                value={formData.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-700"
                placeholder="e.g. www.pixelcraft.design"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Default Currency</label>
              <select
                value={formData.defaultCurrency}
                onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300"
              >
                <option value="USD">USD ($)</option>
                <option value="NGN">NGN (₦)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="KRW">KRW (₩)</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Business Address</label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-700 resize-none font-light leading-relaxed"
                placeholder="Street Address, City, Country"
                rows={2}
              />
            </div>

            {/* Bank details */}
            <div className="space-y-1.5 border-t border-zinc-900 pt-3 sm:col-span-2 mt-1">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-space mb-2">Default Payment Accounts</h4>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Bank Name</label>
              <input
                type="text"
                value={formData.bankName || ''}
                onChange={(e) => handleChange('bankName', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-700"
                placeholder="e.g. Access Bank"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Account Name</label>
              <input
                type="text"
                value={formData.accountName || ''}
                onChange={(e) => handleChange('accountName', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-700"
                placeholder="e.g. PixelCraft Studios Ltd"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Account Number</label>
              <input
                type="text"
                value={formData.accountNumber || ''}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 font-mono"
                placeholder="e.g. 0123456789"
              />
            </div>

            {/* Terms & Details */}
            <div className="space-y-1.5 border-t border-zinc-900 pt-3 sm:col-span-2 mt-1">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-space mb-2">Invoice Standards</h4>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Default Invoice Prefix</label>
              <input
                type="text"
                value={formData.defaultInvoicePrefix || ''}
                onChange={(e) => handleChange('defaultInvoicePrefix', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100"
                placeholder="INV"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Default Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.defaultTaxRate || 0}
                onChange={(e) => handleChange('defaultTaxRate', Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Default Terms</label>
              <input
                type="text"
                value={formData.defaultPaymentTerms || ''}
                onChange={(e) => handleChange('defaultPaymentTerms', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100"
                placeholder="Net 15"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Theme Brand Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.brandColor || '#3BA2DE'}
                  onChange={(e) => handleChange('brandColor', e.target.value)}
                  className="w-8 h-8 rounded border border-zinc-800 bg-zinc-900 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.brandColor || '#3BA2DE'}
                  onChange={(e) => handleChange('brandColor', e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-300 w-full font-mono uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Default Terms & Conditions</label>
              <textarea
                value={formData.defaultTerms || ''}
                onChange={(e) => handleChange('defaultTerms', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 resize-none font-light leading-relaxed"
                placeholder="Terms and conditions statement..."
                rows={3}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-space text-zinc-400 uppercase tracking-wider">Default Thank You Message</label>
              <input
                type="text"
                value={formData.defaultThankYouMessage || ''}
                onChange={(e) => handleChange('defaultThankYouMessage', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100"
                placeholder="Thank you for your business!"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-zinc-900 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#3BA2DE] hover:bg-[#3BA2DE]/90 text-white transition-all shadow-md shadow-[#3BA2DE]/20 flex items-center gap-1.5"
            >
              <Save size={14} />
              Save Settings
            </button>
          </div>
        </form>
      </Squircle>
    </div>
  );
}
