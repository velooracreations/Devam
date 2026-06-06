/**
 * DEVAM BARCODE STRUCTURE
 * AAA BB CCC DD EEE C
 * 
 * AAA = Country Code (890 for India)
 * BB = Manufacturing Year (e.g., 26 for 2026)
 * CCC = SKU Number (Auto increment 001, 002...)
 * DD = Product Category (e.g., 01 for Flour)
 * EEE = Product Code (e.g., 001 for Ghavu Lot)
 * C = Validation Check Digit
 */

export const COUNTRY_CODE = "890";

// Calculates the Modulo 10 Check Digit for EAN/UCC standard-like formats
export function calculateCheckDigit(barcodeWithoutCheckDigit: string): string {
  let oddSum = 0;
  let evenSum = 0;

  // Reading from right to left of the payload (reverse iteration)
  // For standard 13-digit payloads calculating the 14th digit:
  for (let i = barcodeWithoutCheckDigit.length - 1; i >= 0; i--) {
    const digit = parseInt(barcodeWithoutCheckDigit[i], 10);
    // In standard GS1, odd positions (starting from right) multiply by 3
    if ((barcodeWithoutCheckDigit.length - i) % 2 === 1) {
      oddSum += digit * 3;
    } else {
      evenSum += digit * 1;
    }
  }

  const totalSum = oddSum + evenSum;
  const nextMultipleOf10 = Math.ceil(totalSum / 10) * 10;
  const checkDigit = nextMultipleOf10 - totalSum;

  return checkDigit.toString();
}

export function generateBarcode(
  year: string,
  sku: string,
  category: string,
  productCode: string
): string {
  // Ensure lengths are correct
  const formattedYear = year.slice(-2); // Take last 2 digits, e.g., '2026' -> '26'
  const formattedSku = sku.padStart(3, '0');
  const formattedCat = category.padStart(2, '0');
  const formattedProd = productCode.padStart(3, '0');

  const payload = `${COUNTRY_CODE}${formattedYear}${formattedSku}${formattedCat}${formattedProd}`;
  
  const checkDigit = calculateCheckDigit(payload);
  
  return `${payload}${checkDigit}`;
}

export function getNextSku(currentMaxSku: string | null): string {
  if (!currentMaxSku) return "001";
  
  const nextVal = parseInt(currentMaxSku, 10) + 1;
  return nextVal.toString().padStart(3, '0');
}
