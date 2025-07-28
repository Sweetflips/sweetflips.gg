import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import EmpireDropLeaderboard from "@/components/EmpireDrop/EmpireDropLeaderbord";

export const metadata: Metadata = {
  title:
    "LuxDrop Leaderboard",
  description: "LuxDrop Leaderboard",
};

export default function LuxDrop() {
  return (
    <>
      <DefaultLayout>
        <EmpireDropLeaderboard />
      </DefaultLayout>
    </>
  );
}