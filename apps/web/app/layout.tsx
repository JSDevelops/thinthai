import { Anuphan } from 'next/font/google';
import './globals.css';
import BottomNav from './bottom-nav';

const anuphan = Anuphan({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-anuphan',
});

export const viewport = {
  themeColor: '#00695C',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata = {
  applicationName: 'ThinThai',
  title: 'ThinThai | เที่ยวไทยให้ถึงถิ่น',
  description: 'แอปเดียวครบ จองทริป ช้อปสินค้าชุมชน วัฒนธรรมและตลาดชุมชนไทย',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={anuphan.variable}>
      <body className={anuphan.className}>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
