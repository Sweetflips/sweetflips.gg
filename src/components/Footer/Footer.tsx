import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#130C1A] py-8 md:py-12 text-gray-300">
      <div className="mx-auto max-w-screen-lg px-4 flex flex-col items-center gap-6 text-center">
        {/* 1. Logo */}
        <Link href="/" className="inline-block">
          <Image
            src="/images/logo/sweet_flips_logo_white.png"
            alt="SweetFlips"
            width={48}
            height={48}
            className="h-12 w-12"
          />
        </Link>

        {/* 2. Legal Links */}
        <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
          <Link href="/terms-of-service" className="text-gray-300 hover:text-primary transition-colors duration-200 underline underline-offset-4">
            Terms of Service
          </Link>
          <span className="text-gray-600">|</span>
          <Link href="/privacy-policy" className="text-gray-300 hover:text-primary transition-colors duration-200 underline underline-offset-4">
            Privacy Policy
          </Link>
          <span className="text-gray-600">|</span>
          <Link href="/cookie-policy" className="text-gray-300 hover:text-primary transition-colors duration-200 underline underline-offset-4">
            Cookie Policy
          </Link>
        </div>

        {/* 3. Copyright Text */}
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Sweetflips Holdings Limited. All Rights Reserved.
        </p>

        {/* 4. Social Icons */}
        <div className="flex justify-center gap-5">
          <a href="https://www.instagram.com/sweetflips" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors duration-200">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.7-12 26.7-26.7 26.7s-26.7-12-26.7-26.7 12-26.7 26.7-26.7 26.7 12 26.7 26.7zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9 26.3 26.2 58 34.4 93.9 36.2 37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
            </svg>
          </a>
          <a href="https://www.youtube.com/@SweetFlips" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors duration-200">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 576 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/>
            </svg>
          </a>
          <a href="https://x.com/sweetflips_gg" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors duration-200">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="https://kick.com/sweetflips" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors duration-200">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M147.3 114.4c0-56.2-32.5-82.4-73.4-82.4C26.2 32 0 68.2 0 113.4v283c0 47.3 25.3 83.4 74.9 83.4 39.8 0 72.4-25.6 72.4-83.4v-76.5l112.1 138.3c22.7 27.2 72.1 30.7 103.2 0 27-27.6 27.3-67.4 7.4-92.2l-90.8-114.8 74.9-107.4c17.4-24.7 17.5-63.1-10.4-89.8-30.3-29-82.4-31.6-113.6 12.8L147.3 185v-70.6z"/>
            </svg>
          </a>
        </div>

        {/* 5. Company Address */}
        <p className="text-xs text-gray-500">
          Sweetflips Holdings Limited | Capital Business Centre, Entrance A, Floor 1, Triq Taz-Zwejt, San Gwann, SGN 3000, Malta
        </p>

        {/* 6. Restricted Territories Notice */}
        <p className="text-xs text-gray-500 max-w-xl font-medium">
          This website does not target residents of the Netherlands, United Arab Emirates (UAE), or any jurisdiction where online gambling is prohibited. We comply with all applicable gambling laws and regulations.
        </p>

        {/* 7. Disclaimer Text */}
        <p className="text-xs text-gray-500 max-w-xl">
          We do not take responsibility for any losses from gameplay on casinos and entertainment websites promoted on our site. Please bet responsibly and only bet or wager with money you can afford to lose and do not chase your losses. Follow the jurisdictional law in accordance with your location before registering. Gambling can be addictive - please play responsibly.
        </p>

        {/* 8. 18+ Notice */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-gray-500 text-[10px] font-bold">
            18+
          </span>
          <span>This website is intended for adults only.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
