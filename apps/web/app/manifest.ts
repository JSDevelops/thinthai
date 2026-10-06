import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ThinThai — เที่ยวไทยให้ถึงถิ่น',
    short_name: 'ThinThai',
    description: 'แอปเดียวครบ จองทริป ช้อปสินค้าชุมชน',
    lang: 'th',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FFF9F1',
    theme_color: '#00695C',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/brand/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
