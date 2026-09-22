"use client";

import React, { useState } from "react";
import { Order, OrderStatus } from "@/store/orderStore";
import { 
  Check, 
  Clock, 
  Calendar, 
  Truck, 
  Package, 
  PackageCheck, 
  Send, 
  ExternalLink, 
  Copy, 
  CheckCheck,
  MapPin
} from "lucide-react";

interface OrderTimelineProps {
  order: Order;
}

const STEP_DEFINITIONS = [
  {
    key: "orderPlaced" as const,
    label: "Order Placed",
    description: "Order placed & verified in system",
    stepIndex: 1,
    icon: Package,
  },
  {
    key: "confirmed" as const,
    label: "Order Confirmed",
    description: "Quality inspected & packed at Devam Mill",
    stepIndex: 2,
    icon: Check,
  },
  {
    key: "shipped" as const,
    label: "Order Shipped",
    description: "Handed over to logistics courier partner",
    stepIndex: 3,
    icon: Truck,
  },
  {
    key: "outForDispatch" as const,
    label: "Out for Dispatch",
    description: "Delivery executive out for final drop-off",
    stepIndex: 4,
    icon: Send,
  },
  {
    key: "delivered" as const,
    label: "Order Delivered",
    description: "Delivered to customer's destination address",
    stepIndex: 5,
    icon: PackageCheck,
  },
];

function getStatusIndex(status: OrderStatus): number {
  switch (status) {
    case "Order Placed":
      return 1;
    case "Confirmed":
      return 2;
    case "Shipped":
      return 3;
    case "Out for Dispatch":
      return 4;
    case "Delivered":
      return 5;
    default:
      return 1;
  }
}

function formatTimestamp(isoString?: string): { dateStr: string; timeStr: string } | null {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    const dateStr = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { dateStr, timeStr };
  } catch {
    return null;
  }
}

export default function OrderTimeline({ order }: OrderTimelineProps) {
  const currentStep = getStatusIndex(order.status);
  const timeline = order.timeline || {};
  const [copiedTracking, setCopiedTracking] = useState(false);

  const handleCopyTracking = (trackingId: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(trackingId);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  return (
    <div className="w-full bg-stone-50/80 border border-stone-200/90 rounded-xl p-4 sm:p-5 mt-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-devam-red)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-devam-red)]"></span>
          </div>
          <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-stone-900">
            Order Status & Real-Time Timeline
          </h4>
        </div>
        <span
          className={`text-[11px] font-bold px-3 py-1 rounded-full border shadow-2xs ${
            order.status === "Delivered"
              ? "bg-emerald-100 text-emerald-900 border-emerald-300"
              : order.status === "Out for Dispatch"
              ? "bg-purple-100 text-purple-900 border-purple-300"
              : order.status === "Shipped"
              ? "bg-indigo-100 text-indigo-900 border-indigo-300"
              : order.status === "Confirmed"
              ? "bg-blue-100 text-blue-900 border-blue-300"
              : "bg-amber-100 text-amber-900 border-amber-300"
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Mini Progress Bar for Instant Glance (Works Great on Mobile & Desktop) */}
      <div className="mb-6 px-1">
        <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 mb-1.5">
          <span>Step {currentStep} of 5</span>
          <span>{Math.round((currentStep / 5) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 via-[var(--color-devam-red)] to-emerald-600 transition-all duration-500 rounded-full"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Detailed Vertical Stepper with Date & Time for all 5 Milestones */}
      <div className="space-y-0">
        {STEP_DEFINITIONS.map((step, idx) => {
          const isPassed = step.stepIndex < currentStep;
          const isCurrent = step.stepIndex === currentStep;
          const isUpcoming = step.stepIndex > currentStep;
          const isLast = idx === STEP_DEFINITIONS.length - 1;

          // Determine timestamp for this milestone
          let rawTimestamp: string | undefined = timeline[step.key];
          if (!rawTimestamp && step.key === "orderPlaced") {
            rawTimestamp = order.date;
          }
          if (!rawTimestamp && isPassed) {
            rawTimestamp = timeline.orderPlaced || order.date;
          }

          const formatted = formatTimestamp(rawTimestamp);
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative flex items-start gap-3 sm:gap-4 pb-7 last:pb-1">
              {/* Continuous vertical connector line */}
              {!isLast && (
                <div
                  className={`absolute left-4 sm:left-[18px] top-8 bottom-0 w-0.5 -ml-px transition-colors ${
                    isPassed
                      ? "bg-emerald-500"
                      : isCurrent
                      ? "bg-gradient-to-b from-emerald-500 to-stone-300"
                      : "bg-stone-300"
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Node Icon */}
              <div
                className={`relative z-10 flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shadow-xs ${
                  isPassed
                    ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                    : isCurrent
                    ? "bg-[var(--color-devam-red)] text-white ring-4 ring-orange-200/80 shadow-md"
                    : "bg-white text-stone-500 border-2 border-stone-300"
                }`}
              >
                {isPassed ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Milestone Details */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <p
                      className={`text-xs sm:text-sm font-bold ${
                        isPassed
                          ? "text-stone-900"
                          : isCurrent
                          ? "text-[var(--color-devam-red)] font-extrabold"
                          : "text-stone-600"
                      }`}
                    >
                      {step.label}
                    </p>

                    {/* Step Status Badge */}
                    {isPassed && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        Completed
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                        In Progress
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="text-[10px] bg-stone-100 text-stone-600 font-semibold px-2 py-0.5 rounded border border-stone-200">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Explicit Date & Time Display (Mobile & Desktop) */}
                  {formatted ? (
                    <div className="mt-1 sm:mt-0 flex items-center gap-1.5 bg-white border border-stone-200/90 px-2.5 py-1 rounded-md shadow-2xs self-start sm:self-auto">
                      <Calendar className="w-3 h-3 text-stone-500 flex-shrink-0" />
                      <span className="text-[11px] sm:text-xs font-semibold text-stone-900 whitespace-nowrap">
                        {formatted.dateStr}
                      </span>
                      <span className="text-stone-300">•</span>
                      <Clock className="w-3 h-3 text-stone-500 flex-shrink-0" />
                      <span className="text-[11px] sm:text-xs font-bold text-[var(--color-devam-brown)] whitespace-nowrap">
                        {formatted.timeStr}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 sm:mt-0 inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-stone-500 italic bg-stone-100/80 px-2 py-0.5 rounded self-start sm:self-auto">
                      <Clock className="w-2.5 h-2.5 text-stone-400" />
                      <span>Pending update</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] sm:text-xs text-stone-600 mt-1">
                  {step.description}
                </p>

                {/* Additional Tracking Info for Shipped & Out for Dispatch */}
                {(step.key === "shipped" || step.key === "outForDispatch") && (isPassed || isCurrent) && order.trackingNumber && (
                  <div className="mt-2.5 p-2.5 bg-indigo-50/90 border border-indigo-200/80 rounded-lg flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-indigo-700 flex-shrink-0" />
                      <span className="text-xs text-indigo-950 font-medium">
                        Courier: <strong>{order.courierPartner || "SpeedPost"}</strong>
                      </span>
                      <span className="text-indigo-300">•</span>
                      <span className="text-xs font-mono font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                        {order.trackingNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(order.trackingNumber || "")}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 px-2 py-1 rounded transition-colors"
                        title="Copy tracking number"
                      >
                        {copiedTracking ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedTracking ? "Copied" : "Copy"}</span>
                      </button>

                      <a
                        href="https://www.indiapost.gov.in/_layouts/15/dpt.cept.trackconsignment/trackconsignment.aspx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded transition-colors"
                      >
                        <span>Track Live</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
