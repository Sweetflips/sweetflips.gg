import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { createMetadata } from "@/../lib/metadata";
import RazedLeaderboard from "@/components/Razed/RazedLeaderboard";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const imageUrl = `/images/cover/Razed_Leaderboard.png?v=50k-v2`;
  
  return createMetadata({
    title: "$50,000 Razed Leaderboard | Sweetflips",
    description: "$50,000 Razed Leaderboard - Compete for $50,000 in monthly prizes. Each month, a total of $50,000 is distributed across 25 users based on their total wagered amount.",
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
