// src/app/lab/invoice-generator/lib/exportUtils.ts

/**
 * Exports an HTML element as a high-resolution PNG image
 */
export async function exportToPNG(elementId: string, invoiceNumber: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.getElementById(elementId);
    if (!element) throw new Error(`Element with id "${elementId}" not found`);

    // Hide any elements with data-html2canvas-ignore="true" automatically
    const canvas = await html2canvas(element, {
      scale: 3, // Multiplies resolution for print-ready crispness
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794, // Standard A4 width pixel grid at 96 DPI
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${invoiceNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Failed to export to PNG:', error);
    return false;
  }
}

/**
 * Exports an HTML element as a clean A4-formatted PDF
 */
export async function exportToPDF(elementId: string, invoiceNumber: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');
    const element = document.getElementById(elementId);
    if (!element) throw new Error(`Element with id "${elementId}" not found`);

    const canvas = await html2canvas(element, {
      scale: 3, // Render sharp resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
    });

    const imgWidth = 210; // A4 paper width (mm)
    const pageHeight = 297; // A4 paper height (mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    const dataUrl = canvas.toDataURL('image/png');
    
    // Add first page
    pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Handle pages splits if height exceeds A4 bounds
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(`${invoiceNumber}.pdf`);
    return true;
  } catch (error) {
    console.error('Failed to export to PDF:', error);
    return false;
  }
}
