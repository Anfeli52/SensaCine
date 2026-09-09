interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { label: string; error?: string;}

export const Input = ({ label, error, ...props}: InputProps) => {
  const inputId = props.id || props.name;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className=" mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        {...props}
        id={inputId}
        className={` w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none
        transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:ring-4
          ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
              : "border-slate-200 focus:border-[#087ea4] focus:ring-[#087ea4]/10"
          }
        `}
      />

      {error && (
        <span className="mt-1.5 block text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
};