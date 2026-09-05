"use client";
import { useEffect } from "react";

export default function ReferralTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      // Save for 30 days
      const expires = new Date();
      expires.setTime(expires.getTime() + (30 * 24 * 60 * 60 * 1000));
      document.cookie = `fp_ref=${ref};expires=${expires.toUTCString()};path=/`;
      console.log("🤝 Referral code captured:", ref);
    }
  }, []);
  return null;
}