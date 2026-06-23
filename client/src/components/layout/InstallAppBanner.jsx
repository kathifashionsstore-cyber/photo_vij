import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallAppBanner() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("snaplica-install-dismissed") === "true";
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      if (!dismissed) {
        setPromptEvent(event);
        setVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const install = async () => {
    if (!promptEvent) return;
    promptEvent.prompt();
    await promptEvent.userChoice.catch(() => null);
    setVisible(false);
    setPromptEvent(null);
  };

  const dismiss = () => {
    localStorage.setItem("snaplica-install-dismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[9997] mx-auto max-w-md rounded-[8px] border border-brand-gold/30 bg-[#0f0f12] p-4 shadow-2xl shadow-black/70 md:bottom-6 md:left-auto md:right-6">
      <div className="flex items-center gap-3">
        <img src="/logo192.png" alt="Snaplica" className="h-10 w-10 rounded-[8px]" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">Install Snaplica</p>
          <p className="text-xs text-gray-500">Quick access for bookings, galleries, and updates.</p>
        </div>
        <button onClick={install} className="rounded-[8px] bg-brand-gold p-2 text-black" aria-label="Install app">
          <Download className="h-4 w-4" />
        </button>
        <button onClick={dismiss} className="rounded-[8px] border border-white/10 p-2 text-gray-400" aria-label="Dismiss install prompt">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
