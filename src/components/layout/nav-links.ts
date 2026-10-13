/**
 * The primary navigation, shared by the desktop bar (Navbar) and the mobile
 * drawer (MobileNav) so the two can never show different link sets. Lab and
 * Now live in the footer's "More" group and the command palette: the
 * primary nav is for the built, tested work and the way to get in touch.
 */
export const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/ai-pm', label: 'AI PM' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
] as const;

/**
 * The drawer adds an explicit Home link first: on desktop the brand mark is
 * the Home link (its accessible name ends in "Home"), but in the drawer the
 * brand sits behind the overlay.
 */
export const DRAWER_LINKS = [{ href: '/', label: 'Home' }, ...NAV_LINKS] as const;
