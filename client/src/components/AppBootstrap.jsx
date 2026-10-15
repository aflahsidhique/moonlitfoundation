import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import App from "../App.jsx";
import { ToastProvider } from "../hooks/useToast.jsx";
import LoadingScreen from "./ui/LoadingScreen.jsx";
export default function AppBootstrap() {
  const [starting, setStarting] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setStarting(false), 900);
    return () => window.clearTimeout(timer);
  }, []);
  if (starting) return <LoadingScreen label="A little good is on its way…" />;
  return <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>;
}
