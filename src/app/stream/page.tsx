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
        <div className="max-w-7xl mx-auto px-4 py-6 text-white">
        {/* <h2 className="text-4xl font-bold text-center text-white mb-6">Stream Info</h2> */} {/* Removed Stream Info header */}

        <h2 className="text-3xl font-bold text-center text-white mt-6 mb-6">Weekly Stream Schedule</h2>
        {/* StreamScheduleTabs full width */}
        <div className=""> {/* Removed mt-6 mb-6 as header now handles spacing */}
          <StreamScheduleTabs />
        </div>
          {/* <div className="w-full flex justify-center md:items-stretch">
            <div className="bg-[radial-gradient(at_top_center,_#350c4a_0%,_#130C1A_60%)] border border-graydark rounded-xl p-4 shadow-card max-w-fit md:w-full flex justify-center">
              <Image
                src="/images/user/Peter_Gym.png"
                alt="Stream Schedule Banner"
                width={330}
                height={600}
                className="rounded-xl object-cover"
              />
            </div>
          </div> */}
        {/* </div> */} {/* This closing div was likely mismatched with the commented section, removing it or ensuring it matches structure */}

        <h2 className="text-3xl font-bold text-center text-white mt-12 mb-6">Stream Leaderboard</h2>
        {/* BotrixLeaderboard full width below */}
        <div className=""> {/* Removed mt-6 as header now handles spacing */}
          <BotrixLeaderboard />
        </div>

        <h2 className="text-3xl font-bold text-center text-white mt-12 mb-6">Big Wins</h2> {/* Changed text-4xl to text-3xl */}
        <BigWins />
        {/* <Footer /> */} {/* Removed Footer component instance */}
        </div>
      </DefaultLayout>
    </>
  );
}