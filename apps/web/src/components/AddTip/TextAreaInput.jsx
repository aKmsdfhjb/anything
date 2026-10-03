export function TextAreaInput({
  label,
  icon: Icon,
  iconColor,
  value,
  onChange,
  placeholder,
  rows = 5,
  maxLength,
  required = false,
  optional = false,
}) {
  return (
    <div className="mb-6">
      <label className="text-[#1E1E1E] font-bold text-sm mb-3 block">
        {Icon && <Icon className={`w-4 h-4 inline mr-2 text-[${iconColor}]`} />}
        {label}
        {required && " *"}
        {optional && (
          <span className="text-gray-400 font-normal ml-2">(optional)</span>
        )}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-[#1E1E1E] font-semibold outline-none focus:border-[#008C8F] transition-all placeholder-gray-400 resize-none shadow-sm"
        maxLength={maxLength}
      />
      {maxLength && (
        <p className="text-gray-400 text-xs mt-2 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}
