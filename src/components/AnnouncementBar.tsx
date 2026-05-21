import { useState } from "react";
import { Link } from "react-router-dom";
import { Globe, X } from "lucide-react";

const STORAGE_KEY = "fc_intl_bar_dismissed";

const AnnouncementBar = () => {
    const [visible, setVisible] = useState(
        () => localStorage.getItem(STORAGE_KEY) !== "1"
    );

    if (!visible) return null;

    const dismiss = () => {
        localStorage.setItem(STORAGE_KEY, "1");
        setVisible(false);
    };

    return (
        <div className="flex w-full items-center justify-between gap-2 bg-[#D97706] px-4 py-2 text-xs text-white">
            <div className="flex flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                <Globe className="h-3.5 w-3.5 shrink-0 text-white" />
                <span className="font-medium text-white">
                    FarmChops now ships internationally!
                </span>
                <span className="hidden sm:inline text-white/90">
                    Order fresh Nigerian produce from anywhere in the world.
                </span>
                <Link
                    to="/products"
                    className="font-semibold text-white underline underline-offset-2 hover:text-emerald-200 transition"
                >
                    Shop Now
                </Link>
            </div>
            <button
                onClick={dismiss}
                aria-label="Dismiss announcement"
                className="ml-2 shrink-0 rounded p-0.5 text-white/70 hover:text-white transition"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
};

export default AnnouncementBar;
