function Wrap({ className, span, children }) {
  return <div className={[span && "sm:col-span-2", className].filter(Boolean).join(" ")}>{children}</div>;
}
function Label({ htmlFor, required, hint, children }) {
  return <label className="mf-label" htmlFor={htmlFor}>
      {children} {required && "*"} {hint && <span className="text-[#9CA3AF] font-normal">{hint}</span>}
    </label>;
}
export function TextField({ label, name, id, type = "text", required, hint, error, span, className, ...rest }) {
  const fieldId = id || name;
  return <Wrap span={span} className={className}>
      <Label htmlFor={fieldId} required={required} hint={hint}>{label}</Label>
      <input className="mf-input" id={fieldId} name={name} type={type} required={required} {...rest} />
      {required && <p className="mf-error-msg">{error || `Please enter your ${label?.toLowerCase()}.`}</p>}
    </Wrap>;
}
export function TextareaField({ label, name, id, required, hint, error, span, className, rows = 3, ...rest }) {
  const fieldId = id || name;
  return <Wrap span={span} className={className}>
      <Label htmlFor={fieldId} required={required} hint={hint}>{label}</Label>
      <textarea className="mf-input" id={fieldId} name={name} required={required} rows={rows} {...rest} />
      {required && <p className="mf-error-msg">{error || "Please fill in this field."}</p>}
    </Wrap>;
}
export function SelectField({ label, name, id, required, hint, error, span, className, children, ...rest }) {
  const fieldId = id || name;
  return <Wrap span={span} className={className}>
      <Label htmlFor={fieldId} required={required} hint={hint}>{label}</Label>
      <select className="mf-input" id={fieldId} name={name} required={required} {...rest}>
        {children}
      </select>
      {required && <p className="mf-error-msg">{error || "Please make a selection."}</p>}
    </Wrap>;
}
export function FileField({ label, name, id, hint, span, className, accept = "image/jpeg,image/png", ...rest }) {
  const fieldId = id || name;
  return <Wrap span={span} className={className}>
      <Label htmlFor={fieldId} hint={hint}>{label}</Label>
      <input className="mf-input" id={fieldId} name={name} type="file" accept={accept} {...rest} />
    </Wrap>;
}
export function CheckboxGrid({ legend, name, options, cols = "grid-cols-1 sm:grid-cols-2" }) {
  return <fieldset className="sm:col-span-2">
      <legend className="sr-only">{legend}</legend>
      <div className={`grid ${cols} gap-2 text-[13px]`}>
        {options.map((opt) => <label key={opt} className="flex items-center gap-2">
            <input type="checkbox" name={name} value={opt} className="accent-[#14338C]" /> {opt}
          </label>)}
      </div>
    </fieldset>;
}
