import Link from "next/link";
import Image from "next/image";
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu as MenuIcon } from "lucide-react";
import React from "react";
import { HeaderLiveStatus } from "../HeaderLiveStatus/HeaderLiveStatus";
import { menuGroups } from "@/data/menuData";
import HeaderNavItem from "./HeaderNavItem";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();


  return (
    <header className="sticky top-0 z-999 flex w-full bg-[#130C1A] shadow-md">
      <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:mr-6">
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
        <nav className="hidden lg:flex items-center flex-grow justify-center mx-auto gap-1 xl:gap-2 px-2 sm:px-4"> {/* Removed justify-around */}
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

          {/* Mobile Menu Button for Header Items (visible on small screens) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2 rounded-md hover:bg-opacity-90"
            aria-label="Open mobile menu"
          >
            <MenuIcon size={24} />
          </button>
        </div>
      </div>

      {/* <!-- Mobile Menu Dropdown --> */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#1A1123] shadow-xl py-3"> {/* Slightly different bg for dropdown, increased padding */}
          <nav className="flex flex-col px-3 space-y-1"> {/* Adjusted padding and spacing */}
            {menuGroups[0]?.menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <HeaderNavItem
                  label={item.label}
                  route={item.route} // Parent might be non-interactive if route is '#'
                  external={item.external}
                  icon={item.icon}
                  isMobile={true}
                />
                {/* Render children directly underneath if they exist */}
                {item.children && item.children.length > 0 && (
                  <div className="ml-6 pl-3 py-1 space-y-1 border-l border-gray-500 dark:border-gray-700"> {/* Indentation and styling for submenu block */}
                    {item.children.map((childItem, childIndex) => {
                      const childKey = `${index}-${childIndex}-child`;
                      const isActive = pathname === childItem.route;
                      const subItemClasses = `block px-3 py-1.5 rounded-md text-xs font-medium ${isActive ? 'text-primary bg-gray-700 dark:bg-gray-600' : 'text-gray-300 dark:text-gray-400 hover:text-primary hover:bg-gray-700 dark:hover:bg-gray-600'} transition-colors duration-150 ease-in-out`;

                      if (childItem.external) {
                        return (
                          <a
                            key={childKey}
                            href={childItem.route}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={subItemClasses}
                          >
                            {childItem.label}
                          </a>
                        );
                      }
                      return (
                        <Link
                          key={childKey}
                          href={childItem.route}
                          passHref
                          legacyBehavior
                        >
                          <a className={subItemClasses}>
                            {childItem.label}
                          </a>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
