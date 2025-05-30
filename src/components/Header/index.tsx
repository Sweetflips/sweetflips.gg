import Link from "next/link";
import DarkModeSwitcher from "./DarkModeSwitcher";
import DropdownMessage from "./DropdownMessage";
import DropdownNotification from "./DropdownNotification";
import DropdownUser from "./DropdownUser";
import Image from "next/image";
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { User, Shield } from "lucide-react";
import ShopTokenBar from '@/components/ShopTokenBar/ShopTokenBar';
import React from "react";
import { HeaderLiveStatus } from "../HeaderLiveStatus/HeaderLiveStatus";

const Header = (props: { sidebarOpen: string | boolean | undefined; setSidebarOpen: (arg0: boolean) => void; }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLive, setIsLive] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUserRole(data.user?.role || null);
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } catch (err) {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };
  
    checkAuth();
  }, []);   

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    // Fetch live status from the API
    // const fetchLiveStatus = async () => {
    //   try {
    //     // Fetch live status from the server-side API
    //     const response = await fetch('/api/getChannelInfo');
    //     const data = await response.json();
    //     setIsLive(data.isLive);
    //   } catch (error) {
    //     console.error('Error fetching live status:', error);
    //   }
    // };

    // fetchLiveStatus();
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    setIsAuthenticated(false);
  };

  return (
    <header className="sticky top-0 z-999 flex w-full bg-[#130C1A]">
      <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* <!-- Hamburger Toggle BTN --> */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-xl bg-[#9925FE] p-3.5"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-white delay-[0] duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!w-full delay-300"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-white delay-150 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "delay-400 !w-full"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-white delay-200 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!w-full delay-500"
                  }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-white delay-300 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!h-0 !delay-[0]"
                  }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-white duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!h-0 !delay-200"
                  }`}
                ></span>
              </span>
            </span>
          </button>
          {/* <!-- Hamburger Toggle BTN --> */}

          {/* <Link className="block flex-shrink-0 lg:hidden" href="/">
            <Image
              width={132}
              height={24}
              src={"/images/logo/site_logo.png"}
              alt="Logo"
            />
          </Link> */}
          {/* Mobile Logo */}
{/* <Link className="block flex-shrink-0 lg:hidden" href="/">
  <Image
    width={24}
    height={24}
    src="/images/logo/sweet_flips_logo_white.png"
    alt="Mobile Logo"
  />
</Link> */}

{/* Desktop Logo */}
<Link className="hidden lg:block flex-shrink-0" href="/">
  <Image
    width={160}
    height={32}
    src="/images/logo/site_logo.png"
    alt="Desktop Logo"
  />
</Link>
        </div>
        <div className="hidden md:block">
  <HeaderLiveStatus />
</div>
        {/* Only render the live status Link if we have the live status */}
        {/* {isLive !== null && (
          <Link
            href="https://kick.com/sweetflips"
            className="w-25 cursor-pointer rounded-lg StatusButton p-4 text-white transition text-center border border-graydark"
            target="_blank"
          >
            <span
              className={`inline-flex h-2 w-2 rounded-full float-left my-2 ${isLive ? 'bg-green' : 'bg-red'}`}
            ></span>
            {isLive ? 'Live' : 'Offline'}
          </Link>
        )} */}

        <div className="hidden sm:block">
          {/* <form action="https://formbold.com/s/unique_form_id" method="POST">
            <div className="relative">
              <button className="absolute left-0 top-1/2 -translate-y-1/2">
                <svg
                  className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                    fill=""
                  />
                </svg>
              </button>

              <input
                type="text"
                placeholder="Type to search..."
                className="w-full bg-transparent pl-9 pr-4 font-medium focus:outline-none xl:w-125"
              />
            </div>
          </form> */}
        </div>
        {/* <ShopTokenBar /> */}

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* <!-- Dark Mode Toggler --> */}
            <nav className="flex items-center gap-4">
  {isLoggedIn ? (
    <>
      {/* Desktop*/}
  {isLoggedIn && (
    <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 z-10">
      <ShopTokenBar />
    </div>
  )}
  {/* Mobile*/}
  {isLoggedIn && (
    <div className="sm:hidden absolute left-[43%] -translate-x-1/2 flex w-full z-10">
  <ShopTokenBar />
</div>
  )}
      <div className="flex gap-2 items-center">
        <Link
          href="/account"
          className="flex items-center justify-center gap-2 rounded-lg bg-[#9925FE] px-3.5 py-3.5 text-white transition hover:bg-opacity-90 text-sm sm:px-4 sm:py-3 sm:text-base"
        >
          <User className="w-5 h-5" />
          <span className="hidden sm:inline">Account</span>
        </Link>

        {userRole === "admin" && (
          <Link
            href="/admin-panel"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#9925FE] px-3.5 py-3.5 text-white transition hover:bg-opacity-90 text-sm sm:px-4 sm:py-3 sm:text-base"
          >
            <Shield className="w-5 h-5" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        )}
      </div>
    </>
  ) : (
    <div>
      <Link
        href="/auth/signin"
        className="flex items-center justify-center gap-2 rounded-lg bg-[#9925FE] px-3.5 py-3.5 text-white transition hover:bg-opacity-90 text-sm sm:px-4 sm:py-3 sm:text-base"
      >
        <User className="w-5 h-5" />
        <span className="hidden sm:inline">Login</span>
      </Link>
    </div>
  )}
</nav>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;