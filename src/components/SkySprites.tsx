export function SpaceHomyak({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 72 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse cx="22" cy="24" rx="8" ry="5" fill="#5fa896" opacity="0.85" />
      <path d="M10 24c-6 0-9 3-9 3s2 2 9 2" stroke="#8fd0c0" strokeWidth="2" />
      <ellipse cx="40" cy="26" rx="22" ry="14" fill="#d9b48a" />
      <ellipse cx="40" cy="28" rx="14" ry="8" fill="#c99a6b" />
      <circle cx="28" cy="14" r="7" fill="#e6c49a" />
      <circle cx="52" cy="14" r="7" fill="#e6c49a" />
      <circle cx="40" cy="20" r="11" fill="#f0d2ad" />
      <circle cx="35" cy="19" r="2.2" fill="#2a211c" />
      <circle cx="45" cy="19" r="2.2" fill="#2a211c" />
      <circle cx="35.7" cy="18.3" r="0.7" fill="#fff" />
      <circle cx="45.7" cy="18.3" r="0.7" fill="#fff" />
      <ellipse cx="40" cy="24" rx="3.2" ry="2.2" fill="#e08989" />
      <circle cx="31" cy="23" r="2.4" fill="#f0a8b4" opacity="0.8" />
      <circle cx="49" cy="23" r="2.4" fill="#f0a8b4" opacity="0.8" />
      <rect x="54" y="22" width="14" height="6" rx="2" fill="#c9a227" />
      <path d="M66 18l6 7-6 7" fill="#7b8cff" />
    </svg>
  )
}

export function EnemyScout({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 36" fill="none" aria-hidden>
      <ellipse cx="24" cy="22" rx="18" ry="8" fill="#3a4566" />
      <ellipse cx="24" cy="20" rx="14" ry="10" fill="#5c6b94" />
      <circle cx="24" cy="18" r="7" fill="#1c2438" />
      <circle cx="24" cy="18" r="4.5" fill="#7b8cff" />
      <circle cx="25.5" cy="16.5" r="1.4" fill="#fff" opacity="0.7" />
      <path d="M8 18l-6 4 6 2M40 18l6 4-6 2" stroke="#c9a227" strokeWidth="2" />
    </svg>
  )
}

export function EnemyBrute({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 44" fill="none" aria-hidden>
      <path d="M8 28h40l-4 10H12L8 28z" fill="#4a3038" />
      <ellipse cx="28" cy="20" rx="20" ry="14" fill="#6b3f4d" />
      <path d="M12 14l6-8 8 4M44 14l-6-8-8 4" fill="#8a5160" />
      <circle cx="20" cy="18" r="3" fill="#ff6b6b" />
      <circle cx="36" cy="18" r="3" fill="#ff6b6b" />
      <rect x="22" y="24" width="12" height="4" rx="1" fill="#1a1014" />
      <path d="M4 22h8M44 22h8" stroke="#c9a227" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function EnemyGunner({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 52 40" fill="none" aria-hidden>
      <ellipse cx="28" cy="22" rx="16" ry="11" fill="#2f4a45" />
      <rect x="2" y="18" width="16" height="6" rx="2" fill="#5fa896" />
      <circle cx="30" cy="18" r="8" fill="#1a2e2a" />
      <circle cx="30" cy="18" r="5" fill="#e2c15a" />
      <circle cx="31.5" cy="16.5" r="1.5" fill="#fff" opacity="0.75" />
      <path d="M18 10h8l2 6H18zM34 10h8l-2 6h-8z" fill="#3f8575" />
      <path d="M12 28l4 8M40 28l-4 8" stroke="#8fd0c0" strokeWidth="2" />
    </svg>
  )
}
