"use client";
import React from "react";

const TeamVideo: React.FC = () => {
  return (
    
    <div className="flex items-center justify-center mx-auto w-full sm:w-3/4 md:w-1/1 h-1/5 text-center mt-8">
      <div className="w-full rounded-xl flex flex-col justify-center items-center my-auto">
      <div className="w-full p-4 flex flex-col justify-center items-center my-auto">
        <video
          className="w-full h-auto rounded-xl"
          controls
          autoPlay
          muted
          loop
        >
          <source src="../../videos/sweetflipsxroobet.mp4" type="video/mp4" />
        </video>
      </div>
      </div>
    </div>
    
      
  );
};

export default TeamVideo;
