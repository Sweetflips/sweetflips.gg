import React from "react";
import "@/css/style.css";
import Image from "next/image";

const Footer: React.FC = () => {
  return (
    <div className="FooterBg mx-auto w-full max-w-7xl rounded-xl p-6 transition-all">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        {/* Logo */}
        <div className="flex flex-shrink-0 justify-center xl:justify-start">
          <Image
            src="/images/logo/site_logo.png"
            alt="Sweetflips Logo"
            className="h-24 w-48"
            width={192}
            height={96}
          />
        </div>

        {/* Text */}
        <div className="mx-auto max-w-2xl text-center text-sm text-white xl:text-left">
          <b>© 2025 Sweetflips. All rights reserved.</b>
          <br />
          We do not take responsibility for any losses from gameplay on casinos
          and entertainment websites promoted on our site. Please bet
          responsibly and only bet or wager with money you can afford to lose
          and do not chase your losses. Follow the jurisdictional law in
          accordance with your location before registering.
        </div>

        {/* Social Icons */}
        <div className="order-last flex w-full justify-center xl:order-none xl:w-auto xl:justify-end">
          <div className="flex flex-wrap gap-4">
            <a
              className="p-2 transition-transform hover:scale-110"
              target="_blank"
              href="https://www.instagram.com/sweetflips"
            >
              <svg
                stroke="currentColor"
                fill="white"
                strokeWidth="0"
                viewBox="0 0 448 512"
                height="1.5em"
                width="1.5em"
              >
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9
                S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1
                0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7
                74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0
                14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8
                26.8-26.8 26.8 12 26.8 26.8zM398.8 388c-7.8
                19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1
                9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1
                s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7
                42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6
                132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7
                29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
              </svg>
            </a>
            <a
              className="p-2 transition-transform hover:scale-110"
              target="_blank"
              href="https://www.youtube.com/@SweetFlips"
            >
              <svg
                stroke="currentColor"
                fill="white"
                strokeWidth="0"
                viewBox="0 0 576 512"
                height="1.5em"
                width="1.5em"
              >
                <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597
                C458.781 64 288 64 288 64S117.22 64 74.629
                75.486c-23.497 6.322-42.003 24.947-48.284
                48.597C14.933 166.95 14.933 256.388 14.933
                256.388s0 89.438 11.412 132.305c6.281
                23.65 24.787 41.5 48.284 47.821C117.22 448
                288 448 288 448s170.78 0 213.371-11.486c23.497-6.321
                42.003-24.171 48.284-47.821 11.412-42.867
                11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zM232.145
                337.591V175.185l142.739 81.205-142.739
                81.201z" />
              </svg>
            </a>
            <a
              className="p-2 transition-transform hover:scale-110"
              target="_blank"
              href="https://twitchtracker.com/sweetflipslive"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.5em"
                height="1.5em"
                fill="white"
                viewBox="0 0 16 16"
              >
                <path d="M3.857 0 1 2.857v10.286h3.429V16l2.857-2.857H9.57L14.714 8V0zm9.714
                7.429-2.285 2.285H9l-2 2v-2H4.429V1.143h9.142z" />
              <path d="M11.857 3.143h-1.143V6.57h1.143zm-3.143
                0H7.571V6.57h1.143z" />
              </svg>
            </a>
            <a
              className="p-2 transition-transform hover:scale-110"
              target="_blank"
              href="https://twitter.com/_SweetFlips"
            >
              <svg
                stroke="currentColor"
                fill="white"
                strokeWidth="0"
                viewBox="0 0 512 512"
                height="1.5em"
                width="1.5em"
              >
                <path d="M459.37 151.716c.325 4.548.325 9.097.325
                13.645 0 138.72-105.583 298.558-298.558
                298.558-59.452 0-114.68-17.219-161.137-47.106
                8.447.974 16.568 1.299 25.34 1.299 49.055 0
                94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772
                6.498.974 12.995 1.624 19.818
                1.624 9.421 0 18.843-1.3
                27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299
                c13.969 7.797 30.214 12.67 47.431
                13.319-28.264-18.843-46.781-51.005-46.781-87.391
                0-19.492 5.197-37.36 14.294-52.954
                51.655 63.675 129.3 105.258 216.365
                109.807-1.624-7.797-2.599-15.918-2.599-24.04
                0-57.828 46.782-104.934 104.934-104.934
                30.213 0 57.502 12.67
                76.67 33.137 23.715-4.548
                46.456-13.32 66.599-25.34-7.798
                24.366-24.366 44.833-46.132 57.827
                21.117-2.273 41.584-8.122
                60.426-16.243-14.292 20.791-32.161
                39.308-52.628 54.253z" />
              </svg>
            </a>
            <a
              className="p-2 transition-transform hover:scale-110"
              target="_blank"
              href="https://kick.com/sweetflips"
            >
              <svg
                stroke="currentColor"
                fill="white"
                strokeWidth="0"
                viewBox="0 0 384 512"
                height="1.5em"
                width="1.5em"
              >
                <path d="M147.3 114.4c0-56.2-32.5-82.4-73.4-82.4C26.2
                32 0 68.2 0 113.4v283c0 47.3 25.3 83.4 74.9
                83.4 39.8 0 72.4-25.6 72.4-83.4v-76.5l112.1
                138.3c22.7 27.2 72.1 30.7 103.2
                0 27-27.6 27.3-67.4
                7.4-92.2l-90.8-114.8 74.9-107.4c17.4-24.7
                17.5-63.1-10.4-89.8-30.3-29-82.4-31.6-113.6
                12.8L147.3 185v-70.6z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
