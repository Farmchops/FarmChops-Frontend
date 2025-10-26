import { useEffect } from "react";
import { cn } from "@/lib/utils";

export type AlertType = "success" | "error" | "warning" | "info" | "confirm";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    type?: AlertType;
    onConfirm?: () => void; // for confirmation dialogs
}

export const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = "info",
    onConfirm,
}) => {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const colors = {
        success: "bg-green-50 border-green-100 ",
        error: "bg-red-50 border-red-100 ",
        warning: "bg-yellow-50 border-yellow-100 ",
        info: "bg-blue-50 border-blue-100 ",
        confirm: "bg-gray-50 border-gray-300 ",
    }[type];

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className={cn(
                    "bg-white rounded-3xl sm:rounded-md shadow-xl w-full sm:max-w-md p-6 border",
                    colors
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold">
                        {title || (type === "confirm" ? "Please Confirm" : "Alert")}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="hover:text-gray-700 ml-4 text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Message */}
                <p className="text-sm mb-6">{message}</p>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    {type === "confirm" ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (onConfirm) onConfirm();
                                    onClose();
                                }}
                                className="px-4 py-2 bg-[#1D7B3C] text-white rounded text-sm hover:bg-green-800 transition-colors"
                            >
                                Confirm
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-[#1D7B3C] text-white rounded text-sm hover:bg-green-800 transition-colors"
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
