'use client';
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import { AuthProvider } from "@/contexts/AuthContext";
import { TokenProvider } from "@/contexts/TokenContext"; // ✅ Import your new TokenProvider
import { LinkAccountProvider } from "@/components/LinkAccountProvider/LinkAccountProvider";
import ChatBubbleWrapper from "@/components/Chat/ChatBubbleWrapper";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className="flex flex-col min-h-screen dark:text-bodydark SidebarBg"> {/* Moved classes here */}
      <AuthProvider>
        <TokenProvider>
          <LinkAccountProvider>
            {/* Removed intermediate div */}
            {loading ? <Loader /> : (
              <>
                {children}
                <ChatBubbleWrapper />
              </>
            )}
          </LinkAccountProvider>
        </TokenProvider>
      </AuthProvider>
      </body>
    </html>
  );
}