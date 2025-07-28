import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import LuxDropLeaderboard from "@/components/LuxDrop/LuxDropLeaderboard";

export const metadata: Metadata = {
  title:
    "LuxDrop Leaderboard",
  description: "LuxDrop Leaderboard",
};

export default function LuxDrop() {
  return (
    <>
      <DefaultLayout>
        <LuxDropLeaderboard />
      </DefaultLayout>
    </>
  );
}