import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ThemeService } from './common/service/theme.service';

type CookieUiSnapshot = {
    acto: string;
    reto: string;
};

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'extension-training';

    public acto = '❌';
    public reto = '❌';

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
        this.ThemeService.listenToExternalChanges();
    }

    ngOnDestroy(): void {
        chrome.storage.onChanged.removeListener(this.onStorageChanged);
    }

    public toggleTheme(): void {
        const next = this.ThemeService.isDarkMode() ? 'light' : 'dark';
        this.ThemeService.applyDarkPalette(next === 'dark');
        void this.ThemeService.setTheme(next);
    }

    public openTodoApplication(): void {
        window.open('http://localhost:4200/auth/login', '_blank');
    }

    private applySnapshot(snap: CookieUiSnapshot | undefined): void {
        if (snap === undefined || snap === null) {
            return;
        }
        this.acto = (snap.acto?.length ?? 0) > 0 ? '✅' : '❌';
        this.reto = (snap.reto?.length ?? 0) > 0 ? '✅' : '❌';
    }
}
