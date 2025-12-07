"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const RegisterBlocks: React.FC = () => {
  const razedReferralCode = process.env.NEXT_PUBLIC_RAZED_REFERRAL_CODE || "SweetFlips";
  const luxdropAffiliateCode = process.env.NEXT_PUBLIC_LUXDROP_AFFILIATE_CODE || "sweetflips";
  const kickChannelUrl = process.env.NEXT_PUBLIC_KICK_CHANNEL_URL || "https://kick.com/sweetflips";
  const razedUrl = `https://www.razed.com/signup/?raf=${encodeURIComponent(razedReferralCode)}`;
  const luxdropUrl = `https://luxdrop.com/?r=${encodeURIComponent(luxdropAffiliateCode)}`;

  const callToActionText = "Sign up here or use code SweetFlips upon sign-up for a plethora of benefits.";

  return (
    <div className="mt-8 p-4 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Razed and LuxDrop Side by Side */}
        <div className="flex flex-col gap-8 md:flex-row md:gap-6">
          {/* Razed Section */}
          <div className="flex-1">
            <h2 className="mb-2 text-2xl font-bold text-black dark:text-white">Razed</h2>
            <p className="mb-4 text-base text-black dark:text-white">
              <Link
                href={razedUrl}
                target="_blank"
                className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded hover:underline"
              >
                Sign up here on Razed
              </Link>{" "}
              or{" "}
              <span className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">
                use code SweetFlips upon sign-up for a plethora of benefits.
              </span>
            </p>
            <Link
              href={razedUrl}
              target="_blank"
              className="block"
            >
              <div className="RegisterBlocks-inner flex flex-col justify-center rounded-lg border border-graydark bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-6 text-center shadow-lg">
                <div className="mb-4 flex justify-center">
                  <Image
                    src="/images/logo/Razed_Logo.png"
                    alt="Razed Logo"
                    width={240}
                    height={106}
                    className="h-auto w-auto"
                  />
                </div>
                <p className="text-sm text-white">
                  {callToActionText}
                </p>
              </div>
            </Link>
          </div>

          {/* LuxDrop Section */}
          <div className="flex-1">
            <h2 className="mb-2 text-2xl font-bold text-black dark:text-white">LuxDrop</h2>
            <p className="mb-4 text-base text-black dark:text-white">
              <Link
                href={luxdropUrl}
                target="_blank"
                className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded hover:underline"
              >
                Sign up here on LuxDrop
              </Link>{" "}
              or{" "}
              <span className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">
                use code SweetFlips upon sign-up for a plethora of benefits.
              </span>
            </p>
            <Link
              href={luxdropUrl}
              target="_blank"
              className="block"
            >
              <div className="RegisterBlocks-inner flex flex-col justify-center rounded-lg border border-graydark bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-6 text-center shadow-lg">
                <div className="mb-4 flex justify-center">
                  <Image
                    src="/images/logo/luxdrop_logo.svg"
                    alt="LuxDrop Logo"
                    width={280}
                    height={53}
                    className="h-auto w-auto"
                  />
                </div>
                <p className="text-sm text-white">
                  {callToActionText}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Kick Section */}
        <div className="mt-8">
          <Link
            href={kickChannelUrl}
            target="_blank"
            className="block w-full transition-transform duration-200 ease-in hover:scale-105"
          >
            <div className="RegisterBlocks-inner mx-auto flex max-w-md flex-col justify-center rounded-lg border border-graydark p-4 text-center">
              <div className="flex justify-center">
                <Image
                  src="/images/logo/Kick_logo.png"
                  alt="Kick Logo"
                  width={100}
                  height={56}
                />
              </div>
              <p className="mt-8 text-sm">
                Join the Kick stream, chat, and earn points to qualify for various rewards and special bonuses.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterBlocks;
