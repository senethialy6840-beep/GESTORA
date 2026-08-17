export function LogoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Gradients */}
        <linearGradient id="g-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F2054" />
          <stop offset="25%" stopColor="#183E9F" />
          <stop offset="100%" stopColor="#1F58FF" />
        </linearGradient>
        <linearGradient id="bar1" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0B3094" />
          <stop offset="100%" stopColor="#1E5CFF" />
        </linearGradient>
        <linearGradient id="bar2" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0079A8" />
          <stop offset="100%" stopColor="#00B8FF" />
        </linearGradient>
        <linearGradient id="bar3" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#00A56E" />
          <stop offset="100%" stopColor="#00E696" />
        </linearGradient>
      </defs>

      {/* Outer G shape */}
      <path 
        d="M50 10 
           C 27.9 10 10 27.9 10 50 
           C 10 72.1 27.9 90 50 90 
           C 68.3 90 83.8 77.7 88.5 60 
           L 63.5 60 
           C 60 67 55 70 50 70 
           C 39 70 30 61 30 50 
           C 30 39 39 30 50 30 
           C 54.5 30 58.5 31.5 61.8 34.2 
           L 78 18 
           C 70.3 12.8 60.5 10 50 10 Z" 
        fill="url(#g-gradient)" 
      />

      {/* Internal Bar Chart */}
      <rect x="38" y="50" width="7" height="20" rx="1" fill="url(#bar1)" />
      <rect x="49" y="38" width="7" height="32" rx="1" fill="url(#bar2)" />
      <rect x="60" y="24" width="7" height="46" rx="1" fill="url(#bar3)" />

      {/* Swooshing Arrow */}
      {/* Black shadow to create a cutout effect behind the white arrow */}
      <path d="M 26 73 Q 55 83 83 45" stroke="#0F2054" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.3" />
      <path d="M 25 72 Q 55 82 82 44 L 74 42 L 90 30 L 88 47 L 80 45 Q 53 80 25 72 Z" fill="#FFFFFF" />
    </svg>
  );
}
