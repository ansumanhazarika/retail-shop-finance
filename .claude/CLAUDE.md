# QuickMart — Finance Hub

## Tech Stack
- **Frontend:** Single-file React 18 (CDN), Babel standalone (no build step)
- **Backend:** Google Apps Script (Sheets sync via doGet/doPost)
- **Storage:** Google Sheets + localStorage (offline cache)
- **Deploy:** GitHub Pages (auto-deploy on push to main)
- **Auth:** PIN-based (SHA-256, salt: retail_shop_salt)

## Architecture
- `index.html` — entire app (React + CSS-in-JS + logic)
- `apps-script-code.js` — Google Apps Script code (deployed separately in Google Sheets)
- No build step, no node_modules, no bundler

## Key URLs
- **Live site:** https://ansumanhazarika.github.io/retail-shop-finance/
- **Repo:** https://github.com/ansumanhazarika/retail-shop-finance

## Data Schema
id, date, dateTo, type, category, amount, commission, gst, deliveryCharge, netAmount, paidBy, note, status

## Business Details
- **People:** Vikram, Meena (partners)
- **Income:** Counter Sales, Wholesale, Online Orders, Home Delivery, Festival Sales, Misc Income
- **Expenses:** Stock Purchase, Rent, Electricity, Water, Staff Salaries, Transport, Packaging, Shop Maintenance, Insurance, Marketing, Misc Expense
- **No platform orders** — no commission/GST/delivery deductions (net = amount always)

## Conventions
- All styling is inline CSS-in-JS (no external stylesheets)
- Currency: INR
- Cache key prefix: qm_
- Primary color: #0369a1 (sky blue)
- Sync is debounced at 1.5s
- Simpler form than cloud kitchen (no platform fields)
