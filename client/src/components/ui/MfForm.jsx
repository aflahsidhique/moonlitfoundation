import { useRef, useState } from "react";
import { apiPost, apiPostForm } from "../../lib/api";
import { useToast } from "../../hooks/useToast";

// Converts a <form> into a plain JSON-friendly object. Repeated fields
// (e.g. checkbox groups sharing a name) become arrays — mirrors the
// legacy site's assets/main.js formToPayload().
function formToPayload(form) {
  const data = new FormData(form);
  const payload = {};
  data.forEach((value, key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      payload[key] = Array.isArray(payload[key]) ? payload[key].concat(value) : [payload[key], value];
    } else {
      payload[key] = value;
    }
  });
  return payload;
}

// Generic form wrapper matching the legacy site's form.mf-form behavior:
// validates every [required] field (plus an optional extra `validate`
// check), POSTs to `endpoint` as JSON or multipart (auto-detected from a
// file input), shows a toast, resets the form, and calls onSuccess.
//
// Deliberately uses native uncontrolled inputs + FormData rather than
// per-field React state, matching every field's `name` attribute directly
// to the API payload key — keeps each page's JSX a close, low-risk port of
// the original markup instead of a full controlled-form rewrite.
export default function MfForm({ endpoint, successMessage = "Thank you! We'll get back to you soon.", onSuccess, validate, className = "", children, ...rest }) {
  const formRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const showToast = useToast();

  function setFieldError(field, bad) {
    field.classList.toggle("is-error", bad);
    const msg = field.closest("div")?.querySelector(".mf-error-msg");
    if (msg) msg.style.display = bad ? "block" : "none";
  }

  function runValidation(form) {
    let ok = true;
    form.querySelectorAll("[required]").forEach((field) => {
      const bad = !field.value.trim() || (field.type === "email" && !/^\S+@\S+\.\S+$/.test(field.value));
      setFieldError(field, bad);
      if (bad) ok = false;
    });
    if (validate && !validate(form)) ok = false;
    return ok;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = formRef.current;
    if (!runValidation(form)) return;

    setSubmitting(true);
    try {
      const hasFile = !!form.querySelector('input[type="file"]');
      const body = hasFile ? await apiPostForm(endpoint, new FormData(form)) : await apiPost(endpoint, formToPayload(form));
      form.reset();
      showToast(successMessage);
      onSuccess?.(body);
    } catch (err) {
      showToast(err.message || "Couldn't reach the server — please try again shortly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} className={className} onSubmit={handleSubmit} data-submitting={submitting || undefined} {...rest}>
      {children}
    </form>
  );
}
