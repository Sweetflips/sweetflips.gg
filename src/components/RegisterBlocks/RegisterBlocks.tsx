"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from 'next/image';

const RegisterBlocks: React.FC = () => {

  return (
    <div className="mt-8 p-4 text-white">
      <div className="flex flex-col items-center justify-center space-y-8 md:flex-row md:space-y-0 md:space-x-4 max-w-7xl mx-auto">
        <a target="_blank" href="https://www.razed.com/signup/?raf=SweetFlips" className="duration-200 ease-in hover:scale-105 transition-transform w-full md:w-1/3">
          <div className="h-44 rounded-lg RegisterBlocks-inner p-4 text-center border border-graydark flex flex-col justify-center mx-2">
            <div className="flex justify-center">
              <Image
                src="/images/logo/Razed_Logo.png"
                alt="Razed Logo"
                className=""
                width={240}
                height={106}
              />
            </div>
            <p className="mt-4 text-sm">
              Create an account on <a target="_blank" href="https://www.razed.com/signup/?raf=SweetFlips" className="text-[#4D4EE0] font-extrabold">Razed</a>, click on register and use code sweetflips
            </p>
          </div>
        </a>
  
        <a target="_blank" href="https://luxdrop.com/?r=sweetflips" className="duration-200 ease-in hover:scale-105 transition-transform w-full md:w-1/3">
          <div className="h-44 rounded-lg RegisterBlocks-inner p-4 text-center border border-graydark flex flex-col justify-center mx-2">
            <div className="flex justify-center">
              <div className="text-6xl font-bold text-purple-400">LuxDrop</div>
            </div>
            <p className="text-sm mt-4 mb-4">
              Use code sweetflips on every deposit you do on <a target="_blank" href="https://luxdrop.com/?r=sweetflips" className="text-[rgb(223,86,255)] font-extrabold">LuxDrop</a>
            </p>
          </div>
        </a>
  
        <a target="_blank" href="https://kick.com/sweetflips" className="duration-200 ease-in hover:scale-105 transition-transform w-full md:w-1/3">
          <div className="h-44 rounded-lg RegisterBlocks-inner p-4 text-center border border-graydark flex flex-col justify-center mx-2">
            <div className="flex justify-center">
              <Image
                src="/images/logo/Kick_logo.png"
                alt="Kick Logo"
                width={100}
                height={56}
              />
            </div>
            <p className="text-sm mt-8">
              Be active in chat earn Sweetflips coins to use in our Webshop!
            </p>
          </div>
        </a>
      </div>
    </div>
  );  
};

export default RegisterBlocks;