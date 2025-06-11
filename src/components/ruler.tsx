"use client";

import { useEffect, useRef, useState } from "react";

interface RulerProps {
  height?: number;
  className?: string;
  segments?: number;
  maxValue?: number;
}

export function Ruler({
  height = 40,
  className = "",
  segments = 60,
  maxValue = 60,
}: RulerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600); // Default fallback width

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setWidth(containerWidth);
      }
    };

    // Initial measurement
    updateWidth();

    // Set up ResizeObserver to watch for container size changes
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Fallback for older browsers - window resize
    window.addEventListener("resize", updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const segmentWidth = width / segments;

  // Generate tick marks and labels
  const ticks = [];
  const labels = [];

  for (let i = 0; i <= segments; i++) {
    const x = i * segmentWidth;
    const value = maxValue - (i * maxValue) / segments; // Dynamic value calculation
    const isMajorTick = i % 10 === 0;

    // Add tick mark
    ticks.push(
      <line
        key={`tick-${i}`}
        x1={x}
        y1={height - (isMajorTick ? 12 : 6)}
        x2={x}
        y2={height}
        stroke="currentColor"
        strokeWidth={isMajorTick ? 1.5 : 0.5}
        className="text-gray-600"
      />,
    );

    // Add label for major ticks
    if (isMajorTick) {
      labels.push(
        <text
          key={`label-${i}`}
          x={x}
          y={height - 16}
          textAnchor="middle"
          className="fill-gray-700 text-xs font-medium"
        >
          {value === 0 ? 0 : -Math.round(value)}
        </text>,
      );
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))" }}
      >
        {/* Main ruler line */}
        <line
          x1={0}
          y1={height}
          x2={width}
          y2={height}
          stroke="currentColor"
          strokeWidth={2}
          className="text-gray-800"
        />

        {/* Tick marks */}
        {ticks}

        {/* Labels */}
        {labels}
      </svg>
    </div>
  );
}
