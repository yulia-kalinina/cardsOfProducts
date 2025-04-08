import clsx from "clsx";
import { ReactNode } from "react";

interface UiButtonProps {
  children: string | ReactNode;
  className?: string;
  variant: "primary" | "outline";
  type?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

export function UiButton({ children, className, variant, onClick }: UiButtonProps) {
  const buttonClassName = clsx(
    "transition-colors",
    className,
    {
      primary: "bg-sky-500 hover:bg-sky-400 text-white",
      outline: "border border-sky-500 text-sky-500 hover:bg-sky-100",
    }[variant]
  );

  return <button className={buttonClassName} onClick={onClick}>{children}</button>;
}
