import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ThemeService } from './common/service/theme.service';
import { DarkModeToggleComponent } from './common/components/dark-mode.toggle.component';
import { ToastComponent } from './common/components/toast.component';
import { MESSAGE_TYPE_SESSION_LOGOUT_SUCCESS } from './constants';

type CookieUiSnapshot = {
    acto: string;
    reto: string;
};

const LOGOUT_CHANNEL_BROADCAST_EVENT_LOGOUT = 'session-logout';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [DarkModeToggleComponent, ToastComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'extension-training';

    public acto = '❌';
    public reto = '❌';
    public isLoggedIn = false;

    @ViewChild('toast') private readonly toast!: ToastComponent;

    /** Same key as `STORAGE_KEY` in `background.js`. */
    private readonly storageKey = 'extension_training_cookie_ui';

    private readonly onStorageChanged = (
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string,
    ): void => {
        if (areaName !== 'local') {
            return;
        }
        const change = changes[this.storageKey];
        const next = change?.newValue as CookieUiSnapshot | undefined;
        if (next === undefined || next === null) {
            return;
        }
        this.ngZone.run(() => {
            this.applySnapshot(next);
        });
    };

    constructor(
        private readonly ngZone: NgZone,
        public readonly ThemeService: ThemeService,
    ) { }

    ngOnInit(): void {
        chrome.storage.onChanged.addListener(this.onStorageChanged);
        void chrome.storage.local.get(this.storageKey).then((data) => {
            const snap = data[this.storageKey] as CookieUiSnapshot | undefined;
            this.ngZone.run(() => {
                this.applySnapshot(snap);
            });
        });

        this.ThemeService.initializeThemeFromStorage();

        chrome.runtime.onMessage.addListener(
            this.ThemeService.listenToExternalChanges,
        );
        chrome.runtime.onMessage.addListener(this.listenToSessionLogoutSuccess);
    }

    ngOnDestroy(): void {
        chrome.storage.onChanged.removeListener(this.onStorageChanged);
        chrome.runtime.onMessage.removeListener(
            this.ThemeService.listenToExternalChanges,
        );
        chrome.runtime.onMessage.removeListener(
            this.listenToSessionLogoutSuccess,
        );
    }

    public toggleTheme(): void {
        const next = this.ThemeService.isDarkMode() ? 'light' : 'dark';
        this.ThemeService.applyDarkPalette(next === 'dark');
        void this.ThemeService.setTheme(next);
    }

    public openTodoApplication(): void {
        window.open('http://localhost:4200/auth/login', '_blank');
    }

    public logout(): void {
        const confirmed = window.confirm('Are you sure you want to logout?');
        if (!confirmed) {
            return;
        }
        chrome.runtime.sendMessage({
            type: LOGOUT_CHANNEL_BROADCAST_EVENT_LOGOUT,
        });
    }

    private applySnapshot(snap: CookieUiSnapshot | undefined): void {
        if (snap === undefined || snap === null) {
            return;
        }
        const hasActo = (snap.acto?.length ?? 0) > 0;
        const hasReto = (snap.reto?.length ?? 0) > 0;
        this.acto = hasActo ? '✅' : '❌';
        this.reto = hasReto ? '✅' : '❌';
        this.isLoggedIn = hasActo && hasReto;
    }

    public readonly listenToSessionLogoutSuccess = (event: {
        type?: string;
    }): void => {
        if (event?.type === MESSAGE_TYPE_SESSION_LOGOUT_SUCCESS) {
            this.ngZone.run(() => {
                this.toast.show('Logged out remotely', 'success');
            });
        }
    };
}
