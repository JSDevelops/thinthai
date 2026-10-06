import PublicHeader from '../public-header';
import BookingsPanel from '../bookings-panel';
export default function Bookings() {
  return (
    <div className="public-site">
      <PublicHeader />
      <main className="catalog-page">
        <span className="eyebrow">MY LOCAL JOURNEY</span>
        <h1>ทริปของฉัน</h1>
        <BookingsPanel />
      </main>
    </div>
  );
}
