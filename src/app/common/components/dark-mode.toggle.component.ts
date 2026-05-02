import { Component, inject } from '@angular/core';
import { ThemeService, TTheme } from '../service/theme.service';

@Component({
    selector: 'app-dark-mode-toggle',
    templateUrl: './dark-mode.toggle.component.html',
    standalone: true,
})
export class DarkModeToggleComponent {
    private readonly themeService = inject(ThemeService);

    public readonly isDark = this.themeService.isDarkMode;

    public toggle(): void {
        const theme: TTheme = this.isDark() ? 'light' : 'dark';
        this.themeService.applyDarkPalette(!this.isDark());
        this.themeService.setTheme(theme);
    }

    public toggleClass(): string {
        const base =
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
        return this.isDark() ? `${base} bg-blue-600` : `${base} bg-gray-300`;
    }

    public thumbClass(): string {
        const base =
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform';
        return this.isDark()
            ? `${base} translate-x-6`
            : `${base} translate-x-1`;
    }

    public iconClass(): string {
        return this.isDark()
            ? 'text-[28px] text-blue-500'
            : 'text-[32px] text-yellow-500';
    }
}
