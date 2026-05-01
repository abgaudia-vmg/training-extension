/// <reference types="chrome" />

chrome.runtime.onInstalled.addListener(() => {
  console.info('[extension-training] service worker installed');
});

chrome.runtime.onMessage.addListener(
  (
    message: unknown,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ): boolean | undefined => {
    const payload = message as { type?: string } | null | undefined;
    if (payload?.type === 'ping') {
      sendResponse({ ok: true, from: 'service' });
      return true;
    }
    return undefined;
  },
);
