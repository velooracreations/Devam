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
          displayValue: false, // We render the custom formatted text below
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

  return (
    <div
      className={`shipping-label-a5-root bg-white text-black font-sans leading-tight ${className}`}
      style={{
        width: "100%",
        maxWidth: "138mm",
        margin: "0 auto",
        boxSizing: "border-box",
        fontSize: "11px",
        color: "#000",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          border: "2px solid #000",
          width: "100%",
          boxSizing: "border-box",
          backgroundColor: "#fff",
        }}
      >
        {/* 1. Header: Devam Logo (top left) + Brand Name & Subtext + Payment Method Badge */}
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
                  color: "#444",
                  marginTop: "2px",
                  fontWeight: "600",
                }}
              >
                Shreeji Gruh Udhyog, Jhalod, Gujarat | www.thedevam.com
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
            }}
          >
            {isCod ? "C.O.D" : "PREPAID"}
          </div>
        </div>

        {/* 2. Order Metadata: Order ID, Date & Time, Total Amount */}
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
            <strong>Order ID:</strong> {order.id}
          </div>
          <div>
            <strong>Date &amp; Time:</strong> {formattedDateTime}
          </div>
          <div>
            <strong>Amount:</strong> ₹{order.totalAmount}
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
                fontWeight: "bold",
                color: "#555",
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
                fontWeight: "bold",
                color: "#555",
                textTransform: "uppercase",
                marginBottom: "4px",
                letterSpacing: "0.5px",
              }}
            >
              SHIP FROM:
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
              Dahod, Gujarat-389170, India
            </div>
            <div
              style={{
                marginTop: "4px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#000",
              }}
            >
              📞 +91 99796 40900
            </div>
          </div>
        </div>

        {/* 4. Product Information Section */}
        <div style={{ borderBottom: "2px solid #000", padding: "8px 12px" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: "900",
              color: "#333",
              textTransform: "uppercase",
              marginBottom: "5px",
              letterSpacing: "0.5px",
            }}
          >
            PACKAGE CONTENTS / ORDER ITEMS:
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
                <th style={{ padding: "4px 6px", fontWeight: "bold", width: "28px", textAlign: "center" }}>
                  #
                </th>
                <th style={{ padding: "4px 6px", fontWeight: "bold" }}>
                  Product Name
                </th>
                <th style={{ padding: "4px 6px", fontWeight: "bold", width: "70px", textAlign: "center" }}>
                  Variant
                </th>
                <th style={{ padding: "4px 6px", fontWeight: "bold", width: "40px", textAlign: "center" }}>
                  Qty
                </th>
                <th style={{ padding: "4px 6px", fontWeight: "bold", width: "65px", textAlign: "right" }}>
                  Price
                </th>
                <th style={{ padding: "4px 6px", fontWeight: "bold", width: "65px", textAlign: "right" }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px dotted #ccc" }}>
                    <td style={{ padding: "4px 6px", textAlign: "center" }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: "4px 6px", fontWeight: "600" }}>
                      {item.name}
                    </td>
                    <td style={{ padding: "4px 6px", textAlign: "center", color: "#555" }}>
                      {item.weight || "-"}
                    </td>
                    <td style={{ padding: "4px 6px", textAlign: "center", fontWeight: "bold" }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: "4px 6px", textAlign: "right" }}>
                      ₹{item.price}
                    </td>
                    <td style={{ padding: "4px 6px", textAlign: "right", fontWeight: "bold" }}>
                      ₹{item.price * item.quantity}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: "6px", textAlign: "center", color: "#666" }}>
                    Items details recorded in order system
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "1.5px solid #000", fontWeight: "bold", background: "#fafafa" }}>
                <td colSpan={3} style={{ padding: "5px 6px", textAlign: "right" }}>
                  Total Items: {totalQuantity}
                </td>
                <td style={{ padding: "5px 6px", textAlign: "center" }}>
                  {totalQuantity}
                </td>
                <td style={{ padding: "5px 6px", textAlign: "right" }}>
                  Total:
                </td>
                <td style={{ padding: "5px 6px", textAlign: "right", fontSize: "11.5px" }}>
                  ₹{order.totalAmount}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 5. Barcode & Logistics Section */}
        <div style={{ padding: "10px 12px", textAlign: "center", backgroundColor: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
            <svg ref={barcodeRef} style={{ maxHeight: "40px", maxWidth: "260px" }}></svg>
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "900",
              fontFamily: "monospace",
              letterSpacing: "4px",
              color: "#000",
            }}
          >
            {order.id}
          </div>
          <div style={{ fontSize: "8.5px", color: "#666", marginTop: "4px" }}>
            System Generated Shipping Label | Devam © {new Date().getFullYear()} | www.thedevam.com
          </div>
        </div>
      </div>
    </div>
  );
}
