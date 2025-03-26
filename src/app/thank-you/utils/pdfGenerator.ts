import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generatePDF(element: HTMLElement, orderId: string): Promise<void> {
  try {
    // Add data attribute to help with PDF generation
    element.setAttribute('data-pdf-content', 'true');
    
    // Preload images to ensure they're rendered properly
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve, reject) => {
            if (img.complete) {
              resolve(null);
            } else {
              img.onload = () => resolve(null);
              img.onerror = reject;
            }
          })
      )
    );

    // Create the canvas with better settings
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      scale: 2,
      logging: false,
      onclone: (clonedDoc) => {
        // In the cloned document, we can modify elements before rendering to PDF
        const clonedElement = clonedDoc.body.querySelector('[data-pdf-content]');
        if (clonedElement) {
          // Make any necessary adjustments to the cloned DOM
          const hiddenElements = clonedElement.querySelectorAll('.web-view-only');
          hiddenElements.forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });

          const pdfElements = clonedElement.querySelectorAll('.pdf-only');
          pdfElements.forEach((el) => {
            (el as HTMLElement).style.display = 'block';
          });
        }
      },
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate dimensions for the receipt
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.95;

    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`CaseCrafters_Order_${orderId}.pdf`);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
}
