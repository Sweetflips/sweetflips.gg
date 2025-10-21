"use client";
import Image from "next/image";
import React from "react";

const RegisterBlocks: React.FC = () => {
  return (
    <div className="mt-8 p-4 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center space-y-8 md:flex-row md:space-x-4 md:space-y-0">
        {/* Razed */}
        <a
          target="_blank"
          href="https://www.razed.com/signup/?raf=SweetFlips"
          className="w-full transition-transform duration-200 ease-in hover:scale-105 md:w-1/3"
        >
          <div className="RegisterBlocks-inner mx-2 flex h-44 flex-col justify-center rounded-lg border border-graydark p-4 text-center">
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
              Create an account on{" "}
              <a
                target="_blank"
                href="https://www.razed.com/signup/?raf=SweetFlips"
                className="font-extrabold text-[#4D4EE0]"
              >
                Razed
              </a>
              , click on register and use code sweetflips
            </p>
          </div>
        </a>

        {/* Luxdrop */}
        <a
          target="_blank"
          href="https://luxdrop.com/?r=sweetflips"
          className="w-full transition-transform duration-200 ease-in hover:scale-105 md:w-1/3"
        >
          <div className="RegisterBlocks-inner mx-2 flex h-44 flex-col justify-center rounded-lg border border-graydark p-4 text-center">
            <div className="flex justify-center">
              <Image
                src="/images/logo/Icon colored.png"
                alt="Luxdrop Logo"
                className=""
                width={80}
                height={80}
              />
            </div>
            <p className="mb-4 mt-4 text-sm">
              Use code sweetflips on every deposit you do on{" "}
              <a
                target="_blank"
                href="https://luxdrop.com/?r=sweetflips"
                className="font-extrabold text-[rgb(223,86,255)]"
              >
                Luxdrop
              </a>
            </p>
          </div>
        </a>

        {/* Kick */}
        <a
          target="_blank"
          href="https://kick.com/sweetflips"
          className="w-full transition-transform duration-200 ease-in hover:scale-105 md:w-1/3"
        >
          <div className="RegisterBlocks-inner mx-2 flex h-44 flex-col justify-center rounded-lg border border-graydark p-4 text-center">
            <div className="flex justify-center">
              <Image
                src="/images/logo/Kick_logo.png"
                alt="Kick Logo"
                width={100}
                height={56}
              />
            </div>
            <p className="mt-8 text-sm">
              Be active in chat earn Sweetflips coins to use in our Webshop!
            </p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default RegisterBlocks;
