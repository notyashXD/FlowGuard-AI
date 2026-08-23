export default function FlowGuardLogo({ size = 32, className = '' }) {
  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform transition-transform hover:scale-105 duration-200"
      >
        <defs>
          <linearGradient id="fg-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E4BF0" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="fg-grad-shield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B1528" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="fg-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
          </linearGradient>
          <filter id="fg-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1E4BF0" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer Shield Shell */}
        <path
          d="M20 4L34 9.5V20.5C34 29.2 28 35.5 20 38C12 35.5 6 29.2 6 20.5V9.5L20 4Z"
          fill="url(#fg-grad-shield)"
          stroke="url(#fg-grad-primary)"
          strokeWidth="1.75"
          strokeLinejoin="round"
          filter="url(#fg-shadow)"
        />

        {/* Dynamic Interlocking Flow Wave (representing continuous capital cashflow) */}
        <path
          d="M13 23C13 18.5 16.5 15.5 20 15.5C23.5 15.5 27 18.5 27 23"
          stroke="url(#fg-glow)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <path
          d="M13 18C13 14 16.5 11.5 20 11.5C23.5 11.5 27 14 27 18"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Center Node / Autonomous Defense Core */}
        <circle cx="20" cy="27" r="2.75" fill="#10B981" />
        <circle cx="20" cy="27" r="4.5" stroke="#10B981" strokeWidth="1" opacity="0.4" />
      </svg>
    </div>
  );
}
