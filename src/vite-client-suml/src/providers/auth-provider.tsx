import { createContext, useContext, useEffect, useState } from "react";
import type { components } from "@/lib/api/v1";
import { useCookies } from "react-cookie";

type User = components["schemas"]["CurrentUserResponseSchema"];

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    register: (email: string, username: string, password: string, accountCreationToken: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/* eslint-disable */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [cookies] = useCookies(['access_token']);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const response = await fetch("/api/v1/auth/me", {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                return userData;
            }

            setUser(null);
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
        return null;
    };

    // Próba pobrania użytkownika tylko gdy jest access_token
    useEffect(() => {
        fetchUser().then(() => {
            setIsLoading(false);
        });
    }, [cookies.access_token]);

    const login = async (username: string, password: string) => {
        const response = await fetch("/api/v1/auth/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        console.log(response);
        if (response.status !== 200) {
            console.log("Login failed");
            return false;
        }

        // Po udanym logowaniu pobierz dane użytkownika
        return await fetchUser() !== null;
    };

    const logout = async () => {
        const response = await fetch("/api/v1/auth/logout", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error("Failed to logout");
        }

        setUser(null);
    };

    const register = async (email: string, username: string, password: string, accountCreationToken: string) => {
        const response = await fetch("/api/v1/auth/register?account_creation_token=" + accountCreationToken, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, username, password }),
            credentials: 'include'
        });

        if (response.status !== 200) {
            console.log("Register failed, reason: " + response.text);
            return false;
        }

        // Po udanej rejestracji spróbujemy się zalogować
        return await login(username, password);
    };

    const refreshAuth = async () => {
        const response = await fetch("/api/v1/auth/refresh", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error("Failed to refresh auth");
        }

        // Po odświeżeniu tokenu pobierz dane użytkownika
        await fetchUser();
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshAuth,
        register,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
