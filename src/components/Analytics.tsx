"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export function Analytics() {
  const [consentGranted, setConsentGranted] = useState(false);
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-DEVAM2026IN";

  useEffect(() => {
    // Check initial stored consent
    const consent = localStorage.getItem("devam_cookie_consent");
    if (consent === "all") {
      setConsentGranted(true);
    }

    const handleConsentUpdate = (e: any) => {
      if (e?.detail?.level === "all") {
        setConsentGranted(true);
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("consent", "update", {
            analytics_storage: "granted",
          });
        }
      }
    };

    window.addEventListener("devam_cookie_consent_updated", handleConsentUpdate);
    return () => window.removeEventListener("devam_cookie_consent_updated", handleConsentUpdate);
  }, []);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('consent', 'default', {
              'analytics_storage': '${consentGranted ? "granted" : "denied"}',
              'ad_storage': 'denied'
            });
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}
