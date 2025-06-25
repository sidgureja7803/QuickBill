const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

/**
 * Generate PDF invoice
 * @param {Object} invoice - Invoice data
 * @param {Object} user - User data
 * @param {Object} client - Client data
 * @returns {Promise<Buffer>} - PDF buffer
 */
exports.generateInvoicePDF = async (invoice, user, client) => {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a page to the document
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    
    // Get fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Set font size
    const fontSize = 12;
    const titleSize = 24;
    const headerSize = 14;
    
    // Draw company info
    page.drawText('INVOICE', {
      x: 50,
      y: 800,
      size: titleSize,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    // Invoice number and dates
    page.drawText(`Invoice #: ${invoice.invoiceNumber}`, {
      x: 50,
      y: 770,
      size: fontSize,
      font: helveticaBold,
    });
    
    page.drawText(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, {
      x: 50,
      y: 750,
      size: fontSize,
      font: helveticaFont,
    });
    
    page.drawText(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, {
      x: 50,
      y: 730,
      size: fontSize,
      font: helveticaFont,
    });
    
    // From (Company/User)
    page.drawText('From:', {
      x: 50,
      y: 690,
      size: headerSize,
      font: helveticaBold,
    });
    
    page.drawText(user.company?.name || user.name, {
      x: 50,
      y: 670,
      size: fontSize,
      font: helveticaFont,
    });
    
    if (user.company?.address) {
      page.drawText(user.company.address, {
        x: 50,
        y: 650,
        size: fontSize,
        font: helveticaFont,
      });
    }
    
    page.drawText(user.email, {
      x: 50,
      y: 630,
      size: fontSize,
      font: helveticaFont,
    });
    
    if (user.company?.phone) {
      page.drawText(user.company.phone, {
        x: 50,
        y: 610,
        size: fontSize,
        font: helveticaFont,
      });
    }
    
    // To (Client)
    page.drawText('Bill To:', {
      x: 300,
      y: 690,
      size: headerSize,
      font: helveticaBold,
    });
    
    page.drawText(client.name, {
      x: 300,
      y: 670,
      size: fontSize,
      font: helveticaFont,
    });
    
    if (client.address) {
      const address = [];
      if (client.address.street) address.push(client.address.street);
      if (client.address.city) address.push(client.address.city);
      if (client.address.state) address.push(client.address.state);
      if (client.address.zipCode) address.push(client.address.zipCode);
      if (client.address.country) address.push(client.address.country);
      
      const fullAddress = address.join(', ');
      page.drawText(fullAddress, {
        x: 300,
        y: 650,
        size: fontSize,
        font: helveticaFont,
      });
    }
    
    page.drawText(client.email, {
      x: 300,
      y: 630,
      size: fontSize,
      font: helveticaFont,
    });
    
    if (client.phone) {
      page.drawText(client.phone, {
        x: 300,
        y: 610,
        size: fontSize,
        font: helveticaFont,
      });
    }
    
    // Invoice items table header
    const tableTop = 550;
    const colWidths = [40, 250, 75, 75, 75];
    const colStarts = [50];
    
    for (let i = 1; i < colWidths.length; i++) {
      colStarts[i] = colStarts[i - 1] + colWidths[i - 1];
    }
    
    // Table header
    page.drawText('#', {
      x: colStarts[0] + 15,
      y: tableTop,
      size: fontSize,
      font: helveticaBold,
    });
    
    page.drawText('Description', {
      x: colStarts[1],
      y: tableTop,
      size: fontSize,
      font: helveticaBold,
    });
    
    page.drawText('Qty', {
      x: colStarts[2] + 25,
      y: tableTop,
      size: fontSize,
      font: helveticaBold,
    });
    
    page.drawText('Price', {
      x: colStarts[3] + 20,
      y: tableTop,
      size: fontSize,
      font: helveticaBold,
    });
    
    page.drawText('Total', {
      x: colStarts[4] + 20,
      y: tableTop,
      size: fontSize,
      font: helveticaBold,
    });
    
    // Draw horizontal line
    page.drawLine({
      start: { x: 50, y: tableTop - 10 },
      end: { x: 545, y: tableTop - 10 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    // Table rows
    let currentY = tableTop - 30;
    
    invoice.items.forEach((item, index) => {
      const itemTotal = item.quantity * item.unitPrice;
      
      page.drawText(`${index + 1}`, {
        x: colStarts[0] + 15,
        y: currentY,
        size: fontSize,
        font: helveticaFont,
      });
      
      page.drawText(item.description, {
        x: colStarts[1],
        y: currentY,
        size: fontSize,
        font: helveticaFont,
      });
      
      page.drawText(`${item.quantity}`, {
        x: colStarts[2] + 25,
        y: currentY,
        size: fontSize,
        font: helveticaFont,
      });
      
      page.drawText(`$${item.unitPrice.toFixed(2)}`, {
        x: colStarts[3] + 10,
        y: currentY,
        size: fontSize,
        font: helveticaFont,
      });
      
      page.drawText(`$${itemTotal.toFixed(2)}`, {
        x: colStarts[4] + 10,
        y: currentY,
        size: fontSize,
        font: helveticaFont,
      });
      
      currentY -= 25;
    });
    
    // Draw horizontal line
    page.drawLine({
      start: { x: 50, y: currentY - 10 },
      end: { x: 545, y: currentY - 10 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    // Totals
    currentY -= 30;
    
    page.drawText('Subtotal:', {
      x: 400,
      y: currentY,
      size: fontSize,
      font: helveticaBold,
    });
    
    page.drawText(`$${(invoice.totalAmount - invoice.totalTax).toFixed(2)}`, {
      x: 500,
      y: currentY,
      size: fontSize,
      font: helveticaFont,
    });
    
    currentY -= 25;
    
    page.drawText('Tax:', {
      x: 400,
      y: currentY,
      size: fontSize,
      font: helveticaBold,
    });
    
    page.drawText(`$${invoice.totalTax.toFixed(2)}`, {
      x: 500,
      y: currentY,
      size: fontSize,
      font: helveticaFont,
    });
    
    currentY -= 25;
    
    page.drawText('Total:', {
      x: 400,
      y: currentY,
      size: fontSize,
      font: helveticaBold,
    });
    
    page.drawText(`$${invoice.totalAmount.toFixed(2)}`, {
      x: 500,
      y: currentY,
      size: fontSize,
      font: helveticaBold,
    });
    
    // Notes
    if (invoice.notes) {
      currentY -= 50;
      
      page.drawText('Notes:', {
        x: 50,
        y: currentY,
        size: headerSize,
        font: helveticaBold,
      });
      
      currentY -= 25;
      
      page.drawText(invoice.notes, {
        x: 50,
        y: currentY,
        size: fontSize,
        font: helveticaFont,
      });
    }
    
    // Payment terms
    if (invoice.paymentTerms) {
      currentY -= 50;
      
      page.drawText('Payment Terms:', {
        x: 50,
        y: currentY,
        size: headerSize,
        font: helveticaBold,
      });
      
      currentY -= 25;
      
      page.drawText(invoice.paymentTerms, {
        x: 50,
        y: currentY,
        size: fontSize,
        font: helveticaFont,
      });
    }
    
    // Footer
    page.drawText('Thank you for your business!', {
      x: 50,
      y: 50,
      size: fontSize,
      font: helveticaFont,
    });
    
    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();
    
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Could not generate PDF');
  }
};

/**
 * Save PDF to file system
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {string} fileName - File name
 * @returns {Promise<string>} - File path
 */
exports.savePDF = async (pdfBuffer, fileName) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Create uploads directory if it doesn't exist
    try {
      await fs.access(uploadsDir);
    } catch (error) {
      await fs.mkdir(uploadsDir, { recursive: true });
    }
    
    const filePath = path.join(uploadsDir, `${fileName}.pdf`);
    await fs.writeFile(filePath, pdfBuffer);
    
    return filePath;
  } catch (error) {
    console.error('Error saving PDF:', error);
    throw new Error('Could not save PDF');
  }
}; 