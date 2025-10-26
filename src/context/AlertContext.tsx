import { createContext, useContext, useState, useCallback, useEffect } from "react";
import AlertModal, { type AlertType } from "@/components/AlertModal";
import { alertService } from "@/lib/alertService";

interface AlertOptions {
    title?: string;
    message: string;
    type?: AlertType;
    onConfirm?: () => void;
}

interface AlertContextValue {
    show: (options: AlertOptions) => void;
    close: () => void;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<AlertOptions | null>(null);

    const show = useCallback((opts: AlertOptions) => {
        setOptions(opts);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => setIsOpen(false), []);

    useEffect(() => {
        // 🔗 register this provider’s show function globally
        alertService._register(show);
    }, [show]);

    return (
        <AlertContext.Provider value={{ show, close }}>
            {children}
            {options && (
                <AlertModal
                    isOpen={isOpen}
                    onClose={close}
                    title={options.title}
                    message={options.message}
                    type={options.type}
                    onConfirm={options.onConfirm}
                />
            )}
        </AlertContext.Provider>
    );
};


export const useAlertContext = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error("useAlertContext must be used inside an AlertProvider");
    }
    return context;
};
