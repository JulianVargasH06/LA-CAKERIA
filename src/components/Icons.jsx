/* Minimal line icons for ingredient pills (inherit currentColor). */
const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const ChocolateIcon = () => (
  <svg {...base}>
    <path d="M12 3 21 12 12 21 3 12Z" />
    <path d="M7.5 7.5 16.5 16.5M16.5 7.5 7.5 16.5" />
  </svg>
)

export const RaspberryIcon = () => (
  <svg {...base}>
    <circle cx="9" cy="10" r="2.4" />
    <circle cx="14" cy="10" r="2.4" />
    <circle cx="11.5" cy="14.2" r="2.4" />
    <circle cx="7.8" cy="14.6" r="2" />
    <circle cx="15.2" cy="14.6" r="2" />
    <circle cx="11.5" cy="18.4" r="2" />
    <path d="M11.5 7.5c0-2 1-3.4 3-4" />
  </svg>
)

export const SpongeIcon = () => (
  <svg {...base}>
    <path d="M4 10h16v9H4z" />
    <path d="M4 14.5h16" />
    <circle cx="8" cy="12.2" r=".6" />
    <circle cx="13" cy="17" r=".6" />
    <circle cx="16.5" cy="12" r=".6" />
    <path d="M6 10c0-3 2.7-5 6-5s6 2 6 5" />
  </svg>
)

export const DropIcon = () => (
  <svg {...base}>
    <path d="M12 3.5c3.5 4.4 5.5 7.6 5.5 10.2a5.5 5.5 0 0 1-11 0c0-2.6 2-5.8 5.5-10.2Z" />
  </svg>
)

export const FlowerIcon = ({ size = 22 }) => (
  <svg {...base} width={size} height={size} fill="currentColor" stroke="none">
    <circle cx="12" cy="6.5" r="3.6" />
    <circle cx="12" cy="17.5" r="3.6" />
    <circle cx="6.5" cy="12" r="3.6" />
    <circle cx="17.5" cy="12" r="3.6" />
  </svg>
)

export const ArrowIcon = () => (
  <svg {...base} width={18} height={18}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
