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
    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm">
      <div className="rounded-lg bg-[#1a1025] border border-gray-700 shadow-2xl p-4">
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">Cookie Preferences</h3>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-300 leading-relaxed">
            We use cookies to enhance your experience.{' '}
            <Link href="/cookie-policy" className="text-primary hover:underline">
              Learn more
            </Link>
          </p>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              className="flex-1 rounded-md border border-gray-600 bg-transparent px-3 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90"
            >
              Accept
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
