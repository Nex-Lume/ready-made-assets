export function HandiMark({ className, steam = false }: { className?: string; steam?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      {steam && (
        <g className="steam">
          <path d="M22 18c-3-4 3-6 0-10" /><path d="M32 16c-3-4 3-6 0-10" /><path d="M42 18c-3-4 3-6 0-10" />
        </g>
      )}
      <path d="M14 30c0-3 8-6 18-6s18 3 18 6" />
      <path d="M10 31h44" />
      <path d="M13 31c0 14 8 23 19 23s19-9 19-23" />
      <path d="M10 36c-3 0-4 4-1 5M54 36c3 0 4 4 1 5" />
      <circle cx="32" cy="22" r="2" />
    </svg>
  );
}
