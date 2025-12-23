import Link from "next/link";
import Image from "next/image";
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu as MenuIcon, X } from "lucide-react";
import React from "react";
import { HeaderLiveStatus } from "../HeaderLiveStatus/HeaderLiveStatus";
import { menuGroups } from "@/data/menuData";
import HeaderNavItem from "./HeaderNavItem";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-999 w-full bg-[#130C1A] border-b border-white/5 backdrop-blur-sm">
      <div className="mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="lg:hidden animate-spin" style={{ animationDuration: '3s' }}>
              <Image
                width={56}
                height={56}
                src="/images/logo/sweet_flips (2).svg"
                alt="SweetFlips Logo"
                className="block"
                priority
              />
            </div>
            <div className="hidden lg:block animate-spin" style={{ animationDuration: '3s' }}>
              <Image
                width={144}
                height={32}
                src="/images/logo/sweet_flips (2).svg"
                alt="SweetFlips Logo"
                className="block"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          {menuGroups[0]?.menuItems.map((item, index) => (
            <HeaderNavItem
              key={index}
              label={item.label}
              route={item.route}
              external={item.external}
              icon={item.icon}
            >
              {item.children && item.children.map((childItem, childIndex) => {
                if (childItem.external) {
                  return (
                    <a
                      key={childIndex}
                      href={childItem.route}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {childItem.label}
                    </a>
                  );
                }
                return (
                  <Link key={childIndex} href={childItem.route} legacyBehavior passHref>
                    <a>{childItem.label}</a>
                  </Link>
                );
              })}
            </HeaderNavItem>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <HeaderLiveStatus />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/5 bg-[#1A1123]">
          <nav className="px-4 py-3 space-y-1">
            {menuGroups[0]?.menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <HeaderNavItem
                  label={item.label}
                  route={item.route}
                  external={item.external}
                  icon={item.icon}
                  isMobile={true}
                />
                {item.children && item.children.length > 0 && (
                  <div className="ml-8 mt-1 space-y-0.5 border-l border-white/10 pl-4">
                    {item.children.map((childItem, childIndex) => {
                      const childKey = `${index}-${childIndex}-child`;
                      const isActive = pathname === childItem.route;
                      const subItemClasses = `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-primary bg-white/10'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`;

                      if (childItem.external) {
                        return (
                          <a
                            key={childKey}
                            href={childItem.route}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={subItemClasses}
                            onClick={() => setMobileMenuOpen(false)}
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
                          <a className={subItemClasses} onClick={() => setMobileMenuOpen(false)}>
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
