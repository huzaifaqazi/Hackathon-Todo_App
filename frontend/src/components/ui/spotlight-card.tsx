import React, { useRef, useState } from 'react';
import { cn } from '../../lib/utils';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Radial spotlight color (rgba) that follows the cursor */
  spotlightColor?: string;
}

/**
 * Card wrapper with a mouse-tracking radial spotlight overlay.
 * Pure transform/opacity — compositor-friendly, no re-render per frame beyond
 * pointer position state, and inert for touch/keyboard users (hover-only effect).
 */
export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className,
  spotlightColor = 'rgba(37, 99, 235, 0.08)',
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -400, y: -400 });
  const [visible, setVisible] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: visible ? 1 : 0,
          background: `radial-gradient(320px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
};
