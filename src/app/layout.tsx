'use client';
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Analytics } from '@vercel/analytics/next';
import { BotIdClient } from 'botid/client';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body suppressHydrationWarning={true} className="flex flex-col min-h-screen dark:text-bodydark SidebarBg">
        {loading ? <Loader /> : children}
        <Analytics />
        <BotIdClient
          protect={[
            { path: '/api/*', method: 'POST' },
            { path: '/api/*', method: 'GET' },
          ]}
        />
      </body>
    </html>
  );
}
