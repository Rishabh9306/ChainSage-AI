import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ChainSage AI - Smart Contract Security Analysis',
  description: 'AI-powered smart contract security analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fafafa' }}>
        {children}
      </body>
    </html>
  );
}
