"use client";

import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { Order } from "@/store/orderStore";

interface ShippingLabelA5Props {
  order: Order;
  className?: string;
}

/**
 * Format Indian mobile number to match Shreeji style: +91 XXXXX XXXXX
 */
export function formatIndianPhone(phone?: string): string {
  if (!phone) return "N/A";
  
  // Extract all digit characters
  const digits = phone.replace(/\D/g, "");
  
  // If user entered 91XXXXXXXXXX (12 digits), strip the leading 91
  const tenDigits =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length > 10
      ? digits.slice(-10)
      : digits;

  if (tenDigits.length === 10) {
    return `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`;
  }

  // If already starts with +91 and has 10 digits
  if (phone.trim().startsWith("+91")) {
    const raw = phone.replace(/[^\d]/g, "");
    const last10 = raw.slice(-10);
    if (last10.length === 10) {
      return `+91 ${last10.slice(0, 5)} ${last10.slice(5)}`;
    }
  }

  return phone;
}

/**
 * Cleans customer name and phone out of the shipping address if duplicate
 */
export function cleanShippingAddress(
  addr?: string,
  customerName?: string,
  customerPhone?: string
): string {
  if (!addr) return "Address not available";
  let cleaned = addr.trim();

  // If customerName is provided and address starts with customerName
  if (customerName && customerName.trim()) {
    const trimmedName = customerName.trim();
    if (cleaned.toLowerCase().startsWith(trimmedName.toLowerCase())) {
      cleaned = cleaned.slice(trimmedName.length).trim();
    }
  }

  // Remove phone in parentheses like (8488880327) or (+91 8488880327)
  cleaned = cleaned.replace(/\s*\(\+?[\d\s-]{10,13}\)\s*/g, " ").trim();

  // If customer phone digits are inside, strip them
  if (customerPhone) {
    const rawDigits = customerPhone.replace(/\D/g, "");
    if (rawDigits.length >= 10) {
      const ten = rawDigits.slice(-10);
      cleaned = cleaned.replace(new RegExp(`\\(?\\+?\\d*\\s*${ten}\\)?`, "g"), " ").trim();
    }
  }

  // Remove leading separators like " — ", " - ", ": ", ", "
  cleaned = cleaned.replace(/^[\s\(\)\-\—\–\,\:]+/, "").trim();

  return cleaned || addr;
}

/**
 * Format order date and time: e.g. 24/9/2026, 12:35 AM
 */
export function formatOrderDateTime(dateStr?: string): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const dateFormatted = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  const timeFormatted = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).toUpperCase();

  return `${dateFormatted}, ${timeFormatted}`;
}

/**
 * Intelligently ensures product name has a proper suffix (e.g. Flour, Atta, Masala, Grain)
 */
export function formatProductNameWithSuffix(rawName?: string, category?: string, weight?: string): string {
  if (!rawName) return "Devam Food Product";
  const name = rawName.trim();
  const lower = name.toLowerCase();

  // If already has descriptive suffix like Atta, Flour, Masala, Spices, Grain, Dal, Powder, Oil
  if (
    lower.includes("atta") ||
    lower.includes("flour") ||
    lower.includes("masala") ||
    lower.includes("spice") ||
    lower.includes("grain") ||
    lower.includes("powder") ||
    lower.includes("oil")
  ) {
    return name;
  }

  // Exact mappings for Devam products
  const SUFFIX_MAP: Record<string, string> = {
    "makkai": "Makkai Flour (Atta)",
    "jowar": "Jowar Flour (Atta)",
    "bajri": "Bajri Flour (Atta)",
    "ragi": "Ragi Flour (Atta)",
    "wheat": "Sharbati Wheat Flour (Atta)",
    "sharbati": "Sharbati Wheat Flour (Atta)",
    "chana": "Chana Dal Flour (Besan)",
    "besan": "Pure Besan (Gram Flour)",
    "haldi": "Haldi Powder (Turmeric Masala)",
    "turmeric": "Pure Turmeric Powder",
    "mirchi": "Lal Mirchi Powder (Chilli Masala)",
    "dhaniya": "Dhaniya Jeera Powder (Coriander Cumin Masala)",
    "garam": "Special Garam Masala",
  };

  if (SUFFIX_MAP[lower]) {
    return SUFFIX_MAP[lower];
  }

  // Category based fallback
  if (category && category.toLowerCase().includes("flour")) {
    return `${name} Flour (Atta)`;
  }
  if (category && category.toLowerCase().includes("spice")) {
    return `${name} Masala`;
  }
  if (category && category.toLowerCase().includes("grain")) {
    return `${name} Whole Grain`;
  }

  // Default fallback for single-word food items
  return `${name} Flour (Atta)`;
}

