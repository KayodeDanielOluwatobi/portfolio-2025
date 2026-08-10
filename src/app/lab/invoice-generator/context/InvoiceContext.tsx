// src/app/lab/invoice-generator/context/InvoiceContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Invoice, Client, BusinessProfile, ServicePreset, InvoiceStatus } from '../lib/types';
import { generateNextInvoiceNumber } from '../lib/calculations';

interface InvoiceContextType {
  invoices: Invoice[];
  clients: Client[];
  presets: ServicePreset[];
  businessProfile: BusinessProfile;
  isLoading: boolean;
  
  // Invoice actions
  saveInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  duplicateInvoice: (id: string) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  
  // Client actions
  saveClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  
  // Settings actions
  saveBusinessProfile: (profile: BusinessProfile) => void;
  
  // Preset actions
  savePreset: (preset: ServicePreset) => void;
  deletePreset: (id: string) => void;
  
  // Utilities
  generateNewInvoiceNumber: () => string;
}

const defaultBusinessProfile: BusinessProfile = {
  ownerName: 'Jane Doe',
  businessName: 'PixelCraft Studios',
  address: '123 Creative Studio Lane, Lagos, Nigeria',
  email: 'hello@pixelcraft.design',
  phone: '+234 812 345 6789',
  website: 'www.pixelcraft.design',
  defaultCurrency: 'NGN',
  bankName: 'Access Bank',
  accountName: 'PixelCraft Studios Ltd',
  accountNumber: '0123456789',
  defaultPaymentTerms: 'Net 15',
  defaultInvoicePrefix: 'INV',
  defaultThankYouMessage: 'Thank you for your business. It is a pleasure working with you!',
  defaultTerms: '1. Please pay within the designated invoice due date.\n2. Overdue invoices are subject to a 5% monthly interest fee.\n3. Checks should be made payable to the account details provided.',
  defaultTaxRate: 7.5,
  brandColor: '#3BA2DE'
};

const defaultPresets: ServicePreset[] = [
  { id: '1', name: 'Logo Design', description: 'Custom vector logo design including source files and corporate color schemes.', unitPrice: 150000 },
  { id: '2', name: 'Brand Identity Suite', description: 'Complete brand packaging including logo variants, business cards, letterheads, and typography guides.', unitPrice: 350000 },
  { id: '3', name: 'UI/UX Mobile Design', description: 'High-fidelity mobile screens UI prototype design in Figma (up to 10 screens).', unitPrice: 500000 },
  { id: '4', name: 'Social Media Banner Design', description: 'Pack of 5 custom social media templates / graphics.', unitPrice: 40000 },
  { id: '5', name: 'Website Design & Development', description: 'Fully responsive landing page build using Next.js, Framer Motion and TailwindCSS.', unitPrice: 800000 },
  { id: '6', name: 'Corporate Brand Guidelines', description: 'A comprehensive document outlining your visual brand guidelines, patterns, and style specifications.', unitPrice: 120000 }
];

