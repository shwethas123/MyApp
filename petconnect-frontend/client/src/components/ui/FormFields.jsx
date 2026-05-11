export function InputField({
  label,
  required,
  placeholder,
  type = "text",
  value,
  onChange,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-gray-600">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:border-[#3B6B8A] focus:ring-1 focus:ring-[#3B6B8A]/20 transition-colors bg-white"
      />
    </div>
  );
}

export function SelectField({
  label,
  required,
  options,
  value,
  onChange,
  placeholder,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-gray-600">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-500 focus:border-[#3B6B8A] focus:ring-1 focus:ring-[#3B6B8A]/20 transition-colors bg-white cursor-pointer"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function RadioGroup({
  label,
  required,
  name,
  options,
  value,
  onChange,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-gray-600">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="flex items-center gap-4">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
              className="w-3.5 h-3.5 accent-[#3B6B8A]"
            />
            <span className="text-sm text-gray-600">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function BooleanRadio({ label, name, value, onChange, className = "" }) {
  return (
    <RadioGroup
      label={label}
      name={name}
      options={[
        { value: "true", label: "True" },
        { value: "false", label: "False" },
      ]}
      value={value}
      onChange={onChange}
      className={className}
    />
  );
}

export function TextareaField({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-gray-600">{label}</label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className="border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-[#3B6B8A] focus:ring-1 focus:ring-[#3B6B8A]/20 transition-colors resize-none bg-white"
      />
    </div>
  );
}

export function SectionHeader({ title }) {
  return (
    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
      {title}
    </h2>
  );
}
