import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
// import Footer from "@/components/Footer/Footer"; // Removed Footer import
import Image from "next/image";
import BotrixLeaderboard from "@/components/BotrixLeaderboard/BotrixLeaderboard";
import BigWins from "@/components/BigWins/BigWins";
import { createMetadata } from "@/../lib/metadata";
import StreamScheduleTabs from "@/components/StreamScheduleTabs/StreamScheduleTabs";

export const metadata: Metadata = createMetadata({
  title: "Stream Info",
  description: "Stream Information",
  path: "/stream",
});

export default function Stream() {
  return (
    <>
      <DefaultLayout>
        <div className="p-6 text-white">
        <h2 className="text-4xl font-bold text-center text-white">Stream Info</h2>
        <div className="mx-auto mt-6 grid max-w-[95vw] grid-cols-1 gap-6 px-4 sm:px-6 md:max-w-5xl lg:max-w-7xl xl:grid-cols-2">
        <div className="flex flex-col h-full">
  <StreamScheduleTabs />
  <div className="mt-4 flex justify-center">
    <Image
      src="/images/user/Peter_Gym.png"
      alt="Stream Schedule Banner"
      width={330}
      height={600}
      className="rounded-xl object-cover"
    />
  </div>
</div>


  <div className="flex flex-col h-full">
    <BotrixLeaderboard />
  </div>
</div>
        </div>
        <h2 className="text-4xl font-bold text-center text-white">Big Wins!</h2>
        <BigWins />
        {/* <Footer /> */} {/* Removed Footer component instance */}
      </DefaultLayout>
    </>
  );
}