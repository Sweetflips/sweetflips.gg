import DefaultLayout from "@/components/Layouts/DefaultLayout";
import RazedLeaderboard from "@/components/Razed/RazedLeaderboard";
import { createMetadata } from "@/lib/metadata";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const imageUrl = `/images/cover/Razed_Leaderboard_50k.png`;

  return createMetadata({
    title: "$50,000 Razed Leaderboard | SweetFlips",
    description: "$50,000 Razed Leaderboard - Compete for $50,000 in monthly prizes. Each month, $50,000 is distributed among 25 users based on their total wagered amount on Razed.",
    path: "/razed",
    image: imageUrl,
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
