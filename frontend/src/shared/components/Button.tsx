import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Spinner } from "./Spinner";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "dark" | "ghost" | "tertiary";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-normal transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    // Apple primary action blue button
    primary:
      "bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-applePill font-normal shadow-sm",
    // Apple secondary light pill
    secondary:
      "bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] rounded-applePill font-normal",
    // Apple dark pill
    dark:
      "bg-[#1d1d1f] hover:bg-[#333336] text-white rounded-applePill font-normal",
    // Ghost text link
    ghost:
      "bg-transparent hover:bg-black/5 text-[#0071e3] rounded-applePill",
    // Tertiary blue pill
    tertiary:
      "bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0071e3] rounded-applePill",
  };

  const sizes = {
    sm: "text-[12px] px-3.5 py-1.5 gap-1.5",
    md: "text-[14px] px-5 py-2 gap-2",
    lg: "text-[17px] px-6 py-3 gap-2.5",
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <>
          {leftIcon && <span className="inline-flex">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

export const ButtonA = ({ children, isLoading = false, disabled, ...props}: ButtonProps) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className=" w-full rounded-xl bg-[#087ea4] px-5 py-3 text-sm font-semibold text-white
      shadow-lg shadow-[#087ea4]/20 transition-all duration-200 hover:bg-[#066f91] hover:shadow-xl
      hover:shadow-[#087ea4]/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
      {isLoading ? "Cargando..." : children}
    </button>
  );
};