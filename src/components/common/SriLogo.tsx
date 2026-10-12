import React from 'react';

interface SriLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
}

export const SriLogo: React.FC<SriLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'text-white',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl',
    xl: 'text-2xl font-black',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Exact SVG recreation of the attached Sri Groups emblem */}
      <div className={`${iconSizes[size]} shrink-0 relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          {/* Dark Background Badge */}
          <rect width="200" height="200" rx="40" fill="#090d16" />

          {/* Top-Right Cyan/Teal Arc */}
          <path
            d="M 125 35 A 72 72 0 0 1 172 115"
            stroke="#17a8b8"
            strokeWidth="15"
            strokeLinecap="round"
          />

          {/* Bottom-Left Orange Arc */}
          <path
            d="M 75 165 A 72 72 0 0 1 28 85"
            stroke="#f07822"
            strokeWidth="15"
            strokeLinecap="round"
          />

          {/* Additional continuation arcs for the circular motion */}
          <path
            d="M 172 115 A 72 72 0 0 1 150 148"
            stroke="#17a8b8"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <path
            d="M 28 85 A 72 72 0 0 1 50 52"
            stroke="#f07822"
            strokeWidth="15"
            strokeLinecap="round"
          />

          {/* Inner "Sri" Typography */}
          <g transform="translate(42, 60)">
            {/* Letter 'S' */}
            <path
              d="M 40 24 C 40 13 32 8 22 8 C 11 8 5 14 5 22 C 5 36 38 34 38 52 C 38 64 28 72 16 72 C 6 72 0 65 0 54"
              stroke="#ffffff"
              strokeWidth="11"
              strokeLinecap="round"
              fill="none"
            />
            {/* Letter 'r' */}
            <path
              d="M 52 70 L 52 32 M 52 44 C 55 35 64 30 73 30"
              stroke="#ffffff"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
            {/* Letter 'i' stem */}
            <path
              d="M 87 70 L 87 34"
              stroke="#ffffff"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
            {/* Stylized dual dots above 'i' (Orange and Cyan/Teal) */}
            <circle cx="89" cy="18" r="6" fill="#f07822" />
            <circle cx="103" cy="24" r="7" fill="#17a8b8" />
          </g>
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-black tracking-tight ${textColor} ${textSizes[size]} leading-none`}>
            Sri Groups
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mt-0.5">
            ERP & CRM
          </span>
        </div>
      )}
    </div>
  );
};
