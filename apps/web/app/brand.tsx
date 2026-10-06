export default function Brand({
  reverse = false,
  tagline = true,
}: {
  reverse?: boolean;
  tagline?: boolean;
}) {
  return (
    <a
      className={'brand brand-lockup' + (reverse ? ' brand-on-dark' : '')}
      href="/"
      aria-label="ThinThai — หน้าหลัก"
    >
      <img
        src={reverse ? '/brand/logo-reverse.svg' : '/brand/logo.svg'}
        alt="ThinThai"
        width={470}
        height={128}
      />
      {tagline && <small>เที่ยวไทยให้ถึงถิ่น</small>}
    </a>
  );
}
