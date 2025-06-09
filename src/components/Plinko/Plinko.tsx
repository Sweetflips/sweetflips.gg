"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import "@/css/style.css";
import Loader from "../common/Loader";

export default function ClientPlinkoPage() {
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.status === 401) {
          router.push("/auth/signin");
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setTokenBalance(data.user.tokens);
      } catch (err) {
        console.error("User fetch failed:", err);
        router.push("/auth/signin");
      } finally {
        setLoading(false);
        setTimeout(() => setShowSplash(false), 5000);
      }
    };

    fetchUser();
  }, [router]);

  const iframeBaseUrl = process.env.NEXT_PUBLIC_PLINKO_IFRAME_URL || "";
  const iframeSrc =
    tokenBalance !== null ? `${iframeBaseUrl}${tokenBalance}` : "";

  return (
    <DefaultLayout>
      {showSplash ? (
        <div className="SidebarBg flex h-[80vh] items-center justify-center dark:text-bodydark">
          <Loader />
        </div>
      ) : (
        <div className="mx-auto min-h-[60vh] w-full max-w-6xl">
          <iframe
            src={iframeSrc}
            className="h-[900px] w-full rounded-xl sm:h-[1000px] md:h-[1000px] lg:h-[800px] [@media(min-height:1366px)]:h-[1200px]"
          />
        </div>
      )}
    </DefaultLayout>
  );
}
