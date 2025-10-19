"use client";

import * as React from "react";
import styles from "./page-enter.module.css";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Stagger children entrance (ms between items). Default 70ms. */
  staggerMs?: number;
};

/**
 * Wrap a block to make it "fall in" on first mount.
 * When children is an array, we apply per-child animation delays.
 */
export function PageEnter({ children, className, staggerMs = 70 }: Props) {
  const kids = React.Children.toArray(children);
  if (kids.length <= 1) {
    return <div className={cn(styles.fallIn, className)}>{children}</div>;
  }
  return (
    <div className={cn(className)}>
      {kids.map((child, i) => (
        <div
          key={i}
          className={styles.fallIn}
          style={{ animationDelay: `${i * staggerMs}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}