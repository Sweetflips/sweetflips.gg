import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Homepage from "@/components/Homepage/Homepage";

export const metadata: Metadata = {
  title:
    "Sweetflips",
  description: "",
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
