"use client";

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { prefersReducedMotion, animationDuration, easing } from '@/lib/animations';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: 'fast' | 'normal' | 'slow' | 'slower';
}

export function Reveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 'normal',
}: RevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setIsVisible(true);
      setHasRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasRevealed) {
          setTimeout(() => {
            setIsVisible(true);
            setHasRevealed(true);
          }, delay);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay, hasRevealed]);

  const getTransform = () => {
    if (prefersReducedMotion() || isVisible) return 'none';

    switch (direction) {
      case 'up':
        return 'translateY(2rem)';
      case 'down':
        return 'translateY(-2rem)';
      case 'left':
        return 'translateX(2rem)';
      case 'right':
        return 'translateX(-2rem)';
      case 'none':
        return 'none';
      default:
        return 'translateY(2rem)';
    }
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all',
        prefersReducedMotion() || isVisible
          ? 'opacity-100 transform-none'
          : 'opacity-0',
        className
      )}
      style={{
        transform: getTransform(),
        transitionDuration: animationDuration[duration],
        transitionTimingFunction: easing.easeOut,
        transitionDelay: prefersReducedMotion() ? '0ms' : `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}