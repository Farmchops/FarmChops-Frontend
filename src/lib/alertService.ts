import type { AlertType } from "@/components/AlertModal";

interface AlertOptions {
    title?: string;
    message: string;
    type?: AlertType;
    onConfirm?: () => void;
}

type AlertHandler = (options: AlertOptions) => void;

let showAlertHandler: AlertHandler | null = null;

export const alertService = {
    // called inside the provider
    _register(handler: AlertHandler) {
        showAlertHandler = handler;
    },

    show(options: AlertOptions) {
        if (showAlertHandler) {
            showAlertHandler(options);
        } else {
            console.warn("alertService not registered yet. Wrap your app with <AlertProvider>.");
        }
    },
};
