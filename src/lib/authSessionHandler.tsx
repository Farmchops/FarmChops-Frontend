// src/utils/authSessionHandler.ts

import { store } from '../redux/store';
import { logout } from '../redux/features/auth/authSlice';

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const ACTIVITY_CHECK_KEY = 'last_activity';

export class AuthSessionHandler {
    private static instance: AuthSessionHandler;
    private timeoutId: NodeJS.Timeout | null = null;

    private constructor() {
        this.setupActivityListeners();
        this.checkSession();
    }

    public static getInstance(): AuthSessionHandler {
        if (!AuthSessionHandler.instance) {
            AuthSessionHandler.instance = new AuthSessionHandler();
        }
        return AuthSessionHandler.instance;
    }

    private setupActivityListeners(): void {
        // Track user activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        events.forEach(event => {
            document.addEventListener(event, () => this.updateActivity(), { passive: true });
        });

        // Check session on visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkSession();
            }
        });
    }

    private updateActivity(): void {
        sessionStorage.setItem(ACTIVITY_CHECK_KEY, Date.now().toString());
    }

    private checkSession(): void {
        const lastActivity = sessionStorage.getItem(ACTIVITY_CHECK_KEY);
        const state = store.getState();

        if (!state.auth.isAuthenticated) return;

        if (lastActivity) {
            const elapsed = Date.now() - parseInt(lastActivity);

            if (elapsed > SESSION_TIMEOUT) {
                // Session expired
                store.dispatch(logout());
                window.location.href = '/login?session=expired';
            } else {
                // Set timeout for remaining time
                this.scheduleTimeout(SESSION_TIMEOUT - elapsed);
            }
        } else {
            // First time, set activity
            this.updateActivity();
            this.scheduleTimeout(SESSION_TIMEOUT);
        }
    }

    private scheduleTimeout(delay: number): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.timeoutId = setTimeout(() => {
            const state = store.getState();
            if (state.auth.isAuthenticated) {
                store.dispatch(logout());
                window.location.href = '/login?session=expired';
            }
        }, delay);
    }
}
