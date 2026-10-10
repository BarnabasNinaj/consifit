import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  const media = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone =
    'standalone' in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return media || iosStandalone;
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Native-feeling shell only happens after install / Add to Home Screen.
 * Browsers will not permanently hide the URL bar in a normal tab.
 */
export function usePwaInstall() {
  const [standalone, setStandalone] = useState(isStandaloneDisplay);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setStandalone(isStandaloneDisplay());
    setIos(isIos());

    const onChange = () => setStandalone(isStandaloneDisplay());
    const mq = window.matchMedia('(display-mode: standalone)');
    mq.addEventListener('change', onChange);

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBip);

    const onInstalled = () => {
      setDeferred(null);
      setStandalone(true);
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const canPrompt = Boolean(deferred) && !standalone;

  const install = useCallback(async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === 'accepted') setStandalone(true);
    return outcome === 'accepted';
  }, [deferred]);

  return {
    standalone,
    ios,
    canPrompt,
    /** Show install guidance when running inside a browser tab */
    needsInstall: !standalone,
    install,
  };
}
