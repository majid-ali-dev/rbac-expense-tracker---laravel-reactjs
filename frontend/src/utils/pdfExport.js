import jsPDF from 'jspdf';
import 'jspdf-autotable';

const resolveUserField = (user, keys, fallback = 'N/A') => {
    if (!user) return fallback;
    for (const key of keys) {
        const value = user[key];
        if (value !== undefined && value !== null && value !== '') {
            return value;
        }
    }
    return fallback;
};

const formatPdfDate = (value) => {
    if (!value || value === 'N/A') return 'N/A';
    if (value instanceof Date) {
        return value.toLocaleDateString('en-GB');
    }
    if (typeof value === 'string') {
        const trimmedValue = value.trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(trimmedValue)) {
            return trimmedValue.split('T')[0];
        }
        return trimmedValue;
    }
    return String(value);
};

export const generateUserProfilePDF = (user, paymentHistory) => {
    try {
        console.log('PDF Generation Started');
        console.log('User Data:', user);
        console.log('Payment History:', paymentHistory);

        const doc = new jsPDF('p', 'mm', 'a4');
        let yPosition = 20;

        // === HEADER ===
        doc.setFontSize(24);
        doc.setTextColor(37, 99, 235);
        doc.setFont('helvetica', 'bold');
        doc.text('User Profile Report', 105, yPosition, { align: 'center' });
        yPosition += 14;

        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.8);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 12;

        // === USER INFORMATION SECTION ===
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('User Information', 20, yPosition);
        yPosition += 10;

        // Get latest payment month if exists
        let latestPaymentMonth = 'N/A';
        if (paymentHistory && paymentHistory.length > 0) {
            // Get the first payment from the latest month
            const latestMonth = paymentHistory[0];
            if (latestMonth && latestMonth.payments && latestMonth.payments.length > 0) {
                latestPaymentMonth = latestMonth.month || 'N/A';
            }
        }

        // Prepare user details - Status replaced with Payment Month
        const userDetails = [
            ['Name:', resolveUserField(user, ['name'])],
            ['Email:', resolveUserField(user, ['email'])],
            ['Phone:', resolveUserField(user, ['phone', 'phone_number'])],
            ['Joined:', formatPdfDate(resolveUserField(user, ['joined_at', 'joining_date', 'created_at']))],
            ['Total Amount:', `Rs. ${(user?.total_amount ?? 0).toFixed(2)}`],
            ['Total Paid:', `Rs. ${(user?.total_paid ?? 0).toFixed(2)}`],
            ['Remaining:', `Rs. ${((user?.total_amount ?? 0) - (user?.total_paid ?? 0)).toFixed(2)}`],
            ['Payment Month:', latestPaymentMonth],
        ];

        const rowsCount = Math.ceil(userDetails.length / 2);
        const rowHeight = 9;
        const paddingTop = 8;
        const paddingBottom = 8;
        const boxHeight = paddingTop + (rowsCount * rowHeight) + paddingBottom;

        const boxStartY = yPosition - 2;
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(248, 250, 252);
        doc.rect(20, boxStartY, 170, boxHeight, 'FD');
        doc.rect(20, boxStartY, 170, boxHeight, 'S');

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        const col1X = 30;
        const col2X = 105;

        userDetails.forEach(([label, value], index) => {
            const xPos = index < 4 ? col1X : col2X;
            const rowIndex = index < 4 ? index : index - 4;
            const yPos = boxStartY + paddingTop + 4 + (rowIndex * rowHeight);

            doc.setFont('helvetica', 'bold');
            doc.text(label, xPos, yPos);
            const labelWidth = doc.getTextWidth(label + ' ');

            doc.setFont('helvetica', 'normal');
            const safeValue = String(value || 'N/A');
            doc.text(safeValue, xPos + labelWidth, yPos);
        });

        yPosition = boxStartY + boxHeight + 15;

        // === PAYMENT HISTORY SECTION ===
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment History', 20, yPosition);
        yPosition += 10;

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 10;

        const history = Array.isArray(paymentHistory) ? paymentHistory : [];

        if (history.length === 0) {
            doc.setFontSize(12);
            doc.setTextColor(128, 128, 128);
            doc.setFont('helvetica', 'normal');
            doc.text('No payment history found.', 20, yPosition + 10);
        } else {
            const tableData = [];
            let grandTotal = 0;

            history.forEach((monthData) => {
                tableData.push([
                    {
                        content: monthData.month || 'Unknown Month',
                        colSpan: 3,
                        styles: {
                            fillColor: [37, 99, 235],
                            textColor: [255, 255, 255],
                            fontStyle: 'bold',
                            fontSize: 11,
                            halign: 'center',
                        }
                    }
                ]);

                const payments = Array.isArray(monthData.payments) ? monthData.payments : [];
                payments.forEach((payment) => {
                    tableData.push([
                        payment.date || '-',
                        `Rs. ${(payment.amount || 0).toFixed(2)}`,
                        payment.month_label || '-'
                    ]);
                });

                tableData.push([
                    {
                        content: `Total: Rs. ${(monthData.total || 0).toFixed(2)}`,
                        colSpan: 3,
                        styles: {
                            fillColor: [240, 240, 240],
                            fontStyle: 'bold',
                            fontSize: 10,
                            halign: 'right',
                        }
                    }
                ]);

                grandTotal += (monthData.total || 0);
            });

            tableData.push([
                {
                    content: `GRAND TOTAL: Rs. ${grandTotal.toFixed(2)}`,
                    colSpan: 3,
                    styles: {
                        fillColor: [37, 99, 235],
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        fontSize: 12,
                        halign: 'right',
                    }
                }
            ]);

            if (typeof doc.autoTable === 'function') {
                doc.autoTable({
                    startY: yPosition,
                    head: [['Date', 'Amount', 'Month']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [37, 99, 235],
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        fontSize: 10,
                        halign: 'center',
                    },
                    styles: {
                        fontSize: 10,
                        cellPadding: 4,
                        halign: 'center',
                    },
                    columnStyles: {
                        0: { cellWidth: 50, halign: 'center' },
                        1: { cellWidth: 55, halign: 'right' },
                        2: { cellWidth: 55, halign: 'center' },
                    },
                    margin: { left: 20, right: 20 },
                    tableWidth: 'auto',
                });
            } else {
                console.error('autoTable is not available. Please check jspdf-autotable import.');
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.text('Payment History:', 20, yPosition + 10);
                let y = yPosition + 20;
                history.forEach((monthData) => {
                    doc.text(`- ${monthData.month}: Rs. ${(monthData.total || 0).toFixed(2)}`, 25, y);
                    y += 8;
                });
            }
        }

        // === FOOTER ===
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.setFont('helvetica', 'normal');
            doc.text(
                `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
                105,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }

        const fileName = `user-profile-${(user?.name || 'user').replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        console.log('PDF Generated Successfully');

    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw new Error('Failed to generate PDF: ' + error.message);
    }
};