import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

/**
 * Generate PDF invoice
 * @param {Object} invoice - Invoice data
 * @param {Object} user - User data
 * @param {Object} client - Client data
 * @returns {jsPDF} - PDF document
 */
export const generateInvoicePDF = (invoice, user, client) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set font size
  const fontSize = 10;
  const titleSize = 18;
  const headerSize = 12;
  
  // Add title
  doc.setFontSize(titleSize);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 15, 20);
  
  // Add invoice number and dates
  doc.setFontSize(headerSize);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 15, 30);
  
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  doc.text(`Issue Date: ${format(new Date(invoice.issueDate), 'MM/dd/yyyy')}`, 15, 40);
  doc.text(`Due Date: ${format(new Date(invoice.dueDate), 'MM/dd/yyyy')}`, 15, 45);
  
  // From (Company/User)
  doc.setFontSize(headerSize);
  doc.setFont('helvetica', 'bold');
  doc.text('From:', 15, 60);
  
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  doc.text(user.company?.name || user.name, 15, 65);
  
  if (user.company?.address) {
    doc.text(user.company.address, 15, 70);
  }
  
  doc.text(user.email, 15, 75);
  
  if (user.company?.phone) {
    doc.text(user.company.phone, 15, 80);
  }
  
  // To (Client)
  doc.setFontSize(headerSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 120, 60);
  
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  doc.text(client.name, 120, 65);
  
  if (client.address) {
    const address = [];
    if (client.address.street) address.push(client.address.street);
    if (client.address.city) address.push(client.address.city);
    if (client.address.state) address.push(client.address.state);
    if (client.address.zipCode) address.push(client.address.zipCode);
    if (client.address.country) address.push(client.address.country);
    
    const fullAddress = address.join(', ');
    doc.text(fullAddress, 120, 70);
  }
  
  doc.text(client.email, 120, 75);
  
  if (client.phone) {
    doc.text(client.phone, 120, 80);
  }
  
  // Invoice items table header
  const tableTop = 100;
  const tableLeft = 15;
  const colWidths = [10, 80, 25, 25, 30];
  const colStarts = [tableLeft];
  
  for (let i = 1; i < colWidths.length; i++) {
    colStarts[i] = colStarts[i - 1] + colWidths[i - 1];
  }
  
  // Table header
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  doc.text('#', colStarts[0], tableTop);
  doc.text('Description', colStarts[1], tableTop);
  doc.text('Qty', colStarts[2], tableTop);
  doc.text('Price', colStarts[3], tableTop);
  doc.text('Total', colStarts[4], tableTop);
  
  // Draw horizontal line
  doc.line(tableLeft, tableTop + 2, 195, tableTop + 2);
  
  // Table rows
  let currentY = tableTop + 10;
  doc.setFont('helvetica', 'normal');
  
  invoice.items.forEach((item, index) => {
    const itemTotal = item.quantity * item.unitPrice;
    
    doc.text(`${index + 1}`, colStarts[0], currentY);
    doc.text(item.description, colStarts[1], currentY);
    doc.text(`${item.quantity}`, colStarts[2], currentY);
    doc.text(`$${item.unitPrice.toFixed(2)}`, colStarts[3], currentY);
    doc.text(`$${itemTotal.toFixed(2)}`, colStarts[4], currentY);
    
    currentY += 8;
  });
  
  // Draw horizontal line
  doc.line(tableLeft, currentY, 195, currentY);
  currentY += 10;
  
  // Totals
  const totalsX = 140;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', totalsX, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`$${(invoice.totalAmount - invoice.totalTax).toFixed(2)}`, totalsX + 30, currentY);
  
  currentY += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Tax:', totalsX, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`$${invoice.totalTax.toFixed(2)}`, totalsX + 30, currentY);
  
  currentY += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', totalsX, currentY);
  doc.text(`$${invoice.totalAmount.toFixed(2)}`, totalsX + 30, currentY);
  
  // Notes
  if (invoice.notes) {
    currentY += 20;
    
    doc.setFontSize(headerSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', tableLeft, currentY);
    
    currentY += 8;
    
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.notes, tableLeft, currentY);
  }
  
  // Payment terms
  if (invoice.paymentTerms) {
    currentY += 20;
    
    doc.setFontSize(headerSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Terms:', tableLeft, currentY);
    
    currentY += 8;
    
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.paymentTerms, tableLeft, currentY);
  }
  
  // Footer
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', tableLeft, 280);
  
  return doc;
};

/**
 * Download PDF invoice
 * @param {Object} invoice - Invoice data
 * @param {Object} user - User data
 * @param {Object} client - Client data
 */
export const downloadInvoicePDF = (invoice, user, client) => {
  const doc = generateInvoicePDF(invoice, user, client);
  doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
}; 