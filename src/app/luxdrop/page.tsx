import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { createMetadata } from "@/../lib/metadata";
import LuxDropAffiliates from "@/components/Luxdrop/LuxDropAffiliates";

export const metadata: Metadata = createMetadata({
  title: "LuxDrop Affiliates",
  description: "View affiliate data and statistics for LuxDrop.",
  path: "/luxdrop",
  image: "/images/cover/Luxdrop_Leaderboard.png",
});

export default function LuxdropPage() {
  return (
    <>
      <DefaultLayout>
        <LuxDropAffiliates />
      </DefaultLayout>
    </>
  );
}
