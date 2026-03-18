/**
 * =====================================================
 * QuickMart Finance Hub — Google Apps Script Backend
 * (Single "Entries" Sheet)
 * =====================================================
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet (sheets.new)
 * 2. Go to Extensions > Apps Script
 * 3. Delete the default code in Code.gs
 * 4. Paste this ENTIRE file into Code.gs
 * 5. Click Save (Ctrl+S)
 * 6. In the toolbar, select "setupNewSheets" from the function dropdown
 * 7. Click Run and authorize when prompted
 * 8. Click Deploy > New Deployment
 * 9. Click the gear icon next to "Select type" and choose "Web app"
 * 10. Set "Execute as" → Me
 * 11. Set "Who has access" → Anyone
 * 12. Click Deploy
 * 13. Copy the Web App URL — paste it into the Finance Hub app
 */

var ENTRIES_HEADERS = ['id', 'date', 'dateTo', 'type', 'category', 'amount', 'commission', 'gst', 'deliveryCharge', 'netAmount', 'paidBy', 'note', 'status'];

function setupNewSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Entries');
  if (!sheet) {
    sheet = ss.insertSheet('Entries');
  } else {
    sheet.clear();
  }
  sheet.getRange(1, 1, 1, ENTRIES_HEADERS.length).setValues([ENTRIES_HEADERS]);
  sheet.getRange(1, 1, 1, ENTRIES_HEADERS.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  try {
    var sheet1 = ss.getSheetByName('Sheet1');
    if (sheet1 && ss.getSheets().length > 1) {
      ss.deleteSheet(sheet1);
    }
  } catch (e) {}

  SpreadsheetApp.getUi().alert('Setup complete! "Entries" sheet created with headers:\n' + ENTRIES_HEADERS.join(', '));
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Entries');
  var numericFields = ['id', 'amount', 'commission', 'gst', 'deliveryCharge', 'netAmount'];

  if (!sheet || sheet.getLastRow() <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ Entries: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var hasData = false;
    for (var c = 0; c < row.length; c++) {
      if (row[c] !== '' && row[c] !== null) { hasData = true; break; }
    }
    if (!hasData) continue;

    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var h = headers[j];
      var v = row[j];
      if (h === 'date' || h === 'dateTo') {
        if (v instanceof Date) {
          obj[h] = Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        } else {
          obj[h] = v ? String(v) : '';
        }
      } else if (numericFields.indexOf(h) !== -1) {
        obj[h] = Number(v) || 0;
      } else {
        obj[h] = v !== null && v !== undefined ? String(v) : '';
      }
    }
    rows.push(obj);
  }

  return ContentService.createTextOutput(JSON.stringify({ Entries: rows }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var rows = body.rows;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Entries');

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Entries sheet not found. Run setupNewSheets() first.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'sync') {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
      }
      if (rows && rows.length > 0) {
        var newRows = [];
        for (var i = 0; i < rows.length; i++) {
          var rowData = [];
          for (var j = 0; j < headers.length; j++) {
            var val = rows[i][headers[j]];
            rowData.push(val !== undefined && val !== null ? val : '');
          }
          newRows.push(rowData);
        }
        sheet.getRange(2, 1, newRows.length, headers.length).setValues(newRows);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Seed demo data for QuickMart (Jan 2026 – Mar 2026).
 * Realistic retail / general provision store entries.
 */
function seedHistoricalData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Entries');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Error: "Entries" sheet not found. Run setupNewSheets() first.');
    return;
  }

  var rows = [];
  var now = Date.now();

  // --- JANUARY 2026 ---

  // Investment from both partners
  rows.push([now++, '2026-01-01', '', 'investment', 'Capital', 100000, 0, 0, 0, 100000, 'Vikram', 'Initial shop setup investment', 'paid']);
  rows.push([now++, '2026-01-01', '', 'investment', 'Capital', 75000, 0, 0, 0, 75000, 'Meena', 'Initial shop setup investment', 'paid']);

  // Counter sales (daily varying, higher on weekends)
  rows.push([now++, '2026-01-02', '', 'income', 'Counter Sales', 4200, 0, 0, 0, 4200, '', 'Friday sales', 'paid']);
  rows.push([now++, '2026-01-03', '', 'income', 'Counter Sales', 6800, 0, 0, 0, 6800, '', 'Saturday rush', 'paid']);
  rows.push([now++, '2026-01-04', '', 'income', 'Counter Sales', 7100, 0, 0, 0, 7100, '', 'Sunday sales', 'paid']);
  rows.push([now++, '2026-01-05', '', 'income', 'Counter Sales', 3500, 0, 0, 0, 3500, '', 'Monday sales', 'paid']);
  rows.push([now++, '2026-01-07', '', 'income', 'Counter Sales', 3800, 0, 0, 0, 3800, '', 'Wednesday sales', 'paid']);
  rows.push([now++, '2026-01-10', '', 'income', 'Counter Sales', 7500, 0, 0, 0, 7500, '', 'Saturday rush', 'paid']);
  rows.push([now++, '2026-01-11', '', 'income', 'Counter Sales', 6900, 0, 0, 0, 6900, '', 'Sunday sales', 'paid']);
  rows.push([now++, '2026-01-13', '', 'income', 'Counter Sales', 3600, 0, 0, 0, 3600, '', 'Tuesday sales', 'paid']);
  rows.push([now++, '2026-01-15', '', 'income', 'Counter Sales', 4100, 0, 0, 0, 4100, '', 'Thursday sales', 'paid']);
  rows.push([now++, '2026-01-17', '', 'income', 'Counter Sales', 7200, 0, 0, 0, 7200, '', 'Saturday rush', 'paid']);
  rows.push([now++, '2026-01-18', '', 'income', 'Counter Sales', 6500, 0, 0, 0, 6500, '', 'Sunday sales', 'paid']);
  rows.push([now++, '2026-01-20', '', 'income', 'Counter Sales', 3400, 0, 0, 0, 3400, '', 'Tuesday sales', 'paid']);
  rows.push([now++, '2026-01-22', '', 'income', 'Counter Sales', 4000, 0, 0, 0, 4000, '', 'Thursday sales', 'paid']);
  rows.push([now++, '2026-01-24', '', 'income', 'Counter Sales', 7800, 0, 0, 0, 7800, '', 'Saturday rush', 'paid']);
  rows.push([now++, '2026-01-25', '', 'income', 'Counter Sales', 7000, 0, 0, 0, 7000, '', 'Sunday sales', 'paid']);
  rows.push([now++, '2026-01-27', '', 'income', 'Counter Sales', 3900, 0, 0, 0, 3900, '', 'Tuesday sales', 'paid']);
  rows.push([now++, '2026-01-29', '', 'income', 'Counter Sales', 4300, 0, 0, 0, 4300, '', 'Thursday sales', 'paid']);
  rows.push([now++, '2026-01-31', '', 'income', 'Counter Sales', 7600, 0, 0, 0, 7600, '', 'Saturday month-end rush', 'paid']);

  // Wholesale orders (weekly)
  rows.push([now++, '2026-01-06', '', 'income', 'Wholesale', 12000, 0, 0, 0, 12000, '', 'Bulk order - Sharma General Store', 'paid']);
  rows.push([now++, '2026-01-14', '', 'income', 'Wholesale', 8500, 0, 0, 0, 8500, '', 'Bulk order - Patel Kirana', 'paid']);
  rows.push([now++, '2026-01-21', '', 'income', 'Wholesale', 10200, 0, 0, 0, 10200, '', 'Bulk order - local canteen', 'paid']);
  rows.push([now++, '2026-01-28', '', 'income', 'Wholesale', 9800, 0, 0, 0, 9800, '', 'Bulk order - hostel mess', 'paid']);

  // Home delivery
  rows.push([now++, '2026-01-08', '', 'income', 'Home Delivery', 2200, 0, 0, 0, 2200, '', 'Delivery orders - local area', 'paid']);
  rows.push([now++, '2026-01-19', '', 'income', 'Home Delivery', 1800, 0, 0, 0, 1800, '', 'Delivery orders - local area', 'paid']);

  // Republic Day festival sales
  rows.push([now++, '2026-01-26', '', 'income', 'Festival Sales', 15000, 0, 0, 0, 15000, '', 'Republic Day special offers', 'paid']);

  // Stock purchases (weekly)
  rows.push([now++, '2026-01-02', '', 'expense', 'Stock Purchase', 18000, 0, 0, 0, 18000, 'Vikram', 'FMCG & groceries restock', 'paid']);
  rows.push([now++, '2026-01-09', '', 'expense', 'Stock Purchase', 15500, 0, 0, 0, 15500, 'Meena', 'Dairy, snacks & beverages', 'paid']);
  rows.push([now++, '2026-01-16', '', 'expense', 'Stock Purchase', 16200, 0, 0, 0, 16200, 'Vikram', 'Groceries & toiletries', 'paid']);
  rows.push([now++, '2026-01-23', '', 'expense', 'Stock Purchase', 14800, 0, 0, 0, 14800, 'Meena', 'Staples & cooking oil', 'paid']);
  rows.push([now++, '2026-01-30', '', 'expense', 'Stock Purchase', 17000, 0, 0, 0, 17000, 'Vikram', 'Month-end heavy restock', 'paid']);

  // Monthly bills
  rows.push([now++, '2026-01-05', '', 'expense', 'Rent', 18000, 0, 0, 0, 18000, 'Vikram', 'Shop rent - January', 'paid']);
  rows.push([now++, '2026-01-15', '', 'expense', 'Electricity', 3200, 0, 0, 0, 3200, 'Vikram', 'Jan electricity bill', 'paid']);
  rows.push([now++, '2026-01-15', '', 'expense', 'Water', 800, 0, 0, 0, 800, 'Vikram', 'Jan water bill', 'paid']);

  // Staff salaries (2 staff)
  rows.push([now++, '2026-01-25', '', 'expense', 'Staff Salaries', 12000, 0, 0, 0, 12000, 'Vikram', 'Counter boy - Raju', 'paid']);
  rows.push([now++, '2026-01-25', '', 'expense', 'Staff Salaries', 10000, 0, 0, 0, 10000, 'Vikram', 'Helper - Sonu', 'paid']);

  // Transport
  rows.push([now++, '2026-01-12', '', 'expense', 'Transport', 1500, 0, 0, 0, 1500, 'Meena', 'Stock pickup auto charges', 'paid']);

  // Packaging
  rows.push([now++, '2026-01-10', '', 'expense', 'Packaging', 2500, 0, 0, 0, 2500, 'Meena', 'Carry bags & packing material', 'paid']);

  // --- FEBRUARY 2026 ---

  // Counter sales
  rows.push([now++, '2026-02-01', '', 'income', 'Counter Sales', 6200, 0, 0, 0, 6200, '', 'Sunday sales', 'paid']);
  rows.push([now++, '2026-02-03', '', 'income', 'Counter Sales', 3800, 0, 0, 0, 3800, '', 'Tuesday sales', 'paid']);
  rows.push([now++, '2026-02-05', '', 'income', 'Counter Sales', 4200, 0, 0, 0, 4200, '', 'Thursday sales', 'paid']);
  rows.push([now++, '2026-02-07', '', 'income', 'Counter Sales', 7400, 0, 0, 0, 7400, '', 'Saturday rush', 'paid']);
  rows.push([now++, '2026-02-08', '', 'income', 'Counter Sales', 6800, 0, 0, 0, 6800, '', 'Sunday sales', 'paid']);
  rows.push([now++, '2026-02-10', '', 'income', 'Counter Sales', 3600, 0, 0, 0, 3600, '', 'Tuesday sales', 'paid']);
  rows.push([now++, '2026-02-12', '', 'income', 'Counter Sales', 4000, 0, 0, 0, 4000, '', 'Thursday sales', 'paid']);
  rows.push([now++, '2026-02-14', '', 'income', 'Counter Sales', 8200, 0, 0, 0, 8200, '', 'Saturday - Valentine rush', 'paid']);
  rows.push([now++, '2026-02-15', '', 'income', 'Counter Sales', 7100, 0, 0, 0, 7100, '', 'Sunday sales', 'paid']);
  rows.push([now++, '2026-02-17', '', 'income', 'Counter Sales', 3500, 0, 0, 0, 3500, '', 'Tuesday sales', 'paid']);
  rows.push([now++, '2026-02-19', '', 'income', 'Counter Sales', 4100, 0, 0, 0, 4100, '', 'Thursday sales', 'paid']);
  rows.push([now++, '2026-02-21', '', 'income', 'Counter Sales', 7500, 0, 0, 0, 7500, '', 'Saturday rush', 'paid']);
  rows.push([now++, '2026-02-22', '', 'income', 'Counter Sales', 6900, 0, 0, 0, 6900, '', 'Sunday sales', 'paid']);
  rows.push([now++, '2026-02-24', '', 'income', 'Counter Sales', 3700, 0, 0, 0, 3700, '', 'Tuesday sales', 'paid']);
  rows.push([now++, '2026-02-26', '', 'income', 'Counter Sales', 4300, 0, 0, 0, 4300, '', 'Thursday sales', 'paid']);
  rows.push([now++, '2026-02-28', '', 'income', 'Counter Sales', 7800, 0, 0, 0, 7800, '', 'Saturday month-end rush', 'paid']);

  // Wholesale
  rows.push([now++, '2026-02-04', '', 'income', 'Wholesale', 11000, 0, 0, 0, 11000, '', 'Bulk - Sharma General Store', 'paid']);
  rows.push([now++, '2026-02-11', '', 'income', 'Wholesale', 9200, 0, 0, 0, 9200, '', 'Bulk - local canteen', 'paid']);
  rows.push([now++, '2026-02-18', '', 'income', 'Wholesale', 10500, 0, 0, 0, 10500, '', 'Bulk - Patel Kirana', 'paid']);
  rows.push([now++, '2026-02-25', '', 'income', 'Wholesale', 8800, 0, 0, 0, 8800, '', 'Bulk - hostel mess', 'paid']);

  // Online orders
  rows.push([now++, '2026-02-06', '', 'income', 'Online Orders', 3200, 0, 0, 0, 3200, '', 'JioMart & Blinkit orders', 'paid']);
  rows.push([now++, '2026-02-20', '', 'income', 'Online Orders', 2800, 0, 0, 0, 2800, '', 'Swiggy Instamart orders', 'paid']);

  // Home delivery
  rows.push([now++, '2026-02-09', '', 'income', 'Home Delivery', 2500, 0, 0, 0, 2500, '', 'Local deliveries', 'paid']);
  rows.push([now++, '2026-02-23', '', 'income', 'Home Delivery', 1900, 0, 0, 0, 1900, '', 'Local deliveries', 'paid']);

  // Pending payment
  rows.push([now++, '2026-02-15', '', 'income', 'Wholesale', 7500, 0, 0, 0, 7500, '', 'Bulk order - credit to Gupta Store', 'pending']);

  // Stock purchases
  rows.push([now++, '2026-02-02', '', 'expense', 'Stock Purchase', 17500, 0, 0, 0, 17500, 'Vikram', 'Weekly FMCG restock', 'paid']);
  rows.push([now++, '2026-02-09', '', 'expense', 'Stock Purchase', 14200, 0, 0, 0, 14200, 'Meena', 'Snacks & beverages', 'paid']);
  rows.push([now++, '2026-02-16', '', 'expense', 'Stock Purchase', 16800, 0, 0, 0, 16800, 'Vikram', 'Groceries & household', 'paid']);
  rows.push([now++, '2026-02-23', '', 'expense', 'Stock Purchase', 15000, 0, 0, 0, 15000, 'Meena', 'Staples & oil restock', 'paid']);

  // Monthly bills
  rows.push([now++, '2026-02-05', '', 'expense', 'Rent', 18000, 0, 0, 0, 18000, 'Vikram', 'Shop rent - February', 'paid']);
  rows.push([now++, '2026-02-15', '', 'expense', 'Electricity', 3500, 0, 0, 0, 3500, 'Vikram', 'Feb electricity bill', 'paid']);
  rows.push([now++, '2026-02-15', '', 'expense', 'Water', 800, 0, 0, 0, 800, 'Vikram', 'Feb water bill', 'paid']);

  // Staff salaries
  rows.push([now++, '2026-02-25', '', 'expense', 'Staff Salaries', 12000, 0, 0, 0, 12000, 'Vikram', 'Counter boy - Raju', 'paid']);
  rows.push([now++, '2026-02-25', '', 'expense', 'Staff Salaries', 10000, 0, 0, 0, 10000, 'Vikram', 'Helper - Sonu', 'paid']);

  // Transport & packaging
  rows.push([now++, '2026-02-10', '', 'expense', 'Transport', 1800, 0, 0, 0, 1800, 'Meena', 'Stock pickup charges', 'paid']);
  rows.push([now++, '2026-02-12', '', 'expense', 'Packaging', 2200, 0, 0, 0, 2200, 'Meena', 'Carry bags restock', 'paid']);

  // Marketing
  rows.push([now++, '2026-02-14', '', 'expense', 'Marketing', 3000, 0, 0, 0, 3000, 'Meena', 'Local newspaper ad + pamphlets', 'paid']);

  // Shop maintenance
  rows.push([now++, '2026-02-20', '', 'expense', 'Shop Maintenance', 2500, 0, 0, 0, 2500, 'Vikram', 'Shelf repair & painting', 'paid']);

  // Reimbursement
  rows.push([now++, '2026-02-01', '', 'reimbursement', 'Reimbursement', 8000, 0, 0, 0, 8000, 'Meena', 'Jan expense settlement to Meena', 'paid']);

  // --- MARCH 2026 ---

  // Counter sales
  rows.push([now++, '2026-03-01', '', 'income', 'Counter Sales', 6500, 0, 0, 0, 6500, '', 'Sunday sales', 'paid']);
  rows.push([now++, '2026-03-03', '', 'income', 'Counter Sales', 3900, 0, 0, 0, 3900, '', 'Tuesday sales', 'paid']);
  rows.push([now++, '2026-03-05', '', 'income', 'Counter Sales', 4400, 0, 0, 0, 4400, '', 'Thursday sales', 'paid']);
  rows.push([now++, '2026-03-07', '', 'income', 'Counter Sales', 7600, 0, 0, 0, 7600, '', 'Saturday rush', 'paid']);
  rows.push([now++, '2026-03-08', '', 'income', 'Counter Sales', 7000, 0, 0, 0, 7000, '', 'Sunday sales', 'paid']);
  rows.push([now++, '2026-03-10', '', 'income', 'Counter Sales', 3700, 0, 0, 0, 3700, '', 'Tuesday sales', 'paid']);
  rows.push([now++, '2026-03-12', '', 'income', 'Counter Sales', 4500, 0, 0, 0, 4500, '', 'Thursday sales', 'paid']);
  rows.push([now++, '2026-03-14', '', 'income', 'Counter Sales', 9500, 0, 0, 0, 9500, '', 'Holi eve Saturday rush', 'paid']);
  rows.push([now++, '2026-03-15', '', 'income', 'Counter Sales', 4200, 0, 0, 0, 4200, '', 'Sunday post-Holi', 'paid']);
  rows.push([now++, '2026-03-17', '', 'income', 'Counter Sales', 3800, 0, 0, 0, 3800, '', 'Tuesday sales', 'paid']);
  rows.push([now++, '2026-03-19', '', 'income', 'Counter Sales', 4600, 0, 0, 0, 4600, '', 'Thursday sales', 'paid']);

  // Holi festival sales
  rows.push([now++, '2026-03-13', '', 'income', 'Festival Sales', 22000, 0, 0, 0, 22000, '', 'Holi colors, sweets & snacks', 'paid']);
  rows.push([now++, '2026-03-14', '', 'income', 'Festival Sales', 18500, 0, 0, 0, 18500, '', 'Holi day special sales', 'paid']);

  // Wholesale
  rows.push([now++, '2026-03-04', '', 'income', 'Wholesale', 11500, 0, 0, 0, 11500, '', 'Bulk - Sharma General Store', 'paid']);
  rows.push([now++, '2026-03-11', '', 'income', 'Wholesale', 13000, 0, 0, 0, 13000, '', 'Holi bulk - local shops', 'paid']);
  rows.push([now++, '2026-03-18', '', 'income', 'Wholesale', 9500, 0, 0, 0, 9500, '', 'Bulk - canteen order', 'paid']);

  // Online orders
  rows.push([now++, '2026-03-06', '', 'income', 'Online Orders', 3500, 0, 0, 0, 3500, '', 'Online platform orders', 'paid']);
  rows.push([now++, '2026-03-16', '', 'income', 'Online Orders', 2900, 0, 0, 0, 2900, '', 'Online orders post-Holi', 'paid']);

  // Home delivery
  rows.push([now++, '2026-03-09', '', 'income', 'Home Delivery', 2800, 0, 0, 0, 2800, '', 'Local area deliveries', 'paid']);

  // Stock purchases
  rows.push([now++, '2026-03-01', '', 'expense', 'Stock Purchase', 19000, 0, 0, 0, 19000, 'Vikram', 'Monthly heavy restock', 'paid']);
  rows.push([now++, '2026-03-07', '', 'expense', 'Stock Purchase', 16500, 0, 0, 0, 16500, 'Meena', 'Holi special stock', 'paid']);
  rows.push([now++, '2026-03-12', '', 'expense', 'Stock Purchase', 12000, 0, 0, 0, 12000, '', 'Holi colors & sweets stock', 'paid']);
  rows.push([now++, '2026-03-16', '', 'expense', 'Stock Purchase', 14500, 0, 0, 0, 14500, 'Vikram', 'Post-Holi restock', 'paid']);

  // Monthly bills
  rows.push([now++, '2026-03-05', '', 'expense', 'Rent', 18000, 0, 0, 0, 18000, 'Vikram', 'Shop rent - March', 'paid']);
  rows.push([now++, '2026-03-15', '', 'expense', 'Electricity', 3800, 0, 0, 0, 3800, 'Vikram', 'Mar electricity bill', 'paid']);
  rows.push([now++, '2026-03-15', '', 'expense', 'Water', 800, 0, 0, 0, 800, 'Vikram', 'Mar water bill', 'paid']);

  // Staff salaries (partial month, assume paid)
  rows.push([now++, '2026-03-15', '', 'expense', 'Staff Salaries', 12000, 0, 0, 0, 12000, 'Vikram', 'Counter boy - Raju (advance)', 'paid']);
  rows.push([now++, '2026-03-15', '', 'expense', 'Staff Salaries', 10000, 0, 0, 0, 10000, 'Vikram', 'Helper - Sonu (advance)', 'paid']);

  // Transport
  rows.push([now++, '2026-03-08', '', 'expense', 'Transport', 2000, 0, 0, 0, 2000, 'Meena', 'Holi stock pickup tempo', 'paid']);

  // Packaging
  rows.push([now++, '2026-03-10', '', 'expense', 'Packaging', 3000, 0, 0, 0, 3000, 'Meena', 'Festival gift packaging', 'paid']);

  // Insurance
  rows.push([now++, '2026-03-01', '', 'expense', 'Insurance', 5000, 0, 0, 0, 5000, 'Vikram', 'Quarterly shop insurance', 'paid']);

  if (rows.length > 0) {
    var startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rows.length, ENTRIES_HEADERS.length).setValues(rows);
  }

  SpreadsheetApp.getUi().alert('Seeded ' + rows.length + ' demo entries for QuickMart (Jan-Mar 2026).');
}
