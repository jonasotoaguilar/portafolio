export type NavItem = {
  label: string;
  href: string;
  match: string;
  kicker: string;
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/", kicker: "00", match: "/" },
  { label: "Projects", href: "/projects", kicker: "01", match: "/projects" },
  { label: "Skills", href: "/skills", kicker: "02", match: "/skills" },
  { label: "Experience", href: "/experience", kicker: "03", match: "/experience" },
  { label: "About", href: "/about", kicker: "04", match: "/about" },
  { label: "Contact", href: "/contact", kicker: "05", match: "/contact" },
];
