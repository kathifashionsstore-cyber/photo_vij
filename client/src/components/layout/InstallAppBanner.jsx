import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const APK_DOWNLOAD_URL = import.meta.env.VITE_APK_DOWNLOAD_URL || "/snaplica.apk";

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

  return (
    <>
      {visible && (
        <div className="fixed bottom-[calc(13.75rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[9997] w-[min(calc(100vw-120px),360px)] -translate-x-1/2 rounded-[8px] border border-brand-gold/30 bg-[#0f0f12] p-3 shadow-2xl shadow-black/70 md:bottom-6 md:left-auto md:right-6 md:w-full md:max-w-md md:translate-x-0">
          <div className="flex items-center gap-3">
            <img src="/logo192.png" alt="Snaplica" className="h-10 w-10 rounded-[8px]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">Install Snaplica</p>
              <p className="hidden text-xs text-gray-500 sm:block">Quick access for bookings, galleries, and updates.</p>
            </div>
            <button onClick={install} className="min-h-11 min-w-11 rounded-[8px] bg-brand-gold p-2 text-black" aria-label="Install app">
              <Download className="mx-auto h-4 w-4" />
            </button>
            <button onClick={dismiss} className="min-h-11 min-w-11 rounded-[8px] border border-white/10 p-2 text-gray-400" aria-label="Dismiss install prompt">
              <X className="mx-auto h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <a
        href={APK_DOWNLOAD_URL}
        download
        className="fixed bottom-[calc(7.75rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[9010] flex min-h-11 -translate-x-1/2 items-center justify-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold px-4 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-2xl shadow-black/50 transition-colors hover:bg-amber-500 md:bottom-6 md:left-6 md:translate-x-0"
        title="Download Android APK"
      >
        <Download className="h-4 w-4" />
        APK
      </a>
    </>
  );
}
