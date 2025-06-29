"use client";

import { useEffect } from "react";
import { useToken } from "@/contexts/TokenContext";
import Image from "next/image";
import Link from "next/link";

export default function ShopTokenBar() {
  const { tokenBalance, refreshTokenBalance } = useToken();

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "REFRESH_TOKEN_BALANCE") {
        refreshTokenBalance(); // 👈 Instant refresh, no throttle
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [refreshTokenBalance]);

  const handleTokensLinkClick = () => {
    const event = new CustomEvent("navigate-to-tokens-tab");
    window.dispatchEvent(event);
  };

  if (tokenBalance === null) return null;

  return (
    <div className="flex w-full items-center justify-center sm:justify-start">
      {" "}
      {/* Changed justify-center to sm:justify-start and added items-center */}
      <div className="flex items-center overflow-hidden rounded-lg bg-[#130c1a] text-white shadow-lg">
        {" "}
        {/* Main container for token balance */}
        <div className="flex items-center gap-2 px-4 py-2">
          {" "}
          {/* Adjusted padding, bg is now on parent */}
          <Image
            src="/images/logo/sweetflips_coin.png"
            alt="Token Icon"
            width={20}
            height={20}
            className="rounded-full"
          />
          <span className="text-sm font-semibold sm:text-base">
            {tokenBalance.toFixed(2)}
          </span>
        </div>
      </div>
      {/* Removed the old divider and structure for the + button */}
      {/* New "Add Coin" button, styled like header buttons */}
      <Link
        href="/account#tokens"
        aria-label="Add Tokens"
        onClick={handleTokensLinkClick}
        className="ml-2 flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-sweetflipsPanel text-white transition hover:shadow-lg hover:shadow-primary/40"
      >
        <span className="text-2xl font-bold">+</span>{" "}
        {/* Making the plus icon larger and bold */}
      </Link>
    </div>
  );
}
