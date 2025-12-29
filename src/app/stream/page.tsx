import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import BigWins from "@/components/BigWins/BigWins";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Stream Info",
  description: "Stream Information",
  path: "/stream",
});

export default function Stream() {
  return (
    <>
      <DefaultLayout>
        <div className="max-w-7xl mx-auto px-4 py-6 text-white">
        <h2 className="text-3xl font-bold text-center text-white mt-6 mb-6">Big Wins</h2>
        <BigWins />
        </div>
      </DefaultLayout>
    </>
  );
}
