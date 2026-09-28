"use client";

import * as React from "react";

interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function CountUp({
  value,
  duration = 0.8,
  className,
  suffix = "",
  prefix = "",
}: CountUpProps) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const end = Math.round(Number(value) || 0);
    if (end === 0) {
      setDisplayValue(0);
      return;
    }

    const startTime = performance.now();
    const durationMs = duration * 1000;
    let frameId: number;

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // easeOutExpo for a sleek, snappy modern feel
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.round(ease * end));
      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      }
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