const defaultClients: Client[] = [
  {
    id: 'c1',
    name: 'Tobi Daniels',
    company: 'Foresight Ventures',
    address: '45 Marina, Lagos Island, Lagos',
    email: 'tobi@foresight.com',
    phone: '+234 703 111 2222',
    createdAt: Date.now()
  },
  {
    id: 'c2',
    name: 'Sarah Connor',
    company: 'Skynet Solutions',
    address: '90 Cyberdyne Blvd, Los Angeles, CA',
    email: 'sconnor@skynet.com',
    phone: '+1 (555) 909-2029',
    createdAt: Date.now()
  }
];

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [presets, setPresets] = useState<ServicePreset[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(defaultBusinessProfile);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedInvoices = localStorage.getItem('lab_invoices');
        const storedClients = localStorage.getItem('lab_clients');
        const storedPresets = localStorage.getItem('lab_presets');
        const storedProfile = localStorage.getItem('lab_business_profile');

        if (storedInvoices) setInvoices(JSON.parse(storedInvoices));
        
        if (storedClients) {
          setClients(JSON.parse(storedClients));
        } else {
          setClients(defaultClients);
          localStorage.setItem('lab_clients', JSON.stringify(defaultClients));
        }

        if (storedPresets) {
          setPresets(JSON.parse(storedPresets));
        } else {
          setPresets(defaultPresets);
          localStorage.setItem('lab_presets', JSON.stringify(defaultPresets));
        }

        if (storedProfile) {
          setBusinessProfile(JSON.parse(storedProfile));
        } else {
          setBusinessProfile(defaultBusinessProfile);
          localStorage.setItem('lab_business_profile', JSON.stringify(defaultBusinessProfile));
        }
      } catch (err) {
        console.error('Failed to load storage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // Save actions to local storage
  const saveToStorage = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (err) {
        console.error(`Error saving ${key} to storage:`, err);
      }
    }
  };

  // 1. Invoice Actions
  const saveInvoice = (invoice: Invoice) => {
    setInvoices(prev => {
      const exists = prev.some(inv => inv.id === invoice.id);
      const updated = exists
        ? prev.map(inv => inv.id === invoice.id ? invoice : inv)
        : [invoice, ...prev];
      saveToStorage('lab_invoices', updated);
      return updated;
    });
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => {
      const updated = prev.filter(inv => inv.id !== id);
      saveToStorage('lab_invoices', updated);
      return updated;
    });
  };

  const duplicateInvoice = (id: string) => {
    const target = invoices.find(inv => inv.id === id);
    if (!target) return;

    const nextNum = generateNewInvoiceNumber();
    const duplicated: Invoice = {
      ...target,
      id: crypto.randomUUID(),
      invoiceNumber: nextNum,
      dateIssued: new Date().toISOString(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // +15 days default
      createdAt: Date.now(),
      status: 'Draft',
      amountPaid: 0 // Reset payments
    };

    saveInvoice(duplicated);
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setInvoices(prev => {
      const updated = prev.map(inv => {
        if (inv.id === id) {
          const amountPaid = status === 'Paid' ? inv.amountPaid || 0 : inv.amountPaid;
          return { ...inv, status, amountPaid };
        }
        return inv;
      });
      saveToStorage('lab_invoices', updated);
      return updated;
    });
  };

  // 2. Client Actions
  const saveClient = (client: Client) => {
    setClients(prev => {
      const exists = prev.some(c => c.id === client.id);
      const updated = exists
        ? prev.map(c => c.id === client.id ? client : c)
        : [...prev, client];
      saveToStorage('lab_clients', updated);
      return updated;
    });
  };

  const deleteClient = (id: string) => {
    setClients(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveToStorage('lab_clients', updated);
      return updated;
    });
  };

  // 3. Settings Actions
  const saveBusinessProfile = (profile: BusinessProfile) => {
    setBusinessProfile(profile);
    saveToStorage('lab_business_profile', profile);
  };

  // 4. Preset Actions
  const savePreset = (preset: ServicePreset) => {
    setPresets(prev => {
      const exists = prev.some(p => p.id === preset.id);
      const updated = exists
        ? prev.map(p => p.id === preset.id ? preset : p)
        : [...prev, preset];
      saveToStorage('lab_presets', updated);
      return updated;
    });
  };

  const deletePreset = (id: string) => {
    setPresets(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveToStorage('lab_presets', updated);
      return updated;
    });
  };

  // Helper: Generates unique invoice numbers
  const generateNewInvoiceNumber = () => {
    const prefix = businessProfile.defaultInvoicePrefix || 'INV';
    // Get last invoice matching prefix
    const matchingInvoices = invoices
      .filter(inv => inv.invoiceNumber.startsWith(prefix))
      .sort((a, b) => b.createdAt - a.createdAt);

    const lastNum = matchingInvoices[0]?.invoiceNumber;
    return generateNextInvoiceNumber(prefix, lastNum);
  };

  return (
    <InvoiceContext.Provider value={{
      invoices,
      clients,
      presets,
      businessProfile,
      isLoading,
      saveInvoice,
      deleteInvoice,
      duplicateInvoice,
      updateInvoiceStatus,
      saveClient,
      deleteClient,
      saveBusinessProfile,
      savePreset,
      deletePreset,
      generateNewInvoiceNumber
    }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
}
