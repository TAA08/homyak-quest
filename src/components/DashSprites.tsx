export function KnightHomyak({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 72 84" fill="none" aria-hidden>
      <path d="M22 18h28l4 10H18l4-10z" fill="#c9a227" />
      <path d="M26 10h20v10H26z" fill="#8a7350" />
      <circle cx="36" cy="36" r="16" fill="#f0d2ad" />
      <circle cx="26" cy="28" r="7" fill="#e6c49a" />
      <circle cx="46" cy="28" r="7" fill="#e6c49a" />
      <circle cx="31" cy="35" r="2.2" fill="#2a211c" />
      <circle cx="41" cy="35" r="2.2" fill="#2a211c" />
      <ellipse cx="36" cy="41" rx="3" ry="2" fill="#e08989" />
      <path d="M20 48h32l-4 22H24L20 48z" fill="#5c6b94" />
      <path d="M24 52h24v4H24z" fill="#c9a227" />
      <path d="M28 58h16v3H28z" fill="#8fd0c0" opacity="0.85" />
      <rect x="14" y="50" width="8" height="18" rx="2" fill="#7a879e" />
      <rect x="50" y="50" width="8" height="18" rx="2" fill="#7a879e" />
    </svg>
  )
}

export function CrownLoot({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 40" fill="none" aria-hidden>
      <path
        d="M6 30h36l-3 6H9L6 30z"
        fill="#c9a227"
      />
      <path
        d="M8 28l6-16 10 10 10-14 6 20H8z"
        fill="#e2c15a"
      />
      <circle cx="14" cy="14" r="3" fill="#7b8cff" />
      <circle cx="24" cy="20" r="3" fill="#ff6b6b" />
      <circle cx="34" cy="12" r="3" fill="#8fd0c0" />
      <path d="M10 28h28" stroke="#8a6a1a" strokeWidth="2" />
    </svg>
  )
}

export function MouseTrap({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 40" fill="none" aria-hidden>
      <rect x="4" y="22" width="48" height="12" rx="2" fill="#6b4a32" />
      <rect x="6" y="24" width="44" height="3" fill="#8a6244" />
      <path
        d="M10 22c0-12 12-18 18-18s18 6 18 18"
        stroke="#9aa3b5"
        strokeWidth="3"
        fill="none"
      />
      <path d="M28 6v16" stroke="#c9a227" strokeWidth="2" />
      <circle cx="28" cy="22" r="3" fill="#e2c15a" />
      <path d="M22 30h12l-2 4h-8l-2-4z" fill="#3d2a1c" />
      <path d="M40 18l8-6" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
