import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAFAFA',
          backgroundImage:
            'radial-gradient(circle at 15% 15%, rgba(26,115,232,0.14), transparent 45%), radial-gradient(circle at 85% 85%, rgba(212,175,55,0.16), transparent 45%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 140,
            height: 140,
            borderRadius: 32,
            backgroundImage: 'linear-gradient(135deg, #1A73E8, #0d47a1)',
            boxShadow: '0 20px 40px rgba(26,115,232,0.35)',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 64,
              height: 64,
              borderRadius: 12,
              backgroundColor: '#FAFAFA',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 76,
            fontWeight: 700,
            color: '#101828',
            letterSpacing: '-2px',
          }}
        >
          Trusthotel
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 20,
            fontSize: 32,
            color: '#475467',
            textAlign: 'center',
            maxWidth: 860,
          }}
        >
          Wird Ihr Hotel von der KI empfohlen?
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 48,
            padding: '10px 28px',
            borderRadius: 999,
            backgroundColor: 'rgba(212,175,55,0.16)',
            border: '2px solid #D4AF37',
          }}
        >
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 600, color: '#8a6d1f' }}>
            AI-Sichtbarkeit &amp; Reputation für Hotels
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
