import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CsgowinLeaderboard from "@/components/Csgowin/CsgowinLeaderboard";
import { createMetadata } from "@/lib/metadata";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return createMetadata({
    title: "25,000 CSGOWIN X SWEETFLIPS LEADERBOARD | SweetFlips",
    description: "25,000 CSGOWIN X SWEETFLIPS LEADERBOARD - Compete for 25,000 in monthly prizes. Each month, 25,000 coins are distributed among 10 users based on their total wagered amount on CSGOWIN.",
    path: "/csgowin",
  });
}

export default function Csgowin() {
  return (
    <>
      <DefaultLayout>
        <CsgowinLeaderboard />
      </DefaultLayout>
    </>
  );
}
