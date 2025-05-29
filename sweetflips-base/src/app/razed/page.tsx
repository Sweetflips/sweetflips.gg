import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import RazedLeaderboard from "@/components/Razed/RazedLeaderboard";

export const metadata: Metadata = {
  title:
    "Razed Leaderboard",
  description: "Razed Leaderboard",
};

export default function Razed() {
  return (
    <>
      <DefaultLayout>
        <RazedLeaderboard />
      </DefaultLayout>
    </>
  );
}
