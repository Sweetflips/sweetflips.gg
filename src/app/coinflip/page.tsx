// src/app/coinflip/page.tsx
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { createMetadata } from "@/../lib/metadata";
import CoinflipLanding from "@/components/Coinflip/CoinflipLanding";

export const metadata: Metadata = createMetadata({
  title: "Sweetflips Coinflip",
  description: "Get ready to flip for sweet rewards!",
  path: "/coinflip",
});

export default function CoinflipPage() {
  return (
    <DefaultLayout>
      <CoinflipLanding />
    </DefaultLayout>
  );
}
