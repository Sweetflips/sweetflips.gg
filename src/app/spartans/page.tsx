import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SpartansLeaderboard from "@/components/Spartans/SpartansLeaderboard";
import { createMetadata } from "@/lib/metadata";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  // Note: Keep using Razed cover image until Spartans replacement is provided
  const imageUrl = `/images/cover/Razed_Leaderboard_50k.png`;

  return createMetadata({
    title: "$75,000 SPARTANS X SWEETFLIPS LEADERBOARD | SweetFlips",
    description: "$75,000 SPARTANS X SWEETFLIPS LEADERBOARD - Compete for $75,000 in monthly prizes. Each month, $75,000 is distributed among 25 users based on their total wagered amount on Spartans.",
    path: "/spartans",
    image: imageUrl,
  });
}

export default function Spartans() {
  return (
    <>
      <DefaultLayout>
        <SpartansLeaderboard />
      </DefaultLayout>
    </>
  );
}
