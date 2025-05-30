import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { createMetadata } from "@/../lib/metadata";
import RazedLeaderboard from "@/components/Razed/RazedLeaderboard";

export const metadata: Metadata = createMetadata({
  title: "Razed Leaderboard",
  description: "Razed Leaderboard",
  path: "/razed",
  image: "/images/cover/Razed_Leaderboard.png",
});

export default function Razed() {
  return (
    <>
      <DefaultLayout>
        <RazedLeaderboard />
      </DefaultLayout>
    </>
  );
}
