'use client';

import { useEffect } from 'react';
import { useToken } from '@/contexts/TokenContext';
import Image from 'next/image';
import Link from 'next/link';

export default function ShopTokenBar() {
  const { tokenBalance, refreshTokenBalance } = useToken();

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'REFRESH_TOKEN_BALANCE') {
        refreshTokenBalance(); // 👈 Instant refresh, no throttle
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [refreshTokenBalance]);

  if (tokenBalance === null) return null;

  return (
    <div className="w-full flex justify-center sm:justify-center">
      <div className="flex items-center overflow-hidden rounded-xl border border-[#9925FE] bg-[#1a1120] shadow-lg text-white">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#130c1a]">
          <Image
            src="/images/logo/sweetflips_coin.png"
            alt="Token Icon"
            width={20}
            height={20}
            className="rounded-full"
          />
          <span className="font-semibold text-sm sm:text-base">
            {tokenBalance.toFixed(2)}
          </span>
        </div>
        <div className="h-6 w-px bg-[#9925FE] mx-2" />
        <Link
          href="/account#tokens"
          className="bg-[#9925FE] hover:opacity-90 text-white text-xs sm:text-sm px-4 py-2 rounded-r-xl transition"
        >
          +
        </Link>
      </div>
    </div>
  );
}