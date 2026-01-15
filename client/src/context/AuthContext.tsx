import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
    username: string;
    nickname: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    const decodeUser = (token: string): User | null => {
        try {
            const decoded: any = jwtDecode(token);
            return {
                username: decoded.sub || decoded.name,
                nickname: decoded.nickname || decoded.name || "User",
                role: decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "User"
            };
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const userData = decodeUser(token);
            if (userData) setUser(userData);
        }
    }, []);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        const userData = decodeUser(token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};