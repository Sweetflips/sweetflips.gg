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
        icon: "spartans",
        label: "Spartans",
        route: "/spartans",
      },
      {
        icon: "luxdrop",
        label: "LuxDrop",
        route: "/luxdrop",
      },
      {
        icon: "stream",
        label: "Stream",
        route: "https://kick.com/sweetflips",
        external: true,
      },
      {
        icon: "rewards",
        label: "SweetFlipsRewards",
        route: "/sweetflipsrewards",
      },
    ],
  },
];
