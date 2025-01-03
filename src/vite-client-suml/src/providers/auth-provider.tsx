import { createContext, useContext } from "react";
import { $api } from "@/lib/api/clients";
import { useCookies } from "react-cookie";
import type { components } from "@/lib/api/v1";
import { useQueryClient } from "@tanstack/react-query";

type User = components["schemas"]["CurrentUserResponseSchema"];

/**
 * @interface AuthContextType
 * @property {User | null} user - Aktualny użytkownik
 * @property {boolean} isAuthenticated - Czy użytkownik jest zalogowany
 * @property {boolean} isLoading - Czy obecnie trwa ładowanie danych
 * @property {(username: string, password: string) => Promise<void>} login - Funkcja logowania
 * @property {() => Promise<void>} logout - Funkcja wylogowania
 * @property {() => Promise<void>} refreshAuth - Funkcja odświeżania autoryzacji
 */
interface AuthContextType {
    /**
     * Aktualny użytkownik
     * @type {User | null}
     */
    user: User | null;
    /**
     * Czy użytkownik jest zalogowany
     * @type {boolean}
     */
    isAuthenticated: boolean;
    /**
     * Czy obecnie trwa ładowanie danych
     * @type {boolean}
     */
    isLoading: boolean;
    /**
     * Funkcja logowania
     * @param {string} username - Nazwa użytkownika
     * @param {string} password - Hasło
     * @returns {Promise<void>}
     */
    login: (username: string, password: string) => Promise<void>;
    /**
     * Funkcja wylogowania
     * @returns {Promise<void>}
     */
    logout: () => Promise<void>;
    /**
     * Funkcja odświeżania autoryzacji
     * @returns {Promise<void>}
     */
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook do pobierania kontekstu autoryzacji
 * @returns {AuthContextType}
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

/**
 * Komponent dostarczający kontekst autoryzacji
 * @param {React.ReactNode} children - Dzieci
 * @returns {React.ReactNode}
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [cookies, setCookie, removeCookie] = useCookies(['access_token', 'refresh_token']);
    const queryClient = useQueryClient();

    /**
     * Pobieranie aktualnego użytkownika
     * @type {QueryObserverBaseResult<User | null, Error>}
     */
    const { data: user, isLoading } = $api.useQuery(
        "get",
        "/api/v1/auth/me",
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            params: {
                cookie: cookies.access_token,
            }
        }
    );

    const loginMutation = $api.useMutation("post", "/api/v1/auth/login");

    const login = async (username: string, password: string) => {
        try {
            const response = await loginMutation.mutateAsync({
                headers: {
                    'Content-Type': 'application/json',
                },
                body: {
                    username,
                    password,
                }
            });

            await setCookie('access_token', response.access_token, { path: '/' });
            await setCookie('refresh_token', response.refresh_token, { path: '/' });

            // Odśwież dane użytkownika po zalogowaniu
            await queryClient.invalidateQueries({ queryKey: ["/api/v1/auth/me"] });
            
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        const response = await $api.useQuery(
            "post",
            "/api/v1/auth/logout",
            {
                params: {
                    cookie: cookies.access_token,
                }
            }
        );

        while (response.isLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (response.error) {
            throw new Error("Failed to logout");
        }

        removeCookie('access_token', { path: '/' });
        removeCookie('refresh_token', { path: '/' });
        // queryClient.setQueryData(['currentUser'], null);
        // queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    };

    const refreshAuth = async () => {
        const response = await $api.useQuery(
            "post",
            "/api/v1/auth/refresh",
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                params: {
                    cookie: cookies.refresh_token,
                }
            }
        );
        while (response.isLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (response.error) throw new Error("Failed to refresh auth");

        // queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    };

    const value = {
        user: user ?? null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
