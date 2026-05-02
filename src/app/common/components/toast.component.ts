import { Component, signal } from '@angular/core';
import { twMerge } from 'tailwind-merge';

export type TToastVariant = 'success' | 'error' | 'info';

@Component({
    selector: 'app-toast',
    standalone: true,
    templateUrl: './toast.component.html',
})
export class ToastComponent {
    public readonly message = signal<string>('');
    public readonly variant = signal<TToastVariant>('success');
    public readonly visible = signal<boolean>(false);

    private dismissTimer: ReturnType<typeof setTimeout> | null = null;

    public show(
        message: string,
        variant: TToastVariant = 'success',
        durationMs = 3000,
    ): void {
        if (this.dismissTimer !== null) {
            clearTimeout(this.dismissTimer);
        }
        this.message.set(message);
        this.variant.set(variant);
        this.visible.set(true);
        this.dismissTimer = setTimeout(() => this.dismiss(), durationMs);
    }

    public dismiss(): void {
        this.visible.set(false);
        this.dismissTimer = null;
    }

    public containerClass(): string {
        const base =
            'flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 shadow-sm';
        const variantMap: Record<TToastVariant, string> = {
            success:
                'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800',
            error: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
            info: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
        };
        return twMerge(base, variantMap[this.variant()]);
    }

    public iconForVariant(): string {
        const icons: Record<TToastVariant, string> = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
        };
        return icons[this.variant()];
    }
}
