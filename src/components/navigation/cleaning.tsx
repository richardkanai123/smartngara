'use client'
import { motion } from "framer-motion";

const BUBBLES_INSIDE = [
  { cx: 85, cy: 118, r: 4, delay: 0 },
  { cx: 112, cy: 115, r: 3, delay: 0.3 },
  { cx: 95, cy: 110, r: 2.5, delay: 0.6 },
  { cx: 106, cy: 106, r: 3.5, delay: 0.9 },
  { cx: 88, cy: 104, r: 2, delay: 1.2 },
  { cx: 116, cy: 112, r: 2.8, delay: 0.4 },
] as const;

const BUBBLES_FLOATING = [
  { cx: 75, size: 5, delay: 0 },
  { cx: 95, size: 3.5, delay: 0.5 },
  { cx: 110, size: 4, delay: 1 },
  { cx: 125, size: 3, delay: 1.5 },
  { cx: 85, size: 2.5, delay: 0.8 },
] as const;

const SPARKLES = [
  { x: 58, y: 42, delay: 0, size: 1 },
  { x: 142, y: 48, delay: 1.5, size: 0.8 },
  { x: 78, y: 30, delay: 2.5, size: 0.6 },
  { x: 128, y: 36, delay: 0.8, size: 0.7 },
] as const;

const WAVE_1_KEYFRAMES = [
  "M55,120 Q70,112 85,120 Q100,128 115,120 Q130,112 145,120 L145,180 L55,180 Z",
  "M55,120 Q70,128 85,120 Q100,112 115,120 Q130,128 145,120 L145,180 L55,180 Z",
  "M55,120 Q70,112 85,120 Q100,128 115,120 Q130,112 145,120 L145,180 L55,180 Z",
];

const WAVE_2_KEYFRAMES = [
  "M55,126 Q72,132 88,126 Q104,118 120,126 Q136,132 145,126 L145,180 L55,180 Z",
  "M55,126 Q72,118 88,126 Q104,132 120,126 Q136,118 145,126 L145,180 L55,180 Z",
  "M55,126 Q72,132 88,126 Q104,118 120,126 Q136,132 145,126 L145,180 L55,180 Z",
];

const CleaningLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[340px] select-none">
      {/** biome-ignore lint/a11y/noSvgWithoutTitle: accessible via aria-label */}
      <motion.svg
        aria-label="Smart Ngara: Cleaning in progress"
        viewBox="0 0 200 220"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[300px] h-auto drop-shadow-lg"
        animate={{ y: [0, -1.5, 0, 1.5, 0] }}
        transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="machineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="panelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <clipPath id="drumClip">
            <circle cx="100" cy="132" r="44" />
          </clipPath>
          <radialGradient id="glassHighlight" cx="0.32" cy="0.32" r="0.65">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bubbleGrad" cx="0.3" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.25" />
          </radialGradient>
          <filter id="foam">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="100" cy="208" rx="58" ry="5" fill="#94a3b8" opacity="0.15" />

        {/* Machine body */}
        <rect x="40" y="60" width="120" height="148" rx="6" fill="url(#machineGrad)" stroke="#94a3b8" strokeWidth="1.5" />

        {/* Control panel */}
        <rect x="40" y="60" width="120" height="32" rx="6" fill="url(#panelGrad)" stroke="#94a3b8" strokeWidth="1.5" />
        <rect x="40" y="84" width="120" height="8" fill="#e2e8f0" />

        {/* Temperature dial */}
        <circle cx="68" cy="76" r="9" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
        <circle cx="68" cy="76" r="6" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
        <g transform="translate(68, 76)">
          <motion.line
            x1="0" y1="0" x2="0" y2="-7"
            stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round"
            animate={{ rotate: [0, 90, 180, 270, 360] }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        </g>

        {/* Status LEDs */}
        <motion.circle
          cx="92" cy="76" r="2.5"
          fill="#22c55e"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
        />
        <circle cx="100" cy="76" r="2.5" fill="#f59e0b" opacity="0.25" />
        <circle cx="108" cy="76" r="2.5" fill="#ef4444" opacity="0.2" />

        {/* Brand text */}
        <text x="138" y="73" textAnchor="middle" fontSize="4.5" fill="#475569" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="0.5">
          SMART
        </text>
        <text x="138" y="80" textAnchor="middle" fontSize="3.8" fill="#64748b" fontFamily="system-ui, sans-serif" letterSpacing="0.3">
          NG&apos;ARA
        </text>

        {/* Drum outer ring */}
        <circle cx="100" cy="132" r="50" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
        <circle cx="100" cy="132" r="47" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="1" />

        {/* Drum interior (clipped to circular window) */}
        <g clipPath="url(#drumClip)">
          {/* Water base */}
          <rect x="55" y="118" width="90" height="60" fill="url(#waterGrad)" />

          {/* Animated wave layer 1 */}
          <motion.path
            d={WAVE_1_KEYFRAMES[0]}
            fill="#38bdf8" opacity="0.5"
            animate={{ d: WAVE_1_KEYFRAMES }}
            transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />

          {/* Animated wave layer 2 */}
          <motion.path
            d={WAVE_2_KEYFRAMES[0]}
            fill="#0ea5e9" opacity="0.35"
            animate={{ d: WAVE_2_KEYFRAMES }}
            transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />

          {/* Foam line */}
          <motion.ellipse
            cx="100" cy="118" rx="40" ry="3"
            fill="white" opacity="0.4" filter="url(#foam)"
            animate={{ rx: [38, 42, 38], ry: [2.5, 3.5, 2.5] }}
            transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />

          {/* Tumbling clothes group */}
          <motion.g
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            style={{ transformOrigin: "100px 132px" }}
          >
            {/* T-shirt */}
            <path
              d="M90,126 L93,119 L97,122 L100,120 L103,122 L107,119 L110,126 L106,127 L106,140 L94,140 L94,127 Z"
              fill="#f472b6" opacity="0.85" stroke="#ec4899" strokeWidth="0.5" strokeLinejoin="round"
            />
            {/* Sock */}
            <path
              d="M78,140 L78,150 Q78,154 82,154 L86,154 Q89,154 89,150 L89,147 L84,147 L84,140 Z"
              fill="#a78bfa" opacity="0.8" stroke="#8b5cf6" strokeWidth="0.5" strokeLinejoin="round"
            />
            {/* Pants */}
            <path
              d="M113,118 L120,118 L120,132 L117.5,132 L117.5,125 L115.5,125 L115.5,132 L113,132 Z"
              fill="#34d399" opacity="0.75" stroke="#10b981" strokeWidth="0.5" strokeLinejoin="round"
            />
            {/* Towel */}
            <path
              d="M82,118 L90,115 L92,120 L84,123 Z"
              fill="#fbbf24" opacity="0.7" stroke="#f59e0b" strokeWidth="0.4" strokeLinejoin="round"
            />
          </motion.g>

          {/* Soap bubbles inside drum */}
          {BUBBLES_INSIDE.map((bubble) => (
            <motion.circle
              key={`drum-b-${bubble.cx}-${bubble.cy}`}
              cx={bubble.cx} cy={bubble.cy} r={bubble.r}
              fill="url(#bubbleGrad)" stroke="white" strokeWidth="0.3"
              animate={{
                cy: [bubble.cy, bubble.cy - 18, bubble.cy - 36],
                opacity: [0, 0.85, 0],
                scale: [0.4, 1, 0.2],
              }}
              transition={{
                duration: 2.2,
                delay: bubble.delay,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 0.4,
                ease: "easeOut",
              }}
            />
          ))}
        </g>

        {/* Glass highlight overlay */}
        <circle cx="100" cy="132" r="44" fill="url(#glassHighlight)" />

        {/* Drum inner ring detail */}
        <circle cx="100" cy="132" r="44" fill="none" stroke="#94a3b8" strokeWidth="0.5" opacity="0.5" />

        {/* Door handle */}
        <rect x="144" y="129" width="9" height="3.5" rx="1.75" fill="#94a3b8" stroke="#64748b" strokeWidth="0.4" />
        <circle cx="150" cy="130.75" r="1" fill="#cbd5e1" />

        {/* Floating bubbles above machine */}
        {BUBBLES_FLOATING.map((b, i) => (
          <motion.circle
            key={`float-b-${b.cx}`}
            cx={b.cx} cy={56} r={b.size}
            fill="url(#bubbleGrad)" stroke="white" strokeWidth="0.3"
            animate={{
              cy: [56, 32, 8],
              cx: [b.cx, b.cx + (i % 2 === 0 ? 6 : -6), b.cx + (i % 2 === 0 ? 12 : -12)],
              opacity: [0, 0.7, 0],
              scale: [0.3, 1, 0.4],
            }}
            transition={{
              duration: 3.2,
              delay: b.delay,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 0.8,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Sparkle effects */}
        {SPARKLES.map((s) => (
          <motion.g
            key={`sparkle-${s.x}-${s.y}`}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{
              duration: 1.2,
              delay: s.delay,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 2.2,
            }}
            style={{ transformOrigin: `${s.x}px ${s.y}px` }}
          >
            <line x1={s.x - 4 * s.size} y1={s.y} x2={s.x + 4 * s.size} y2={s.y} stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" />
            <line x1={s.x} y1={s.y - 4 * s.size} x2={s.x} y2={s.y + 4 * s.size} stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" />
            <line x1={s.x - 2.8 * s.size} y1={s.y - 2.8 * s.size} x2={s.x + 2.8 * s.size} y2={s.y + 2.8 * s.size} stroke="#fbbf24" strokeWidth="0.6" strokeLinecap="round" />
            <line x1={s.x + 2.8 * s.size} y1={s.y - 2.8 * s.size} x2={s.x - 2.8 * s.size} y2={s.y + 2.8 * s.size} stroke="#fbbf24" strokeWidth="0.6" strokeLinecap="round" />
          </motion.g>
        ))}

        {/* Water droplets splash on sides */}
        {[
          { x: 38, y: 100, delay: 0.5 },
          { x: 162, y: 105, delay: 1.2 },
          { x: 36, y: 120, delay: 2.0 },
        ].map((d) => (
          <motion.circle
            key={`drop-${d.x}-${d.y}`}
            cx={d.x} cy={d.y} r="1.5"
            fill="#38bdf8" opacity="0"
            animate={{
              cy: [d.y, d.y - 8, d.y + 4],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 1,
              delay: d.delay,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 2.5,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Machine feet */}
        <rect x="48" y="204" width="14" height="4" rx="2" fill="#94a3b8" />
        <rect x="138" y="204" width="14" height="4" rx="2" fill="#94a3b8" />
      </motion.svg>

      {/* Animated text label */}
      <div className="mt-5 flex items-center gap-2">
        <span className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-500">
          Cleaning
        </span>
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={`dot-${i}`}
              className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400"
              animate={{ opacity: [0.15, 1, 0.15], y: [0, -3, 0] }}
              transition={{
                duration: 1,
                delay: i * 0.2,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
};

export default CleaningLoader;
