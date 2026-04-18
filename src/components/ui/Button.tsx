import Link from "next/link";
import styles from "./Button.module.css";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  external?: boolean;
}

export function Button({
  children,
  variant = "primary",
  href,
  onClick,
  className,
  disabled = false,
  type = "button",
  external = false,
  ...rest
}: ButtonProps) {
  const classes = cn(styles.button, styles[variant], className);

  if (href) {
    if (external) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
