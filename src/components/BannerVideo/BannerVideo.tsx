import React from "react";

const BannerVideo: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start rounded-4xl w-full max-w-7xl mx-auto h-auto px-2 sm:px-4">
      <video
        className="w-full h-auto rounded-4xl object-cover 
                   max-h-[200px] sm:max-h-[300px] md:max-h-[400px] lg:max-h-[500px] xl:max-h-[600px]
                   min-h-[150px] sm:min-h-[200px]"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        loading="lazy"
        poster="/images/cover/Homepage_Banner.png"
        style={{ 
          backgroundColor: 'transparent', 
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          WebkitBoxShadow: 'none',
          MozBoxShadow: 'none',
          objectFit: 'cover',
          objectPosition: 'center'
        }}
      >
        <source src="/videos/Banner_V6.mov" type="video/quicktime" />
        <source src="/videos/Homepage_Banner.mp4" type="video/mp4" />
        <source src="/videos/SweetflipsxRazed_Banner.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>
  );  
};

export default BannerVideo;
