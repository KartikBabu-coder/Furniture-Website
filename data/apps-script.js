// ============================================
// Google Apps Script - Orders to Google Sheet + Email
// ============================================
//
// HOW TO SETUP:
// 1. Go to https://script.google.com
// 2. Click "New Project"
// 3. Delete existing code, paste this ENTIRE code
// 4. Replace the 3 values below:
//    - YOUR_EMAIL: Your email to receive orders
//    - YOUR_SHEET_ID: Your Google Sheet ID
// 5. Click Deploy > New Deployment
// 6. Select Type: Web App
// 7. Execute as: Me
// 8. Who has access: Anyone
// 9. Click Deploy
// 10. Copy the Web App URL and paste it in script.js
// ============================================

// ============ SETTINGS - CHANGE THESE ============
const YOUR_EMAIL = 'prjapatiramesh18k@gmail.com';  // Email to receive orders
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';  // Your Google Sheet ID
// ============================================

function doPost(e) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('Orders');

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet('Orders');
    sheet.appendRow([
      'Order ID', 'Date', 'Customer Name', 'Phone', 'Email',
      'Address', 'Items', 'Total', 'Payment Method', 'Status'
    ]);
  }

  const data = JSON.parse(e.postData.contents);

  // Save to Google Sheet
  sheet.appendRow([
    data.orderId || '',
    data.date || '',
    data.customerName || '',
    data.phone || '',
    data.email || '',
    data.address || '',
    data.items || '',
    data.total || '',
    data.paymentMethod || '',
    data.status || 'New Order'
  ]);

  // Send email notification
  sendOrderEmail(data);

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendOrderEmail(data) {
  const paymentMethodDisplay = {
    'GPAY': 'Google Pay (UPI)',
    'PHONEPE': 'PhonePe (UPI)',
    'PAYTM': 'Paytm (UPI)',
    'UPI': 'UPI Payment',
    'CARD': 'Credit/Debit Card',
    'COD': 'Cash on Delivery'
  }[data.paymentMethod] || data.paymentMethod;

  const subject = `New Order Received! - ${data.orderId} - Rs.${data.total}`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f2f2f2; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1f232a, #ce962e); color: white; padding: 25px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header h2 { margin: 5px 0 0; font-size: 16px; font-weight: normal; opacity: 0.9; }
    .content { padding: 25px; }
    .order-id { background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 20px; }
    .order-id span { font-size: 24px; font-weight: bold; color: #856404; }
    .section { margin-bottom: 20px; }
    .section h3 { background: #1f232a; color: white; padding: 10px 15px; margin: 0; font-size: 14px; border-radius: 5px 5px 0 0; }
    .section table { width: 100%; border-collapse: collapse; background: #fafafa; }
    .section table td { padding: 10px 15px; border-bottom: 1px solid #eee; font-size: 14px; }
    .section table td:first-child { color: #666; width: 35%; }
    .section table td:last-child { color: #333; font-weight: 500; }
    .items-table { background: #fafafa; border-radius: 0 0 5px 5px; }
    .items-table td { vertical-align: top; }
    .items-list { margin: 0; padding: 0 15px 15px; list-style: none; }
    .items-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
    .items-list li:last-child { border-bottom: none; }
    .total-row { background: #1f232a; color: white; }
    .total-row td { font-size: 18px !important; font-weight: bold; color: #ce962e !important; }
    .payment-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .payment-upi { background: #e8f5e9; color: #2e7d32; }
    .payment-cod { background: #e3f2fd; color: #1565c0; }
    .payment-card { background: #f3e5f5; color: #7b1fa2; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .urgent { color: #e53935; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Order Received!</h1>
      <h2>Ananya House of Furniture</h2>
    </div>

    <div class="content">
      <div class="order-id">
        Order ID: <span>${data.orderId}</span>
      </div>

      <div class="section">
        <h3>Customer Details</h3>
        <table>
          <tr><td>Name</td><td><strong>${data.customerName}</strong></td></tr>
          <tr><td>Phone</td><td><a href="tel:${data.phone}">${data.phone}</a></td></tr>
          <tr><td>Email</td><td>${data.email || 'Not provided'}</td></tr>
          <tr><td>Address</td><td>${data.address}</td></tr>
        </table>
      </div>

      <div class="section">
        <h3>Items Ordered</h3>
        <table class="items-table">
          <tr><td colspan="2">
            <ul class="items-list">
              ${data.items.split(', ').map(item => `<li>${item}</li>`).join('')}
            </ul>
          </td></tr>
        </table>
      </div>

      <div class="section">
        <h3>Payment Summary</h3>
        <table>
          <tr><td>Total Amount</td><td><strong style="color:#ce962e;font-size:20px;">Rs.${data.total}</strong></td></tr>
          <tr><td>Payment Method</td>
            <td>
              <span class="payment-badge ${
                data.paymentMethod === 'COD' ? 'payment-cod' :
                data.paymentMethod === 'CARD' ? 'payment-card' : 'payment-upi'
              }">${paymentMethodDisplay}</span>
            </td>
          </tr>
          <tr><td>Order Date</td><td>${data.date}</td></tr>
        </table>
      </div>

      ${data.paymentMethod === 'COD' ? `
      <div style="background:#fff3cd;border:2px solid #ffc107;border-radius:8px;padding:15px;margin-bottom:20px;text-align:center;">
        <p style="margin:0;font-size:16px;color:#856404;">
          <strong>Cash on Delivery</strong> - Collect Rs.${data.total} when delivering
        </p>
      </div>
      ` : ''}

      <p style="text-align:center;margin-top:30px;">
        <a href="#" style="display:inline-block;background:#ce962e;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;font-size:16px;font-weight:bold;">
          Call Customer: ${data.phone}
        </a>
      </p>

      <p style="text-align:center;margin-top:15px;color:#666;font-size:13px;">
        Please contact the customer to confirm and arrange delivery.
      </p>
    </div>

    <div class="footer">
      <p>Ananya House of Furniture - Order Notification</p>
      <p>Generated automatically from website</p>
    </div>
  </div>
</body>
</html>
  `;

  const textBody = `
NEW ORDER RECEIVED - ${data.orderId}
================================

Order ID: ${data.orderId}
Date: ${data.date}
Total: Rs.${data.total}
Payment: ${paymentMethodDisplay}

CUSTOMER DETAILS
-----------------
Name: ${data.customerName}
Phone: ${data.phone}
Email: ${data.email || 'Not provided'}
Address: ${data.address}

ITEMS ORDERED
-------------
${data.items.split(', ').join('\n')}

${data.paymentMethod === 'COD' ? `IMPORTANT: Cash on Delivery - Collect Rs.${data.total} when delivering\n` : ''}
Call customer: ${data.phone}
  `;

  try {
    MailApp.sendEmail({
      to: YOUR_EMAIL,
      subject: subject,
      htmlBody: htmlBody,
      body: textBody
    });
  } catch (error) {
    console.log('Email error: ' + error);
  }
}

function doGet(e) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Orders');

  if (!sheet || sheet.getLastRow() <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ orders: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const orders = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });

  return ContentService.createTextOutput(JSON.stringify({ orders: orders }))
    .setMimeType(ContentService.MimeType.JSON);
}
