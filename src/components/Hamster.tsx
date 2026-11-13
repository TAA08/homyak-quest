export function Hamster({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="40" cy="36" r="18" fill="#F3C9A3" />
      <circle cx="88" cy="36" r="18" fill="#F3C9A3" />
      <ellipse cx="64" cy="74" rx="38" ry="34" fill="#F6D7B8" />
      <circle cx="50" cy="70" r="5.5" fill="#3D2C29" />
      <circle cx="78" cy="70" r="5.5" fill="#3D2C29" />
      <circle cx="51.5" cy="68.5" r="1.6" fill="#fff" />
      <circle cx="79.5" cy="68.5" r="1.6" fill="#fff" />
      <ellipse cx="64" cy="84" rx="8" ry="5.5" fill="#E89A9A" />
      <circle cx="38" cy="82" r="9" fill="#F0B4B4" opacity="0.85" />
      <circle cx="90" cy="82" r="9" fill="#F0B4B4" opacity="0.85" />
      <path
        d="M54 92c4 4 16 4 20 0"
        stroke="#C77B7B"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
