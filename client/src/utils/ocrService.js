import Tesseract from 'tesseract.js';

/**
 * Extracts structured receipt details from raw OCR text using regex heuristics
 */
export function parseReceiptText(rawText) {
  if (!rawText) return { merchant: '', amount: '', date: '', category: '' };

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Merchant Heuristic: first non-empty line with letters, avoiding generic words
  let merchant = '';
  const genericWords = /tax|invoice|bill|receipt|cash|memo|welcome|gstin|gst|tel|phone|date/i;
  for (const line of lines) {
    if (line.length >= 3 && !genericWords.test(line)) {
      merchant = line.replace(/[^a-zA-Z0-9\s&.,'-]/g, '').trim();
      break;
    }
  }

  // 2. Amount Heuristic: look for total / amount lines or largest figure
  let amount = '';
  const totalRegex = /(?:total|grand\s*total|net\s*amount|amount\s*payable|balance\s*due|bill\s*amount)[\s:₹Rs.INR$]*([0-9,]+(?:\.[0-9]{2})?)/i;
  
  for (const line of lines) {
    const match = line.match(totalRegex);
    if (match && match[1]) {
      const cleanVal = match[1].replace(/,/g, '');
      if (!isNaN(cleanVal) && parseFloat(cleanVal) > 0) {
        amount = parseFloat(cleanVal).toFixed(2);
        break;
      }
    }
  }

  // Fallback to currency pattern like ₹ 4,520.00 or Rs. 4520
  if (!amount) {
    const currencyRegex = /(?:₹|Rs\.?|INR|\$)\s*([0-9,]+(?:\.[0-9]{2})?)/i;
    for (const line of lines) {
      const match = line.match(currencyRegex);
      if (match && match[1]) {
        const cleanVal = match[1].replace(/,/g, '');
        if (!isNaN(cleanVal) && parseFloat(cleanVal) > 0) {
          amount = parseFloat(cleanVal).toFixed(2);
          break;
        }
      }
    }
  }

  // 3. Date Heuristic: match common Indian/ISO formats
  let date = '';
  const dateRegex = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/i;
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match && match[1]) {
      date = match[1];
      break;
    }
  }

  // 4. Category Heuristic
  let category = 'Other';
  const textLower = rawText.toLowerCase();
  if (/hotel|room|inn|stay|resort|lodge/i.test(textLower)) {
    category = 'Lodging & Hotel';
  } else if (/flight|airline|airfare|boarding|airport|ticket/i.test(textLower)) {
    category = 'Air Travel';
  } else if (/cafe|coffee|restaurant|dinner|lunch|food|meal|bar/i.test(textLower)) {
    category = 'Meals & Dining';
  } else if (/cab|taxi|uber|ola|auto|transit/i.test(textLower)) {
    category = 'Local Transit';
  }

  return { merchant, amount, date, category };
}

/**
 * Runs local Tesseract OCR on a file or data URL with live progress
 */
export async function scanReceiptWithOCR(imageSource, onProgress) {
  try {
    const result = await Tesseract.recognize(imageSource, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      }
    });

    const rawText = result.data.text || '';
    const confidence = Math.round(result.data.confidence || 0);
    const parsed = parseReceiptText(rawText);

    return {
      success: true,
      rawText,
      confidence,
      ...parsed
    };
  } catch (err) {
    console.error('OCR Error:', err);
    return {
      success: false,
      error: err.message || 'Failed to scan image',
      rawText: '',
      confidence: 0,
      merchant: '',
      amount: '',
      date: '',
      category: ''
    };
  }
}

/**
 * Sample Pre-Built Indian Business Receipts for 1-Click Viva Demo
 */
export const SAMPLE_RECEIPTS = [
  {
    id: 'sample-hotel',
    name: '🏨 Hotel Taj Coromandel, Chennai',
    merchant: 'Taj Coromandel Luxury Stay',
    amount: '4520.00',
    date: '18/10/2026',
    category: 'Lodging & Hotel',
    confidence: 96,
    rawText: `TAJ COROMANDEL CHENNAI
37 Mahatma Gandhi Road, Nungambakkam, Chennai 600034
GSTIN: 33AAACT1984K1Z2
TAX INVOICE - GUEST FOLIO #TC-88912
Guest: Arvind (Zylker Enterprise)
Room 412 - Deluxe Corporate Suite
Date: 18/10/2026

Room Charges (1 Night):        ₹ 3,800.00
CGST @ 9%:                     ₹   342.00
SGST @ 9%:                     ₹   342.00
Dinner Room Service:           ₹    36.00
-----------------------------------------
TOTAL AMOUNT PAYABLE:          ₹ 4,520.00
Payment Method: Corporate Direct Bill
STATUS: PAID IN FULL`
  },
  {
    id: 'sample-flight',
    name: '✈️ IndiGo Airlines (MAA ➔ BOM)',
    merchant: 'IndiGo Airlines E-Ticket',
    amount: '8650.00',
    date: '15/10/2026',
    category: 'Air Travel',
    confidence: 98,
    rawText: `INTERGLOBE AVIATION LIMITED (INDIGO)
Central Wing, Terminal 1, Chennai Airport (MAA)
GSTIN: 07AAACI1036H1Z0
PASSENGER ITINERARY RECEIPT / TAX INVOICE
Booking PNR: 6E-ZYL748
Date of Issue: 15/10/2026

Passenger: Arvind
Flight 6E-512 | MAA (Chennai) -> BOM (Mumbai)
Seat: 12F (Corporate Flexi Plus)

Base Airfare:                  ₹ 7,200.00
Passenger Service Fee:         ₹   450.00
K-Tax & Fuel Surcharge:        ₹   500.00
GST @ 5%:                      ₹   500.00
-----------------------------------------
GRAND TOTAL:                   ₹ 8,650.00
Payment Status: Confirmed`
  },
  {
    id: 'sample-cafe',
    name: '☕ Cafe Coffee Day Client Meet',
    merchant: 'Cafe Coffee Day',
    amount: '850.00',
    date: '19/10/2026',
    category: 'Meals & Dining',
    confidence: 92,
    rawText: `CAFE COFFEE DAY
Anna Nagar 2nd Avenue, Chennai - 600040
CIN: L55101KA1993PLC014463
TAX INVOICE / CASH MEMO
Date: 19/10/2026   Time: 16:42
Table: 04   Server: Ramesh

2x Classic Cappuccino King:    ₹   420.00
1x Smoked Chicken Sandwich:    ₹   260.00
1x Blueberry Cheesecake:       ₹   170.00
-----------------------------------------
TOTAL BILL AMOUNT:             ₹   850.00
CGST & SGST (5%): INCLUDED
Thank you for visiting CCD!`
  }
];

