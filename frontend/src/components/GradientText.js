// src/components/GradientText.js
import React, { useMemo } from 'react';

export default function GradientText({
  children,
  className = "",
  colors = ["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"],
  animationSpeed = 8,
  showBorder = false
}) {
  // Create gradient style with animation
  const gradientStyle = useMemo(() => ({
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    backgroundSize: '200% auto',
    color: 'transparent',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: `animated-gradient ${animationSpeed}s linear infinite`,
    whiteSpace: 'nowrap',
    fontFamily: "'Segoe UI', 'Arial Black', Arial, sans-serif",
    fontSize: '27px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    position: 'relative',
    display: 'inline-block',
  }), [colors, animationSpeed]);

  // Optional gradient border overlay style
  const gradientOverlayStyle = useMemo(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
    backgroundImage: gradientStyle.backgroundImage,
    animation: gradientStyle.animation,
    zIndex: -1,
  }), [gradientStyle]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className={className}>
      {showBorder && <div style={gradientOverlayStyle}></div>}
      <div style={gradientStyle}>
        {children}
      </div>

      {/* Insert keyframes styles inside the component */}
      <style>
        {`
          @keyframes animated-gradient {
            0% {
              background-position: 0% 50%;
            }
            100% {
              background-position: 100% 50%;
            }
          }
        `}
      </style>
    </div>
  );
}