import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Home-screen icon for iOS "Add to Home Screen" (iOS ignores SVG icons).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F5A623',
        }}
      >
        <svg width="140" height="80" viewBox="0 0 64 36">
          <ellipse cx="32" cy="24" rx="24" ry="10" fill="#FCEABB" />
          <ellipse cx="22" cy="19" rx="13" ry="9" fill="#FFFFFF" />
          <ellipse cx="42" cy="19" rx="13" ry="9" fill="#FFFFFF" />
          <ellipse cx="32" cy="15" rx="17" ry="10" fill="#FFFFFF" />
        </svg>
      </div>
    ),
    size,
  );
}
