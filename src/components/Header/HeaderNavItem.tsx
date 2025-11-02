import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { iconMap } from "@/components/icons/MenuIcons";

interface HeaderNavItemProps {
  label: string;
  route: string;
  external?: boolean;
  icon?: string;
  isMobile?: boolean;
}

const HeaderNavItem: React.FC<React.PropsWithChildren<HeaderNavItemProps>> = ({
  label,
  route,
  external,
  icon,
  children: propChildren,
  isMobile,
}) => {
  const pathname = usePathname();
  const childrenArray = React.Children.toArray(propChildren);
  const isActive =
    pathname === route ||
    (childrenArray &&
      childrenArray.some((child) => {
        return (
          React.isValidElement(child) &&
          child.props.href &&
          pathname === child.props.href
        );
      }));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasChildren = childrenArray && childrenArray.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const IconComponent = icon ? iconMap[icon] : null;

  const handleToggleDropdown = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  // Desktop navigation item
  if (!isMobile) {
    const baseClasses = `relative flex items-center gap-3 px-6 py-3 text-base font-medium transition-all duration-200 rounded-lg ${
      isActive
        ? "text-primary"
        : "text-gray-300 hover:text-white"
    }`;

    const itemContent = (
      <>
        {IconComponent && (
          <IconComponent className={`h-6 w-6 flex-shrink-0 ${isActive ? "text-primary" : "text-gray-400"}`} />
        )}
        <span>{label}</span>
        {hasChildren && (
          <ChevronDown
            className={`h-4 w-4 ml-1 transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            } ${isActive ? "text-primary" : "text-gray-400"}`}
          />
        )}
      </>
    );

    if (hasChildren) {
      return (
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            className={baseClasses}
            onClick={handleToggleDropdown}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            {itemContent}
          </button>
          {isDropdownOpen && (
            <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 w-40 rounded-lg bg-[#1A1123] border border-white/10 py-1.5 shadow-xl backdrop-blur-sm">
              {childrenArray.map((child, index) => {
                if (!React.isValidElement(child)) return null;

                const childProps = child.props as any;
                const childIsActive = pathname === childProps.href;
                const childLinkClasses = `block px-4 py-2 text-sm text-center transition-colors ${
                  childIsActive
                    ? "text-primary bg-white/10"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`;

                return React.cloneElement(child as React.ReactElement<any>, {
                  key: index,
                  className: childLinkClasses,
                  onClick: () => setIsDropdownOpen(false),
                });
              })}
            </div>
          )}
        </div>
      );
    }

    if (external) {
      return (
        <a
          href={route}
          className={baseClasses}
          target="_blank"
          rel="noopener noreferrer"
        >
          {IconComponent && (
            <IconComponent className={`h-6 w-6 flex-shrink-0 ${isActive ? "text-primary" : "text-gray-400"}`} />
          )}
          <span>{label}</span>
        </a>
      );
    }

    return (
      <Link href={route} legacyBehavior passHref>
        <a className={baseClasses}>
          {IconComponent && (
            <IconComponent className={`h-6 w-6 flex-shrink-0 ${isActive ? "text-primary" : "text-gray-400"}`} />
          )}
          <span>{label}</span>
        </a>
      </Link>
    );
  }

  // Mobile navigation item
  const mobileBaseClasses = `flex items-center gap-4 w-full px-4 py-3 rounded-lg text-base font-medium transition-colors ${
    isActive
      ? "text-primary bg-white/10"
      : "text-gray-300 hover:text-white hover:bg-white/5"
  }`;

  const mobileItemContent = (
    <>
      {IconComponent && (
        <IconComponent className={`h-6 w-6 flex-shrink-0 ${isActive ? "text-primary" : "text-gray-400"}`} />
      )}
      <span className="flex-1 text-left">{label}</span>
    </>
  );

  if (external) {
    return (
      <a href={route} className={mobileBaseClasses} target="_blank" rel="noopener noreferrer">
        {mobileItemContent}
      </a>
    );
  }

  return (
    <Link href={route} legacyBehavior passHref>
      <a className={mobileBaseClasses}>{mobileItemContent}</a>
    </Link>
  );
};

export default HeaderNavItem;
