import { Metadata } from "next";
import Homepage from "@/components/Homepage/Homepage";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "SweetFlips | Entertainment & Gaming Content",
  description: "SweetFlips - Your destination for entertainment and gaming content. Operated by Sweetflips Holdings Limited, Malta.",
};

export default function Home() {
  return (
    <>
      <DefaultLayout>
        <Homepage />
      </DefaultLayout>
    </>
  );
}
