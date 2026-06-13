import { useState, useEffect, useRef } from 'react';

export function useCountUp(target, duration = 1500, startOnMount = true) {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);

  const start = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (startOnMount && target > 0) start();
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return { current, start };
}
