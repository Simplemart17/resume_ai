'use client';

import { useEffect } from 'react';

/**
 * Enables scroll reveals for every [data-reveal] element on the page.
 * Progressive enhancement: elements are visible by default; this island adds
 * .js-reveal to <html> (hiding them) and reveals each as it enters the
 * viewport. No JS or prefers-reduced-motion → everything simply shows.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    root.classList.add('js-reveal');

    const elements = Array.from(document.querySelectorAll('[data-reveal]'));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );

    for (const el of elements) {
      // Anything already in view reveals in the same style flush — no flash
      // of hidden content above the fold.
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('is-revealed');
      } else {
        observer.observe(el);
      }
    }

    return () => {
      observer.disconnect();
      root.classList.remove('js-reveal');
    };
  }, []);

  return null;
}
