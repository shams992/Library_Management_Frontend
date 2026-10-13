import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Smooth-scrolls to #anchors after navigation (used by the marketing navbar). */
export const useHashScroll = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    const id = hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.requestAnimationFrame(() =>
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      );
    }
  }, [hash, pathname]);
};
