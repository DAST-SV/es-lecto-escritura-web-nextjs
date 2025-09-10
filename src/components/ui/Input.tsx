import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  icon?: React.ReactElement<{ className?: string }>
  error?: string
  showToggle?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = "text", icon, error, showToggle = false, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const inputType =
      showToggle && type === "password"
        ? showPassword
          ? "text"
          : "password"
        : type

    return (
      <div className="mb-3 w-full">
        <div className="relative">
          {/* Icono a la izquierda */}
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <div className="p-1.5 bg-orange-400 rounded-full shadow-md">
                {React.cloneElement(icon, {
                  className: cn("h-3 w-3 text-white", icon.props.className),
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            data-slot="input"
            className={cn(
              "flex h-10 w-full rounded-xl border bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-md transition-all placeholder:text-gray-500 focus-visible:border-orange-400 focus-visible:ring-2 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              showToggle && "pr-12",
              error
                ? "border-red-400 focus-visible:ring-red-200"
                : "border-blue-300",
              className
            )}
            {...props}
          />

          {/* Toggle password */}
          {showToggle && type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-2 flex items-center"
              tabIndex={-1}
            >
              <div className="p-1.5 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                {showPassword ? (
                  <EyeOff className="h-3 w-3 text-gray-700" />
                ) : (
                  <Eye className="h-3 w-3 text-gray-700" />
                )}
              </div>
            </button>
          )}
        </div>

        {/* Mensaje de error */}
        {error && (
          <p className="mt-1 text-red-500 font-semibold text-xs">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"