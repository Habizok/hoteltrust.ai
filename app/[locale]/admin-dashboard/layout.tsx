import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
