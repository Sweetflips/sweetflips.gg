import React from "react";

const BannerVideo = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start rounded-4xl w-full max-w-7xl mx-auto h-auto px-2 sm:px-4">
      <div
        className="relative w-full overflow-hidden rounded-4xl bg-[radial-gradient(ellipse_at_center,_#3a1357_0%,_#130c1a_75%)] aspect-[3.2/1] min-h-[150px] sm:min-h-[200px]"
      >
        <video
          src="/Banner Home.webm"
          autoPlay
          loop
          muted
          playsInline
          className="block h-full w-full rounded-4xl object-cover mix-blend-screen bg-transparent"
          style={{
            objectFit: "cover",
            objectPosition: "center",
            mixBlendMode: "screen",
            backgroundColor: "transparent",
          }}
          aria-label="SweetFlips Banner"
        />
      </div>
    </div>
  );
};

export default BannerVideo;
