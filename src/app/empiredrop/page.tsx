import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import EmpireDropLeaderboard from "@/components/EmpireDrop/EmpireDropLeaderbord";

export const metadata: Metadata = {
  title:
    "EmpireDrop Leaderboard",
  description: "EmpireDrop Leaderboard",
};

export default function EmpireDrop() {
  return (
    <>
      <DefaultLayout>
        <EmpireDropLeaderboard />
      </DefaultLayout>
    </>
  );
}