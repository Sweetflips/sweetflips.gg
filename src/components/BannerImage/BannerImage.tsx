import React from "react";
import Image from 'next/image';


const BannerImage: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start rounded-xl mx-auto w-full sm:w-3/4 md:w-5/6 h-auto">
     <Image
    src="/images/cover/Sweetflips_Team_Banner.png"
    alt="Sweetflips Team Image"
    className="rounded-xl"
    width={1920}
    height={1080}
  />

    </div>
  );
};

export default BannerImage;
