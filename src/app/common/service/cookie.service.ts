import { Component, Injectable, NgZone } from '@angular/core';
import { COOKIE_STORAGE_KEY } from 'src/app/constants';

export interface ICookieUiSnapshot {
    acto: string;
    reto: string;
}
@Injectable({ providedIn: 'root' })
export class CookieService {
    public reto = '❌';
    public acto = '❌';

    constructor(private readonly ngZone: NgZone) {}

    private readonly onStorageChanged = (
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string,
    ): void => {
        if (areaName !== 'local') {
            return;
        }
        const change = changes[COOKIE_STORAGE_KEY];
        const next = change?.newValue as ICookieUiSnapshot | undefined;
        if (next === undefined || next === null) {
            return;
        }
        this.ngZone.run(() => {
            this.applySnapshot(next);
        });
    };

    public getCookies() {
        void chrome.storage.local.get;
    }
}
