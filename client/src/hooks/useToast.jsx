import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);
  const timerRef = useRef(null);

  const showToast = useCallback((msg) => {
    clearTimeout(timerRef.current);
    setMessage(msg);
    setShow(true);
    timerRef.current = setTimeout(() => setShow(false), 3400);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={"mf-toast" + (show ? " show" : "")} role="status">{message}</div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
