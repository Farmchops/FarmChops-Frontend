import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Store, ShoppingCart, ClipboardList, User } from "lucide-react";
import { useGetCartQuery } from "@/redux/api/cartApi";

/**
 * Mobile-only bottom tab bar (hidden from md up). Sits alongside the hamburger
 * menu in the Navbar — quick access to the routes people use most.
 */
const tabs = [
    { to: "/", label: "Home", icon: Home, end: true },
    { to: "/products", label: "Products", icon: Store, end: false },
    { to: "/cart", label: "Cart", icon: ShoppingCart, end: false },
    { to: "/profile/orders", label: "Orders", icon: ClipboardList, end: false },
    { to: "/profile", label: "Account", icon: User, end: false },
];

const MobileTabBar: React.FC = () => {
    const { data: cartData } = useGetCartQuery();
    const cartCount = cartData?.cart?.totalItems || 0;

    return (
        <nav
            aria-label="Primary"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
        >
            <ul className="flex">
                {tabs.map(({ to, label, icon: Icon, end }) => (
                    <li key={to} className="flex-1">
                        <NavLink
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `relative flex h-14 flex-col items-center justify-center gap-0.5 text-caption font-medium outline-none transition-colors focus-visible:bg-surface-sunken ${
                                    isActive ? "text-brand-ink" : "text-ink-muted"
                                }`
                            }
                        >
                            <span className="relative">
                                <Icon size={22} aria-hidden="true" />
                                {label === "Cart" && cartCount > 0 && (
                                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-pill bg-brand px-1 text-[10px] font-bold text-brand-fg">
                                        {cartCount > 9 ? "9+" : cartCount}
                                    </span>
                                )}
                            </span>
                            {label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default MobileTabBar;
