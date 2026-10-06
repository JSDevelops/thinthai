'use client';
import { useEffect, useRef, useState } from 'react';
import type { Map, Marker, Circle, LeafletMouseEvent } from 'leaflet';
type Props = {
  lat: number | null;
  lng: number | null;
  radius?: number | null;
  delivery?: boolean;
  onPick: (lat: number, lng: number) => void;
};
export default function LocationMap(props: Props) {
  const host = useRef<HTMLDivElement>(null),
    state = useRef<{
      map: Map;
      marker?: Marker;
      target?: Marker;
      circle?: Circle;
      L: typeof import('leaflet');
    } | null>(null),
    latest = useRef(props);
  latest.current = props;
  const [error, setError] = useState(''),
    [ready, setReady] = useState(false);
  useEffect(() => {
    let stopped = false;
    let observer: ResizeObserver | undefined;
    void import('leaflet')
      .then((L) => {
        if (stopped || !host.current) return;
        const p = latest.current;
        const map = L.map(host.current, { scrollWheelZoom: false }).setView(
          p.lat !== null && p.lng !== null ? [p.lat, p.lng] : [13.75, 100.5],
          p.lat !== null ? 13 : 6,
        );
        state.current = { map, L };
        L.tileLayer(
          process.env.NEXT_PUBLIC_MAP_TILE_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            maxZoom: 19,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        )
          .on('tileerror', () => setError('โหลดภาพแผนที่ไม่ได้ ยังระบุพิกัดในช่องด้านล่างได้'))
          .addTo(map);
        map.on('click', (e: LeafletMouseEvent) => {
          const lat = Math.max(-90, Math.min(90, e.latlng.lat)),
            lng = ((((e.latlng.lng + 180) % 360) + 360) % 360) - 180;
          latest.current.onPick(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
          if (latest.current.delivery) {
            state.current?.target?.remove();
            if (state.current)
              state.current.target = L.marker([lat, lng], {
                icon: L.divIcon({ className: 'delivery-target', html: '●', iconSize: [24, 24] }),
              }).addTo(map);
          }
        });
        observer = new ResizeObserver(() => map.invalidateSize());
        observer.observe(host.current);
        setReady(true);
      })
      .catch(() => setError('เปิดแผนที่ไม่สำเร็จ กรุณาระบุพิกัดแทน'));
    return () => {
      stopped = true;
      observer?.disconnect();
      state.current?.map.remove();
      state.current = null;
    };
  }, []);
  useEffect(() => {
    const s = state.current;
    if (!s || !ready) return;
    const firstPin = !s.marker;
    s.marker?.remove();
    s.circle?.remove();
    if (
      props.lat === null ||
      props.lng === null ||
      !Number.isFinite(props.lat) ||
      !Number.isFinite(props.lng) ||
      Math.abs(props.lat) > 90 ||
      Math.abs(props.lng) > 180
    )
      return;
    const position: [number, number] = [props.lat, props.lng];
    s.marker = s.L.marker(position, {
      draggable: !props.delivery,
      icon: s.L.divIcon({
        className: 'store-pin',
        html: '●',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    }).addTo(s.map);
    s.marker.on('dragend', () => {
      const p = s.marker!.getLatLng();
      latest.current.onPick(
        Number(p.lat.toFixed(6)),
        Number((((((p.lng + 180) % 360) + 360) % 360) - 180).toFixed(6)),
      );
    });
    if (props.radius)
      s.circle = s.L.circle(position, {
        radius: props.radius * 1000,
        color: '#00695c',
        fillOpacity: 0.12,
      }).addTo(s.map);
    if (firstPin) s.map.setView(position, 13);
    else if (!s.map.getBounds().contains(position)) s.map.panTo(position);
  }, [props.lat, props.lng, props.radius, props.delivery, ready]);
  return (
    <>
      <div className="location-map" ref={host} role="region" aria-label="แผนที่ปักหมุดร้าน" />
      {error && <p role="status">{error}</p>}
      <p className="footnote">
        {props.delivery
          ? 'แตะแผนที่เพื่อเลือกจุดทดสอบจัดส่ง'
          : 'แตะแผนที่หรือลากหมุด เพื่อเลือกตำแหน่งร้าน'}{' '}
        ·{' '}
        <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer">
          แจ้งปัญหาแผนที่
        </a>
      </p>
    </>
  );
}
