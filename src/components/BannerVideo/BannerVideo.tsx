import React from "react";

const BannerVideo = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start rounded-4xl w-full max-w-7xl mx-auto h-auto px-2 sm:px-4">
      <div className="w-full h-auto rounded-4xl object-cover overflow-hidden
                   max-h-[200px] sm:max-h-[300px] md:max-h-[400px] lg:max-h-[500px] xl:max-h-[600px]
                   min-h-[150px] sm:min-h-[200px] relative">
        <video
          src="/video/Banner_V6.webm"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto rounded-4xl object-cover"
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
          aria-label="SweetFlips Banner"
        />
      </div>
    </div>
  );
};

export default BannerVideo;
