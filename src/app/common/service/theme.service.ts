import { Injectable, signal } from '@angular/core';
import {
    MESSAGE_TYPE_SET_THEME,
    THEME_CHANNEL_BROADCAST_EVENT,
    THEME_STORAGE_KEY,
} from '../../constants/index.js';

export type TTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    public readonly isDarkMode = signal(false);

    constructor() {
        this.getTheme();
        this.listenToExternalChanges();
    }

    get appPreferredTheme(): boolean {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    public applyDarkPalette(dark: boolean): void {
        document.documentElement.classList.toggle('dark', dark);
        this.isDarkMode.set(dark);
    }

    private getTheme(): void {
        chrome.storage.local.get(THEME_STORAGE_KEY).then((result) => {
            this.applyDarkPalette(result[THEME_STORAGE_KEY] === 'dark');
            this.isDarkMode.set(result[THEME_STORAGE_KEY] === 'dark');
        });
    }

    public initializeThemeFromStorage(): void {
        this.getTheme();
        if (!this.isDarkMode()) {
            this.applyDarkPalette(this.appPreferredTheme);
            this.setTheme(this.appPreferredTheme ? 'dark' : 'light', false);
        }
    }

    public async setTheme(
        theme: TTheme,
        broadcast: boolean = true,
    ): Promise<void> {
        chrome.storage.local.set({ [THEME_STORAGE_KEY]: theme });
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });

        if (tab?.id && broadcast) {
            chrome.tabs.sendMessage(tab.id, {
                type: MESSAGE_TYPE_SET_THEME,
                data: { theme },
            });
            this.broadcastThemeChange(theme, tab.id);
        }
    }

    public listenToExternalChanges(): void {
        console.log('listenToExternalChanges');
        chrome.runtime.onMessage.addListener((event) => {
            console.log(
                '🚀 ~ ThemeService ~ listenToExternalChanges ~ event:',
                event,
            );
            if (event?.type === THEME_CHANNEL_BROADCAST_EVENT) {
                this.applyDarkPalette((event.data.theme as TTheme) === 'dark');
                this.setTheme(event.data.theme as TTheme, false);
            }
            return true;
        });
    }

    private broadcastThemeChange(theme: TTheme, tabId: number): void {
        chrome.tabs.sendMessage(tabId, {
            type: MESSAGE_TYPE_SET_THEME,
            data: { theme },
        });
    }
}
