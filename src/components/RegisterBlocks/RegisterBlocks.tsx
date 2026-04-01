"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const RegisterBlocks = () => {
  const spartansReferralCode = process.env.NEXT_PUBLIC_SPARTANS_REFERRAL_CODE || "SweetFlips";
  const luxdropAffiliateCode = process.env.NEXT_PUBLIC_LUXDROP_AFFILIATE_CODE || "sweetflips";
  const csgowinUrl = "https://csgowin.com/r/sweetflips";
  // REFLINK (promo codes are not available yet)
  const spartansUrl = process.env.NEXT_PUBLIC_SPARTANS_SIGNUP_URL || "https://go.aff.spartans.com/fqf5mmbm";
  const luxdropUrl = `https://luxdrop.com/?r=${encodeURIComponent(luxdropAffiliateCode)}`;

  const callToActionText = "Sign up here or use code SweetFlips upon sign-up for a plethora of benefits.";

  return (
    <div className="mt-8 p-4 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center space-y-8 md:flex-row md:space-x-4 md:space-y-0">
        {/* Spartans */}
        <Link
          target="_blank"
          href={spartansUrl}
          className="group w-full transition-transform duration-200 ease-in hover:scale-105 md:w-1/3"
        >
          <div className="RegisterBlocks-inner mx-2 flex h-44 flex-col justify-center rounded-lg border border-graydark p-4 text-center">
            <div className="relative flex justify-center">
              <Image
                src="/images/logo/Spartans wordmark.webp"
                alt="Spartans Logo"
                className="relative z-10 mb-3 transition-all duration-300 sm:mb-0"
                style={{ filter: 'grayscale(1)' }}
                width={280}
                height={53}
                priority
              />
              <Image
                src="/images/logo/Spartans wordmark.webp"
                alt="Spartans Logo Glow"
                className="absolute top-0 z-0 mb-3 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-40 sm:mb-0"
                style={{ filter: 'grayscale(1)' }}
                width={280}
                height={53}
                priority
              />
            </div>
            <p className="mb-4 mt-4 text-sm">
              {callToActionText}
            </p>
          </div>
        </Link>

        {/* LuxDrop */}
        <Link
          target="_blank"
          href={luxdropUrl}
          className="group w-full transition-transform duration-200 ease-in hover:scale-105 md:w-1/3"
        >
          <div className="RegisterBlocks-inner mx-2 flex h-44 flex-col justify-center rounded-lg border border-graydark p-4 text-center">
            <div className="relative flex justify-center">
              <Image
                src="/images/logo/luxdrop_logo.svg"
                alt="LuxDrop Logo"
                className="relative z-10 mb-3 transition-all duration-300 sm:mb-0"
                width={280}
                height={53}
                priority
              />
              <Image
                src="/images/logo/luxdrop_logo.svg"
                alt="LuxDrop Logo Glow"
                className="absolute top-0 z-0 mb-3 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-40 sm:mb-0"
                width={280}
                height={53}
                priority
              />
            </div>
            <p className="mb-4 mt-4 text-sm">
              {callToActionText}
            </p>
          </div>
        </Link>

        {/* CSGOWin */}
        <Link
          target="_blank"
          href={csgowinUrl}
          className="group w-full transition-transform duration-200 ease-in hover:scale-105 md:w-1/3"
        >
          <div className="RegisterBlocks-inner mx-2 flex h-44 flex-col justify-center rounded-lg border border-graydark p-4 text-center">
            <div className="relative flex items-center justify-center gap-3">
              <Image
                src="/images/logo/csgowin_logo.webp"
                alt="CSGOWin Logo"
                className="relative z-10"
                width={48}
                height={48}
                priority
              />
              <Image
                src="/images/logo/csgowin_wordmark.webp"
                alt="CSGOWin"
                className="relative z-10"
                width={200}
                height={48}
                priority
              />
              <Image
                src="/images/logo/csgowin_wordmark.webp"
                alt="CSGOWin Glow"
                className="absolute top-0 z-0 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-40"
                width={200}
                height={48}
                priority
              />
            </div>
            <p className="mb-4 mt-4 text-sm">
              {callToActionText}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default RegisterBlocks;
