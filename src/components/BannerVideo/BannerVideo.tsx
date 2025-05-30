import React from "react";

const BannerVideo: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start rounded-4xl w-full max-w-7xl mx-auto h-auto px-4">
      <video
        className="w-full h-auto rounded-4xl object-cover"
        autoPlay
        muted
        loop
        playsInline
        style={{ backgroundColor: 'transparent', border: 'none' }}
      >
        <source src="../../videos/SweetflipsxRazed_Banner.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>
  );  
};

export default BannerVideo;
