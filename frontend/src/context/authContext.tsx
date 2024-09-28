'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { checkAuthStatus } from '@/utils/checkAuth';

interface User {
    id: string;
    name: string;
    email: string;
    // Add other user-related fields if necessary
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to access authentication context
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/**
 * Provider component to wrap the application and provide auth status and user data
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);

    const refreshAuth = async () => {
        try {
            const status = await checkAuthStatus();
            setIsAuthenticated(status.isAuthenticated);

            if (status.isAuthenticated) {
                const response = await fetch(`http://localhost:5000/api/users/profile`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    console.error('Failed to fetch user profile.');
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Error refreshing auth status:', error);
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    useEffect(() => {
        refreshAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
