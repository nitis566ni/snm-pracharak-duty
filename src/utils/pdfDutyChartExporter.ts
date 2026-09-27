import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports a DOM element containing the duty calendar chart to a high-fidelity PDF.
 * Uses html2canvas to ensure 100% accurate rendering of Devanagari script (Hindi/Marathi)
 * ligatures and layout, followed by jsPDF compilation.
 */
export async function exportDutyCalendarToPdf(
  elementId: string,
  filename: string = 'Sant_Nirankari_Zone34_Duty_Chart.pdf'
): Promise<{ success: boolean; error?: string }> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Target print element #${elementId} not found.`);
    }

    // Capture element as high-resolution canvas
    const canvas = await html2canvas(element, {
      scale: 2, // High DPI for crisp text and Devanagari ligatures
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');

    // A4 dimensions in mm
    const pdfWidth = 297; // Landscape A4 width
    const pdfHeight = 210; // Landscape A4 height

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Multi-page handling if the roster exceeds 1 page
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage('a4', 'landscape');
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
    return { success: true };
  } catch (err: any) {
    console.error('Error generating PDF chart:', err);
    return {
      success: false,
      error: err?.message || 'Failed to export PDF chart',
    };
  }
}
