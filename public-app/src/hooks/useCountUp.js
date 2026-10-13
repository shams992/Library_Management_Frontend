import { useEffect, useRef, useState } from 'react';

/** Small number animation used by the landing trust section. */
export const useCountUp = (target = 0, { duration = 1400, enabled = true } = {}) => {
  const [value, setValue] = useState(enabled ? 0 : target);
  const frame = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return undefined;
    }
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration, enabled]);

  return value;
};
