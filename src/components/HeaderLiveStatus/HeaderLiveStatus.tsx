'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function HeaderLiveStatus() {
  const [isLive, setIsLive] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('https://kick.com/api/v2/channels/sweetflips');
        const data = await res.json();
        setIsLive(data.livestream?.is_live ?? false);
      } catch (err) {
        console.error('Failed to fetch Kick live status:', err);
        setIsLive(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLive === null) return null;

  return (
    <Link
      href="https://kick.com/sweetflips"
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full px-4 mt-1"
    >
      <div
        className={`
          flex items-center justify-center gap-2 text-sm font-semibold px-3 py-1 rounded-full transition-all duration-300
          ${isLive
            ? 'bg-green-500/20 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)] hover:shadow-[0_0_15px_rgba(34,197,94,0.8)]'
            : 'bg-red-500/10 text-red-400 hover:brightness-110 opacity-70'}
        `}
      >

        {/* Live Dot */}
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            backgroundColor: isLive ? '#22c55e' : '#ef4444',
            boxShadow: isLive ? '0 0 8px #22c55e' : 'none',
          }}
        />
        {/* SVG ICON */}
        <svg
          className="w-3 h-3 fill-current"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M37 .036h164.448v113.621h54.71v-56.82h54.731V.036h164.448v170.777h-54.73v56.82h-54.711v56.8h54.71v56.82h54.73V512.03H310.89v-56.82h-54.73v-56.8h-54.711v113.62H37V.036z" />
        </svg>
        {/* Text */}
        {isLive ? 'Live' : 'Offline'}
      </div>
    </Link>
  );
}