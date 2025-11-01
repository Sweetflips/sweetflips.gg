import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { createMetadata } from "@/../lib/metadata";
import RazedLeaderboard from "@/components/Razed/RazedLeaderboard";

export async function generateMetadata(): Promise<Metadata> {
  return createMetadata({
    title: "50k Razed Leaderboard",
    description: "50k Razed Leaderboard - Compete for $50,000 in monthly prizes",
    path: "/razed",
    image: "/images/cover/Razed_Leaderboard.png",
  });
}

export default function Razed() {
  return (
    <>
      <DefaultLayout>
        <RazedLeaderboard />
      </DefaultLayout>
    </>
  );
}
