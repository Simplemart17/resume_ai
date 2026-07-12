import { ImageResponse } from 'next/og';

export const alt = 'ResumeAI Pro — written for people, read by machines';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Social share card in the app's own voice: ink field, the two-reader thesis
// with the highlighter sweep, and a machine strip along the bottom edge.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#16181d',
          padding: '72px 80px 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 11,
              background: 'linear-gradient(45deg, #3A32A8, #4B41D6)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 4,
              padding: '0 11px',
            }}
          >
            {/* the résumé, with the machine's matched line in gold */}
            <div style={{ display: 'flex', height: 5, width: 17, borderRadius: 3, background: '#ffffff' }} />
            <div style={{ display: 'flex', height: 4, width: 26, borderRadius: 2, background: 'rgba(255,255,255,0.82)' }} />
            <div style={{ display: 'flex', height: 5, width: 20, borderRadius: 2, background: '#f7e463' }} />
            <div style={{ display: 'flex', height: 4, width: 13, borderRadius: 2, background: 'rgba(255,255,255,0.5)' }} />
          </div>
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, color: '#ffffff' }}>
            ResumeAI&nbsp;<span style={{ color: '#a49bf0' }}>Pro</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 700, color: '#ffffff', letterSpacing: -2 }}>
            Written for people.
          </div>
          <div style={{ display: 'flex', marginTop: 8 }}>
            <div
              style={{
                display: 'flex',
                fontSize: 84,
                fontWeight: 700,
                color: '#16181d',
                letterSpacing: -2,
                backgroundColor: '#f7e463',
                padding: '0 20px',
              }}
            >
              Read by machines.
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            borderTop: '1px solid rgba(255,255,255,0.18)',
            margin: '0 -80px',
            padding: '22px 80px 26px',
            fontSize: 24,
            color: 'rgba(255,255,255,0.65)',
          }}
        >
          <span style={{ color: '#a49bf0' }}>[ats]</span>
          <span>parse ok</span>
          <span>·</span>
          <span>match 78/100</span>
          <span>·</span>
          <span>build · score · apply</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
