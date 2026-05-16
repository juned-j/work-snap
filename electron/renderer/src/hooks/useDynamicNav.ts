import { useEffect, useState } from 'react';

export type DynamicNavItem = {
  key: 'dashboard' | 'timesheets' | 'activity' | 'profile';
  label: string;
};

export const useDynamicNav = () => {
  const [navItems, setNavItems] = useState<DynamicNavItem[]>([
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'timesheets', label: 'Timesheets' },
    { key: 'activity', label: 'Activity' },
    { key: 'profile', label: 'Profile' },
  ]);

  useEffect(() => {
    // Preserve initial navigation list; no duplicate appends in strict mode.
    setNavItems((prev) => prev);
  }, []);

  return navItems;
};