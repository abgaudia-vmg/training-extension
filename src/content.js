const THEME_CHANNEL_BROADCAST_NAME = 'theme-sync';
const SESSION_CHANNEL_BROADCAST_NAME = 'session-sync';
const THEME_CHANNEL_BROADCAST_EVENT = 'theme-change';
const SESSION_CHANNEL_BROADCAST_EVENT_LOGOUT = 'session-logout';
const SESSION_CHANNEL_BROADCAST_EVENT_LOGOUT_SUCCESS = 'session-logout-success';
const MESSAGE_TYPE_SET_THEME = 'set-theme';


const sessionChannel = new BroadcastChannel(SESSION_CHANNEL_BROADCAST_NAME);
const themeChannel = new BroadcastChannel(THEME_CHANNEL_BROADCAST_NAME);

sessionChannel.onmessage = (event) => {
    if (event.data?.type === SESSION_CHANNEL_BROADCAST_EVENT_LOGOUT) {
        chrome.runtime.sendMessage({
            type: SESSION_CHANNEL_BROADCAST_EVENT_LOGOUT_SUCCESS,
        });
    }
}

themeChannel.onmessage = (event) => {
    if (event.data?.type === THEME_CHANNEL_BROADCAST_EVENT) {
        const theme = event.data.theme
        chrome.runtime.sendMessage({
            type: THEME_CHANNEL_BROADCAST_EVENT,
            data: { theme },
        })
    }
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === MESSAGE_TYPE_SET_THEME) {
        console.log("🚀 ~ message:", message)
        themeChannel.postMessage({
            type: THEME_CHANNEL_BROADCAST_EVENT,
            theme: message.data.theme,
        })
    }
    return true;
})

chrome.runtime.onMessage.addListener((message) => {
    console.log("🚀 ~ content.js ~ chrome.runtime.onMessage.addListener:", message)
    if (message.type === SESSION_CHANNEL_BROADCAST_EVENT_LOGOUT) {
        console.log('logout message received');
        sessionChannel.postMessage({
            type: SESSION_CHANNEL_BROADCAST_EVENT_LOGOUT,
        });
    }
    return true;
})



console.log("running content.js")