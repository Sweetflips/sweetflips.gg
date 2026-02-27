import React from "react";
import Image from "next/image";

const BannerVideo = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start rounded-4xl w-full max-w-7xl mx-auto h-auto px-2 sm:px-4">
      <div className="w-full h-auto rounded-4xl object-cover 
                   max-h-[200px] sm:max-h-[300px] md:max-h-[400px] lg:max-h-[500px] xl:max-h-[600px]
                   min-h-[150px] sm:min-h-[200px] relative">
        <Image
          src="/images/cover/Homepage_Banner.png"
          alt="SweetFlips Banner"
          width={1920}
          height={600}
          className="w-full h-auto rounded-4xl object-cover"
          style={{ 
            backgroundColor: 'transparent', 
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            WebkitBoxShadow: 'none',
            MozBoxShadow: 'none',
            objectFit: 'cover',
            objectPosition: 'center',
            mixBlendMode: 'lighten'
          }}
          priority
        />
      </div>
    </div>
  );  
};

export default BannerVideo;
