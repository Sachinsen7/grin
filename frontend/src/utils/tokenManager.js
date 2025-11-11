import axios from 'axios';

const TOKEN_KEY = 'authToken';
const ROLE_KEY = 'userRole';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';

// Token will expire in 15 minutes (as set in backend)
const TOKEN_LIFETIME = 15 * 60 * 1000; // 15 minutes in milliseconds
const REFRESH_BEFORE = 2 * 60 * 1000; // Refresh 2 minutes before expiry

class TokenManager {
    constructor() {
        this.refreshTimer = null;
        this.setupAutoRefresh();
    }

    setToken(token, role) {
        const expiryTime = Date.now() + TOKEN_LIFETIME;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(ROLE_KEY, role);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
        this.setupAutoRefresh();
    }

    getToken() {
        const token = localStorage.getItem(TOKEN_KEY);
        const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

        if (!token || !expiry) {
            return null;
        }

        // Check if token is expired
        if (Date.now() >= parseInt(expiry)) {
            this.clearToken();
            return null;
        }

        return token;
    }

    getRole() {
        return localStorage.getItem(ROLE_KEY);
    }

    clearToken() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ROLE_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    isTokenValid() {
        const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
        if (!expiry) return false;
        return Date.now() < parseInt(expiry);
    }

    getTimeUntilExpiry() {
        const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
        if (!expiry) return 0;
        return Math.max(0, parseInt(expiry) - Date.now());
    }

    async refreshToken() {
        try {
            const url = process.env.REACT_APP_BACKEND_URL;
            const response = await axios.post(`${url}/refresh-token`, {}, {
                withCredentials: true // Send cookies with refresh token
            });

            const newToken = response.data.data?.accessToken || response.data.accessToken;
            if (newToken) {
                const role = this.getRole();
                this.setToken(newToken, role);
                console.log('Token refreshed successfully');
                return newToken;
            }
        } catch (error) {
            console.error('Failed to refresh token:', error);
            this.clearToken();
            // Redirect to login
            window.location.href = '/';
            return null;
        }
    }

    setupAutoRefresh() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        const timeUntilExpiry = this.getTimeUntilExpiry();
        if (timeUntilExpiry <= 0) {
            return;
        }

        // Schedule refresh before token expires
        const refreshTime = Math.max(0, timeUntilExpiry - REFRESH_BEFORE);

        this.refreshTimer = setTimeout(() => {
            this.refreshToken();
        }, refreshTime);
    }
}

export default new TokenManager();
