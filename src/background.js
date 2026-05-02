const COOKIE_ACTO = `acto_local`;
const COOKIE_RETO = `reto_local`;
const APP_URL = `http://localhost:4200/`;
const STORAGE_KEY = `extension_training_cookie_ui`;
const THEME_CHANNEL_BROADCAST_EVENT = 'theme-change';
const THEME_STORAGE_KEY = 'theme';
const LOGOUT_CHANNEL_BROADCAST_EVENT_LOGOUT = 'session-logout';

async function getCookiesAndStore() {
    const [acto, reto] = await Promise.all([
        chrome.cookies.get({ url: APP_URL, name: COOKIE_ACTO }),
        chrome.cookies.get({ url: APP_URL, name: COOKIE_RETO }),
    ]);
    await chrome.storage.local.set({
        [STORAGE_KEY]: {
            acto: acto?.value ?? ``,
            reto: reto?.value ?? ``,
        },
    });
}


chrome.runtime.onMessage.addListener((message, sender) => {
    if (message?.type === THEME_CHANNEL_BROADCAST_EVENT) {
        chrome.storage.local.set({ [THEME_STORAGE_KEY]: message.data?.theme });
        chrome.runtime.sendMessage(message).catch(() => { });
    }
    return true;
});

chrome.cookies.onChanged.addListener((changeInfo) => {
    const { cookie } = changeInfo;
    if (cookie.name === COOKIE_ACTO || cookie.name === COOKIE_RETO) {
        void getCookiesAndStore();
    }
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === LOGOUT_CHANNEL_BROADCAST_EVENT_LOGOUT) {
        console.log('logout message received in background');
        chrome.tabs.query({}, (tabs) => {
            for (const tab of tabs) {
                chrome.tabs.sendMessage(tab.id, {
                    type: LOGOUT_CHANNEL_BROADCAST_EVENT_LOGOUT,
                }).catch(() => { });
            }
        });
    }
    return true;
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === SESSION_CHANNEL_BROADCAST_EVENT_LOGOUT_SUCCESS) {
        console.log('logout success message received in background');
    }
    return true;
});
chrome.cookies.getAll({ domain: "localhost" }, console.log);
void getCookiesAndStore();