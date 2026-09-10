"use client";

import { useEffect, useState } from "react";

// BeforeInstallPromptEvent is not in standard TS lib yet
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already installed (running in standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Check if already dismissed this session
    if (sessionStorage.getItem("afya-install-dismissed")) {
      setDismissed(true);
      return;
    }

    // Detect iOS
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window.navigator as unknown as { standalone?: boolean }).standalone;
    setIsIOS(ios);

    // Listen for Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    sessionStorage.setItem("afya-install-dismissed", "1");
    setDismissed(true);
    setShowIOSTip(false);
  }

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
    }
    dismiss();
  }

  // Nothing to show
  if (installed || dismissed || (!prompt && !isIOS)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-teal/10 bg-white px-4 py-3 shadow-lg sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm sm:rounded-2xl sm:border">
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.png" alt="AfyaDrop" className="h-10 w-10 rounded-xl" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-teal">Install AfyaDrop</p>
          <p className="text-xs text-muted mt-0.5">
            Add to your home screen for instant access.
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-muted hover:text-teal transition-colors p-1"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Android/Chrome: native prompt */}
      {prompt && (
        <button
          onClick={install}
          className="mt-3 w-full rounded-xl bg-teal py-2.5 text-sm font-semibold text-sage transition-opacity hover:opacity-90"
        >
          Add to Home Screen
        </button>
      )}

      {/* iOS: manual instructions */}
      {isIOS && !prompt && (
        <>
          <button
            onClick={() => setShowIOSTip((v) => !v)}
            className="mt-3 w-full rounded-xl bg-teal py-2.5 text-sm font-semibold text-sage transition-opacity hover:opacity-90"
          >
            How to install on iPhone →
          </button>
          {showIOSTip && (
            <div className="mt-3 rounded-xl bg-ivory p-3 text-xs text-muted space-y-1">
              <p>1. Tap the <strong>Share</strong> button (□↑) in Safari.</p>
              <p>2. Scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
              <p>3. Tap <strong>"Add"</strong> — done!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
