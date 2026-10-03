export function TextInput({
  label,
  icon: Icon,
  iconColor,
  value,
  onChange,
  placeholder,
  maxLength,
  required = false,
}) {
  return (
    <div className="mb-6">
      <label className="text-[#1E1E1E] font-bold text-sm mb-3 block">
        {Icon && <Icon className={`w-4 h-4 inline mr-2 text-[${iconColor}]`} />}
        {label}
        {required && " *"}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-[#1E1E1E] font-semibold outline-none focus:border-[#008C8F] transition-all placeholder-gray-400 shadow-sm"
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
