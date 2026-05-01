/// <reference types="chrome" />

console.info(
    '[extension-training] content script loaded on',
    window.location.href,
);

void chrome.runtime.sendMessage({ type: 'ping' }, (response: unknown) => {
    const err = chrome.runtime.lastError;
    if (err?.message !== undefined && err.message.length > 0) {
        console.warn('[extension-training] message error', err.message);
        return;
    }
    console.info('[extension-training] background replied', response);
});
