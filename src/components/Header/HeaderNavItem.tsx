import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { iconMap } from '@/components/icons/MenuIcons';

interface HeaderNavItemProps {
  label: string;
  route: string;
  external?: boolean;
  icon?: string;
  // children prop removed
  isMobile?: boolean; // Added isMobile prop
}

const HeaderNavItem: React.FC<React.PropsWithChildren<HeaderNavItemProps>> = ({ label, route, external, icon, children: propChildren, isMobile }) => {
  const pathname = usePathname();
  // Use React.Children to count and iterate over children
  const childrenArray = React.Children.toArray(propChildren);
  const isActive = pathname === route || (childrenArray && childrenArray.some(child => {
    // Children are expected to be <Link> or <a> tags, so check href
    return React.isValidElement(child) && child.props.href && pathname === child.props.href;
  }));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasChildren = childrenArray && childrenArray.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const alignmentClass = isMobile ? 'justify-start' : 'justify-center';
  let linkClasses = `relative group flex items-center ${alignmentClass} text-[rgb(222,228,238)] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out`;

  if (isMobile) {
    linkClasses += ' w-full'; // Ensure full width for mobile items' clickable area
  }

  if (isActive) {
    linkClasses += " text-primary";
  } else {
    // Text color does not change on hover for non-active items
  }

  const iconClasses = `mr-2 h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-[rgb(222,228,238)]'}`;
  const IconComponent = icon ? iconMap[icon] : null;

  const handleToggleDropdown = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const itemContent = (
    <>
      {IconComponent ? <IconComponent className={iconClasses} /> : <span className="w-5 mr-2 h-5"></span>}
      <div className="relative">
        <span className="block font-semibold invisible" aria-hidden="true">{label}</span>
        <span className={`absolute left-0 top-0 ${isMobile ? '' : 'w-full'} ${isActive ? "font-semibold" : ""}`}>{label}</span>
        {/* On mobile, let natural width dictate for left-align; desktop needs w-full for absolute overlay */}
      </div>
      {hasChildren && !isMobile && ( // Chevron only for desktop dropdowns
        <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''} ${isActive ? 'text-primary' : 'text-[rgb(222,228,238)]'}`} />
      )}
    </>
  );

  const underlineDiv = (
    <div
      className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 w-[calc(100%-1.5rem)]
                 scale-x-0 group-hover:scale-x-100 bg-primary
                 transition-transform duration-200 ease-out`}
    ></div>
  );

  // For mobile, children are not handled as a dropdown by this component
  // They are expected to be rendered as a flat list in the mobile menu itself if needed
  if (hasChildren && !isMobile) { // Desktop dropdown logic
    return (
      <div className="relative flex-1" ref={dropdownRef}>
        <button
          type="button"
          className={`${linkClasses} w-full`}
          onClick={handleToggleDropdown}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          {itemContent}
          {!isMobile && underlineDiv} {/* Underline for desktop parent items */}
        </button>
        {isDropdownOpen && (
          <div className="absolute left-0 mt-2 w-full origin-top-left rounded-md shadow-lg bg-[#1A1123] ring-1 ring-black ring-opacity-5 focus:outline-none z-50 py-1 flex flex-col"> {/* Changed background color */}
            {/* Iterate over React children */}
            {childrenArray.map((child, index) => {
              if (!React.isValidElement(child)) return null; // Skip invalid elements

              // Assuming children are <Link> or <a> tags. Access href for active check.
              // This might need adjustment based on how children are structured in Header/index.tsx
              const childProps = child.props as any; // Type assertion, be cautious
              const childIsActive = pathname === childProps.href;
              // Base classes for all submenu items
              let childLinkClasses = "block px-4 py-2 text-sm w-full text-center transition-colors duration-150 ease-in-out";

              if (childIsActive) {
                // Active state: Uses bg-purple-600 (#7E22CE) with white text
                childLinkClasses += " bg-purple-600 text-white";
              } else {
                // Inactive state: now text-white for resting,
                // On hover: bg-purple-700 (#6B21A8) with white text
                childLinkClasses += " text-white hover:bg-purple-700 hover:text-white"; // Changed from text-gray-200
              }

              // We need to clone the element to add/modify props like className and onClick
              return React.cloneElement(child as React.ReactElement<any>, {
                key: index,
                className: childLinkClasses,
                onClick: () => setIsDropdownOpen(false), // Close dropdown on click
                // Ensure any existing onClick on the child is also called if necessary
              });
            })}
          </div>
        )}
      </div>
    );
  }

  // Common rendering for non-dropdown items (desktop) and all mobile items
  const rootElementClasses = isMobile ? "" : "flex-1"; // flex-1 only for desktop non-dropdown items

  if (external) {
    return (
      <a href={route} className={`${linkClasses} ${rootElementClasses}`} target="_blank" rel="noopener noreferrer">
        {itemContent}
        {underlineDiv}
      </a>
    );
  }

  return (
    <Link href={route} legacyBehavior passHref>
      <a className={`${linkClasses} ${rootElementClasses}`}>
        {itemContent}
        {underlineDiv}
      </a>
    </Link>
  );
};

export default HeaderNavItem;
