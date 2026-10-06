import 'leaflet/dist/leaflet.css';
import './globals.css';
export const viewport = { themeColor: '#00695C' };
export const metadata = {
  applicationName: 'ThinThai',
  title: 'ThinThai | เที่ยวไทยให้ถึงถิ่น',
  description: 'แอปเดียวครบ จองทริป ช้อปสินค้าชุมชน',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
