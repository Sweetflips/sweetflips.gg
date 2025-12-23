'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'sweetflips_cookie_consent';

type ConsentStatus = 'pending' | 'accepted' | 'rejected';

export default function CookieConsent() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('pending');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (storedConsent === 'accepted' || storedConsent === 'rejected') {
      setConsentStatus(storedConsent as ConsentStatus);
      setIsVisible(false);
    } else {
      // Small delay before showing banner for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setConsentStatus('accepted');
    setIsVisible(false);
    // Enable analytics/tracking cookies here if needed
    enableCookies();
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    setConsentStatus('rejected');
    setIsVisible(false);
    // Disable/remove non-essential cookies
    disableCookies();
  };

  const enableCookies = () => {
    // This is where you would initialize analytics, etc.
    // For example: gtag consent update
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted',
      });
    }
  };

  const disableCookies = () => {
    // Remove non-essential cookies
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
      });
    }
  };

  if (!isVisible || consentStatus !== 'pending') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
      <div className="mx-auto max-w-4xl rounded-xl bg-[#1a1025] border border-gray-700 shadow-2xl p-4 md:p-6">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Cookie Preferences</h3>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-300">
            We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
            By clicking &quot;Accept All&quot;, you consent to our use of cookies. You can manage your preferences 
            or learn more in our{' '}
            <Link href="/cookie-policy" className="text-primary hover:underline">
              Cookie Policy
            </Link>
            .
          </p>

          {/* Cookie Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 rounded-lg bg-gray-800/50 p-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-gray-300">Essential (Required)</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-800/50 p-3">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-300">Analytics</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-800/50 p-3">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <span className="text-gray-300">Marketing</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={handleReject}
              className="flex-1 rounded-lg border border-gray-600 bg-transparent px-6 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            >
              Reject Non-Essential
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Accept All Cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export a hook to check consent status
export function useCookieConsent(): ConsentStatus {
  const [status, setStatus] = useState<ConsentStatus>('pending');

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored === 'accepted' || stored === 'rejected') {
      setStatus(stored as ConsentStatus);
    }
  }, []);

  return status;
}
