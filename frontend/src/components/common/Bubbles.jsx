// Decorative soap bubbles rising across the background of the parent (which needs `relative overflow-hidden`).
// Negative delays start each bubble part-way through its rise, so the screen is never empty on load.
const BUBBLES = [
  { size: 46, left: 4, duration: 11, delay: -2 },
  { size: 90, left: 12, duration: 15, delay: -9 },
  { size: 22, left: 20, duration: 8, delay: -5 },
  { size: 64, left: 28, duration: 13, delay: -1 },
  { size: 30, left: 37, duration: 9, delay: -7 },
  { size: 110, left: 45, duration: 17, delay: -12 },
  { size: 18, left: 53, duration: 7, delay: -3 },
  { size: 56, left: 60, duration: 12, delay: -8 },
  { size: 36, left: 68, duration: 10, delay: -4 },
  { size: 80, left: 76, duration: 14, delay: -6 },
  { size: 26, left: 84, duration: 9, delay: -2 },
  { size: 70, left: 91, duration: 13, delay: -10 },
  { size: 40, left: 97, duration: 11, delay: -6 },
];

// Rainbow film that only shows near the rim, like a real soap bubble
const RIM = {
  background: 'conic-gradient(from 0deg, #ff4fd8, #ffb347, #fff275, #5dffb0, #4fc3ff, #8a5cff, #ff4fd8)',
  WebkitMask: 'radial-gradient(circle, transparent 55%, #000 72%, #000 100%)',
  mask: 'radial-gradient(circle, transparent 55%, #000 72%, #000 100%)',
  opacity: 0.85,
};

export default function Bubbles({ className = '' }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="absolute rounded-full bubble-rise"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            bottom: -b.size,
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.18) 100%)',
            boxShadow: '0 0 18px rgba(147,197,253,0.35)',
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        >
          {/* Rotating rainbow rim makes the colours shimmer */}
          <span className="absolute inset-0 rounded-full bubble-shimmer" style={{ ...RIM, animationDelay: `${b.delay}s` }} />
          {/* Specular highlights */}
          <span className="absolute rounded-full bg-white/80 blur-[1px]" style={{ top: '16%', left: '22%', width: '22%', height: '12%', transform: 'rotate(-35deg)' }} />
          <span className="absolute rounded-full bg-white/50" style={{ bottom: '18%', right: '20%', width: '8%', height: '8%' }} />
        </span>
      ))}
    </div>
  );
}
