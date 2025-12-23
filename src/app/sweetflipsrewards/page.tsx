import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { createMetadata } from "@/lib/metadata";
import Link from "next/link";

export const metadata: Metadata = createMetadata({
  title: "SweetFlipsRewards | SweetFlips",
  description: "Learn more about SweetFlipsRewards and how to earn rewards",
  path: "/sweetflipsrewards",
});

export default function SweetFlipsRewardsPage() {
  return (
    <>
      <DefaultLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-white">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">SweetFlipsRewards</h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 px-2">
              Your gateway to exclusive rewards and benefits
            </p>
          </div>

          <div className="bg-[radial-gradient(at_top_center,_#350c4a_0%,_#130C1A_60%)] border border-graydark rounded-xl p-4 sm:p-6 lg:p-8 shadow-card mb-8 relative">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">About SweetFlipsRewards</h2>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  SweetFlipsRewards is our exclusive rewards program designed to give back to our community.
                  Earn points, unlock special perks, and enjoy exclusive benefits as you engage with SweetFlips.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">How It Works</h2>
                <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-sm sm:text-base text-gray-300">
                  <li>Participate in leaderboards and competitions</li>
                  <li>Earn points through various activities</li>
                  <li>Redeem rewards for exclusive perks</li>
                  <li>Unlock special bonuses and benefits</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">Get Started</h2>
                <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">
                  Visit SweetFlipsRewards to learn more and start earning rewards today!
                </p>
                <Link
                  href="https://www.sweetflipsrewards.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 w-full sm:w-auto justify-center"
                >
                  Visit SweetFlipsRewards.com
                  <svg
                    className="ml-2 w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Video Section - Responsive positioning */}
            <div className="mt-6 sm:mt-0 sm:absolute sm:bottom-4 sm:right-4">
              <div className="w-full sm:w-48 lg:w-64 rounded-xl overflow-hidden shadow-lg mx-auto sm:mx-0">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                  controls
                >
                  <source src="/images/logo/IMG_3904.MP4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}
