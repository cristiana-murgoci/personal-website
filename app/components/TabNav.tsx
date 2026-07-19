'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../page.module.css';

const TABS = [
  { href: '/',         label: 'Background' },
  { href: '/projects', label: 'Projects'   },
  { href: '/research', label: 'Research'   },
  { href: '/writing',  label: 'Writing'    },
];

export default function TabNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.tabBar}>
      {TABS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          scroll={false}
          className={`${styles.tabButton} ${pathname === href ? styles.tabActive : ''}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
