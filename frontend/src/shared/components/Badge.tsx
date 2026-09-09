import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "tertiary" | "neutral" | "dark";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  size = "sm",
  className,
}: BadgeProps) {
  const variants = {
    neutral: "bg-[#f5f5f7] text-[#1d1d1f] border border-[#e0e0e0]",
    primary: "bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]/20",
    tertiary: "bg-[#e0f2fe] text-[#0284c7] border-[#bae6fd]",
    dark: "bg-[#1d1d1f] text-white border-transparent",
  };

  const sizes = {
    sm: "text-[11px] px-2.5 py-0.5",
    md: "text-[12px] px-3 py-1",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center font-normal rounded-applePill border",
          variants[variant],
          sizes[size],
          className
        )
      )}
    >
      {children}
    </span>
  );
}
