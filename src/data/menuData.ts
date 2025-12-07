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
        icon: "razed",
        label: "Razed",
        route: "/razed",
      },
      {
        icon: "luxdrop",
        label: "LuxDrop",
        route: "/luxdrop",
      },
      {
        icon: "stream",
        label: "Stream",
        route: "/stream",
      },
      {
        icon: "rewards",
        label: "SweetFlipsRewards",
        route: "/sweetflipsrewards",
      },
    ],
  },
];
