// src/app/lab/invoice-generator/page.tsx

import { InvoiceProvider } from './context/InvoiceContext';
import InvoiceGeneratorDashboard from './components/InvoiceGeneratorDashboard';

export const metadata = {
  title: 'Invoice Generator | Lab Experiments',
  description: 'Create, preview, and download professional-grade PDF and PNG invoices with automated calculations and customized themes.',
};

export default function Page() {
  return (
    <InvoiceProvider>
      <InvoiceGeneratorDashboard />
    </InvoiceProvider>
  );
}
