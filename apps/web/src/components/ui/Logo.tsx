export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Forms AI logo"
    >
      <rect width="40" height="40" rx="10" fill="#0d9488" />
      <rect x="10" y="12" width="14" height="2" rx="1" fill="white" />
      <rect x="10" y="17" width="20" height="2" rx="1" fill="white" />
      <rect x="10" y="22" width="16" height="2" rx="1" fill="white" />
      <circle cx="30" cy="28" r="6" fill="#f0fdfa" />
      <path d="M27.5 28l1.5 1.5 3-3" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
