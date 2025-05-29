import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SweetflipsShop from "@/components/Shop/SweetflipsShop";

export const metadata: Metadata = {
  title:
    "Shop",
  description: "Sweetflips Shop",
};

export default function Shop() {
  return (
    <>
      <DefaultLayout>
        <SweetflipsShop />
      </DefaultLayout>
    </>
  );
}
