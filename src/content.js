const THEME_CHANNEL_BROADCAST_NAME = 'theme-sync';
const THEME_CHANNEL_BROADCAST_EVENT = 'theme-change';
const MESSAGE_TYPE_SET_THEME = 'set-theme';



const themeChannel = new BroadcastChannel(THEME_CHANNEL_BROADCAST_NAME);

themeChannel.onmessage = (event) => {
    if (event.data?.type === THEME_CHANNEL_BROADCAST_EVENT) {
        console.log("🚀 ~ event.data:", event.data)
        const theme = event.data.theme
        chrome.runtime.sendMessage({
            type: THEME_CHANNEL_BROADCAST_EVENT,
            data: { theme },
        })
    }
}

chrome.runtime.onMessage.addListener((message) => {
    console.log("🚀 24~ event:", message)
    if (message.type === MESSAGE_TYPE_SET_THEME) {
        console.log("🚀 ~ message:", message)
        themeChannel.postMessage({
            type: THEME_CHANNEL_BROADCAST_EVENT,
            theme: message.data.theme,
        })
    }
    return true;
})