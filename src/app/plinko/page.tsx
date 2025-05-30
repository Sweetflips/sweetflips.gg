import { createMetadata } from "@/../lib/metadata";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

// Dynamically import your client component
const ClientPlinkoPage = dynamic(() => import("@/components/Plinko/Plinko"), { ssr: false });

export const metadata: Metadata = createMetadata({
  title: "Sweetflips Plinko",
  description: "Play our token-based Plinko game and win rewards!",
  path: "/plinko",
  image: "https://sweetflips.gg/images/cover/Sweetflips_Plinko.png",
});

export default function Page() {
  return <ClientPlinkoPage />;
}
