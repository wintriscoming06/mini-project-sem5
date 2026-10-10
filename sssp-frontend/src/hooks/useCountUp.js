import { useState, useEffect } from 'react';

/**
 * useCountUp hook for smooth, GPU-friendly counter animations.
 * Features:
 * - easeOutExpo progression for professional sports-broadcast data arrival feel
 * - Automatically respects prefers-reduced-motion
 * - Configurable decimal places (e.g. 1 for GPI scores like 84.5, 0 for matches/goals)
 */
export function useCountUp(endVal, duration = 800, decimals = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const target = Number(endVal);
    if (isNaN(target)) {
      setValue(endVal);
      return;
    }

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    if (target === 0) {
      setValue(0);
      return;
    }

    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo curve for snappy start and gentle settle
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = target * ease;
      setValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    const rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [endVal, duration]);

  if (typeof endVal === 'string' && isNaN(Number(endVal))) {
    return endVal;
  }

  const numVal = typeof value === 'number' ? value : Number(value) || 0;
  return decimals > 0 ? numVal.toFixed(decimals) : Math.round(numVal);
}

export default useCountUp;
