const PDFDocument = require('pdfkit');

/**
 * Generate Invoice PDF
 * @param {Object} order - Order object with all related data
 * @param {Object} appSettings - App settings containing company info
 * @returns {Promise<Buffer>} - PDF buffer
 */
const generateInvoicePDF = async (order, appSettings) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];

            // Collect PDF data into buffers
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            // Helper function to format date
            const formatDate = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };

            // Helper function to format currency
            const formatCurrency = (amount) => {
                return `₹${parseFloat(amount).toFixed(2)}`;
            };

            // ===== HEADER SECTION =====
            doc.fontSize(24)
                .font('Helvetica-Bold')
                .text(appSettings.appName || 'Health Harbour', 50, 50);

            doc.fontSize(10)
                .font('Helvetica')
                .text(appSettings.appTagline || 'B2B Medicine Ordering', 50, 80);

            if (appSettings.gstNumber) {
                doc.fontSize(9)
                    .text(`GST No: ${appSettings.gstNumber}`, 50, 95);
            }

            // Invoice Title
            doc.fontSize(20)
                .font('Helvetica-Bold')
                .text('INVOICE', 400, 50, { align: 'right' });

            // Invoice metadata
            doc.fontSize(10)
                .font('Helvetica')
                .text(`Invoice No: INV-${String(order.id).padStart(6, '0')}`, 400, 75, { align: 'right' })
                .text(`Date: ${formatDate(order.orderDate)}`, 400, 90, { align: 'right' });

            // Horizontal line
            doc.moveTo(50, 120)
                .lineTo(545, 120)
                .stroke();

            // ===== CUSTOMER DETAILS SECTION =====
            let yPosition = 140;

            doc.fontSize(12)
                .font('Helvetica-Bold')
                .text('Bill To:', 50, yPosition);

            yPosition += 20;

            if (order.retailerName) {
                doc.fontSize(10)
                    .font('Helvetica-Bold')
                    .text(order.retailerName, 50, yPosition);
                yPosition += 15;
            }

            if (order.shopName) {
                doc.fontSize(10)
                    .font('Helvetica')
                    .text(order.shopName, 50, yPosition);
                yPosition += 15;
            }

            if (order.User) {
                doc.fontSize(10)
                    .font('Helvetica')
                    .text(`Contact: ${order.User.name}`, 50, yPosition);
                yPosition += 12;
                doc.text(`Email: ${order.User.email}`, 50, yPosition);
                yPosition += 15;
            }

            // Address
            doc.fontSize(10)
                .font('Helvetica')
                .text(`Address: ${order.address}`, 50, yPosition, { width: 250 });

            yPosition += 40;

            // ===== ORDER ITEMS TABLE =====
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .text('Order Details:', 50, yPosition);

            yPosition += 25;

            // Table header
            const tableTop = yPosition;
            const itemX = 50;
            const qtyX = 300;
            const priceX = 370;
            const totalX = 470;

            doc.fontSize(10)
                .font('Helvetica-Bold')
                .text('Item', itemX, tableTop)
                .text('Qty', qtyX, tableTop)
                .text('Price', priceX, tableTop)
                .text('Total', totalX, tableTop);

            // Table header line
            yPosition = tableTop + 15;
            doc.moveTo(50, yPosition)
                .lineTo(545, yPosition)
                .stroke();

            yPosition += 10;

            // Table rows
            doc.font('Helvetica').fontSize(9);

            if (order.OrderItems && order.OrderItems.length > 0) {
                for (const item of order.OrderItems) {
                    const productName = item.Product ? item.Product.name : 'Unknown Product';
                    const itemTotal = item.quantity * item.price;

                    // Check if we need a new page
                    if (yPosition > 700) {
                        doc.addPage();
                        yPosition = 50;
                    }

                    doc.text(productName, itemX, yPosition, { width: 240 })
                        .text(item.quantity.toString(), qtyX, yPosition)
                        .text(formatCurrency(item.price), priceX, yPosition)
                        .text(formatCurrency(itemTotal), totalX, yPosition);

                    yPosition += 20;
                }
            }

            // Table footer line
            yPosition += 5;
            doc.moveTo(50, yPosition)
                .lineTo(545, yPosition)
                .stroke();

            yPosition += 20;

            // ===== PRICING BREAKDOWN =====
            const labelX = 350;
            const valueX = 470;

            doc.fontSize(10).font('Helvetica');

            doc.text('Subtotal:', labelX, yPosition)
                .text(formatCurrency(order.subTotal), valueX, yPosition);
            yPosition += 18;

            if (order.discount > 0) {
                doc.text('Discount:', labelX, yPosition)
                    .text(`-${formatCurrency(order.discount)}`, valueX, yPosition);
                yPosition += 18;
            }

            if (order.couponDiscount > 0) {
                doc.text(`Coupon (${order.couponCode || 'N/A'}):`, labelX, yPosition)
                    .text(`-${formatCurrency(order.couponDiscount)}`, valueX, yPosition);
                yPosition += 18;
            }

            if (order.paymentDiscount > 0) {
                doc.text('Payment Discount:', labelX, yPosition)
                    .text(`-${formatCurrency(order.paymentDiscount)}`, valueX, yPosition);
                yPosition += 18;
            }

            if (order.deliveryFee > 0) {
                doc.text('Delivery Fee:', labelX, yPosition)
                    .text(formatCurrency(order.deliveryFee), valueX, yPosition);
                yPosition += 18;
            }

            // Total line
            doc.moveTo(350, yPosition)
                .lineTo(545, yPosition)
                .stroke();

            yPosition += 15;

            doc.fontSize(12)
                .font('Helvetica-Bold')
                .text('Total Amount:', labelX, yPosition)
                .text(formatCurrency(order.totalAmount), valueX, yPosition);

            yPosition += 30;

            // ===== PAYMENT INFORMATION =====
            doc.fontSize(10)
                .font('Helvetica-Bold')
                .text('Payment Information:', 50, yPosition);

            yPosition += 18;

            doc.fontSize(9)
                .font('Helvetica')
                .text(`Payment Method: ${order.paymentMethod}`, 50, yPosition);
            yPosition += 15;

            doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 50, yPosition);
            yPosition += 15;

            doc.text(`Order Status: ${order.status}`, 50, yPosition);

            // ===== FOOTER =====
            const footerY = 750;
            doc.fontSize(8)
                .font('Helvetica')
                .text('Thank you for your business!', 50, footerY, { align: 'center', width: 495 });

            if (appSettings.supportNumber) {
                doc.fontSize(8)
                    .text(`Support: ${appSettings.supportNumber}`, 50, footerY + 15, { align: 'center', width: 495 });
            }

            // Finalize PDF
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateInvoicePDF };
