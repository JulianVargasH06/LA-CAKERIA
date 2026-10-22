/**
 * Static illustration shown when WebGL is unavailable: an isometric slab
 * cake with ganache, raspberry filling and berries, drawn in SVG.
 */
const Berry = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="#a70f26" />
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <circle
        key={a}
        cx={Math.cos((a * Math.PI) / 180) * r * 0.55}
        cy={Math.sin((a * Math.PI) / 180) * r * 0.55}
        r={r * 0.36}
        fill="#c4203a"
      />
    ))}
    <circle r={r * 0.34} fill="#d63a52" />
  </g>
)

export default function CakeFallback({ className = '' }) {
  return (
    <div className={`cake-fallback ${className}`} role="img" aria-label="Torta de chocolate con frambuesas">
      <svg viewBox="0 0 400 400">
        <ellipse cx="200" cy="370" rx="130" ry="14" fill="#5c0101" opacity=".18" />
        {/* left face */}
        <path d="M70 170 200 225v130L70 300Z" fill="#3b1a10" />
        <path d="M70 235 200 290v22L70 257Z" fill="#8f0a1d" />
        {/* right face */}
        <path d="M200 225 330 170v130l-130 55Z" fill="#2d130b" />
        <path d="M200 290 330 235v22l-130 55Z" fill="#760818" />
        {/* glaze top + drips */}
        <path d="M70 170 200 115l130 55-130 55Z" fill="#2a0e06" />
        <path
          d="M70 170v28c0 8 9 8 9 0v-14l16 7v34c0 9 10 9 10 0v-26l22 9v16c0 8 9 8 9 0v-12l25 10v40c0 10 11 10 11 0v-35l15 6 0 0 15-6v22c0 9 10 9 10 0v-27l28-12v34c0 9 10 9 10 0v-38l18-8v20c0 8 9 8 9 0v-24l23-10v-26l-130 55Z"
          fill="#1f0a04"
        />
        <path d="M110 165 200 128l70 28" stroke="#fff" strokeOpacity=".25" strokeWidth="5" fill="none" strokeLinecap="round" />
        <Berry x={170} y={150} r={20} />
        <Berry x={228} y={140} r={18} />
        <Berry x={250} y={175} r={17} />
        <Berry x={325} y={70} r={24} />
        <Berry x={60} y={110} r={16} />
        <Berry x={300} y={330} r={20} />
      </svg>
    </div>
  )
}
