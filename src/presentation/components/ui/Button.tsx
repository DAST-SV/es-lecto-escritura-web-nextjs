import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils" // helper: clsx + tailwind-merge

// Definimos las variantes de estilos
const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-md hover:from-green-500 hover:to-blue-600",
        secondary:
          "bg-white text-blue-600 border-2 border-blue-300 shadow-sm hover:bg-gray-50",
        text: "text-red-500 hover:text-red-700 hover:underline shadow-none border-none",
      },
      size: {
        sm: "px-3 py-1.5 text-xs rounded-md",
        md: "px-4 py-2 text-sm rounded-lg",
        lg: "px-5 py-3 text-base rounded-xl",
        icon: "p-2 rounded-full", // por si quieres un botón solo de ícono
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, loadingText, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={props.disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {loadingText || children}
          </span>
        ) : (
          children
        )}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }