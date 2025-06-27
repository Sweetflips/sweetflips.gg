// import React from 'react'; // No longer needed for JSX
// import { HomeIcon, LeaderboardsIcon, ShopIcon, StreamIcon, GamesIcon } from '@/components/icons/MenuIcons'; // Will be handled by consumer

export interface MenuItem {
  icon?: string; // Changed from React.ReactNode to string | undefined
  label: string;
  route: string;
  external?: boolean;
  children?: MenuItem[];
}

export interface MenuGroup {
  name: string;
  menuItems: MenuItem[];
}

export const menuGroups: MenuGroup[] = [
  {
    name: "",
    menuItems: [
      {
        icon: "home",
        label: "Home",
        route: "/",
      },
      {
        icon: "leaderboards",
        label: "Leaderboards",
        route: "#",
        children: [
          { label: "Razed", route: "/razed" },
          { label: "EmpireDrop", route: "/empiredrop" },
        ],
      },
      {
        icon: "shop",
        label: "Shop",
        route: "/shop",
      },
      {
        icon: "stream",
        label: "Stream",
        route: "/stream",
      },
      {
        icon: "games",
        label: "Games",
        route: "#",
        children: [
          { label: "Plinko", route: "/plinko" },
          { label: "Coinflip", route: "/coinflip" },
        ],
      },
    ],
  },
];
