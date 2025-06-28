import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { createMetadata } from "@/../lib/metadata";
import LuxdropLeaderboard from "@/components/Luxdrop/LuxdropLeaderboard"; // Corrected import

export const metadata: Metadata = createMetadata({
  title: "Luxdrop Leaderboard", // Corrected title
  description: "Luxdrop Leaderboard", // Corrected description
  path: "/luxdrop",
  image: "/images/cover/Luxdrop_Leaderboard.png", // Make sure this image exists
});

export default function LuxdropLeaderboardPage() { // Renamed function
  return (
    <>
      <DefaultLayout>
        <LuxdropLeaderboard />
      </DefaultLayout>
    </>
  );
}
