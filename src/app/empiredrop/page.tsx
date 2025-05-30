import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { createMetadata } from "@/../lib/metadata";
import EmpireDropLeaderboard from "@/components/EmpireDrop/EmpireDropLeaderbord";

export const metadata: Metadata = createMetadata({
  title: "EmpireDrop Leaderboard",
  description: "EmpireDrop Leaderboard",
  path: "/empiredrop",
  image: "/images/cover/Empire_Leaderboard.png",
});

export default function EmpireDrop() {
  return (
    <>
      <DefaultLayout>
        <EmpireDropLeaderboard />
      </DefaultLayout>
    </>
  );
}