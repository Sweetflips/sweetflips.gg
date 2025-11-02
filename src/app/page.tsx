import { Metadata } from "next";
import Homepage from "@/components/Homepage/Homepage";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "Sweetflips",
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
