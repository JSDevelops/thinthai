import TripsClient from './trips-client';
import type { Trip } from '../trip-shared';

export const metadata = {
  title: 'ค้นหาทริปท่องเที่ยวชุมชน | ThinThai',
  description: 'ออกไปพบถิ่นใหม่ ๆ เลือกกิจกรรมที่ชอบ จองรอบที่ใช่ แล้วไปสัมผัสเรื่องราวของชุมชนไทย',
};

async function getInitialTrips(): Promise<Trip[]> {
  try {
    const apiOrigin = process.env.API_ORIGIN ?? 'http://127.0.0.1:4200';
    const res = await fetch(`${apiOrigin}/api/v1/trips`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    return (await res.json()) as Trip[];
  } catch {
    return [];
  }
}

export default async function TripsPage() {
  const initialTrips = await getInitialTrips();
  return <TripsClient initialTrips={initialTrips} />;
}
