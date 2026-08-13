import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test',
  robots: { index: false, follow: false, nocache: true },
};

export default function TestAiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
