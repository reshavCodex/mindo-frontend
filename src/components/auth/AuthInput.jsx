import { useState } from "react";

export default function AuthInput({
  label,
  id,
  type = "text",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <label htmlFor={id} className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink-soft">
        {label}
      </span>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={inputType}
          className={`w-full rounded-xl border border-line bg-white/70 py-2.5 text-sm text-ink outline-none transition-all duration-200 placeholder:text-ink-soft/50 focus:border-primary focus:bg-white focus:shadow-soft ${
            isPassword ? "pl-4 pr-11" : "px-4"
          }`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-ink-soft transition-[color,transform] duration-200 hover:text-ink hover:scale-110 active:scale-90"
          >
            <span aria-hidden="true">
              {showPassword ? "🙈" : "👁️"}
            </span>
          </button>
        )}
      </div>
    </label>
  );
}