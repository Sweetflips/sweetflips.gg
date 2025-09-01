import { createMetadata } from "@/../lib/metadata";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

// Dynamically import your client component
const ClientPlinkoPage = dynamic(() => import("@/components/Plinko/Plinko"), { ssr: false });

export const metadata: Metadata = createMetadata({
  title: "Sweetflips Plinko",
  description: "Play our token-based Plinko game and win rewards! Keep in mind that all bets are no real bets and testing only.",
  path: "/plinko",
  image: "https://sweetflips.gg/images/cover/Sweetflips_Plinko.png",
});

export default function Page() {
  return <ClientPlinkoPage />;
}
