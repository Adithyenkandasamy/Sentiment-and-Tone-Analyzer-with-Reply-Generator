'use client';

import * as React from 'react';

type ToastProps = {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
};

type ToastContextType = {
    toast: (props: ToastProps) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<(ToastProps & { id: number })[]>([]);
    const idCounter = React.useRef(0);

    const toast = React.useCallback((props: ToastProps) => {
        const id = idCounter.current++;
        setToasts((prev) => [...prev, { ...props, id }]);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`px-4 py-3 rounded-lg shadow-lg max-w-md animate-slide-up ${t.variant === 'destructive'
                                ? 'bg-destructive text-destructive-foreground'
                                : 'bg-card text-card-foreground border border-border'
                            }`}
                    >
                        {t.title && <div className="font-semibold">{t.title}</div>}
                        {t.description && <div className="text-sm mt-1">{t.description}</div>}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
