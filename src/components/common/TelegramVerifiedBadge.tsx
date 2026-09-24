"use client";

import React from "react";

interface TelegramVerifiedBadgeProps {
  size?: number;
  className?: string;
}

export const TelegramVerifiedBadge: React.FC<TelegramVerifiedBadgeProps> = ({
  size = 14,
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center align-middle flex-shrink-0 ${className}`}
      title="Verified Telegram Account"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Telegram Official 12-Point Starburst Scallop Badge */}
        <path
          d="M10.5 2.25C11.163 1.255 12.837 1.255 13.5 2.25L14.48 3.72C14.88 4.32 15.6 4.62 16.3 4.45L18.02 4.03C19.18 3.75 20.25 4.82 19.97 5.98L19.55 7.7C19.38 8.4 19.68 9.12 20.28 9.52L21.75 10.5C22.745 11.163 22.745 12.837 21.75 13.5L20.28 14.48C19.68 14.88 19.38 15.6 19.55 16.3L19.97 18.02C20.25 19.18 19.18 20.25 18.02 19.97L16.3 19.55C15.6 19.38 14.88 19.68 14.48 20.28L13.5 21.75C12.837 22.745 11.163 22.745 10.5 21.75L9.52 20.28C9.12 19.68 8.4 19.38 7.7 19.55L5.98 19.97C4.82 20.25 3.75 19.18 4.03 18.02L4.45 16.3C4.62 15.6 4.32 14.88 3.72 14.48L2.25 13.5C1.255 12.837 1.255 11.163 2.25 10.5L3.72 9.52C4.32 9.12 4.62 8.4 4.45 7.7L4.03 5.98C3.75 4.82 4.82 3.75 5.98 4.03L7.7 4.45C8.4 4.62 9.12 4.32 9.52 3.72L10.5 2.25Z"
          fill="#0098ea"
        />
        {/* Telegram Checkmark */}
        <path
          d="M8.5 12.5L10.75 14.75L15.5 9.5"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
};
