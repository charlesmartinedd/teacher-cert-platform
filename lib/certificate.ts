import jsPDF from 'jspdf';

export interface CertificateData {
  userName: string;
  courseName: string;
  completionDate: Date;
  certificateNumber: string;
}

export function generateCertificate(data: CertificateData): jsPDF {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Background border
  pdf.setDrawColor(37, 99, 235); // primary-600
  pdf.setLineWidth(5);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Inner border
  pdf.setDrawColor(147, 197, 253); // primary-300
  pdf.setLineWidth(1);
  pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Certificate Title
  pdf.setFontSize(48);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(37, 99, 235);
  pdf.text('Certificate of Completion', pageWidth / 2, 45, { align: 'center' });

  // Decorative line
  pdf.setDrawColor(217, 119, 6); // accent-600
  pdf.setLineWidth(2);
  pdf.line(pageWidth / 2 - 60, 52, pageWidth / 2 + 60, 52);

  // "This is to certify that"
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(75, 85, 99);
  pdf.text('This is to certify that', pageWidth / 2, 70, { align: 'center' });

  // Student Name
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(17, 24, 39);
  pdf.text(data.userName, pageWidth / 2, 90, { align: 'center' });

  // "Has successfully completed"
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(75, 85, 99);
  pdf.text('has successfully completed', pageWidth / 2, 105, { align: 'center' });

  // Course Name
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(37, 99, 235);
  pdf.text(data.courseName, pageWidth / 2, 125, { align: 'center' });

  // Date
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128);
  const formattedDate = data.completionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  pdf.text(`Date: ${formattedDate}`, pageWidth / 2, 145, { align: 'center' });

  // Certificate Number
  pdf.setFontSize(10);
  pdf.setTextColor(156, 163, 175);
  pdf.text(
    `Certificate No: ${data.certificateNumber}`,
    pageWidth / 2,
    155,
    { align: 'center' }
  );

  // Signature Section
  const signatureY = 175;
  const leftX = pageWidth / 3;
  const rightX = (2 * pageWidth) / 3;

  // Left signature line
  pdf.setDrawColor(156, 163, 175);
  pdf.setLineWidth(0.5);
  pdf.line(leftX - 30, signatureY, leftX + 30, signatureY);
  pdf.setFontSize(12);
  pdf.setTextColor(75, 85, 99);
  pdf.text('Instructor Signature', leftX, signatureY + 8, { align: 'center' });

  // Right signature line
  pdf.line(rightX - 30, signatureY, rightX + 30, signatureY);
  pdf.text('Program Director', rightX, signatureY + 8, { align: 'center' });

  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(156, 163, 175);
  pdf.text(
    'TeachCertPro - Teacher Certification Excellence',
    pageWidth / 2,
    pageHeight - 15,
    { align: 'center' }
  );

  return pdf;
}

export function downloadCertificate(data: CertificateData): void {
  const pdf = generateCertificate(data);
  const fileName = `certificate-${data.certificateNumber}.pdf`;
  pdf.save(fileName);
}

export function getCertificateBlob(data: CertificateData): Blob {
  const pdf = generateCertificate(data);
  return pdf.output('blob');
}