export function ShippingLabelA5({ order, className = "" }: ShippingLabelA5Props) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && order.id) {
      try {
        JsBarcode(barcodeRef.current, order.id, {
          format: "CODE128",
          lineColor: "#000",
          width: 1.8,
          height: 38,
          displayValue: false, // We render the custom formatted monospace text below
          margin: 0,
        });
      } catch (err) {
        console.warn("JsBarcode error in ShippingLabelA5:", err);
      }
    }
  }, [order.id]);

  const isCod =
    order.paymentMethod.toLowerCase().includes("cash") ||
    order.paymentMethod.toLowerCase().includes("cod");

  const cleanedAddress = cleanShippingAddress(
    order.shippingAddress,
    order.customerName,
    order.customerPhone
  );

  const formattedCustomerPhone = formatIndianPhone(order.customerPhone);
  const formattedDateTime = formatOrderDateTime(order.date);

  const totalQuantity =
    order.items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 1;

  // Calculate Subtotal and Delivery / Shipping Fee breakdown
  const itemsSubtotal = (order.items || []).reduce(
    (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)),
    0
  );
  const grandTotal = Number(order.totalAmount || itemsSubtotal);
  const deliveryCharge = Math.max(0, grandTotal - itemsSubtotal);

  return (
    <div
      className={`shipping-label-a5-root bg-white text-black font-sans leading-tight ${className}`}
      style={{
        width: "100%",
        maxWidth: "138mm",
        minHeight: "196mm",
        margin: "0 auto",
        boxSizing: "border-box",
        fontSize: "11px",
        color: "#000",
        backgroundColor: "#ffffff",
        border: "2px solid #000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* TOP SECTION: Header, Metadata, Ship To / Ship From                       */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0 }}>
        {/* 1. Header: Devam Logo + Brand Title + Tax Invoice Subtitle + Payment Badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #000",
            padding: "8px 12px",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src="/logo.svg"
              alt="Devam Logo"
              style={{
                height: "44px",
                width: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  lineHeight: "1.15",
                }}
              >
                DEVAM ATTA &amp; SPICES
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: "#333",
                  marginTop: "2px",
                  fontWeight: "700",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                TAX INVOICE &amp; SHIPPING LABEL | www.thedevam.com
              </div>
            </div>
          </div>
          <div
            style={{
              border: "2.5px solid #000",
              padding: "5px 12px",
              fontSize: "15px",
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: "1px",
              whiteSpace: "nowrap",
              backgroundColor: isCod ? "#fff" : "#f2f2f2",
            }}
          >
            {isCod ? "C.O.D" : "PREPAID"}
          </div>
        </div>

        {/* 2. Order Metadata: Order ID, Date & Time, Payment Mode */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #000",
            background: "#f9f9f9",
            padding: "6px 12px",
            fontSize: "11px",
          }}
        >
          <div>
            <strong>Order ID:</strong> <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>{order.id}</span>
          </div>
          <div>
            <strong>Date &amp; Time:</strong> {formattedDateTime}
          </div>
          <div>
            <strong>Payment Mode:</strong> {isCod ? "Cash on Delivery" : (order.paymentMethod || "Prepaid Online")}
          </div>
        </div>

        {/* 3. Address Section: Ship To (Cleaned) and Ship From */}
        <div
          style={{
            display: "flex",
            borderBottom: "2px solid #000",
            padding: "10px 12px",
          }}
        >
          {/* SHIP TO */}
          <div
            style={{
              flex: 1,
              borderRight: "2px solid #000",
              paddingRight: "12px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: "900",
                color: "#444",
                textTransform: "uppercase",
                marginBottom: "4px",
                letterSpacing: "0.5px",
              }}
            >
              SHIP TO:
            </div>
            <div style={{ fontSize: "14px", fontWeight: "900", color: "#000" }}>
              {order.customerName || "Customer"}
            </div>
            <div
              style={{
                marginTop: "4px",
                fontSize: "11px",
                lineHeight: "1.35",
                color: "#222",
              }}
            >
              {cleanedAddress}
            </div>
            <div
              style={{
                marginTop: "6px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#000",
              }}
            >
              📞 {formattedCustomerPhone}
            </div>
          </div>

          {/* SHIP FROM */}
          <div style={{ flex: 1, paddingLeft: "12px" }}>
            <div
              style={{
                fontSize: "10px",
                fontWeight: "900",
                color: "#444",
                textTransform: "uppercase",
                marginBottom: "4px",
                letterSpacing: "0.5px",
              }}
            >
              SHIP FROM / SOLD BY:
            </div>
            <div style={{ fontSize: "12px", fontWeight: "900", color: "#000" }}>
              SHREEJI GRUH UDHYOG
            </div>
            <div
              style={{
                marginTop: "2px",
                fontSize: "10.5px",
                lineHeight: "1.35",
                color: "#333",
              }}
            >
              Godown Plot No. 5-6, City Survey No. 3354,
              <br />
              Block 1/12, Nr. Market Yard, Jhalod,
              <br />
              Dahod, Gujarat - 389170, India
            </div>
            <div
              style={{
                marginTop: "4px",
                fontSize: "11px",
                color: "#333",
                fontWeight: "600",
              }}
            >
              FSSAI Lic. No.: <strong>10725008000026</strong>
            </div>
            <div
              style={{
                marginTop: "2px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#000",
              }}
            >
              📞 +91 99796 40900
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* BODY SECTION: Package Contents / Item Details (Flexible Invoice Body)     */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "10px 12px",
          borderBottom: "2px solid #000",
          backgroundColor: "#fff",
        }}
      >
        <div
          style={{
            fontSize: "10.5px",
            fontWeight: "900",
            color: "#111",
            textTransform: "uppercase",
            marginBottom: "6px",
            letterSpacing: "0.5px",
          }}
        >
          PACKAGE CONTENTS / PRODUCT DETAILS:
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "10.5px",
            textAlign: "left",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1.5px solid #000", background: "#f2f2f2" }}>
              <th style={{ padding: "5px 6px", fontWeight: "bold", width: "26px", textAlign: "center" }}>
                #
              </th>
              <th style={{ padding: "5px 6px", fontWeight: "bold" }}>
                Product Name &amp; Description
              </th>
              <th style={{ padding: "5px 6px", fontWeight: "bold", width: "70px", textAlign: "center" }}>
                Variant
              </th>
              <th style={{ padding: "5px 6px", fontWeight: "bold", width: "38px", textAlign: "center" }}>
                Qty
              </th>
              <th style={{ padding: "5px 6px", fontWeight: "bold", width: "65px", textAlign: "right" }}>
                Price (₹)
              </th>
              <th style={{ padding: "5px 6px", fontWeight: "bold", width: "65px", textAlign: "right" }}>
                Total (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => {
                const displayName = formatProductNameWithSuffix(item.name, (item as any).category, item.weight);
                const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);
                return (
                  <tr key={idx} style={{ borderBottom: "1px dotted #ccc" }}>
                    <td style={{ padding: "6px", textAlign: "center" }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: "6px", fontWeight: "600", fontSize: "11px" }}>
                      {displayName}
                    </td>
                    <td style={{ padding: "6px", textAlign: "center", color: "#555" }}>
                      {item.weight || "-"}
                    </td>
                    <td style={{ padding: "6px", textAlign: "center", fontWeight: "bold" }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: "6px", textAlign: "right" }}>
                      ₹{item.price}
                    </td>
                    <td style={{ padding: "6px", textAlign: "right", fontWeight: "bold" }}>
                      ₹{itemTotal}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                  Items details recorded in order system
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* BOTTOM SECTION: Total Items, Cost Breakdown, GST Incl, Barcode & Footer   */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0 }}>
        {/* 1. Price Accounting Breakdown (Explains product cost + delivery = total) */}
        <div style={{ padding: "8px 12px", backgroundColor: "#fafafa", borderBottom: "2px solid #000" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
            {/* Left: Total Items count & GST note */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#222" }}>
                Total Items: {order.items?.length || 1} &nbsp;|&nbsp; Total Quantity: {totalQuantity} Units
              </div>
              <div style={{ fontSize: "9px", color: "#444", marginTop: "3px", lineHeight: "1.4" }}>
                * All item prices and shipping charges are inclusive of <strong>GST (Goods &amp; Services Tax)</strong>.
              </div>
            </div>

            {/* Right: Transparent financial calculation */}
            <div style={{ width: "210px", fontSize: "10.5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: "#444" }}>
                <span>Items Subtotal:</span>
                <span style={{ fontWeight: "600" }}>₹{itemsSubtotal}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: "#444" }}>
                <span>Shipping &amp; Delivery:</span>
                <span style={{ fontWeight: "600" }}>
                  {deliveryCharge > 0 ? `₹${deliveryCharge}` : "FREE (₹0)"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0 2px 0",
                  borderTop: "1.5px solid #000",
                  marginTop: "2px",
                  fontSize: "12.5px",
                  fontWeight: "900",
                  color: "#000",
                }}
              >
                <span>Total Amount (GST incl.):</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Barcode & Logistics Identification Box */}
        <div style={{ padding: "10px 12px", textAlign: "center", backgroundColor: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
            <svg ref={barcodeRef} style={{ maxHeight: "38px", maxWidth: "260px" }}></svg>
          </div>
          <div
            style={{
              fontSize: "17px",
              fontWeight: "900",
              fontFamily: "monospace",
              letterSpacing: "4px",
              color: "#000",
            }}
          >
            {order.id}
          </div>
          <div style={{ fontSize: "8.5px", color: "#555", marginTop: "4px", letterSpacing: "0.2px" }}>
            System Generated Shipping Label &amp; Tax Invoice | Shreeji Gruh Udhyog © {new Date().getFullYear()} | www.thedevam.com
          </div>
        </div>
      </div>
    </div>
  );
}
