"use client";
import React from "react";
import { withAuth } from '@/components/withAuth';
import YoutubeSlider from "@/components/YoutubeSlider/YoutubeSlider";
import TopLeaderboard from "@/components/TopLeaderboard/TopLeaderboard";
import HomeBanner from "@/components/HomeBanner/HomeBanner";
// import Footer from "@/components/Footer/Footer"; // Removed Footer import
import RegisterBlocks from "@/components/RegisterBlocks/RegisterBlocks";
import BannerVideo from "@/components/BannerVideo/BannerVideo";
import BannerImage from "@/components/BannerImage/BannerImage";
import GiveAwayCounter from "../GiveAwayCounter/GiveAwayCounter";
import Image from 'next/image';
import RaffleTicketBanner from "../RaffleTicketBanner/RaffleTicketBanner";


const Homepage: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-1 rounded-2xl h-auto">
        {/* Floating Image */}
  {/* <div className="floating-image1 animate-rotating">
  <Image
    src="/images/icon/Razed_coin.png"
    alt="Razed Coin"
    className="h-25 w-25"
    width={100}
    height={100}
  />
  </div>
  <div className="floating-image2 animate-line3">
  <Image
    src="/images/icon/Razed_card.png"
    alt="Razed Coin"
    className="h-30 w-30"
    width={120}
    height={120}
  />
  </div>
  <div className="floating-image3 animate-line3">
  <Image
    src="/images/icon/Razed_777.png"
    alt="Razed Slot777"
    className="h-30 w-30"
    width={120}
    height={200}
  />
  </div> */}
        <div className="col-span-12 xl:col-span-8">
          <BannerVideo />
          {/* <BannerImage /> */}
          <HomeBanner />
          <RaffleTicketBanner />
          <RegisterBlocks />
          <GiveAwayCounter />
          <TopLeaderboard />
          {/* <YoutubeSlider /> */}
          {/* <div className="mt-4"><Footer /></div> */} {/* Removed Footer component instance */}
        </div>
      </div>
    </>
  );
};

export default (Homepage);
