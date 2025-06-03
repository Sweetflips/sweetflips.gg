import Link from "next/link";
// Removed DarkModeSwitcher, DropdownMessage, DropdownNotification, DropdownUser as they are not used in the provided snippet
import Image from "next/image";
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { User, Shield, Menu as MenuIcon } from "lucide-react"; // Renamed Menu to MenuIcon to avoid conflict
import ShopTokenBar from '@/components/ShopTokenBar/ShopTokenBar';
import React from "react";
import { HeaderLiveStatus } from "../HeaderLiveStatus/HeaderLiveStatus";
import { menuGroups } from "@/data/menuData"; // Import menuGroups
import HeaderNavItem from "./HeaderNavItem"; // Import HeaderNavItem

// Removed sidebarOpen and setSidebarOpen from props
const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State for mobile menu

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

  // Unused useEffect and handleLogout removed for clarity
  // useEffect(() => {
  //   const token = Cookies.get('token');
  //   if (token) {
  //     // setIsAuthenticated(true); // This state was removed
  //   } else {
  //     // setIsAuthenticated(false); // This state was removed
  //   }
  // }, []);

  // const handleLogout = () => {
  //   Cookies.remove('token');
  //   // setIsAuthenticated(false); // This state was removed
  // };

  return (
    <header className="sticky top-0 z-999 flex w-full bg-[#130C1A] shadow-md">
      <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Hamburger button for sidebar (now removed)
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              // props.setSidebarOpen(!props.sidebarOpen); // This logic is no longer needed
            }}
            className="z-99999 block rounded-xl bg-[#9925FE] p-3.5 lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  // className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-white delay-[0] duration-200 ease-in-out dark:bg-white ${
                  //   !props.sidebarOpen && "!w-full delay-300"
                  // }`}
                ></span>
                <span
                  // className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-white delay-150 duration-200 ease-in-out dark:bg-white ${
                  //   !props.sidebarOpen && "delay-400 !w-full"
                  // }`}
                ></span>
                <span
                  // className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-white delay-200 duration-200 ease-in-out dark:bg-white ${
                  //   !props.sidebarOpen && "!w-full delay-500"
                  // }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  // className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-white delay-300 duration-200 ease-in-out dark:bg-white ${
                  //   !props.sidebarOpen && "!h-0 !delay-[0]"
                  // }`}
                ></span>
                <span
                  // className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-white duration-200 ease-in-out dark:bg-white ${
                  //   !props.sidebarOpen && "!h-0 !delay-200"
                  // }`}
                ></span>
              </span>
            </span>
          </button>
          */}

          <Link className="block flex-shrink-0" href="/">
            <Image
              width={32} // Smaller logo for mobile to fit hamburger
              height={32}
              src="/images/logo/sweet_flips_logo_white.png" // Assuming this is the small square logo
              alt="Logo"
              className="lg:hidden" // Show only on small screens
            />
            <Image
              width={160} // Full logo for larger screens
              height={32}
              src="/images/logo/site_logo.png"
              alt="Logo"
              className="hidden lg:block" // Show only on large screens
            />
          </Link>
        </div>

        {/* <!-- Desktop Header Navigation --> */}
        <nav className="hidden lg:flex items-center w-full max-w-screen-lg mx-auto gap-1 xl:gap-2"> {/* Removed justify-around */}
          {menuGroups[0]?.menuItems.map((item, index) => (
            <HeaderNavItem
              key={index}
              label={item.label}
              route={item.route}
              external={item.external}
              icon={item.icon}
              // Removed children prop
            >
              {/* Nested children */}
              {item.children && item.children.map((childItem, childIndex) => {
                if (childItem.external) {
                  return (
                    <a
                      key={childIndex}
                      href={childItem.route}
                      target="_blank"
                      rel="noopener noreferrer"
                      // className and onClick will be added by HeaderNavItem
                      // HeaderNavItem will use href for active checks
                    >
                      {childItem.label}
                    </a>
                  );
                }
                return (
                  <Link key={childIndex} href={childItem.route} legacyBehavior passHref>
                    {/* The <a> tag will receive href from Link, and HeaderNavItem can access it */}
                    <a>
                      {childItem.label}
                    </a>
                  </Link>
                );
              })}
            </HeaderNavItem>
          ))}
        </nav>

        <div className="flex items-center gap-3 2xsm:gap-7">
          {/* Container for HeaderLiveStatus with fixed dimensions */}
          <div className="hidden md:block h-8 w-28">
            <HeaderLiveStatus />
          </div>

          {/* <!-- Mobile Menu Button for Header Items (visible on small screens) --> */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2 rounded-md hover:bg-opacity-90"
            aria-label="Open mobile menu"
          >
            <MenuIcon size={24} />
          </button>

          {/* User-specific items - hidden on small screens, shown on large */}
          <div className="hidden lg:flex items-center gap-3 2xsm:gap-7">
            {isLoggedIn && (
              <div className="hidden sm:block"> {/* Desktop ShopTokenBar */}
                <ShopTokenBar />
              </div>
            )}
            <nav className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
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
          </div>
        </div>
      </div>

      {/* <!-- Mobile Menu Dropdown --> */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#1A1123] shadow-xl py-3"> {/* Slightly different bg for dropdown, increased padding */}
          <nav className="flex flex-col px-3 space-y-1"> {/* Adjusted padding and spacing */}
            {menuGroups[0]?.menuItems.map((item, index) => (
              <HeaderNavItem
                key={index}
                label={item.label}
                route={item.route}
                external={item.external}
                icon={item.icon}
                isMobile={true} // Add this prop
              />
            ))}
            {/* Mobile Auth Links and ShopTokenBar - styled more like HeaderNavItem */}
            {isLoggedIn && (
              <div className="px-3 pt-3 pb-2"> {/* Added padding for ShopTokenBar container */}
                <ShopTokenBar />
              </div>
            )}
            <div className="border-t border-gray-700 my-2"></div> {/* Divider */}
            {isLoggedIn ? (
              <>
                <Link href="/account" className="flex items-center text-white hover:bg-gray-700 hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out">
                   <User className="w-5 h-5 mr-2 text-gray-400" /> Account
                </Link>
                {userRole === "admin" && (
                   <Link href="/admin-panel" className="flex items-center text-white hover:bg-gray-700 hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out">
                     <Shield className="w-5 h-5 mr-2 text-gray-400" /> Admin
                  </Link>
                )}
              </>
            ) : (
              <Link href="/auth/signin" className="flex items-center text-white hover:bg-gray-700 hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out">
                <User className="w-5 h-5 mr-2 text-gray-400" /> Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;