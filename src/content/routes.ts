export type NavItem = {
  path: string;
  label: string;
  end?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Home", end: true },
  { path: "/learning-path", label: "Learning Path" },
  { path: "/practice", label: "Practice Room" },
  { path: "/library", label: "My Library" },
  { path: "/progress", label: "Progress & Review" },
  { path: "/assistant", label: "AI Learning Assistant" },
];

export function titleForPath(pathname: string): string {
  const match = NAV_ITEMS.find((item) =>
    item.end ? pathname === item.path : pathname === item.path || pathname.startsWith(`${item.path}/`),
  );
  return match?.label ?? "English Lab";
}
