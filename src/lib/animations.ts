export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const animationDuration = {
  fast: prefersReducedMotion() ? '0ms' : '150ms',
  normal: prefersReducedMotion() ? '0ms' : '300ms',
  slow: prefersReducedMotion() ? '0ms' : '500ms',
  slower: prefersReducedMotion() ? '0ms' : '800ms',
};

export const easing = {
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
};