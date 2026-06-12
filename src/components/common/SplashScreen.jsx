import { useEffect, useState } from 'react';
import { trackEvent, EVENTS } from '../../firebase/analytics';

export default function SplashScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    trackEvent(EVENTS.APP_OPENED, {
      returning_user: !!localStorage.getItem('onboarding_complete')
    });

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'linear-gradient(180deg, #1B5E20 0%, #2E7D32 100%)', zIndex: 9999 }}
    >
      <div className="flex flex-col items-center gap-6">
        <span className="animate-wave" style={{ fontSize: '72px', lineHeight: 1 }}>🌾</span>

        <div className="text-center animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
            Monsoon Mitra
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.85)', marginTop: '8px', lineHeight: 1.75 }}>
            किसान का डिजिटल साथी
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginTop: '4px' }}>
            (Farmer's Digital Companion)
          </p>
        </div>

        <div className="flex gap-2 absolute" style={{ bottom: '60px' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full animate-pulse"
              style={{
                width: '10px',
                height: '10px',
                background: '#FFFFFF',
                animationDelay: `${i * 300}ms`,
                animationDuration: '1.2s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
