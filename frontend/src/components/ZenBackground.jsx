import React from "react";

export default function ZenBackground({ time = 0 }) {
  return (
    <div className="absolute inset-0 bg-black">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0.15">
              <animate attributeName="offset" values="0;1;0" dur="8s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="white" stopOpacity="0.3">
              <animate attributeName="offset" values="0.5;1;0.5" dur="8s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="white" stopOpacity="0.15">
              <animate attributeName="offset" values="1;0;1" dur="8s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>

        {/* Concentric circles */}
        {[...Array(8)].map((_, i) => {
          const radius = 80 + i * 60;
          const delay = i * 0.5;
          return (
            <circle
              key={`circle-${i}`}
              cx="50%"
              cy="40%"
              r={radius + Math.sin(time + delay) * 20}
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity={0.15 - i * 0.015}
            />
          );
        })}

        {/* Flowing curved lines */}
        {[...Array(12)].map((_, i) => {
          const y = 10 + i * 8;
          const amplitude = 30 + Math.sin(time + i * 0.5) * 10;
          const offset = Math.sin(time * 0.5 + i * 0.3) * 50;

          return (
            <path
              key={`wave-${i}`}
              d={`M ${-20 + offset} ${y}% Q ${25 + offset} ${y - amplitude}% ${50 + offset} ${y}% T ${
                120 + offset
              } ${y}%`}
              fill="none"
              stroke="url(#flow-gradient)"
              strokeWidth="2"
              opacity={0.2 - i * 0.01}
            />
          );
        })}

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => {
          const x = (i * 5) % 100;
          const baseY = (i * 7) % 100;
          const y = baseY + Math.sin(time + i) * 3;

          return (
            <circle
              key={`particle-${i}`}
              cx={`${x}%`}
              cy={`${y}%`}
              r={i % 2 === 0 ? 2 : 1}
              fill="white"
              opacity={0.3}
            />
          );
        })}
      </svg>
    </div>
  );
}
