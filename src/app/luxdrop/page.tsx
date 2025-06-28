import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { createMetadata } from "@/../lib/metadata";
import LuxdropLeaderboard from "@/components/Luxdrop/LuxdropLeaderboard";

export const metadata: Metadata = createMetadata({
  title: "Luxdrop Leaderboard",
  description: "Luxdrop Leaderboard",
  path: "/luxdrop",
  image: "/images/cover/Luxdrop_Leaderboard.png",
});

export default function Luxdrop() {
  return (
    <>
      <DefaultLayout>
        <LuxdropLeaderboard />
      </DefaultLayout>
    </>
  );
}
