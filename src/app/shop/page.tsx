import type { Metadata } from "next";
import { createMetadata } from "@/../lib/metadata";
import dynamic from "next/dynamic";

const ClientShopPage = dynamic(() => import("@/components/Shop/SweetflipsShop"), { ssr: false });

export const metadata: Metadata = createMetadata({
  title: "Sweetflips Shop",
  description: "Browse and buy using your tokens",
  path: "/shop",
});

export default function Page() {
  return <ClientShopPage />;
}
